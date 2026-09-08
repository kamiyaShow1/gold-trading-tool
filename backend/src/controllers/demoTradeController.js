const prisma = require('../config/database');

// pip刻み(XAUUSD: 1pip=0.01と仮定。docs/PHASE2.md参照。実仕様はPhase3のHFM連携時に要確認)
const PIP_SIZE = 0.01;
// 1pipあたりの損益($/pip/標準ロット)。実仕様はPhase3で要確認
const PIP_VALUE_PER_LOT = 1;

const VALID_ENTRY_TYPES = ['buy', 'sell'];
const VALID_STATUSES = ['open', 'closed', 'cancelled'];

function toPublicTrade(trade) {
  return {
    tradeId: trade.id,
    symbol: trade.symbol,
    entryType: trade.entryType,
    entryPrice: trade.entryPrice,
    entryTime: trade.entryTime,
    entryReason: trade.entryReason,
    exitPrice: trade.exitPrice,
    exitTime: trade.exitTime,
    exitReason: trade.exitReason,
    lotSize: trade.lotSize,
    pips: trade.pips,
    profitLoss: trade.profitLoss,
    status: trade.status,
    learningChapter: trade.learningChapter,
  };
}

async function createDemoTrade(req, res) {
  const { symbol, entryType, entryPrice, entryReason, learningChapter } = req.body || {};

  if (!VALID_ENTRY_TYPES.includes(entryType)) {
    return res.status(400).json({ error: 'entryTypeは buy または sell で指定してください' });
  }
  if (typeof entryPrice !== 'number' || !Number.isFinite(entryPrice) || entryPrice <= 0) {
    return res.status(400).json({ error: 'entryPriceは正の数値で指定してください' });
  }

  const trade = await prisma.demoTrade.create({
    data: {
      userId: req.user.sub,
      symbol: symbol || 'XAUUSD',
      entryType,
      entryPrice,
      entryReason: entryReason || null,
      learningChapter: learningChapter || null,
    },
  });

  return res.status(201).json({ trade: toPublicTrade(trade) });
}

async function closeDemoTrade(req, res) {
  const tradeId = Number(req.params.tradeId);
  const { exitPrice, exitReason } = req.body || {};

  if (!Number.isInteger(tradeId)) {
    return res.status(404).json({ error: '指定されたトレードが見つかりません' });
  }
  if (typeof exitPrice !== 'number' || !Number.isFinite(exitPrice) || exitPrice <= 0) {
    return res.status(400).json({ error: 'exitPriceは正の数値で指定してください' });
  }

  const trade = await prisma.demoTrade.findUnique({ where: { id: tradeId } });
  if (!trade || trade.userId !== req.user.sub) {
    return res.status(404).json({ error: '指定されたトレードが見つかりません' });
  }
  if (trade.status !== 'open') {
    return res.status(400).json({ error: 'このトレードは既に決済済みです' });
  }

  const direction = trade.entryType === 'buy' ? 1 : -1;
  const pips = ((exitPrice - trade.entryPrice) / PIP_SIZE) * direction;
  const profitLoss = pips * PIP_VALUE_PER_LOT * trade.lotSize;

  const updated = await prisma.demoTrade.update({
    where: { id: tradeId },
    data: {
      exitPrice,
      exitTime: new Date(),
      exitReason: exitReason || null,
      pips,
      profitLoss,
      status: 'closed',
    },
  });

  return res.json({
    pips: updated.pips,
    profitLoss: updated.profitLoss,
    status: updated.status,
    trade: toPublicTrade(updated),
  });
}

async function getDemoTrades(req, res) {
  const { status } = req.query;

  if (status !== undefined && !VALID_STATUSES.includes(status)) {
    return res.status(400).json({ error: 'statusは open, closed, cancelled のいずれかで指定してください' });
  }

  const trades = await prisma.demoTrade.findMany({
    where: { userId: req.user.sub, ...(status ? { status } : {}) },
    orderBy: { entryTime: 'desc' },
  });

  const closedTrades = trades.filter((t) => t.status === 'closed');
  const wins = closedTrades.filter((t) => (t.profitLoss || 0) > 0).length;
  const totalPips = closedTrades.reduce((sum, t) => sum + (t.pips || 0), 0);
  const totalProfitLoss = closedTrades.reduce((sum, t) => sum + (t.profitLoss || 0), 0);
  const winRate = closedTrades.length > 0 ? Math.round((wins / closedTrades.length) * 100) : 0;

  return res.json({
    trades: trades.map(toPublicTrade),
    stats: {
      totalTrades: trades.length,
      openTrades: trades.filter((t) => t.status === 'open').length,
      closedTrades: closedTrades.length,
      winRate,
      totalPips,
      totalProfitLoss,
    },
  });
}

module.exports = { createDemoTrade, closeDemoTrade, getDemoTrades };
