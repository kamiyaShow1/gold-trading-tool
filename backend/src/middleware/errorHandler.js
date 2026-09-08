function notFound(req, res) {
  res.status(404).json({ error: `不明なエンドポイントです: ${req.method} ${req.originalUrl}` });
}

function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  console.error(err);
  const status = err.status || 500;
  const message = status < 500 ? err.message || 'リクエストが正しくありません' : 'サーバー内部エラーが発生しました';
  res.status(status).json({ error: message });
}

module.exports = { notFound, errorHandler };
