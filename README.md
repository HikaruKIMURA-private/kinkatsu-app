This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## ローカル開発環境のセットアップ

### 前提条件

- Docker Desktop がインストールされ、起動していること
- Supabase CLI がインストールされていること（`brew install supabase/tap/supabase`）

### 環境変数の設定

プロジェクトルートに `.env.local` ファイルを作成し、以下の内容を設定してください：

```env
# ローカルSupabase接続
DATABASE_URL="postgresql://postgres:postgres@localhost:54322/postgres"

# Better Auth設定
BETTER_AUTH_SECRET="your-local-secret-key-change-this-in-production"
BETTER_AUTH_URL="http://localhost:3000"

# GitHub OAuth（開発用）
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"
```

### ローカルSupabaseの起動

```bash
# Supabaseを起動
bun run supabase:start

# または、SupabaseとNext.jsを同時に起動
bun run dev:local
```

起動後、以下のURLでアクセスできます：
- Supabase Studio: http://localhost:54323
- Next.js アプリ: http://localhost:3000

### データベースマイグレーション

ローカルSupabaseにマイグレーションを適用：

```bash
bun run db:migrate
```

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
# kinkatsu-app
