const express = require('express');
const { getChart, getFundamentalToday } = require('../controllers/marketController');
const { requireAuth } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/asyncHandler');

const router = express.Router();

router.use(requireAuth);

router.get('/fundamental-today', asyncHandler(getFundamentalToday));
router.get('/chart/:timeframe', asyncHandler(getChart));

module.exports = router;
