# Phase 2 設計書: デモトレード・チャート・ファンダメンタル分析

Phase 1(認証・学習コンテンツ・クイズ)は `phase1-complete` タグとして完了済み。
本ドキュメントは `gold-trading-design.md` のPhase 2セクションを、Phase 1で確立した実装規約
(Prisma + SQLite、camelCase、`requireAuth`、共通データ/ユーザー別データの分離)に合わせて
具体化・拡張したものです。

## 1. Phase 2 概要

### スコープ

- **デモトレード**: 仮想資金でのXAUUSD(金)売買シミュレーション。エントリー・決済・成績集計。
- **チャート**: 複数時間足(1m/5m/15m/30m/1h/4h/1d)のOHLC + テクニカル指標(EMA/RSI/ATR)表示。
- **ファンダメンタル情報**: FOMC/NFP/CPI/ドル指数/VIXなど、当日の相場材料の一覧表示。

Phase 2で扱わないもの(Phase 3以降):
- 実トレード記録・CSVインポート
- Claude APIによるAI振り返り分析・勝ちパターン抽出
- HFM口座連携

### 目的

学習(Phase 1)で得た知識を、**ノーリスクの仮想売買**で実践に移す段階。
チャートとファンダメンタル情報を見ながらデモトレードを行うことで、
「知識」と「相場観察→意思決定」を接続し、Phase 3の実トレードに備える。

検証観点(ロードマップ上のゴール): デモトレードで **勝率65%以上** を出せるか。

---

## 2. データベース設計追加

Phase 1と同様、Prisma schema(`backend/prisma/schema.prisma`)に追記する形で設計する。
SQLiteはENUM非対応のため、許容値をコメントで明記した文字列型を使う(Phase 1の`LearningContent.category`等と同じ方針)。

### 2.1 DemoTrades テーブル

ユーザー本人の仮想取引記録。1ユーザーが複数件持つ(`User` 1 : N `DemoTrade`)。

```prisma
model DemoTrade {
  id     Int @id @default(autoincrement())
  userId Int

  symbol String @default("XAUUSD")

  entryTime  DateTime
  entryPrice Float
  // entryType: 'buy' | 'sell'
  entryType  String

  exitTime  DateTime?
  exitPrice Float?

  // ロット数。デモ用に固定値運用も可(デフォルト0.01=マイクロロット)
  lotSize Float @default(0.01)

  pips       Float?
  profitLoss Float?
  // status: 'open' | 'closed' | 'cancelled'
  status String @default("open")

  entryReason     String?
  exitReason      String?
  learningChapter String?

  createdAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id])

  @@map("DemoTrades")
}
```

**成績計算の仮定(要確認)**:

- pips計算: XAUUSDは1pip=0.01と仮定(HFMの実際の刻み・コントラクト仕様は Phase 3のHFM連携時に要確認)。
  ```
  pips = (exitPrice - entryPrice) / 0.01 * (entryType === 'buy' ? 1 : -1)
  ```
- 損益計算: `profitLoss = pips * pipValue * lotSize`。`pipValue`(1pipあたりの金額)もブローカー仕様依存のため、
  Phase 2では固定値(例: $1/pip/標準ロット)を定数化し、later Phase 3で実仕様に合わせて補正する前提とする。
- この簡易計算はあくまで「勝率・pips単位の傾向」を見るためのものであり、正確な口座損益の再現を目的としない。

`User` モデルに以下を追加:
```prisma
  demoTrades DemoTrade[]
```

### 2.2 MarketData テーブル

**設計変更(Phase 1の教訓を反映)**: 元設計書ではMarketDataに`userId`が付与されていたが、
相場データ(OHLC・指標)は全ユーザー共通の客観的事実であり、ユーザーごとに複製する意味がない。
Phase 1で`LearningContent`を「ユーザー個別」から「全ユーザー共通カタログ」に変更したのと同じ理由で、
**MarketDataも`userId`を持たない共通テーブル**として設計する。

また、日足以外(1m〜4h)は「日付」だけでは一意に特定できないため、`dataDate`(DATE)ではなく
`timestamp`(DateTime、ローソク足の開始時刻)を主キー相当の識別子として使う。

```prisma
model MarketData {
  id Int @id @default(autoincrement())

  symbol String @default("XAUUSD")
  // timeframe: '1m' | '5m' | '15m' | '30m' | '1h' | '4h' | '1d'
  timeframe String
  timestamp DateTime // ローソク足の開始時刻(UTC)

  open  Float
  high  Float
  low   Float
  close Float

  ema20  Float?
  ema75  Float?
  ema200 Float?
  rsi    Float?
  atr    Float?

  // ファンダメンタル(その時刻時点のイベント・指標値)
  fomc        Boolean @default(false)
  nfp         Boolean @default(false)
  cpi         Float?
  dollarIndex Float?
  vix         Float?

  @@unique([symbol, timeframe, timestamp])
  @@map("MarketData")
}
```

**データ投入について(未解決の依存関係)**: 元設計のアーキテクチャ図では「Make自動化」経由で
外部の金融メディアAPIからレートを取得する想定だが、Phase 2の実装範囲では外部API連携までは行わない。
当面は次のいずれかで対応する(実装順序セクションで詳細):
1. `backend/seeds/`にサンプルOHLCデータを投入するシードスクリプトを用意する(Phase 1の学習コンテンツと同じ方式)
2. 無料の金融データAPI(例: 実装時に選定)を1つ選び、バックフィル用スクリプトを別途作る

どちらを取るかはチャートAPI実装前に決定する。

---

## 3. Backend API 仕様

Phase 1と同じ規約に従う: 全エンドポイントは`requireAuth`必須、`asyncHandler`でラップ、
エラーは`{ error: "日本語メッセージ" }`形式、バリデーション不正は400、対象なしは404。

### 3.1 POST /api/demo-trade/create

デモポジションの新規建て。

**Request body**
```json
{
  "symbol": "XAUUSD",
  "entryType": "buy",
  "entryPrice": 2530.50,
  "entryTime": "2026-09-08T05:00:00.000Z",
  "entryReason": "EMA20がEMA75を上抜けたため",
  "learningChapter": "chapter-3"
}
```

**処理**
- `entryType`が`buy`/`sell`以外、`entryPrice`が数値でない場合 → 400
- `DemoTrade`を`status: "open"`で作成(`userId`は`req.user.sub`)

**Response 201**
```json
{ "trade": { "id": 1, "symbol": "XAUUSD", "entryType": "buy", "entryPrice": 2530.50, "status": "open", ... } }
```

### 3.2 POST /api/demo-trade/:id/close

保有中のデモポジションを決済。

**Request body**
```json
{ "exitPrice": 2531.75, "exitTime": "2026-09-08T05:30:00.000Z", "exitReason": "目標pips到達" }
```

**処理**
- 対象トレードが存在しない、または他ユーザーのものである → 404(存在自体を隠す。CampLogの認可パターンに準拠)
- `status`がすでに`closed`/`cancelled` → 400(「既に決済済みです」)
- pips・profitLossを2.1節の計算式で算出し、`status: "closed"`で更新

**Response 200**
```json
{ "trade": { "id": 1, "pips": 125, "profitLoss": 1.25, "status": "closed", ... } }
```

### 3.3 GET /api/demo-trades

自分のデモトレード一覧+集計統計。

**Query params(任意)**: `status`(`open`|`closed`|`cancelled`)でフィルタ

**Response 200**
```json
{
  "trades": [ { "id": 1, "entryType": "buy", "pips": 125, "profitLoss": 1.25, "status": "closed", ... } ],
  "stats": { "totalTrades": 10, "wins": 6, "losses": 4, "winRate": 60, "totalPips": 320 }
}
```

`stats`は`status: "closed"`のトレードのみで集計(`open`は勝敗未確定のため除外)。

### 3.4 GET /api/market/fundamental-today

当日のファンダメンタル材料をまとめて返す。

**処理**: `MarketData`から`symbol=XAUUSD`かつ`timestamp`が本日直近のレコードを取得し、
`fomc`/`nfp`/`cpi`/`dollarIndex`/`vix`を整形して返す。該当データが無い場合は
`{ available: false }`を返し、フロントは「本日の情報はまだありません」を表示する
(Claude APIによる文章生成(`goldAnalysis`)はPhase 3で追加。Phase 2では数値のみ)。

**Response 200**
```json
{
  "available": true,
  "date": "2026-09-08",
  "fomc": false,
  "nfp": false,
  "cpi": 3.1,
  "dollarIndex": 104.2,
  "vix": 14.8
}
```

### 3.5 GET /api/market/chart/:timeframe

指定時間足のOHLC+指標データ。

**Path param**: `timeframe`は`1m`|`5m`|`15m`|`30m`|`1h`|`4h`|`1d`のいずれか。それ以外は400。

**Query params**: `days`(何日分さかのぼるか。省略時は7)

**Response 200**
```json
{
  "timeframe": "1h",
  "candles": [
    { "timestamp": "2026-09-08T00:00:00.000Z", "open": 2528.0, "high": 2531.2, "low": 2527.5, "close": 2530.5, "ema20": 2529.8, "ema75": 2525.1, "ema200": 2510.3, "rsi": 58.2, "atr": 3.4 }
  ]
}
```

該当データが0件でもエラーにはせず`candles: []`を返す(データ未投入は3-4節と同じ運用課題)。

---

## 4. Frontend 画面設計

Phase 1の`Layout`(Header+Navigation)を踏襲。`Navigation`に「デモ」タブを追加する。

### 4.1 デモトレード画面(`pages/DemoTradePage.jsx`)

```
┌─────────────────────────────────┐
│  デモトレード                     │
├─────────────────────────────────┤
│  バーチャル残高: $100,000         │
│  勝率: 62%（31/50）               │
│                                 │
│  【チャート】(4.2のミニ版を埋め込み)│
│                                 │
│  エントリー理由:                  │
│  [___________________________] │
│  [ 買い ]        [ 売り ]        │
│                                 │
│  【保有中のポジション】            │
│  買い 2530.50 → 含み +12pips     │
│  [ 決済する ]                    │
└─────────────────────────────────┘
```

- 建玉が無ければ「エントリー理由入力＋買い/売りボタン」、建玉があれば「決済ボタン」を表示する
  (同時に1ポジションのみ、という制約はPhase2ではシンプルに固定する)。
- `entryPrice`/`exitPrice`はチャート画面の最新終値を初期値として自動入力しつつ、手動修正も可能にする
  (リアルタイム気配値の外部連携はPhase2スコープ外)。

### 4.2 チャート画面(`components/chart/PriceChart.jsx`)

- 時間足切り替えタブ(1m/5m/15m/30m/1h/4h/1d)
- ローソク足 or ラインチャート + EMA20/75/200のオーバーレイ
- 下部にRSI/ATRのサブパネル
- 描画ライブラリは`lightweight-charts`(軽量・モバイル向き)を新規導入する想定

### 4.3 ファンダメンタル情報パネル(`components/market/FundamentalPanel.jsx`)

```
┌─────────────────────────────────┐
│ 【今日の市場】                    │
│ 🟢 FOMC発表予定なし               │
│ 🔴 NFP発表なし                    │
│ CPI: 3.1%   ドル指数: 104.2      │
│ VIX: 14.8（落ち着き）             │
└─────────────────────────────────┘
```

`GET /api/market/fundamental-today`の`available: false`時は「本日の情報はまだありません」を表示。

### 4.4 デモ成績ダッシュボード(`pages/DemoTradePage.jsx`内 or `DashboardPage.jsx`拡張)

- 勝率・総pips・トレード数をカード表示(Phase 1の`DashboardPage`の進捗カードと同じ`Card`コンポーネントを再利用)
- 直近5件のトレード履歴リスト(勝敗色分け: 緑/赤)

---

## 5. 実装順序(優先度)

依存関係を踏まえ、以下の順で進める。

1. **Backend: DemoTrades API** — `MarketData`が無くても`entryPrice`をクライアントから受け取れば動くため、
   最初に着手可能。スキーマ追加→`prisma migrate`→`demoTradeController`/`routes/demoTrade.js`。
2. **Frontend: デモトレード UI** — チャート無しの状態でも、価格を手入力してエントリー/決済のフローを検証できる。
3. **データ投入方針の決定** — サンプルシード or 外部API選定(2.2節の未解決事項)。ここで手が止まらないよう、
   まずはシードスクリプトでダミーOHLCを用意し、チャートAPIの疎通を優先する。
4. **Backend: チャート API** — `MarketData`シード投入後に`GET /api/market/chart/:timeframe`を実装。
5. **Frontend: チャート表示** — `lightweight-charts`導入、デモトレード画面に埋め込み。
6. **ファンダメンタル情報** — `GET /api/market/fundamental-today` + `FundamentalPanel`。他に比べて依存が薄いため最後でも可。

---

## 6. 実装チェックリスト

**Backend**
- [ ] `DemoTrade`モデル追加・マイグレーション
- [ ] `MarketData`モデル追加・マイグレーション
- [ ] `POST /api/demo-trade/create`
- [ ] `POST /api/demo-trade/:id/close`(他ユーザーのトレードは404、決済済みは400)
- [ ] `GET /api/demo-trades`(stats集計含む)
- [ ] `GET /api/market/fundamental-today`
- [ ] `GET /api/market/chart/:timeframe`(不正なtimeframeは400)
- [ ] `MarketData`シードスクリプト(`backend/seeds/marketData.seed.js`)

**Frontend**
- [ ] `pages/DemoTradePage.jsx`(エントリー/決済フォーム)
- [ ] `components/chart/PriceChart.jsx`(`lightweight-charts`導入)
- [ ] `components/market/FundamentalPanel.jsx`
- [ ] デモ成績カード(勝率・pips・履歴)
- [ ] `Navigation`に「デモ」タブ追加
- [ ] `services/api.js`経由でのAPI呼び出し一式
- [ ] ローカルブラウザでの手動テスト(Phase 1と同じ手順)

---

## 7. 参考情報

元設計書(`gold-trading-design.md`)のPhase 2該当セクション(データベース設計のDemoTrades/MarketData定義、
API仕様書のデモトレード/市場分析API、フロントエンド画面設計のデモトレード開始画面、
開発ロードマップのWeek3-4)を土台に、本ドキュメントでは以下を変更・具体化した。

| 項目 | 元設計書 | 本ドキュメントでの変更点 | 理由 |
|---|---|---|---|
| DB | MySQL想定のSQL(ENUM, AUTO_INCREMENT等) | Prisma schema(SQLite向け、String+コメントでENUM代替) | Phase 1で採用した実装規約と統一 |
| MarketData所有者 | `userId`付き(ユーザー個別) | `userId`なし(全ユーザー共通) | Phase 1のLearningContentと同じ理由(相場データはユーザーの所有物ではない) |
| MarketData識別 | `dataDate`(DATE型) | `timestamp`(DateTime、時刻まで) | 分足・時間足を一意に識別するため |
| pips/損益計算 | 未記載 | 計算式を明記(要確認の仮定付き) | 実装時に迷わないように、ただし正確性はPhase3で要検証 |
| ファンダメンタルの文章分析 | Claude API連携 | Phase 2では数値のみ、文章生成はPhase 3 | AI分析はPhase3スコープのため |

外部データ取得(Make自動化・金融メディアAPI・HFM連携)は元設計のアーキテクチャ図どおりPhase 2では実装せず、
2.2節・5節に記載の通りシードデータで代替する。
