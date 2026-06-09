/**
 * routes/aiRoutes.js
 * ----------------------------------------------------------------
 * AI endpoints — all protected (require a valid JWT) so a user can only
 * ever analyse their own data.
 *
 *   GET  /api/ai/status    → { configured: boolean }  (cheap, no LLM call)
 *   GET  /api/ai/insights  → AI-generated insight cards
 *   POST /api/ai/chat      → { reply } for a free-form question
 *
 * The AI rate limiter is applied in server.js (AI calls cost money).
 */

const express = require('express');
const router = express.Router();
const { getStatus, getAiInsights, chat } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/status', getStatus);
router.get('/insights', getAiInsights);
router.post('/chat', chat);

module.exports = router;
