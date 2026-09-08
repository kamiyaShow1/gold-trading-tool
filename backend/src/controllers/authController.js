const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/database');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function issueToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' },
  );
}

function toPublicUser(user) {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    hfmAccountId: user.hfmAccountId,
    tradingLevel: user.tradingLevel,
    targetWinRate: user.targetWinRate,
    totalTrades: user.totalTrades,
    totalWins: user.totalWins,
    totalLosses: user.totalLosses,
    currentWinRate: user.currentWinRate,
    totalProfitLoss: user.totalProfitLoss,
  };
}

async function register(req, res) {
  const { username, email, password } = req.body || {};

  if (!username || username.trim().length < 2) {
    return res.status(400).json({ error: 'ユーザー名は2文字以上で入力してください' });
  }
  if (!email || !EMAIL_RE.test(email)) {
    return res.status(400).json({ error: '有効なメールアドレスを入力してください' });
  }
  if (!password || password.length < 8) {
    return res.status(400).json({ error: 'パスワードは8文字以上で入力してください' });
  }

  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, { username: username.trim() }] },
  });
  if (existing) {
    return res.status(409).json({ error: 'このユーザー名またはメールアドレスは既に登録されています' });
  }

  const passwordHash = bcrypt.hashSync(password, 10);
  const user = await prisma.user.create({
    data: { username: username.trim(), email, passwordHash },
  });

  const token = issueToken(user);
  return res.status(201).json({ userId: user.id, token, userProfile: toPublicUser(user) });
}

async function login(req, res) {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ error: 'メールアドレスとパスワードを入力してください' });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    return res.status(401).json({ error: 'メールアドレスまたはパスワードが正しくありません' });
  }

  const token = issueToken(user);
  return res.json({ userId: user.id, token, userProfile: toPublicUser(user) });
}

async function logout(req, res) {
  // ステートレスJWTのためサーバー側では何も破棄せず、クライアント側でのトークン破棄を前提とする
  return res.json({ success: true });
}

async function me(req, res) {
  const user = await prisma.user.findUnique({ where: { id: req.user.sub } });
  if (!user) {
    return res.status(404).json({ error: 'ユーザーが見つかりません' });
  }
  return res.json({ userProfile: toPublicUser(user) });
}

module.exports = { register, login, logout, me, issueToken, toPublicUser };
