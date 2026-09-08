const prisma = require('../config/database');

const SYMBOL = 'XAUUSD';
const VALID_TIMEFRAMES = ['1m', '5m', '15m', '30m', '1h', '4h', '1d'];

function toPublicCandle(row) {
  return {
    timestamp: row.timestamp,
    open: row.open,
    high: row.high,
    low: row.low,
    close: row.close,
    ema20: row.ema20,
    ema75: row.ema75,
    ema200: row.ema200,
    rsi: row.rsi,
    atr: row.atr,
  };
}

async function getChart(req, res) {
  const { timeframe } = req.params;
  if (!VALID_TIMEFRAMES.includes(timeframe)) {
    return res.status(400).json({ error: 'timeframeは 1m,5m,15m,30m,1h,4h,1d のいずれかで指定してください' });
  }

  const daysRaw = req.query.days;
  const days = daysRaw === undefined ? 5 : Number(daysRaw);
  if (!Number.isInteger(days) || days <= 0) {
    return res.status(400).json({ error: 'daysは正の整数で指定してください' });
  }

  const cutoff = new Date();
  cutoff.setUTCDate(cutoff.getUTCDate() - days);

  const rows = await prisma.marketData.findMany({
    where: { symbol: SYMBOL, timeframe, timestamp: { gte: cutoff } },
    orderBy: { timestamp: 'asc' },
  });

  return res.json({
    timeframe,
    symbol: SYMBOL,
    data: rows.map(toPublicCandle),
  });
}

function todayDateString() {
  return new Date().toISOString().slice(0, 10);
}

function buildAnalysis({ dollarIndex, vix, fomc, nfp }) {
  if (dollarIndex === null || vix === null) {
    return '本日のファンダメンタルデータはまだありません。';
  }

  let vixComment = 'リスクオン環境';
  if (vix > 25) {
    vixComment = 'リスクオフ環境の可能性';
  } else if (vix >= 20) {
    vixComment = 'やや警戒感のある環境';
  }

  const events = [];
  if (fomc) events.push('FOMC');
  if (nfp) events.push('NFP');
  const eventComment = events.length > 0 ? `本日は${events.join('・')}の発表予定あり。` : '大型発表なし。';

  return `本日のファンダメンタル要因：ドル指数が${dollarIndex.toFixed(2)}で推移、VIXは${vix.toFixed(1)}で${vixComment}。${eventComment}`;
}

async function getFundamentalToday(req, res) {
  const date = todayDateString();
  const dayStart = new Date(`${date}T00:00:00.000Z`);
  const dayEnd = new Date(`${date}T23:59:59.999Z`);

  // 日足(1d)のレコードをその日の代表値として扱う
  const row = await prisma.marketData.findFirst({
    where: { symbol: SYMBOL, timeframe: '1d', timestamp: { gte: dayStart, lte: dayEnd } },
  });

  const fomcScheduled = row?.fomc || false;
  const nfpScheduled = row?.nfp || false;
  const dollarIndex = row?.dollarIndex ?? null;
  const vix = row?.vix ?? null;
  const cpi = row?.cpi ?? null;

  return res.json({
    date,
    fomc: { scheduled: fomcScheduled, time: null, impact: null },
    nfp: { scheduled: nfpScheduled, time: null, expected: null, previous: null },
    cpi,
    dollarIndex,
    vix,
    analysis: buildAnalysis({ dollarIndex, vix, fomc: fomcScheduled, nfp: nfpScheduled }),
  });
}

module.exports = { getChart, getFundamentalToday };
