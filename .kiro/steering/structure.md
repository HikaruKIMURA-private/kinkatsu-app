# Project Structure

## Organization Philosophy

Next.js App Router の規約に従い、機能ごとにルートとコンポーネントを配置。認証やデータベースアクセスなどの共通機能は `lib/` に集約。

## Directory Patterns

### App Router Pages
**Location**: `/app/`  
**Purpose**: Next.js App Router のページとルートハンドラー  
**Example**: 
- `app/page.tsx` - ルートページ
- `app/login/page.tsx` - ログインページ
- `app/dashboard/page.tsx` - ダッシュボードページ
- `app/api/auth/[...all]/route.ts` - Better Auth API ルート

### Route Groups
**Location**: `/app/(group-name)/`  
**Purpose**: 機能別にコードを整理するためのルートグループ（URLには影響しない）  
**Example**: 
- `app/(actions)/` - Server Actions（`"use server"` 関数）
- `app/(data)/` - データ取得関数（`"use cache"` 付き）
- `app/(rsc)/` - Server Components（`"use server"` または `server-only`）

### Shared Components
**Location**: `/components/`  
**Purpose**: 再利用可能なUIコンポーネント  
**Example**: 
- `components/ui/` - shadcn/ui ベースの基本UIコンポーネント（Button, Input, Card など）

### Library Code
**Location**: `/lib/`  
**Purpose**: アプリケーションのコアロジックとユーティリティ  
**Example**: 
- `lib/auth.ts` - Better Auth サーバーサイド設定
- `lib/auth-client.ts` - Better Auth クライアント設定
- `lib/prisma.ts` - Prisma Client インスタンス
- `lib/base-url.ts` - ベースURL取得ユーティリティ
- `lib/utils.ts` - 汎用ユーティリティ関数
- `lib/tags.ts` - キャッシュタグ定義（`TAG.EXERCISES`, `TAG.WORKOUTS_BY_USER()` など）
- `lib/date.ts` - 日付ユーティリティ（週/月の範囲計算など）

### Database Schema
**Location**: `/prisma/`  
**Purpose**: Prisma スキーマとマイグレーション  
**Example**: 
- `prisma/schema.prisma` - データベーススキーマ定義
- `prisma/migrations/` - マイグレーションファイル
- `prisma/seed.ts` - シードデータ

### Configuration
**Location**: ルートディレクトリ  
**Purpose**: プロジェクト設定ファイル  
**Example**: 
- `next.config.ts` - Next.js 設定
- `tsconfig.json` - TypeScript 設定
- `biome.json` - Biome 設定
- `components.json` - shadcn/ui 設定

## Naming Conventions

- **Files**: kebab-case（例: `auth-client.ts`, `page.tsx`）
- **Components**: PascalCase（例: `Button`, `LoginPage`）
- **Functions**: camelCase（例: `getCurrentUser`, `handleSubmit`）
- **Constants**: UPPER_SNAKE_CASE（例: `BETTER_AUTH_SECRET`）
- **Types/Interfaces**: PascalCase（例: `User`, `WorkoutItem`）

## Import Organization

```typescript
// 1. 外部ライブラリ
import { betterAuth } from "better-auth";
import { cookies } from "next/headers";

// 2. 内部ライブラリ（@/ エイリアス）
import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";

// 3. 相対インポート
import { LocalComponent } from "./local-component";
```

**Path Aliases**:
- `@/` - プロジェクトルート（`tsconfig.json` で設定）

## Code Organization Principles

1. **サーバー/クライアント分離**:
   - 既定は **Server Component**（明示的なディレクティブ不要）
   - フック/イベント利用箇所のみ `"use client"` で明示
   - DB/外部アクセスは `"use server"` 関数に切り出し（`app/(actions)/` または `app/(data)/`）

2. **認証パターン**:
   - サーバーサイド: `lib/auth.ts` の `getCurrentUser()`, `getSessionUserId()` を使用
   - クライアントサイド: `lib/auth-client.ts` の `authClient` を使用
   - すべての保護されたページで `getCurrentUser()` をチェック

3. **データベースアクセス**:
   - Prisma Client は `lib/prisma.ts` からインポート
   - サーバーコンポーネントまたはAPIルート内でのみ使用
   - データ取得関数は `app/(data)/` に配置し、`"use cache"` を関数先頭に記述

4. **フォーム処理**:
   - `conform` + `useActionState` + `zod` の組み合わせを使用
   - Server Actions は `app/(actions)/` に配置
   - バリデーションは `zod` スキーマで定義
   - フォーム状態は `useActionState` で管理

5. **キャッシュ戦略**:
   - データ取得関数の先頭に `"use cache"` を記述（React の `cache()` は使用禁止）
   - キャッシュタグは `lib/tags.ts` で一元管理
   - 書き込み後は `revalidateTag()` で該当タグを再検証
   - 画面は `<Suspense>` で段階表示（数値カード → チャート）

6. **型定義**:
   - `type` エイリアスを使用（`interface` ではなく）
   - `zod` スキーマから型を推論: `type Foo = z.infer<typeof FooSchema>`

7. **ルート保護**:
   - 認証が必要なページでは、サーバーコンポーネントで `getSessionUserId()` をチェック
   - 未認証の場合は `redirect("/login")` でリダイレクト

8. **エラーハンドリング**:
   - クライアントサイド: try-catch でエラーをキャッチし、ユーザーフレンドリーな日本語メッセージを表示
   - サーバーサイド: 適切なHTTPステータスコードとエラーレスポンスを返す
   - フォームバリデーションエラーは `conform` で表示

---
_Document patterns, not file trees. New files following patterns shouldn't require updates_

