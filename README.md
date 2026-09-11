# Gold Trading AI Learning Platform (gold-trading-tool)

金(XAUUSD)トレードの学習からデモトレードでの実践までを一貫して行うためのWebアプリ。

## 1. 現在の技術スタック

| 領域 | 技術 |
|---|---|
| **Backend** | Node.js + Express、Prisma ORM |
| **Database** | PostgreSQL（Neon） |
| **Authentication** | JWT（`jsonwebtoken` + `bcryptjs`） |
| **Frontend** | React + Vite、`react-router-dom` + `axios` + Tailwind CSS |
| **Chart** | `lightweight-charts`（ローソク足 + EMA20/75/200 + RSI/ATR） |
| **Deployment** | Frontend＝Vercel、Backend＝Render、DB＝Neon（PostgreSQL） |

## 2. アーキテクチャ概要

```
Frontend (React + Vite)
  Vercel でホスティング
        │  HTTPS
        ▼
Backend API (Express + Prisma)
  Render でホスティング
        │
        ▼
Neon (PostgreSQL)
```

- フロントエンドは`VITE_API_URL`でバックエンドのオリジンを参照する
- バックエンドはNeonへ`DATABASE_URL`（PostgreSQL接続文字列、プール接続）で接続する
- 秘密情報（APIキー・接続文字列等の値）はこのドキュメントには記載しない

## 3. 主要ディレクトリ

```
backend/    Express API、Prisma schema/migrations、seeds
frontend/   React + Vite SPA
docs/       設計書・実装ログ
render.yaml         Renderデプロイ設定
frontend/vercel.json Vercelデプロイ設定（SPA rewrite）
```

## 4. 実装済みページ（Frontend）

| パス | 内容 | 認証 |
|---|---|---|
| `/login` | ログイン・新規登録 | 不要 |
| `/dashboard` | 学習進捗の表示 | 必要 |
| `/learning`, `/learning/:chapterId` | 学習コンテンツ一覧・詳細 | 必要 |
| `/quiz/:quizId` | クイズ回答・採点結果 | 必要 |
| `/demo-trade` | チャート・デモトレード・今日の市場（ファンダメンタル） | 必要 |

## 5. 開発環境・セットアップ

**環境変数**（設定例は`.env.example`を参照）：

- バックエンド（`backend/.env`）：`PORT`／`NODE_ENV`／`DATABASE_URL`／`JWT_SECRET`／`JWT_EXPIRES_IN`／`CORS_ORIGIN`
  - `DATABASE_URL`はNeonのプール接続文字列を使用（`?sslmode=require&channel_binding=require`が付く）。クォートで囲む際に末尾へ余分な空白を入れないよう注意（dotenvがそのまま値に含めるため接続エラーの原因になる）
- フロントエンド（`frontend/.env`）：`VITE_API_URL`

```bash
# バックエンド起動（別ターミナル、プロジェクトルートのbackendで）
cd backend
npm run dev

# フロントエンド起動（ポート5173）
cd frontend
npm run dev
```

## 6. デプロイ手順

### ① Neon（DB）
1. [Neon Console](https://console.neon.tech) → 対象プロジェクトを開く
2. **SQL Editor** に `backend/prisma/migrations/001_init.sql` の内容を貼り付けて実行し、テーブルを作成する

### ② Render（Backend）
1. [Render Dashboard](https://dashboard.render.com) → **New** → **Blueprint** → 本リポジトリを選択（`render.yaml`を自動検出）
2. 環境変数を設定：`DATABASE_URL`（Neon接続文字列）／`JWT_SECRET`／`JWT_EXPIRES_IN`／`CORS_ORIGIN`
3. デプロイ後、`https://<サービス名>.onrender.com/api/health` で疎通確認

### ③ Vercel（Frontend）
1. [Vercel](https://vercel.com/new) → 本リポジトリをImport
2. **Root Directory** を `frontend` に設定（モノレポ構成のため必須）
3. 環境変数：`VITE_API_URL`（②で発行されたRenderのURL + `/api`）
4. デプロイ後、発行されたURLをRenderの`CORS_ORIGIN`に反映し再デプロイ

## 7. 既知の技術的負債・注意点

- `backend/prisma/migrations/001_init.sql`はPrisma標準のmigrationフォルダ形式（`<timestamp>_name/migration.sql` + `migration_lock.toml`）ではない単体SQLファイル。`prisma migrate deploy`では認識されないため、今後のスキーマ変更は同様に手動SQL管理になる
- `DATABASE_URL`はNeonのプール接続（`-pooler`ホスト）。将来Prisma経由で`prisma migrate deploy`を行う場合は、Neonの直接接続用URLを`directUrl`として別途設定することを検討する
- `render.yaml`の`startCommand`は`npm start`のみで、migration自動適用を含まない
- Phase 3（実トレード記録・CSVインポート・Claude APIによるAI振り返り分析・HFM連携）は未着手

## 8. Documentation

| ドキュメント | 内容 |
|---|---|
| `docs/CHANGELOG.md` | 日付別の実装ログ |
| `docs/PHASE2.md` | Phase 2（デモトレード・チャート・ファンダメンタル）設計書 |
