const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const authRoutes = require('./routes/auth');
const learningRoutes = require('./routes/learning');
const quizRoutes = require('./routes/quiz');
const demoTradeRoutes = require('./routes/demoTrade');

const app = express();

app.use(
  helmet({
    contentSecurityPolicy: false,
  }),
);

const allowedOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('CORSポリシーにより許可されていないオリジンです'));
    },
  }),
);

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'リクエストが多すぎます。しばらくしてから再度お試しください' },
});
app.use('/api', apiLimiter);

// 総当たり攻撃対策のため、認証系はより厳しく制限する
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'リクエストが多すぎます。しばらくしてから再度お試しください' },
});

app.use(express.json({ limit: '5mb' }));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'gold-trading-tool-backend' });
});

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/learning', learningRoutes);
app.use('/api/quiz', quizRoutes);
// '/create'・'/:tradeId/close' は単数形、一覧は複数形のパスのため同じルーターを両方にマウントする
app.use('/api/demo-trade', demoTradeRoutes);
app.use('/api/demo-trades', demoTradeRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
