# Gym Training Log - タスク分割

このドキュメントは、実装をタスクごとに分割したものです。各タスクを順番に実装し、コミット単位でレビューと改善を行います。

---

## 📋 タスク一覧

### Task 1: Tailwind + shadcn/ui セットアップ

**目的**: UI 基盤の構築

**作業内容**:

- [x] Tailwind CSS の設定確認・調整
- [x] shadcn/ui のインストールと初期設定
- [x] `components/ui` ディレクトリの作成
- [x] 基本的なコンポーネント（Button, Card, Input 等）の追加
- [x] Chart コンポーネントの追加（shadcn/ui Chart コンポーネントを手動で実装）
- [x] `globals.css` に shadcn/ui のスタイルを統合

**確認事項**:

- [x] `components.json` が作成され、shadcn/ui の設定が完了
- [x] コンポーネントが正しくインポートできる（ビルド成功を確認）
- [x] Tailwind のクラスが適用される（ビルド成功を確認）

**コミットメッセージ例**:

```
feat: Tailwind CSS と shadcn/ui をセットアップ
```

---

### Task 2: ローカル開発環境のデータベースセットアップ

**目的**: ローカル開発用のデータベース環境を構築する

**概要**: 
ローカル開発では、Supabase CLIを使用して自分のPC上でデータベースを動かします。これにより、本番環境に影響を与えずに開発・テストができます。

**前提条件**:
- Docker Desktop がインストールされ、起動していること
- Supabase CLI がインストールされていること

---

#### 2-1. Supabase CLI のインストール

**なぜ必要か**: 
Supabase CLIは、ローカルでSupabaseの全機能（データベース、認証、ストレージなど）を動かすためのツールです。

**作業内容**:

- [x] Supabase CLI のインストール確認
  ```bash
  # macOS (Homebrew)
  brew install supabase/tap/supabase
  
  # または npm経由
  npm install -g supabase
  ```
- [x] インストール確認
  ```bash
  supabase --version
  ```

**確認事項**:
- [x] `supabase --version` でバージョンが表示される

---

#### 2-2. ローカルSupabaseプロジェクトの初期化

**なぜ必要か**: 
プロジェクトにSupabaseの設定ファイルを追加し、ローカル開発環境を準備します。

**作業内容**:

- [x] プロジェクトルートで初期化コマンドを実行
  ```bash
  supabase init
  ```
- [x] `supabase/` ディレクトリが作成されたことを確認

**確認事項**:
- [x] `supabase/` ディレクトリが存在する
- [x] `supabase/config.toml` ファイルが存在する

---

#### 2-3. 環境変数の設定

**なぜ必要か**: 
アプリケーションがローカルのデータベースに接続するために、接続情報を環境変数として設定する必要があります。

**重要**: 
Prisma CLIは `.env` ファイルを優先的に読み込みます。ローカル開発時は `.env` にローカルSupabaseの接続情報を設定してください。

**作業内容**:

- [x] `.env` ファイルを作成（または既存の `.env` を確認）
- [x] ローカルSupabaseの接続情報を設定
  ```env
  # ローカルSupabase接続
  # ローカルSupabaseを起動するには: npm run supabase:start
  DATABASE_URL="postgresql://postgres:postgres@localhost:54322/postgres"
  
  # Better Auth設定
  BETTER_AUTH_SECRET="your-local-secret-key-change-this-in-production"
  BETTER_AUTH_URL="http://localhost:3000"
  
  # GitHub OAuth（開発用）
  GITHUB_CLIENT_ID="your-github-client-id"
  GITHUB_CLIENT_SECRET="your-github-client-secret"
  ```
- [x] `.env.local` ファイルも同様に設定（Next.js用）
- [x] 本番環境用の設定は `.env.production` に保存

**注意事項**:
- `.env` ファイルは `.gitignore` に含まれているため、コミットされません
- 本番環境の接続情報は `.env.production` に保存し、Gitにはコミットしないでください
- ローカル開発時は `.env` が優先されます

**確認事項**:
- [x] `.env` ファイルに `DATABASE_URL` が設定されている
- [x] 接続先が `localhost:54322` になっている（ローカルSupabase）

---

#### 2-4. ローカルSupabaseの起動

**なぜ必要か**: 
ローカルでデータベースを動かすために、Supabaseのコンテナを起動する必要があります。

**作業内容**:

- [x] `package.json` にSupabase起動スクリプトを追加
  ```json
  {
    "scripts": {
      "supabase:start": "supabase start",
      "supabase:stop": "supabase stop",
      "supabase:status": "supabase status",
      "dev:local": "supabase start && next dev"
    }
  }
  ```
- [x] ローカルSupabaseを起動
  ```bash
  npm run supabase:start
  # または
  bun run supabase:start
  ```
- [x] 起動後の接続情報を確認
  ```bash
  npm run supabase:status
  ```

**起動後の情報**:
- **API URL**: `http://localhost:54321`
- **DB URL**: `postgresql://postgres:postgres@localhost:54322/postgres`
- **Studio URL**: `http://localhost:54323` (データベース管理画面)
- **Inbucket URL**: `http://localhost:54324` (メールテスト用)

**トラブルシューティング**:
- ポートが既に使用されている場合: 他のSupabaseインスタンスを停止してください
  ```bash
  # 別プロジェクトで実行
  supabase stop
  ```

**確認事項**:
- [x] `supabase status` で全てのサービスが起動している
- [x] Supabase Studio (`http://localhost:54323`) にアクセスできる

---

#### 2-5. Prisma スキーマの作成とマイグレーション

**なぜ必要か**: 
データベースのテーブル構造を定義し、実際のデータベースに反映する必要があります。

**作業内容**:

- [x] Prisma のインストール（既に完了している場合も確認）
- [x] `prisma/schema.prisma` の作成（仕様書のスキーマを反映）
- [x] `lib/prisma.ts` の作成（Prisma Client のシングルトン）
- [x] ローカルSupabaseにマイグレーションを適用
  ```bash
  npm run db:migrate
  # または
  bun run db:migrate
  ```

**マイグレーションとは**: 
データベースの構造（テーブル、カラム、インデックスなど）を変更するための仕組みです。スキーマファイルを変更し、マイグレーションを実行することで、データベースが更新されます。

**確認事項**:
- [x] マイグレーションが正常に実行される
- [x] エラーメッセージが表示されない
- [x] `supabase status` でデータベースが起動していることを確認
- [x] Prisma Client が正しく生成される

**トラブルシューティング**:
- マイグレーションが本番環境に接続しようとする場合:
  - `.env` ファイルにローカルSupabaseの接続情報が設定されているか確認
  - `.env.production` に本番環境の設定がある場合、`.env` が優先されることを確認

---

#### 2-6. 初期データの投入（シード）

**なぜ必要か**: 
開発を始める際に、テスト用のデータがあると便利です。例えば、種目（Exercise）のマスターデータなどです。

**作業内容**:

- [x] `prisma/seed.ts` の作成（初期種目データ）
- [x] `package.json` に `prisma db seed` スクリプト追加（既に設定済み）
- [x] 初期データを投入
  ```bash
  npm run db:seed
  # または
  bun run db:seed
  ```

**確認事項**:
- [x] シードが正常に実行される
- [x] 初期種目がデータベースに投入されている
- [x] Supabase Studioでデータを確認できる

---

#### 2-7. 動作確認

**作業内容**:

- [x] Next.jsアプリを起動
  ```bash
  npm run dev
  # または
  bun run dev
  ```
- [x] アプリケーションが正常に起動する
- [x] データベース接続エラーが発生しない

**確認事項**:
- [x] アプリケーションが `http://localhost:3000` で起動する
- [x] データベースクエリが正常に動作する
- [x] エラーログにデータベース接続エラーが表示されない

**コミットメッセージ例**:

```
feat: ローカル開発環境のデータベースセットアップを完了
```

---

### Task 3: 本番環境のデータベースセットアップ

**目的**: 本番環境（Vercel等）で使用するSupabaseプロジェクトの設定

**概要**: 
本番環境では、Supabaseのクラウドサービスを使用します。ローカル開発とは別のプロジェクトとして管理します。

**前提条件**:
- Supabaseアカウントを持っていること
- 本番環境にデプロイする準備ができていること

---

#### 3-1. Supabaseプロジェクトの作成

**なぜ必要か**: 
本番環境で使用するデータベースをSupabaseのクラウド上に作成する必要があります。

**作業内容**:

- [x] [Supabase](https://supabase.com) にログイン
- [x] 新しいプロジェクトを作成
  - プロジェクト名を設定
  - データベースパスワードを設定（重要: 安全に保管）
  - リージョンを選択（例: `ap-northeast-1`）
- [x] プロジェクトの作成完了を待つ（数分かかります）

**確認事項**:
- [x] プロジェクトが正常に作成される
- [x] プロジェクトダッシュボードにアクセスできる

---

#### 3-2. 接続情報の取得

**なぜ必要か**: 
アプリケーションが本番環境のデータベースに接続するために、接続情報が必要です。

**作業内容**:

- [x] Supabaseプロジェクトの設定画面を開く
- [x] 「Project Settings」→「Database」を開く
- [x] 接続情報を確認
  - **Connection string**: 直接接続用
  - **Connection pooling**: 接続プール用（推奨）

**接続モードの選択**:
- **Transaction モード（推奨）**: アプリケーションからの接続に適している
- **Session モード**: マイグレーション実行時に使用

**確認事項**:
- [x] 接続文字列が表示される
- [x] 接続プールのURLが取得できる

---

#### 3-3. 環境変数の設定（本番環境）

**なぜ必要か**: 
本番環境（Vercel等）で環境変数を設定する必要があります。ローカル開発用とは別の設定を使用します。

**作業内容**:

- [x] `.env.production` ファイルを作成（ローカル開発用のバックアップとして）
  ```env
  # 本番環境用Supabase接続（接続プール URL - Transaction モード）
  DATABASE_URL="postgresql://postgres.xxxxx:password@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
  
  # Better Auth設定
  BETTER_AUTH_SECRET="your-production-secret-key"
  BETTER_AUTH_URL="https://your-production-domain.com"
  
  # GitHub OAuth（本番用）
  GITHUB_CLIENT_ID="your-production-github-client-id"
  GITHUB_CLIENT_SECRET="your-production-github-client-secret"
  ```
- [x] Vercel（または他のデプロイ先）で環境変数を設定
  - Vercelダッシュボード → プロジェクト設定 → Environment Variables
  - 上記の環境変数を追加

**重要**: 
- `.env.production` はGitにコミットしないでください（`.gitignore`に含まれています）
- 本番環境の接続情報は機密情報です。絶対に公開しないでください
- Vercelなどのデプロイ先では、環境変数を直接設定します

**確認事項**:
- [x] `.env.production` ファイルが作成されている（ローカルバックアップ用）
- [x] Vercelで環境変数が設定されている

---

#### 3-4. 本番環境へのマイグレーション適用

**なぜ必要か**: 
本番環境のデータベースにも、ローカルと同じスキーマを適用する必要があります。

**作業内容**:

- [x] 本番環境の接続情報を一時的に `.env` に設定（マイグレーション実行時のみ）
  ```bash
  # 注意: マイグレーション実行後は、ローカル開発用の設定に戻してください
  ```
- [x] 本番環境にマイグレーションを適用
  ```bash
  npm run db:migrate:deploy
  # または
  bun run db:migrate:deploy
  ```
- [x] マイグレーション後、`.env` をローカル開発用の設定に戻す

**より安全な方法**:
- Vercelの環境変数を設定した後、Vercelのビルドプロセスでマイグレーションを実行
- または、CI/CDパイプラインでマイグレーションを実行

**確認事項**:
- [x] マイグレーションが正常に実行される
- [x] 本番環境のデータベースにテーブルが作成される
- [x] エラーメッセージが表示されない

---

#### 3-5. 接続テスト

**なぜ必要か**: 
本番環境のデータベースに正しく接続できることを確認する必要があります。

**作業内容**:

- [x] 本番環境の接続情報で接続テスト
  ```bash
  # Prisma Studioで確認（オプション）
  npx prisma studio
  ```
- [x] 本番環境のSupabaseダッシュボードでテーブルを確認

**確認事項**:
- [x] 接続エラーが発生しない
- [x] テーブルが正しく作成されている
- [x] データベースクエリが正常に動作する

---

#### 3-6. 本番環境での動作確認

**作業内容**:

- [x] 本番環境にデプロイ
- [x] アプリケーションが正常に動作する
- [x] データベース接続エラーが発生しない
- [x] 認証機能が正常に動作する

**確認事項**:
- [x] 本番環境のアプリケーションが起動する
- [x] データベースクエリが正常に動作する
- [x] エラーログにデータベース接続エラーが表示されない

**コミットメッセージ例**:

```
feat: 本番環境のSupabase接続設定を追加
```

**注意**: 
- `.env.production` はコミットしない
- 本番環境の接続情報は機密情報として扱う

---

### Task 4: better-auth 認証システムのセットアップ

**目的**: ユーザー認証機能を実装する（メール/パスワード認証とGitHub OAuth）

**概要**: 
better-authは、Next.jsアプリケーション用の認証ライブラリです。メール/パスワード認証とOAuth（GitHub）の両方をサポートしています。

**前提条件**:
- Task 2（ローカル開発環境のデータベースセットアップ）が完了していること
- Prismaスキーマが設定されていること

---

#### 4-1. better-auth パッケージのインストール

**なぜ必要か**: 
better-authとその関連パッケージをインストールする必要があります。

**作業内容**:

- [x] better-auth のインストール
  ```bash
  npm install better-auth
  # または
  bun add better-auth
  ```
- [x] Passkeyサポート（オプション）のインストール
  ```bash
  npm install @better-auth/passkey
  # または
  bun add @better-auth/passkey
  ```

**確認事項**:
- [x] `package.json` に `better-auth` が追加されている
- [x] インストールエラーが発生しない

---

#### 4-2. Prismaスキーマにbetter-authテーブルを追加

**なぜ必要か**: 
better-authは、ユーザー情報、セッション、アカウント情報などをデータベースに保存します。これらのテーブルをPrismaスキーマに定義する必要があります。

**作業内容**:

- [x] `prisma/schema.prisma` にbetter-auth用のモデルを追加
  - `User` モデル（ユーザー情報）
  - `Session` モデル（セッション情報）
  - `Account` モデル（OAuthアカウント情報）
  - `Verification` モデル（メール認証用）
  - `Passkey` モデル（WebAuthn/Passkey用、オプション）

**スキーマ例**:
```prisma
// better-auth 用のテーブル（デフォルト命名）
model User {
  id            String   @id @default(cuid())
  name          String?
  email         String   @unique
  emailVerified Boolean  @default(false)
  image         String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  accounts Account[]
  sessions Session[]
  passkeys Passkey[]
  workouts Workout[] // アプリケーション固有のリレーション

  @@map("user")
}

model Session {
  id        String   @id @default(cuid())
  expiresAt DateTime
  token     String   @unique
  ipAddress String?
  userAgent String?
  userId    String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([token])
  @@map("session")
}

model Account {
  id                String   @id @default(cuid())
  accountId         String
  providerId        String
  userId            String
  accessToken       String?
  refreshToken      String?
  idToken           String?
  expiresAt         DateTime?
  password          String?
  scope             String?  // GitHub OAuth用
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([providerId, accountId])
  @@index([userId])
  @@map("account")
}

model Verification {
  id         String   @id @default(cuid())
  identifier String
  value      String
  expiresAt  DateTime
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  @@unique([identifier, value])
  @@map("verification")
}

model Passkey {
  id           String   @id @default(cuid())
  name         String?
  publicKey    String   @db.Text
  userId       String
  credentialID String   @unique @map("credentialId")
  counter      BigInt   @default(0)
  deviceType   String
  backedUp     Boolean  @default(false)
  transports   String?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([credentialID])
  @@map("passkey")
}
```

**重要**: 
- `Account` モデルに `scope` フィールドを追加することで、GitHub OAuthのスコープ情報を保存できます
- モデル名は `@@map()` でテーブル名を指定しています（better-authのデフォルト命名規則に合わせる）

**確認事項**:
- [x] 全てのモデルが正しく定義されている
- [x] リレーション（`@relation`）が正しく設定されている
- [x] インデックスが適切に設定されている

---

#### 4-3. マイグレーションの実行

**なぜ必要か**: 
スキーマの変更をデータベースに反映する必要があります。

**作業内容**:

- [x] マイグレーションファイルの作成と適用
  ```bash
  npm run db:migrate
  # または
  bun run db:migrate
  ```
- [x] マイグレーション名を指定（例: `add_better_auth_tables`）

**確認事項**:
- [x] マイグレーションが正常に実行される
- [x] データベースにテーブルが作成される
- [x] Supabase Studioでテーブルを確認できる

---

#### 4-4. 環境変数の設定

**なぜ必要か**: 
better-authは、セッションの暗号化やOAuth認証のために環境変数が必要です。

**作業内容**:

- [x] `.env` ファイルに以下を追加（ローカル開発用）
  ```env
  # Better Auth設定
  BETTER_AUTH_SECRET="your-local-secret-key-change-this-in-production"
  BETTER_AUTH_URL="http://localhost:3000"
  
  # GitHub OAuth（開発用）
  GITHUB_CLIENT_ID="your-github-client-id"
  GITHUB_CLIENT_SECRET="your-github-client-secret"
  ```
- [x] `.env.local` にも同様の設定を追加（Next.js用）

**BETTER_AUTH_SECRET の生成方法**:
```bash
# ランダムな文字列を生成（32文字以上推奨）
openssl rand -base64 32
# または
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**重要**: 
- `BETTER_AUTH_SECRET` は機密情報です。絶対に公開しないでください
- 本番環境では、より強力なシークレットを使用してください
- ローカル開発用と本番環境用で異なるシークレットを使用してください

**確認事項**:
- [x] `.env` ファイルに環境変数が設定されている
- [x] `BETTER_AUTH_SECRET` が32文字以上である

---

#### 4-5. GitHub OAuthアプリの作成

**なぜ必要か**: 
GitHub OAuthを使用するには、GitHub上でOAuthアプリを作成し、クライアントIDとシークレットを取得する必要があります。

**作業内容**:

- [x] GitHubにログイン
- [x] Settings → Developer settings → OAuth Apps に移動
- [x] 「New OAuth App」をクリック
- [x] 以下の情報を入力:
  - **Application name**: アプリケーション名（例: "Gym Training Log"）
  - **Homepage URL**: `http://localhost:3000`（ローカル開発用）
  - **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`
- [x] 「Register application」をクリック
- [x] **Client ID** と **Client secrets** をコピー
- [x] `.env` ファイルに設定
  ```env
  GITHUB_CLIENT_ID="取得したClient ID"
  GITHUB_CLIENT_SECRET="取得したClient secrets"
  ```

**本番環境用の設定**:
- 本番環境用にも別のOAuthアプリを作成することを推奨
- Authorization callback URL: `https://your-production-domain.com/api/auth/callback/github`

**確認事項**:
- [x] GitHub OAuthアプリが作成されている
- [x] Client IDとClient secretsが取得できている
- [x] `.env` ファイルに設定されている

---

#### 4-6. サーバーサイド設定（lib/auth.ts）の作成

**なぜ必要か**: 
better-authのサーバーサイド設定を作成し、データベースアダプターや認証プロバイダーを設定します。

**作業内容**:

- [x] `lib/auth.ts` ファイルを作成
- [x] better-authの設定を実装

**実装例**:
```typescript
import "server-only";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { cookies } from "next/headers";
import { baseUrl } from "./base-url";
import { prisma } from "./prisma";

// better-auth の設定（デフォルト命名を使用）
export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: baseUrl(),
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  user: {
    modelName: "User",
  },
  session: {
    modelName: "Session",
  },
  account: {
    modelName: "Account",
  },
  verification: {
    modelName: "Verification",
  },
  passkey: {
    modelName: "Passkey",
  },
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    },
  },
  plugins: [nextCookies()],
});

// セッションからユーザーIDを取得するヘルパー関数
export async function getSessionUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  const session = await auth.api.getSession({
    headers: {
      cookie: cookieStore.toString(),
    },
  });

  return session?.user?.id || null;
}

// 現在のユーザーを取得
export async function getCurrentUser() {
  const sessionUserId = await getSessionUserId();
  if (!sessionUserId) return null;

  // better-auth の User を直接取得
  const user = await prisma.user.findUnique({
    where: { id: sessionUserId },
  });

  return user;
}
```

**設定の説明**:
- `secret`: セッションの暗号化に使用
- `baseURL`: アプリケーションのベースURL（環境に応じて自動設定）
- `database`: Prismaアダプターを使用してデータベースに接続
- `emailAndPassword`: メール/パスワード認証を有効化
- `socialProviders`: GitHub OAuthを設定
- `plugins`: Next.js用のCookieプラグイン

**確認事項**:
- [x] `lib/auth.ts` ファイルが作成されている
- [x] 設定が正しく記述されている
- [x] TypeScriptのエラーが発生しない

---

#### 4-7. クライアントサイド設定（lib/auth-client.ts）の作成

**なぜ必要か**: 
クライアントサイド（ブラウザ）から認証機能を使用するために、クライアント用の設定が必要です。

**作業内容**:

- [x] `lib/auth-client.ts` ファイルを作成
- [x] better-authのクライアント設定を実装

**実装例**:
```typescript
"use client";

import { inferAdditionalFields } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import type { auth } from "./auth";
import { baseUrl } from "./base-url";

export const authClient = createAuthClient({
  baseURL: baseUrl(),
  plugins: [inferAdditionalFields<typeof auth>()],
});
```

**設定の説明**:
- `baseURL`: サーバーサイドと同じベースURLを使用
- `plugins`: サーバーサイドの設定を推論するプラグイン

**確認事項**:
- [x] `lib/auth-client.ts` ファイルが作成されている
- [x] `"use client"` ディレクティブが記述されている
- [x] TypeScriptのエラーが発生しない

---

#### 4-8. APIルートの作成

**なぜ必要か**: 
better-authの認証エンドポイント（ログイン、ログアウト、OAuthコールバックなど）を処理するAPIルートが必要です。

**作業内容**:

- [x] `app/api/auth/[...all]/route.ts` ファイルを作成
- [x] better-authのハンドラーを実装

**実装例**:
```typescript
import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(auth);
```

**説明**:
- `[...all]` はNext.jsの動的ルートで、`/api/auth/*` の全てのパスを処理します
- `toNextJsHandler` はbetter-authのハンドラーをNext.jsのAPIルート形式に変換します

**確認事項**:
- [x] `app/api/auth/[...all]/route.ts` ファイルが作成されている
- [x] GETとPOSTハンドラーがエクスポートされている

---

#### 4-9. baseUrl関数の確認

**なぜ必要か**: 
better-authは、アプリケーションのベースURLを環境に応じて自動設定する必要があります。

**作業内容**:

- [x] `lib/base-url.ts` ファイルを確認（既に存在する場合）
- [x] 環境に応じてURLを返す関数を実装

**実装例**:
```typescript
export const baseUrl = (options?: { useCommitURL?: boolean }) => {
  const isProd = process.env.NEXT_PUBLIC_VERCEL_ENV === "production";
  const url = isProd
    ? process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL
    : options?.useCommitURL
      ? process.env.NEXT_PUBLIC_VERCEL_URL
      : process.env.NEXT_PUBLIC_VERCEL_BRANCH_URL;

  return url
    ? `https://${url}`
    : `http://localhost:${process.env.PORT || 3000}`;
};
```

**確認事項**:
- [x] `lib/base-url.ts` ファイルが存在する
- [x] ローカル開発時は `http://localhost:3000` を返す
- [x] 本番環境では適切なURLを返す

---

#### 4-10. ログインページの作成

**なぜ必要か**: 
ユーザーがログインできるUIが必要です。

**作業内容**:

- [x] `app/login/page.tsx` ファイルを作成
- [x] メール/パスワード認証のフォームを実装
- [x] GitHub OAuthログインボタンを実装
- [x] 新規登録機能を実装
- [x] エラーハンドリングを実装

**実装のポイント**:
- `authClient.signIn.email()` でメール/パスワードログイン
- `authClient.signUp.email()` で新規登録
- `authClient.signIn.social()` でGitHub OAuthログイン
- ログイン成功後は `/dashboard` にリダイレクト

**確認事項**:
- [x] ログインページが表示される
- [x] メール/パスワードフォームが動作する
- [x] GitHubログインボタンが動作する
- [x] エラーメッセージが適切に表示される

---

#### 4-11. 動作確認

**作業内容**:

- [x] 開発サーバーを起動
  ```bash
  npm run dev
  # または
  bun run dev
  ```
- [x] ログインページにアクセス（`http://localhost:3000/login`）
- [x] メール/パスワードで新規登録をテスト
- [x] メール/パスワードでログインをテスト
- [x] GitHub OAuthでログインをテスト
- [x] ログイン後に `/dashboard` にリダイレクトされることを確認
- [x] セッションが保持されることを確認（ページをリロードしてもログイン状態が維持される）

**トラブルシューティング**:
- **"Failed to fetch" エラー**: 
  - 開発サーバーが起動しているか確認
  - 環境変数が正しく設定されているか確認
- **GitHub OAuthが動作しない**: 
  - GitHub OAuthアプリのコールバックURLが正しいか確認
  - Client IDとClient secretsが正しく設定されているか確認
- **セッションが保持されない**: 
  - `BETTER_AUTH_SECRET` が設定されているか確認
  - Cookieが正しく設定されているか確認（ブラウザの開発者ツールで確認）

**確認事項**:
- [x] 全ての認証方法が正常に動作する
- [x] エラーハンドリングが適切に機能する
- [x] セッションが正しく保持される
- [x] ビルドが成功する

**コミットメッセージ例**:

```
feat: better-auth と GitHub OAuth 認証を実装
```

---

### Task 5: getCurrentUser() 実装

**目的**: better-auth の User を直接取得

**作業内容**:

- [x] `lib/auth.ts` の `getCurrentUser()` を完全実装
- [x] better-auth のセッション取得ロジック
- [x] better-auth の User を直接取得（マッピング不要）
- [ ] エラーハンドリング

**確認事項**:

- [ ] 認証済みユーザーが正しく取得される
- [ ] 未認証時は `null` を返す
- [ ] エラーが適切に処理される

**コミットメッセージ例**:

```
feat: getCurrentUser() を実装（better-auth User を直接使用）
```

---

### Task 6: /exercises & /exercises/new（Action + revalidateTag(TAG.EXERCISES)）

**目的**: 種目一覧と追加機能の実装

**作業内容**:

- [ ] `lib/tags.ts` の作成（キャッシュタグ定義）
- [ ] `app/(data)/get-exercises.ts` の作成（`"use cache"` 付き）
- [ ] `app/(actions)/exercise-actions.ts` の作成
- [ ] `/exercises` ページの作成（種目一覧、検索/フィルタ）
- [ ] `/exercises/new` ページの作成（種目追加フォーム）
- [ ] `conform` + `useActionState` でフォーム処理
- [ ] 追加後のリダイレクトまたはリスト更新

**確認事項**:

- [ ] 種目一覧が表示される
- [ ] 検索/フィルタが動作する
- [ ] 種目追加ができる
- [ ] 追加後、一覧に即座に反映される（再検証 OK）
- [ ] 同名+同部位の重複が防げる

**コミットメッセージ例**:

```
feat: 種目一覧と追加機能を実装
```

---

### Task 7: /workouts/today：ヘッダ upsert、種目追加、セット追加（conform + useActionState）

**目的**: 今日のワークアウト記録機能の実装

**作業内容**:

- [ ] `app/(data)/get-workout.ts` の作成
- [ ] `app/(actions)/workout-actions.ts` の作成（ヘッダ、種目追加、セット追加）
- [ ] `/workouts/today` ページの作成
- [ ] ワークアウトヘッダフォーム（日付、体重、RPE、メモ）
- [ ] 種目選択・追加 UI
- [ ] セット追加フォーム（重量、回数、RPE）
- [ ] `conform` + `useActionState` でフォーム処理
- [ ] リアルタイム更新（再検証）

**確認事項**:

- [ ] 今日の日付でワークアウトが作成される
- [ ] ヘッダ情報（体重、RPE、メモ）が保存される
- [ ] 種目を追加できる
- [ ] セットを追加できる
- [ ] セット追加後、UI が即座に更新される

**コミットメッセージ例**:

```
feat: 今日のワークアウト記録機能を実装
```

---

### Task 8: /workouts/[date]：表示/編集

**目的**: 任意日のワークアウト表示・編集機能

**作業内容**:

- [ ] `/workouts/[date]` ページの作成
- [ ] 日付パラメータのバリデーション（YYYY-MM-DD）
- [ ] 既存ワークアウトの取得と表示
- [ ] 編集機能（ヘッダ、種目、セット）
- [ ] セット削除機能
- [ ] 種目削除機能

**確認事項**:

- [ ] 任意日のワークアウトが表示される
- [ ] 存在しない日付は適切に処理される
- [ ] 編集が保存される
- [ ] 削除が動作する

**コミットメッセージ例**:

```
feat: 任意日のワークアウト表示・編集機能を実装
```

---

### Task 9: /dashboard - "use cache" 関数（getWeeklyVolume, getMonthlyVolume）

**目的**: ダッシュボード用データ取得関数の実装

**作業内容**:

- [ ] `lib/date.ts` の作成（週/月の範囲計算）
- [ ] `app/(data)/get-weekly-volume.ts` の作成（`"use cache"` 付き）
- [ ] `app/(data)/get-monthly-volume.ts` の作成（`"use cache"` 付き）
- [ ] Prisma クエリで集計（JOIN、SUM、GROUP BY）
- [ ] キャッシュタグの設定
- [ ] 型定義の作成

**確認事項**:

- [ ] 週間ボリュームが正しく計算される（totalKg, totalReps, byBodyPart）
- [ ] 月間ボリュームが正しく計算される
- [ ] キャッシュタグが設定されている
- [ ] `"use cache"` が関数先頭にある

**コミットメッセージ例**:

```
feat: 週間・月間ボリューム取得関数を実装
```

---

### Task 10: /dashboard - Suspense で数値カード → チャート

**目的**: ダッシュボード UI の実装

**作業内容**:

- [ ] `/dashboard` ページの作成
- [ ] 期間切替 UI（週/月）
- [ ] `VolumeCards` コンポーネント（合計 kg/reps カード）
- [ ] `BodyPartChart` コンポーネント（shadcn/ui Chart 使用）
- [ ] `<Suspense>` で段階表示
- [ ] ローディング状態の表示

**確認事項**:

- [ ] 数値カードが先に表示される
- [ ] チャートが後から表示される（Suspense）
- [ ] 週/月切替が動作する
- [ ] 部位別ボリュームがチャートで表示される
- [ ] データがない場合の処理

**コミットメッセージ例**:

```
feat: ダッシュボードUIを実装（Suspense対応）
```

---

### Task 11: エラー表示/アクセシビリティ/最終整備

**目的**: エラーハンドリング、アクセシビリティ、最終調整

**作業内容**:

- [ ] エラーバウンダリの実装
- [ ] フォームバリデーションエラーの表示
- [ ] アクセシビリティの確認（ARIA、キーボード操作）
- [ ] ローディング状態の改善
- [ ] エラーメッセージの日本語化
- [ ] 型安全性の最終確認
- [ ] 不要なコードの削除
- [ ] コメントの追加

**確認事項**:

- [ ] エラーが適切に表示される
- [ ] キーボード操作が可能
- [ ] スクリーンリーダー対応
- [ ] TypeScript のエラーがない
- [ ] ビルドが成功する

**コミットメッセージ例**:

```
feat: エラーハンドリングとアクセシビリティを改善
```

---

## 🔄 実装フロー

1. **Task 1-3**: 基盤構築（UI、DB、接続）
2. **Task 4-5**: 認証機能
3. **Task 6**: 種目管理
4. **Task 7-8**: ワークアウト記録
5. **Task 9-10**: ダッシュボード
6. **Task 11**: 最終整備

---

## 📝 各タスク実装時のチェックリスト

### 実装前

- [ ] 仕様書（`.cursor/rules/kinkatsu-app.md`）を確認
- [ ] 関連するタスクの依存関係を確認
- [ ] 必要なパッケージをインストール

### 実装中

- [ ] `"use cache"` を関数先頭に記述（データ取得関数）
- [ ] `revalidateTag()` で適切なタグを再検証（書き込み後）
- [ ] Server Component を優先
- [ ] 型定義を適切に使用
- [ ] `conform` + `useActionState` でフォーム処理

### 実装後

- [ ] 動作確認
- [ ] TypeScript のエラーがない
- [ ] ビルドが成功する
- [ ] コミットメッセージを適切に記述
- [ ] 小さなコミット単位でコミット

---

## 🚨 注意事項

### キャッシュ規約（最重要）

- ✅ 関数先頭に `"use cache"` を記述
- ❌ React の `cache()` は使用禁止

### コミット方針

- タスクごとに小さくコミット
- 1 コミット = 1 機能/1 タスク

### 型定義

- `type` エイリアスを使用（`interface` ではなく）

### 認証

- すべての保護されたページで `getCurrentUser()` をチェック

### エラーハンドリング

- 適切なエラーメッセージを表示
- ユーザーフレンドリーな日本語メッセージ

---

## 📚 参考リソース

- [Next.js 16 Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [better-auth Documentation](https://www.better-auth.com)
- [shadcn/ui Chart Documentation](https://ui.shadcn.com/docs/components/chart)
- [conform Documentation](https://conform.guide)
