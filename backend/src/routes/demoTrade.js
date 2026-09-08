const express = require('express');
const { createDemoTrade, closeDemoTrade, getDemoTrades } = require('../controllers/demoTradeController');
const { requireAuth } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/asyncHandler');

const router = express.Router();

router.use(requireAuth);

// このルーターは app.js で '/api/demo-trade' と '/api/demo-trades' の
// 両方にマウントされる('/create'・'/:tradeId/close' は単数形、一覧は複数形のパスのため)
router.get('/', asyncHandler(getDemoTrades));
router.post('/create', asyncHandler(createDemoTrade));
router.post('/:tradeId/close', asyncHandler(closeDemoTrade));

module.exports = router;
