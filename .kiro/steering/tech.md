# Technology Stack

## Architecture

Next.js App Router ベースのフルスタックアプリケーション。サーバーサイドとクライアントサイドを明確に分離し、認証は Better Auth で一元管理。

## Core Technologies

- **Language**: TypeScript (strict mode)
- **Framework**: Next.js 16.0.1 (App Router)
- **Runtime**: Node.js 20+
- **UI Library**: React 19.2.0
- **Database**: PostgreSQL (Supabase)
- **ORM**: Prisma 6.19.0

## Key Libraries

- **認証**: `better-auth` (v1.3.34) - 認証システムの中核
  - `@better-auth/passkey` - Passkey認証サポート
- **データベース**: `@prisma/client` - 型安全なデータベースアクセス
- **フォーム処理**: 
  - `conform` - フォーム状態管理とバリデーション統合
  - `zod` - スキーマバリデーション
  - `useActionState` (React 19) - Server Actions とフォーム状態の統合
- **UIコンポーネント**: `@radix-ui/*` - アクセシブルなUIコンポーネント基盤
- **UIライブラリ**: `shadcn/ui` - Tailwind CSS ベースのコンポーネントライブラリ
  - `shadcn/ui Chart` - チャート表示用コンポーネント
- **スタイリング**: `tailwindcss` v4 - ユーティリティファーストCSS
- **チャート**: `recharts` - データ可視化（shadcn/ui Chart の基盤）
- **ユーティリティ**: `clsx`, `tailwind-merge`, `class-variance-authority`

## Development Standards

### Type Safety

- TypeScript strict mode を有効化
- `any` 型の使用を避ける
- サーバーサイドコードは `server-only` で明示的に分離
- 型定義は `type` エイリアスを使用（`interface` ではなく）
- `zod` スキーマから型を推論: `type Foo = z.infer<typeof FooSchema>`

### Code Quality

- **Linter/Formatter**: Biome 2.2.0
  - `pnpm run lint` - リントチェック
  - `pnpm run format` - 自動フォーマット
- **React Compiler**: babel-plugin-react-compiler 1.0.0

### Testing

現在テストフレームワークは未導入。将来的に追加を検討。

### Caching Strategy

Next.js 16 の `"use cache"` ディレクティブを使用したキャッシュ戦略：

#### 読み取り関数

- データ取得関数の先頭に `"use cache"` を記述
- キャッシュタグを指定してキャッシュ（`lib/tags.ts` で定義）
- React の `cache()` は使用禁止

```typescript
// app/(data)/get-exercises.ts
"use server";
"use cache";

import { prisma } from "@/lib/prisma";
import { unstable_cache } from "next/cache";
import { TAG } from "@/lib/tags";

export async function getExercises() {
  return unstable_cache(
    async () => {
      return await prisma.exercise.findMany();
    },
    ["exercises"],
    { tags: [TAG.EXERCISES] }
  )();
}
```

#### 書き込み後

- Server Actions でデータを変更した後、該当タグを `revalidateTag()` で再検証
- 例: セット追加 → `WORKOUTS_BY_USER`, `VOLUME_WEEK`, `VOLUME_MONTH` を再検証

```typescript
// app/(actions)/workout-actions.ts
"use server";

import { revalidateTag } from "next/cache";
import { TAG } from "@/lib/tags";

export async function addSetAction(userId: string, ...) {
  // データベースに書き込み
  await prisma.workoutSet.create({ ... });
  
  // 関連するキャッシュを再検証
  revalidateTag(TAG.WORKOUTS_BY_USER(userId));
  revalidateTag(TAG.VOLUME_WEEK(userId));
  revalidateTag(TAG.VOLUME_MONTH(userId));
}
```

#### キャッシュタグ定義

```typescript
// lib/tags.ts
export const TAG = {
  EXERCISES: "exercises",
  WORKOUTS_BY_USER: (id: string) => `workouts:user:${id}`,
  VOLUME_WEEK: (id: string) => `volumes:user:${id}:week`,
  VOLUME_MONTH: (id: string) => `volumes:user:${id}:month`,
} as const;
```

#### UI表示

- `<Suspense>` で段階表示（数値カード → チャート）
- プログレッシブローディング体験を提供

### Form Handling

`conform` + `useActionState` + `zod` の組み合わせでフォーム処理：

#### バリデーションスキーマ

```typescript
// app/(actions)/exercise-actions.ts
import { z } from "zod";

export const ExerciseSchema = z.object({
  name: z.string().min(1).max(100),
  bodyPart: z.enum(["CHEST", "BACK", "LEGS", ...]),
});

export type ExerciseInput = z.infer<typeof ExerciseSchema>;
```

#### Server Action

```typescript
"use server";

import { revalidateTag } from "next/cache";
import { TAG } from "@/lib/tags";

export async function createExerciseAction(input: ExerciseInput) {
  // バリデーション（zod スキーマで自動検証）
  const validated = ExerciseSchema.parse(input);
  
  // データベースに書き込み
  await prisma.exercise.create({ data: validated });
  
  // キャッシュ再検証
  revalidateTag(TAG.EXERCISES);
}
```

#### クライアントコンポーネント

```typescript
"use client";

import { useActionState } from "react";
import { useForm } from "@conform/react";
import { parseWithZod } from "@conform/zod";
import { createExerciseAction } from "@/app/(actions)/exercise-actions";
import { ExerciseSchema } from "@/app/(actions)/exercise-actions";

export default function ExerciseForm() {
  const [state, formAction] = useActionState(createExerciseAction, null);
  const [form, fields] = useForm({
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: ExerciseSchema });
    },
    shouldValidate: "onBlur",
  });

  return (
    <form id={form.id} onSubmit={form.onSubmit} action={formAction}>
      <input name={fields.name.name} />
      {fields.name.errors && <div>{fields.name.errors}</div>}
      {/* ... */}
    </form>
  );
}
```

## Development Environment

### Required Tools

- **Node.js**: 20以上
- **Package Manager**: pnpm (推奨) / bun / npm
- **Docker Desktop**: Supabase ローカル開発用
- **Supabase CLI**: ローカルデータベース管理

### Common Commands

```bash
# 開発サーバー起動（Supabase + Next.js）
pnpm run dev:local

# Next.js のみ
pnpm run dev

# Supabase 管理
pnpm run supabase:start
pnpm run supabase:stop
pnpm run supabase:status

# データベース
pnpm run db:generate    # Prisma Client 生成
pnpm run db:migrate     # マイグレーション実行
pnpm run db:migrate:reset # データベースリセット
pnpm run db:seed        # シードデータ投入

# コード品質
pnpm run lint           # リントチェック
pnpm run format         # フォーマット
```

## Key Technical Decisions

1. **Better Auth の採用**: NextAuth.js ではなく Better Auth を選択。理由：
   - モダンなAPI設計
   - Passkey サポート
   - TypeScript の型安全性
   - Prisma との統合が容易

2. **Supabase ローカル開発**: 本番環境に近い PostgreSQL 環境で開発可能

3. **App Router**: Next.js の最新ルーティングシステムを採用

4. **Prisma**: 型安全なデータベースアクセスとマイグレーション管理

5. **Biome**: ESLint + Prettier の代替として、高速な Biome を採用

6. **フォーム処理**: `conform` + `useActionState` + `zod` の組み合わせ
   - Server Actions とフォーム状態の統合
   - 型安全なバリデーション
   - プログレッシブエンハンスメント対応

7. **キャッシュ戦略**: Next.js 16 の `"use cache"` ディレクティブを使用
   - 関数先頭に `"use cache"` を記述
   - React の `cache()` は使用禁止
   - `revalidateTag()` で書き込み後の再検証
   - キャッシュタグは `lib/tags.ts` で一元管理

8. **型定義**: `type` エイリアスを使用（`interface` ではなく）

---
_Document standards and patterns, not every dependency_

