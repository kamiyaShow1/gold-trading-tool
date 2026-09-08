require('dotenv').config();
const app = require('./app');
const prisma = require('./config/database');

const PORT = process.env.PORT || 3000;

prisma
  .$connect()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`[server] Gold Trading AI Learning backend が起動しました: http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('[server] データベース接続に失敗したため起動を中止しました', err);
    process.exit(1);
  });

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
