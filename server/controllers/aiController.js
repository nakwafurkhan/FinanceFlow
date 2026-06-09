/**
 * controllers/aiController.js
 * ----------------------------------------------------------------
 * AI-powered financial insights + chat, grounded in the user's own
 * data, using the OpenAI API.
 *
 * Design principles:
 *
 *  1. GRACEFUL DEGRADATION. If OPENAI_API_KEY is not set, every endpoint
 *     returns a clean, documented response (configured: false) instead of
 *     crashing. This means the feature is safe to deploy before a key is
 *     added — the live app never breaks.
 *
 *  2. GROUNDED, NOT HALLUCINATED. We never ask the model to invent numbers.
 *     We compute the user's real financial summary with MongoDB
 *     aggregations and pass it as structured context. The model only
 *     interprets and explains data we hand it.
 *
 *  3. CHEAP + BOUNDED. Default model is gpt-4o-mini (fast + inexpensive).
 *     We send aggregated summaries, not thousands of raw transactions, and
 *     cap max_tokens. The route is rate-limited in server.js.
 *
 *  4. PRIVACY. Only the authenticated user's own aggregated data is sent.
 *     No other user's data, no PII beyond what the user already owns.
 */

const asyncHandler = require('express-async-handler');
const Expense = require('../models/Expense');
const Budget = require('../models/Budget');
const Income = require('../models/Income');
const { toObjectId } = require('../utils/aggregations');

const MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

// Provider-agnostic: the OpenAI SDK can talk to ANY OpenAI-compatible
// API (Groq, Google Gemini, OpenRouter, Cerebras, ...) just by changing
// the base URL. Set OPENAI_BASE_URL to switch providers without code
// changes. Examples:
//   Groq    → https://api.groq.com/openai/v1     (model: llama-3.3-70b-versatile)
//   Gemini  → https://generativelanguage.googleapis.com/v1beta/openai/  (gemini-2.0-flash)
//   OpenRtr → https://openrouter.ai/api/v1        (meta-llama/llama-3.3-70b-instruct:free)
// Leave it unset to use OpenAI directly.
const BASE_URL = process.env.OPENAI_BASE_URL || undefined;

// ----------------------------------------------------------------
// Lazy OpenAI-compatible client. Built on first use so the server boots
// even if the `openai` package or the API key is absent.
// ----------------------------------------------------------------
let _client = null;
let _clientTried = false;

function getClient() {
  if (!process.env.OPENAI_API_KEY) return null;
  if (_clientTried) return _client;
  _clientTried = true;
  try {
    // eslint-disable-next-line global-require
    const OpenAI = require('openai');
    _client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: BASE_URL, // undefined → defaults to OpenAI
    });
    if (BASE_URL) console.log(`[ai] using custom base URL: ${BASE_URL} (model: ${MODEL})`);
  } catch (err) {
    // Package not installed — degrade gracefully.
    console.warn('[ai] openai package not available:', err.message);
    _client = null;
  }
  return _client;
}

// ----------------------------------------------------------------
// Robust JSON extraction. Not every provider/model honours
// response_format strictly — some wrap JSON in ```json fences or add
// prose. This pulls the JSON out regardless.
// ----------------------------------------------------------------
function extractJson(raw) {
  if (!raw || typeof raw !== 'string') return {};
  let s = raw.trim();
  const fence = s.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) s = fence[1].trim();
  try {
    return JSON.parse(s);
  } catch {
    /* fall through */
  }
  const block = s.match(/\{[\s\S]*\}/);
  if (block) {
    try {
      return JSON.parse(block[0]);
    } catch {
      /* give up */
    }
  }
  return {};
}

// Request a JSON completion, falling back gracefully if the provider
// rejects the response_format parameter (some OpenAI-compatible APIs do).
async function createJsonCompletion(client, messages, maxTokens) {
  const base = { model: MODEL, temperature: 0.4, max_tokens: maxTokens, messages };
  try {
    return await client.chat.completions.create({
      ...base,
      response_format: { type: 'json_object' },
    });
  } catch (err) {
    const msg = err?.message || '';
    const unsupported =
      err?.status === 400 || /response_format|json|unsupported|not\s+support/i.test(msg);
    if (unsupported) {
      console.warn('[ai] provider rejected response_format; retrying without it.');
      return client.chat.completions.create(base);
    }
    throw err;
  }
}

// ----------------------------------------------------------------
// Build a compact, structured snapshot of the user's finances for the
// current month. This is the "ground truth" the model reasons over.
// ----------------------------------------------------------------
async function buildFinancialContext(userId, month, year) {
  const thisStart = new Date(year, month - 1, 1);
  const thisEnd = new Date(year, month, 0, 23, 59, 59, 999);
  const lastStart = new Date(year, month - 2, 1);
  const lastEnd = new Date(year, month - 1, 0, 23, 59, 59, 999);

  const catPipeline = (start, end) => [
    { $match: { user: toObjectId(userId), date: { $gte: start, $lte: end } } },
    { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
    { $sort: { total: -1 } },
  ];

  const [thisMonthCats, lastMonthCats, budgets, incomeAgg, recent] =
    await Promise.all([
      Expense.aggregate(catPipeline(thisStart, thisEnd)),
      Expense.aggregate(catPipeline(lastStart, lastEnd)),
      Budget.find({ user: userId, month, year }).lean(),
      Income.aggregate([
        {
          $match: {
            user: toObjectId(userId),
            date: { $gte: thisStart, $lte: thisEnd },
          },
        },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Expense.find({ user: userId, date: { $gte: thisStart, $lte: thisEnd } })
        .sort({ date: -1 })
        .limit(10)
        .select('amount category description date -_id')
        .lean(),
    ]);

  const thisMap = Object.fromEntries(thisMonthCats.map((c) => [c._id, c.total]));
  const lastMap = Object.fromEntries(lastMonthCats.map((c) => [c._id, c.total]));
  const totalSpent = Object.values(thisMap).reduce((a, b) => a + b, 0);
  const totalIncome = incomeAgg[0]?.total || 0;

  return {
    period: `${year}-${String(month).padStart(2, '0')}`,
    currency: 'INR',
    totals: {
      spent: Math.round(totalSpent),
      income: Math.round(totalIncome),
      net: Math.round(totalIncome - totalSpent),
      savingsRatePct:
        totalIncome > 0
          ? Math.round(((totalIncome - totalSpent) / totalIncome) * 100)
          : null,
    },
    spendingByCategoryThisMonth: thisMonthCats.map((c) => ({
      category: c._id,
      total: Math.round(c.total),
      transactions: c.count,
    })),
    spendingByCategoryLastMonth: lastMonthCats.map((c) => ({
      category: c._id,
      total: Math.round(c.total),
    })),
    budgets: budgets.map((b) => ({
      category: b.category,
      limit: b.monthlyLimit,
      spent: Math.round(thisMap[b.category] || 0),
      remaining: Math.round((b.monthlyLimit || 0) - (thisMap[b.category] || 0)),
    })),
    recentTransactions: recent.map((e) => ({
      amount: Math.round(e.amount),
      category: e.category,
      description: e.description || '',
      date: new Date(e.date).toISOString().split('T')[0],
    })),
  };
}

function hasAnyData(ctx) {
  return (
    ctx.totals.spent > 0 ||
    ctx.totals.income > 0 ||
    ctx.spendingByCategoryThisMonth.length > 0
  );
}

// ----------------------------------------------------------------
// GET /api/ai/status
// Lets the frontend show/hide the AI widget without a failed call.
// ----------------------------------------------------------------
const getStatus = asyncHandler(async (req, res) => {
  res.json({ success: true, configured: !!getClient(), model: MODEL });
});

// ----------------------------------------------------------------
// GET /api/ai/insights
// Returns 3-5 AI-generated, data-grounded insight cards.
// Falls back to a clear message if AI is not configured.
// ----------------------------------------------------------------
const getAiInsights = asyncHandler(async (req, res) => {
  const client = getClient();
  const now = new Date();
  const month = Number(req.query.month) || now.getMonth() + 1;
  const year = Number(req.query.year) || now.getFullYear();

  const context = await buildFinancialContext(req.user._id, month, year);

  if (!client) {
    return res.json({
      success: true,
      configured: false,
      insights: [
        {
          icon: '🤖',
          tone: 'neutral',
          title: 'AI insights are not configured yet',
          message:
            'Set the OPENAI_API_KEY environment variable on the server to enable AI-powered analysis. The rule-based insights on your dashboard still work in the meantime.',
        },
      ],
    });
  }

  if (!hasAnyData(context)) {
    return res.json({
      success: true,
      configured: true,
      insights: [
        {
          icon: '✨',
          tone: 'neutral',
          title: 'Not enough data yet',
          message:
            'Add a few expenses and some income, then come back — the AI needs data to analyse.',
        },
      ],
    });
  }

  const systemPrompt = `You are a sharp, friendly personal-finance analyst for an app called FinanceFlow.
You will receive a JSON snapshot of ONE user's finances for a month.
Produce 3 to 5 concise, specific, actionable insights about their spending and saving.

Rules:
- Only use numbers present in the data. NEVER invent figures.
- Amounts are in the given currency code. Format like "₹12,500" for INR.
- Each insight: one short title (<= 6 words) and one sentence (<= 25 words).
- Be specific (name categories and real numbers), not generic.
- Pick a tone from: positive, neutral, warning, danger.
- Pick a relevant emoji icon.
- Prioritise: budget overruns, large month-over-month changes, savings rate, biggest category.

Respond ONLY as JSON: {"insights":[{"icon","tone","title","message"}, ...]}`;

  try {
    const completion = await createJsonCompletion(
      client,
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: JSON.stringify(context) },
      ],
      600
    );

    const raw = completion.choices[0]?.message?.content || '';
    const parsed = extractJson(raw);
    const insights = Array.isArray(parsed.insights) ? parsed.insights.slice(0, 5) : [];
    return res.json({ success: true, configured: true, insights });
  } catch (err) {
    console.error('[ai] insights error:', err.message);
    res.status(502);
    throw new Error(
      'The AI service is temporarily unavailable. Please try again in a moment.'
    );
  }
});

// ----------------------------------------------------------------
// POST /api/ai/chat
// Body: { message: string, history?: [{role, content}] }
// Answers a free-form question grounded in the user's data.
// ----------------------------------------------------------------
const chat = asyncHandler(async (req, res) => {
  const client = getClient();
  const { message, history } = req.body;

  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    res.status(400);
    throw new Error('A non-empty "message" is required.');
  }
  if (message.length > 500) {
    res.status(400);
    throw new Error('Question is too long (max 500 characters).');
  }

  if (!client) {
    return res.json({
      success: true,
      configured: false,
      reply:
        "AI chat isn't configured on this server yet. Once an OPENAI_API_KEY is added, you'll be able to ask questions about your spending here.",
    });
  }

  const now = new Date();
  const context = await buildFinancialContext(
    req.user._id,
    now.getMonth() + 1,
    now.getFullYear()
  );

  const systemPrompt = `You are FinanceFlow's AI assistant. Answer the user's question about THEIR finances using ONLY the JSON snapshot provided.

Rules:
- Ground every claim in the data. If the data can't answer, say so honestly.
- Amounts use the given currency code; format INR like "₹12,500".
- Be concise (2-4 sentences). Friendly, direct, no fluff.
- Never invent transactions or numbers not in the data.
- If asked for advice, base it on their actual patterns.

User's financial snapshot:
${JSON.stringify(context)}`;

  // Keep only the last 6 turns of history, validated.
  const safeHistory = Array.isArray(history)
    ? history
        .filter(
          (m) =>
            m &&
            (m.role === 'user' || m.role === 'assistant') &&
            typeof m.content === 'string'
        )
        .slice(-6)
        .map((m) => ({ role: m.role, content: m.content.slice(0, 1000) }))
    : [];

  try {
    const completion = await client.chat.completions.create({
      model: MODEL,
      temperature: 0.5,
      max_tokens: 400,
      messages: [
        { role: 'system', content: systemPrompt },
        ...safeHistory,
        { role: 'user', content: message.trim() },
      ],
    });

    const reply =
      completion.choices[0]?.message?.content?.trim() ||
      "I couldn't generate a response. Please try rephrasing.";
    return res.json({ success: true, configured: true, reply });
  } catch (err) {
    console.error('[ai] chat error:', err.message);
    res.status(502);
    throw new Error(
      'The AI service is temporarily unavailable. Please try again in a moment.'
    );
  }
});

module.exports = { getStatus, getAiInsights, chat };
