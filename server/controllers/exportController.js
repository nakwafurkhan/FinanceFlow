/**
 * controllers/exportController.js
 * ----------------------------------------------------------------
 * Export the user's expenses as CSV (for Excel / Google Sheets) or
 * PDF (for printing, attaching to reports, sharing with an accountant).
 *
 * The PDF is redesigned to match the FinanceFlow website aesthetic:
 *   - Minimalist white layout with generous margins
 *   - Iris (#6366F1) → violet (#8B5CF6) gradient header band
 *   - Summary stat cards mirroring the dashboard
 *   - Category-coloured row indicators in the transaction table
 *   - Bottom total banner + FinanceFlow attribution footer
 *
 * Streamed via pdfkit; the response is `application/pdf` so browsers
 * download it directly.
 */

const asyncHandler = require('express-async-handler');
const { Parser } = require('json2csv');
const PDFDocument = require('pdfkit');
const Expense = require('../models/Expense');

// ----------------------------------------------------------------
// Brand palette — keep in sync with client/src/utils/constants.js
// ----------------------------------------------------------------
const COLORS = {
  iris: '#6366F1',
  irisDeep: '#4F46E5',
  violet: '#8B5CF6',
  mint: '#10B981',
  coral: '#F43F5E',
  amber: '#F59E0B',
  ink900: '#0F172A',
  ink700: '#334155',
  ink500: '#64748B',
  ink300: '#CBD5E1',
  ink100: '#F1F5F9',
  ink50: '#F8FAFC',
  white: '#FFFFFF',
};

const CATEGORY_COLORS = {
  Food: '#F43F5E',
  Travel: '#6366F1',
  Shopping: '#F59E0B',
  Bills: '#0EA5E9',
  Entertainment: '#EC4899',
  Health: '#10B981',
  Education: '#8B5CF6',
  Other: '#94A3B8',
};

// ----------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------
const fetchExpenses = async (userId, { startDate, endDate } = {}) => {
  // NOTE: the Expense schema uses `user` (an ObjectId ref) as the
  // owner field. Don't rename to `userId` — that breaks the index and
  // returns an empty result.
  const filter = { user: userId };
  if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = new Date(startDate);
    if (endDate) filter.date.$lte = new Date(endDate);
  }
  return Expense.find(filter).sort({ date: -1 }).lean();
};

// Indian-style currency formatter, server-side. Returns e.g. "₹1,23,450".
const formatINR = (n) =>
  '₹' + Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 });

const formatShortDate = (d) =>
  new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });

const formatLongDate = (d) =>
  new Date(d).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

// ----------------------------------------------------------------
// CSV — unchanged from the previous behaviour
// ----------------------------------------------------------------
const exportCSV = asyncHandler(async (req, res) => {
  const expenses = await fetchExpenses(req.user._id, req.query);
  const fields = ['date', 'category', 'amount', 'description', 'paymentMethod'];
  const parser = new Parser({ fields });
  const csv = parser.parse(
    expenses.map((e) => ({
      date: new Date(e.date).toISOString().split('T')[0],
      category: e.category,
      amount: e.amount,
      description: e.description || '',
      paymentMethod: e.paymentMethod,
    }))
  );
  res.header('Content-Type', 'text/csv');
  res.attachment(`financeflow-expenses-${Date.now()}.csv`);
  return res.send(csv);
});

// ----------------------------------------------------------------
// PDF — redesigned to match the website
// ----------------------------------------------------------------
const exportPDF = asyncHandler(async (req, res) => {
  const expenses = await fetchExpenses(req.user._id, req.query);

  const doc = new PDFDocument({
    size: 'A4',
    margins: { top: 56, bottom: 56, left: 56, right: 56 },
    info: {
      Title: 'FinanceFlow Expense Report',
      Author: 'FinanceFlow',
      Subject: 'Personal expense report',
      Creator: 'FinanceFlow',
    },
  });

  res.header('Content-Type', 'application/pdf');
  res.attachment(`financeflow-report-${Date.now()}.pdf`);
  doc.pipe(res);

  // ============================================================
  // Page geometry
  // ============================================================
  const PAGE_WIDTH = doc.page.width;
  const PAGE_HEIGHT = doc.page.height;
  const LEFT = doc.page.margins.left;
  const RIGHT = PAGE_WIDTH - doc.page.margins.right;
  const CONTENT_WIDTH = RIGHT - LEFT;

  // ============================================================
  // Computed summary stats
  // ============================================================
  const total = expenses.reduce((s, e) => s + e.amount, 0);
  const transactionCount = expenses.length;

  // Top category by total spend
  const byCategory = expenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {});
  const topCategory = Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0];
  const topCategoryName = topCategory ? topCategory[0] : '—';

  // Date range covered by the data
  const dates = expenses.map((e) => new Date(e.date).getTime());
  const periodStart = dates.length ? new Date(Math.min(...dates)) : new Date();
  const periodEnd = dates.length ? new Date(Math.max(...dates)) : new Date();
  const periodLabel = dates.length
    ? `${formatLongDate(periodStart)} — ${formatLongDate(periodEnd)}`
    : 'No transactions in this report';

  // ============================================================
  // 1. HEADER — gradient band at the top
  // ============================================================
  const HEADER_HEIGHT = 100;
  // Solid iris band (PDFKit doesn't do real CSS gradients, so we fake
  // depth with two stacked rects of slightly different tones)
  doc.rect(0, 0, PAGE_WIDTH, HEADER_HEIGHT).fill(COLORS.iris);
  doc.rect(0, HEADER_HEIGHT - 8, PAGE_WIDTH, 8).fill(COLORS.violet);

  // Brand wordmark
  doc
    .fillColor(COLORS.white)
    .font('Helvetica-Bold')
    .fontSize(22)
    .text('FinanceFlow', LEFT, 32);
  doc
    .font('Helvetica')
    .fontSize(11)
    .fillColor('rgba(255,255,255,0.85)')
    .text('Personal finance, made beautiful', LEFT, 60);

  // Generated date (right side of header)
  const generatedLabel = `Generated ${formatLongDate(new Date())}`;
  doc
    .fontSize(10)
    .fillColor('rgba(255,255,255,0.85)')
    .text(generatedLabel, LEFT, 60, {
      width: CONTENT_WIDTH,
      align: 'right',
    });

  // ============================================================
  // 2. REPORT TITLE + PERIOD
  // ============================================================
  let y = HEADER_HEIGHT + 36;

  doc
    .fillColor(COLORS.ink500)
    .font('Helvetica-Bold')
    .fontSize(9)
    .text('EXPENSE REPORT', LEFT, y, { characterSpacing: 1.5 });

  y += 16;
  doc
    .fillColor(COLORS.ink900)
    .font('Helvetica-Bold')
    .fontSize(20)
    .text(`Report for ${req.user.name || 'You'}`, LEFT, y);

  y += 28;
  doc
    .fillColor(COLORS.ink700)
    .font('Helvetica')
    .fontSize(11)
    .text(periodLabel, LEFT, y);

  // ============================================================
  // 3. SUMMARY CARDS — 3 evenly-spaced tiles
  // ============================================================
  y += 32;
  const CARD_GAP = 12;
  const CARD_WIDTH = (CONTENT_WIDTH - CARD_GAP * 2) / 3;
  const CARD_HEIGHT = 72;

  const cards = [
    { label: 'Total spent', value: formatINR(total), accent: COLORS.iris },
    {
      label: 'Transactions',
      value: String(transactionCount),
      accent: COLORS.mint,
    },
    { label: 'Top category', value: topCategoryName, accent: COLORS.amber },
  ];

  cards.forEach((card, i) => {
    const x = LEFT + i * (CARD_WIDTH + CARD_GAP);
    // Card surface
    doc
      .roundedRect(x, y, CARD_WIDTH, CARD_HEIGHT, 10)
      .fill(COLORS.ink50)
      .stroke();
    // Accent bar on the left edge of the card
    doc.rect(x, y + 12, 3, CARD_HEIGHT - 24).fill(card.accent);
    // Label
    doc
      .fillColor(COLORS.ink500)
      .font('Helvetica-Bold')
      .fontSize(8)
      .text(card.label.toUpperCase(), x + 16, y + 14, {
        characterSpacing: 1.2,
        width: CARD_WIDTH - 24,
      });
    // Value
    doc
      .fillColor(COLORS.ink900)
      .font('Helvetica-Bold')
      .fontSize(18)
      .text(card.value, x + 16, y + 32, { width: CARD_WIDTH - 24 });
  });

  y += CARD_HEIGHT + 40;

  // ============================================================
  // 4. TRANSACTIONS TABLE
  // ============================================================
  doc
    .fillColor(COLORS.ink500)
    .font('Helvetica-Bold')
    .fontSize(9)
    .text('TRANSACTIONS', LEFT, y, { characterSpacing: 1.5 });

  y += 18;

  // Column widths
  const COL = {
    date: 60,
    cat: 100,
    desc: 0, // takes remaining
    amount: 80,
    method: 60,
  };
  COL.desc = CONTENT_WIDTH - COL.date - COL.cat - COL.amount - COL.method;

  // Table header row
  doc
    .fillColor(COLORS.ink500)
    .font('Helvetica-Bold')
    .fontSize(8)
    .text('DATE', LEFT, y, { width: COL.date, characterSpacing: 1 });
  doc.text('CATEGORY', LEFT + COL.date, y, {
    width: COL.cat,
    characterSpacing: 1,
  });
  doc.text('DESCRIPTION', LEFT + COL.date + COL.cat, y, {
    width: COL.desc,
    characterSpacing: 1,
  });
  doc.text('AMOUNT', LEFT + COL.date + COL.cat + COL.desc, y, {
    width: COL.amount,
    align: 'right',
    characterSpacing: 1,
  });
  doc.text('METHOD', LEFT + COL.date + COL.cat + COL.desc + COL.amount, y, {
    width: COL.method,
    align: 'right',
    characterSpacing: 1,
  });

  y += 14;
  doc
    .moveTo(LEFT, y)
    .lineTo(RIGHT, y)
    .strokeColor(COLORS.ink300)
    .lineWidth(0.5)
    .stroke();
  y += 8;

  // Data rows
  const ROW_HEIGHT = 22;
  const PAGE_BOTTOM = PAGE_HEIGHT - doc.page.margins.bottom - 60;

  if (expenses.length === 0) {
    doc
      .fillColor(COLORS.ink500)
      .font('Helvetica-Oblique')
      .fontSize(10)
      .text(
        'No transactions in the selected period.',
        LEFT,
        y + 8,
        { width: CONTENT_WIDTH, align: 'center' }
      );
    y += 32;
  } else {
    expenses.forEach((e, idx) => {
      // Page break if needed
      if (y > PAGE_BOTTOM) {
        doc.addPage();
        y = doc.page.margins.top;
      }

      // Subtle alternating background for readability
      if (idx % 2 === 1) {
        doc
          .roundedRect(LEFT - 4, y - 4, CONTENT_WIDTH + 8, ROW_HEIGHT, 4)
          .fill(COLORS.ink50);
      }

      // Category coloured dot
      const dotColor = CATEGORY_COLORS[e.category] || COLORS.ink500;
      doc.circle(LEFT + 4, y + 6, 3).fill(dotColor);

      // Cells
      doc
        .fillColor(COLORS.ink700)
        .font('Helvetica')
        .fontSize(9)
        .text(formatShortDate(e.date), LEFT + 14, y, { width: COL.date - 14 });
      doc
        .fillColor(COLORS.ink900)
        .text(e.category, LEFT + COL.date, y, { width: COL.cat });
      doc
        .fillColor(COLORS.ink700)
        .text(
          e.description || '—',
          LEFT + COL.date + COL.cat,
          y,
          { width: COL.desc - 8, ellipsis: true }
        );
      doc
        .fillColor(COLORS.ink900)
        .font('Helvetica-Bold')
        .text(
          formatINR(e.amount),
          LEFT + COL.date + COL.cat + COL.desc,
          y,
          { width: COL.amount, align: 'right' }
        );
      doc
        .fillColor(COLORS.ink500)
        .font('Helvetica')
        .fontSize(8)
        .text(
          e.paymentMethod || '—',
          LEFT + COL.date + COL.cat + COL.desc + COL.amount,
          y + 1,
          { width: COL.method, align: 'right' }
        );

      y += ROW_HEIGHT;
    });
  }

  // ============================================================
  // 5. TOTAL BANNER
  // ============================================================
  y += 8;
  if (y > PAGE_BOTTOM - 40) {
    doc.addPage();
    y = doc.page.margins.top;
  }
  doc.rect(LEFT, y, CONTENT_WIDTH, 1).fill(COLORS.ink300);
  y += 16;
  doc
    .fillColor(COLORS.ink500)
    .font('Helvetica-Bold')
    .fontSize(9)
    .text('TOTAL', LEFT, y, { characterSpacing: 1.5 });
  doc
    .fillColor(COLORS.ink900)
    .font('Helvetica-Bold')
    .fontSize(20)
    .text(formatINR(total), LEFT, y - 6, {
      width: CONTENT_WIDTH,
      align: 'right',
    });

  // ============================================================
  // 6. FOOTER — runs on every page
  // ============================================================
  const drawFooter = () => {
    const FY = PAGE_HEIGHT - doc.page.margins.bottom + 20;
    doc.rect(LEFT, FY - 8, CONTENT_WIDTH, 0.5).fill(COLORS.ink300);
    doc
      .fillColor(COLORS.ink500)
      .font('Helvetica')
      .fontSize(8)
      .text(
        'Generated by FinanceFlow · finance-flow-theta-indol.vercel.app',
        LEFT,
        FY,
        { width: CONTENT_WIDTH, align: 'center' }
      );
  };
  // pdfkit lays the document one page at a time, so we draw the footer
  // on each existing page via the `pageAdded` event for any future
  // pages, plus once on the current one.
  const pageRange = doc.bufferedPageRange();
  for (let i = pageRange.start; i < pageRange.start + pageRange.count; i++) {
    doc.switchToPage(i);
    drawFooter();
  }

  doc.end();
});

module.exports = { exportCSV, exportPDF };
