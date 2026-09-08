# 実装ログ

`gold-trading-tool` でこれまでに実装した内容のまとめ。日付・コミットは実際のgit履歴に基づく。

---

## Phase 1: 認証・学習コンテンツ・クイズ(`phase1-complete`タグ)

### Backend基盤
- Express + Prisma(SQLite)構成。CampLogの構成(helmet/cors/express-rate-limit/エラーハンドラ)を踏襲
- `backend/src/app.js`: `/api/health`、認証系のみ厳しめのレート制限(15分/20回)
- `backend/src/config/database.js`: Prisma Clientシングルトン

### 認証API(`/api/auth`)
- `POST /register` — username/email/password、bcryptハッシュ、JWT発行。レスポンス `{ userId, token, username }`
- `POST /login` — 同上レスポンス形式
- `POST /logout`(要認証) / `GET /me`(要認証)
- 重複メール409、パスワード不一致401、バリデーション不正400

### 学習コンテンツAPI(`/api/learning`)
- `LearningContent`・`Quiz`は**全ユーザー共通カタログ**として設計(設計書ではユーザー個別だったが、実装時に共通化。理由: コンテンツはユーザーの所有物ではないため)
- ユーザーごとの進捗は別テーブル`LearningProgress`(1ユーザー1レコード、完了章配列・現在章・進捗率を保持)で管理
- `GET /chapters`(完了フラグ付き一覧) / `GET /chapter/:chapterId`(詳細+紐づくquizId) / `POST /mark-complete/:chapterId` / `GET /progress`
- 次章の自動アンロック制御は未実装(進捗記録のみ)
- `backend/seeds/seed.js`(`npm run seed`)で5章分のコンテンツ+各章5問のクイズを投入

### クイズAPI(`/api/quiz`)
- 問題データは`questionId`/`question`/`options`/`correctAnswer`形式で保持し、`GET /:quizId`では`correctAnswer`を除いて返却(正答漏洩防止)
- `POST /:quizId/submit` — 採点し`score`/`passed`/`feedback`/`analysis`(簡易な不正解問題の列挙)を返却、`QuizResults`に保存
- `GET /results` / `GET /results/:quizId` — 受験履歴

### Frontend基盤
- Vite + React、`react-router-dom` + `axios` + `tailwindcss`(v3系)+ `@tailwindcss/forms`
- `hooks/useAuth.js`: Context化しJWTを`localStorage`に永続化、`RequireAuth`で保護ルート化(`.js`拡張子のためJSXは`createElement`で記述)
- ページ: `LoginPage`(ログイン/新規登録タブ切替) / `DashboardPage`(進捗表示) / `LearningPage`(一覧+詳細、`chapterId`有無で出し分け) / `QuizPage`(回答→採点結果表示)
- 共通コンポーネント: `Layout` / `Header` / `Navigation`、UI部品 `Button` / `Card`

---

## Phase 2: デモトレード・チャート・ファンダメンタル(進行中)

設計書: [`docs/PHASE2.md`](./PHASE2.md)

### スキーマ追加
- `DemoTrade`(ユーザー個別、`User` 1:N): エントリー/決済、pips・損益、`lotSize`(デフォルト0.01)
- `MarketData`(**全ユーザー共通**、`LearningContent`と同じ理由でuserIdなし): symbol+timeframe+timestampで一意。OHLC・EMA20/75/200・RSI・ATR・ファンダメンタル項目(fomc/nfp/cpi/dollarIndex/vix)を保持
- pips計算の仮定(要Phase3で実仕様確認): XAUUSD 1pip=0.01、`buy: (exit-entry)*100`、`sell: (entry-exit)*100`、損益は`pips × $1/pip/標準ロット × lotSize`

### DemoTrades API(`/api/demo-trade`, `/api/demo-trades`)
- `POST /api/demo-trade/create` — entryType/entryPrice/lotSizeバリデーション(400)
- `POST /api/demo-trade/:tradeId/close` — 他ユーザー/不存在は404、決済済みへの再決済は400、pips・損益を計算し`status: closed`に更新
- `GET /api/demo-trades` — `status`フィルタ、`{trades, stats: {totalTrades, openTrades, closedTrades, wins, losses, winRate, totalPips, totalProfitLoss}}`

### MarketDataシード
- `backend/seeds/seed.js`に追加(指示では`prisma/seed.js`だったが、実際に`npm run seed`が参照する既存ファイルに統合)
- 2026-09-04〜09-08の5日 × 7時間足(1m/5m/15m/30m/1h/4h/1d) = 35件、`upsert`で再実行安全

### チャート・ファンダメンタルAPI(`/api/market`)
- `GET /chart/:timeframe?days=N` — 不正timeframe/daysは400、データなしは200+空配列、`{timeframe, symbol, data: [...]}`
- `GET /fundamental-today` — `1d`足を当日の代表値として使用、VIX水準に応じたルールベースの`analysis`文を生成(Claude APIによる本格分析はPhase3)

### Frontend: デモトレード画面
- `pages/DemoTradePage.jsx` — チャート(上部)+ フォーム/成績/ポジション一覧(下部グリッド)
- `components/trade/DemoTradeForm.jsx` — 買い/売り切替、価格・ロット・理由、クライアント側バリデーション、チャート連動の「現在値を使用」ボタン
- `components/trade/PositionList.jsx` — 保有ポジション一覧、現在価格の参考入力による未実現pips/損益表示
- `components/trade/CloseTradeForm.jsx` — 決済→結果表示→「閉じる」で一覧リロード
- `components/trade/DemoStats.jsx` — 総トレード数/勝敗/勝率/pips/損益/平均pips
- `components/trade/PriceChart.jsx` — `lightweight-charts` v5(`addSeries`+`paneIndex`)。ローソク足+EMA20/75/200オーバーレイ、RSI/ATRを別ペイン表示、時間足切替、インジケータON/OFF、レスポンシブ、ローディング/エラー/タイムアウト表示

### 動作確認について
- バックエンドAPIは全機能をcurlで確認(正常系・400/401/404のエラーケース含む)
- フロントエンドはClaude in Chrome拡張が使えない環境のため、ヘッドレスChromium(Playwright)を一時セットアップして実クリック操作を検証(その都度クリーンアップ、リポジトリには含めていない)
- 開発中に発見・修正した環境起因の不具合:
  - `backend/.env`の`CORS_ORIGIN`が`5174`になっており実際のフロントエンド(`5173`)からの通信がすべてブロックされていた → `5173`に修正
  - Viteは`.env`変更をホットリロードしないため、ポート変更後はdevサーバー再起動が必要

### 未実装(このあと)
- `FundamentalPanel.jsx`(ファンダメンタル情報パネルのUI)
- デモ成績のダッシュボード統合表示
- Phase 3: 実トレード記録・CSVインポート・Claude APIによるAI振り返り分析・HFM連携
