# Gym Training Log - 仕様書・設計書

## 📌 プロジェクト概要

### 名称

Gym Training Log

### 目的

日々の筋トレを記録し、週/月のボリューム（kg & reps）と部位別ボリュームを可視化するアプリケーション

### 想定ユーザー

- 個人利用
- 1 ユーザー = 1 日 = 1 ワークアウト

### 言語

日本語

---

## 🧱 技術スタック & 方針

### パッケージマネージャー

- **bun** (package manager)

### フレームワーク

- **Next.js 16** (App Router, RSC)
- **React 19**

### データ処理

- **Server Actions** + **useActionState** + **conform** + **zod**
- **Prisma** (ORM)
- **Supabase** (PostgreSQL)

### UI/UX

- **shadcn/ui** + **Tailwind CSS**
- **shadcn/ui Chart** (チャート表示)

### 認証

- **better-auth** + **Passkey** (WebAuthn)

### デプロイ

- **Vercel**

### コーディング規約

#### コンポーネント方針

- 既定は **Server Component**
- フック/イベント利用箇所のみ `'use client'`

#### データアクセス

- DB/外部アクセスは `'use server'` 関数に切り出し

#### 型定義

- 型は **type alias** を使用（`type Foo = {}`）

#### キャッシュ規約（最重要）

- **関数単位のキャッシュは関数先頭に `"use cache"` を記述**
- **React の `cache()` は使用禁止**
- 書き込み後は `revalidateTag()` により必要範囲のみ再計算
- 画面は `<Suspense>` で段階表示（数値 → グラフ）

---

## 🗂 画面/ルーティング

### ルート一覧

| パス               | 説明                           | 認証 |
| ------------------ | ------------------------------ | ---- |
| `/login`           | Passkey 登録/ログイン          | 不要 |
| `/workouts/today`  | 今日の記録（タイムライン入力） | 必須 |
| `/workouts/[date]` | 任意日（YYYY-MM-DD）の記録     | 必須 |
| `/dashboard`       | 週/月集計（合計 & 部位別）     | 必須 |
| `/exercises`       | 種目一覧（検索/フィルタ）      | 必須 |
| `/exercises/new`   | 種目追加                       | 必須 |

### ワイヤーフレーム

#### `/workouts/today`

```
┌─────────────────────────────────────┐
│ 日付: 2024-01-15                    │
│ 体重(kg): [____]                    │
│ 当日RPE: [____]                     │
│ メモ: [________________]            │
├─────────────────────────────────────┤
│ 種目カード                          │
│ ┌───────────────────────────────┐  │
│ │ ベンチプレス                  │  │
│ │ セット表:                     │  │
│ │ ┌─────┬─────┬─────┐          │  │
│ │ │重量 │回数 │RPE │          │  │
│ │ ├─────┼─────┼─────┤          │  │
│ │ │ 60  │ 10  │ 8   │          │  │
│ │ │ 60  │ 10  │ 8   │          │  │
│ │ └─────┴─────┴─────┘          │  │
│ └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

#### `/dashboard`

```
┌─────────────────────────────────────┐
│ 期間切替: [週] [月]                 │
├─────────────────────────────────────┤
│ 合計kg: 1,250 kg                    │
│ 合計reps: 500 reps                  │
├─────────────────────────────────────┤
│ 部位別チャート                      │
│ [Bar Chart: CHEST, BACK, LEGS...]  │
├─────────────────────────────────────┤
│ 最近の記録                          │
│ - 2024-01-15: ベンチプレス 60kg×10 │
│ - 2024-01-14: スクワット 100kg×8   │
└─────────────────────────────────────┘
```

---

## 🧾 データベーススキーマ

### Prisma Schema

```prisma
enum BodyPart {
  CHEST
  BACK
  LEGS
  ABS
  ARMS
  SHOULDERS
  FOREARMS
  CALVES
  OTHER
}

// better-auth の User モデル（デフォルト命名）
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
  workouts Workout[]
}

model Exercise {
  id        String   @id @default(cuid())
  name      String
  bodyPart  BodyPart
  createdBy String?  // User.id を参照（外部キー制約なし）
  createdAt DateTime @default(now())

  workoutItems WorkoutItem[]

  @@unique([name, bodyPart]) // 同名+同部位は不可
  @@index([bodyPart])
  @@index([name])
}

model Workout {
  id          String   @id @default(cuid())
  userId      String
  date        DateTime
  bodyWeight  Decimal? @db.Decimal(5,2)  // kg
  dayRpe      Decimal? @db.Decimal(3,1)  // 当日の主観的疲労
  notes       String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  user  User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  items WorkoutItem[]

  @@unique([userId, date]) // 1日1件
  @@index([userId, date])
}

model WorkoutItem {
  id          String   @id @default(cuid())
  workoutId   String
  exerciseId  String
  orderIndex  Int
  createdAt   DateTime @default(now())

  workout  Workout  @relation(fields: [workoutId], references: [id], onDelete: Cascade)
  exercise Exercise @relation(fields: [exerciseId], references: [id])
  sets     WorkoutSet[]

  @@index([workoutId, orderIndex])
}

model WorkoutSet {
  id            String   @id @default(cuid())
  workoutItemId String
  weightKg      Decimal  @db.Decimal(6,2)
  reps          Int
  rpe           Decimal? @db.Decimal(3,1)
  createdAt     DateTime @default(now())

  workoutItem WorkoutItem @relation(fields: [workoutItemId], references: [id], onDelete: Cascade)

  @@index([workoutItemId])
}

// better-auth のその他のモデル（デフォルト命名）
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
  scope             String?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([providerId, accountId])
  @@index([userId])
}

model Verification {
  id         String   @id @default(cuid())
  identifier String
  value      String
  expiresAt  DateTime
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  @@unique([identifier, value])
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
}
```

### リレーション

- `User` 1:N `Workout`
- `Workout` 1:N `WorkoutItem`
- `Exercise` 1:N `WorkoutItem`
- `WorkoutItem` 1:N `WorkoutSet`

---

## 🏷 キャッシュタグ設計

### タグ定義

```typescript
// lib/tags.ts
export const TAG = {
  EXERCISES: "exercises",
  WORKOUTS_BY_USER: (id: string) => `workouts:user:${id}`,
  VOLUME_WEEK: (id: string) => `volumes:user:${id}:week`,
  VOLUME_MONTH: (id: string) => `volumes:user:${id}:month`,
} as const;
```

### キャッシュ戦略

#### 読み取り関数

- 関数先頭に `"use cache"` を記述
- タグを指定してキャッシュ

#### 書き込み後

- 該当タグを `revalidateTag()` で再検証
- 例: セット追加 → `WORKOUTS_BY_USER`, `VOLUME_WEEK`, `VOLUME_MONTH` を再検証

#### ダッシュボード表示

- `<Suspense>` で数値カード → チャートの順に表示
- 段階的なローディング体験

---

## 🔧 データ取得関数設計

### 週間ボリューム取得

```typescript
// app/(data)/get-weekly-volume.ts
"use server";
"use cache";

import { prisma } from "@/lib/prisma";
import { unstable_cache } from "next/cache";
import { TAG } from "@/lib/tags";

export type WeeklyVolume = {
  totalKg: number;
  totalReps: number;
  byBodyPart: Record<string, number>;
};

export async function getWeeklyVolume(
  userId: string,
  start: Date,
  end: Date
): Promise<WeeklyVolume> {
  // sets JOIN items JOIN exercises JOIN workouts で期間集計
  // totalKg = SUM(weightKg * reps)
  // totalReps = SUM(reps)
  // byBodyPart = GROUP BY exercises.bodyPart
  // タグ: TAG.VOLUME_WEEK(userId)
}
```

### 月間ボリューム取得

```typescript
// app/(data)/get-monthly-volume.ts
"use server";
"use cache";

export type MonthlyVolume = {
  totalKg: number;
  totalReps: number;
  byBodyPart: Record<string, number>;
};

export async function getMonthlyVolume(
  userId: string,
  start: Date,
  end: Date
): Promise<MonthlyVolume> {
  // 同様の集計ロジック（月間）
  // タグ: TAG.VOLUME_MONTH(userId)
}
```

### 種目一覧取得

```typescript
// app/(data)/get-exercises.ts
"use server";
"use cache";

import { prisma } from "@/lib/prisma";
import { TAG } from "@/lib/tags";

export type ExerciseRow = {
  id: string;
  name: string;
  bodyPart: string;
};

export async function getExercises(): Promise<ExerciseRow[]> {
  const rows = await prisma.exercise.findMany({
    orderBy: [{ bodyPart: "asc" }, { name: "asc" }],
  });
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    bodyPart: r.bodyPart,
  }));
  // タグ: TAG.EXERCISES
}
```

### ワークアウト取得

```typescript
// app/(data)/get-workout.ts
"use server";
"use cache";

export type WorkoutWithItems = {
  id: string;
  date: Date;
  bodyWeight: number | null;
  dayRpe: number | null;
  notes: string | null;
  items: Array<{
    id: string;
    exerciseId: string;
    exerciseName: string;
    exerciseBodyPart: string;
    orderIndex: number;
    sets: Array<{
      id: string;
      weightKg: number;
      reps: number;
      rpe: number | null;
    }>;
  }>;
};

export async function getWorkout(
  userId: string,
  date: Date
): Promise<WorkoutWithItems | null> {
  // タグ: TAG.WORKOUTS_BY_USER(userId)
}
```

---

## 📨 Server Actions 設計

### 種目関連アクション

```typescript
// app/(actions)/exercise-actions.ts
"use server";

import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { revalidateTag } from "next/cache";
import { TAG } from "@/lib/tags";

export const ExerciseSchema = z.object({
  name: z.string().min(1).max(100),
  bodyPart: z.enum([
    "CHEST",
    "BACK",
    "LEGS",
    "ABS",
    "ARMS",
    "SHOULDERS",
    "FOREARMS",
    "CALVES",
    "OTHER",
  ]),
});

export type ExerciseInput = z.infer<typeof ExerciseSchema>;

export async function createExerciseAction(
  input: ExerciseInput & { createdBy?: string | null }
) {
  const { name, bodyPart, createdBy = null } = input;
  await prisma.exercise.create({
    data: { name, bodyPart, createdBy },
  });
  revalidateTag(TAG.EXERCISES);
}
```

### ワークアウト関連アクション

```typescript
// app/(actions)/workout-actions.ts
"use server";

import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { revalidateTag } from "next/cache";
import { TAG } from "@/lib/tags";

export const WorkoutHeaderSchema = z.object({
  date: z.string(), // YYYY-MM-DD
  bodyWeight: z.number().min(0).max(400).optional(),
  dayRpe: z.number().min(1).max(10).optional(),
  notes: z.string().max(2000).optional(),
});

export type WorkoutHeaderInput = z.infer<typeof WorkoutHeaderSchema>;

export async function upsertWorkoutHeaderAction(
  userId: string,
  input: WorkoutHeaderInput
) {
  const date = new Date(input.date + "T00:00:00.000Z");
  await prisma.workout.upsert({
    where: { userId_date: { userId, date } },
    update: {
      bodyWeight: input.bodyWeight,
      dayRpe: input.dayRpe,
      notes: input.notes,
    },
    create: {
      userId,
      date,
      bodyWeight: input.bodyWeight,
      dayRpe: input.dayRpe,
      notes: input.notes,
    },
  });
  revalidateTag(TAG.WORKOUTS_BY_USER(userId));
}

export const SetSchema = z.object({
  weightKg: z.number().min(0).max(999.99),
  reps: z.number().int().min(1).max(100),
  rpe: z.number().min(1).max(10).optional(),
});

export type SetInput = z.infer<typeof SetSchema>;

export async function addSetAction(input: {
  userId: string;
  workoutItemId: string;
  set: SetInput;
}) {
  const { userId, workoutItemId, set } = input;
  await prisma.workoutSet.create({
    data: { workoutItemId, ...set },
  });
  revalidateTag(TAG.WORKOUTS_BY_USER(userId));
  revalidateTag(TAG.VOLUME_WEEK(userId));
  revalidateTag(TAG.VOLUME_MONTH(userId));
}

export async function addWorkoutItemAction(input: {
  userId: string;
  workoutId: string;
  exerciseId: string;
  orderIndex: number;
}) {
  // 実装
  revalidateTag(TAG.WORKOUTS_BY_USER(input.userId));
}
```

---

## 🧩 ダッシュボード設計（Suspense で段階表示）

```typescript
// app/(rsc)/dashboard/page.tsx
import "server-only";
import { Suspense } from "react";
import VolumeCards from "./VolumeCards";
import BodyPartChart from "./BodyPartChart";
import { getCurrentUser } from "@/lib/auth";
import { getWeekRange } from "@/lib/date";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) return <div>ログインが必要です</div>;

  const { start, end } = getWeekRange(new Date());

  return (
    <div className="space-y-6">
      <Suspense fallback={<div className="h-20 bg-muted animate-pulse" />}>
        <VolumeCards userId={user.id} start={start} end={end} />
      </Suspense>
      <Suspense fallback={<div className="h-80 bg-muted animate-pulse" />}>
        <BodyPartChart userId={user.id} start={start} end={end} />
      </Suspense>
    </div>
  );
}
```

---

## 🔐 認証設計（better-auth + Passkey）

### 設定

- **RP ID**: Vercel 本番ドメイン
- 開発/Preview 環境も登録

### ユーザー取得

better-auth の User を直接使用（マッピング不要）

```typescript
// lib/auth.ts
import 'server-only'
import { cookies } from 'next/headers'
import { prisma } from './prisma'
import { auth } from './auth'

export async function getCurrentUser() {
  const cookieStore = await cookies()
  const session = await auth.api.getSession({
    headers: { cookie: cookieStore.toString() },
  })
  if (!session?.user?.id) return null

  // better-auth の User を直接取得
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  })
  return user
}
```

---

## 🌱 初期データ（Seed）

```typescript
// prisma/seed.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const list = [
    ["ベンチプレス", "CHEST"],
    ["インクラインダンベルプレス", "CHEST"],
    ["ラットプルダウン", "BACK"],
    ["スクワット", "LEGS"],
    ["レッグプレス", "LEGS"],
    ["ショルダープレス", "SHOULDERS"],
    ["バイセップカール", "ARMS"],
    ["トライセップスプレスダウン", "ARMS"],
    ["カーフレイズ", "CALVES"],
    ["クランチ", "ABS"],
  ];

  for (const [name, bodyPart] of list) {
    await prisma.exercise.upsert({
      where: {
        name_bodyPart: {
          name,
          bodyPart: bodyPart as any,
        },
      },
      update: {},
      create: {
        name,
        bodyPart: bodyPart as any,
        createdBy: null,
      },
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

---

## 📁 ディレクトリ構造

```
kinkatsu-app/
├── app/
│   ├── (actions)/          # Server Actions
│   │   ├── exercise-actions.ts
│   │   └── workout-actions.ts
│   ├── (data)/             # データ取得関数（"use cache"）
│   │   ├── get-exercises.ts
│   │   ├── get-workout.ts
│   │   ├── get-weekly-volume.ts
│   │   └── get-monthly-volume.ts
│   ├── (rsc)/              # Server Components
│   │   ├── dashboard/
│   │   ├── exercises/
│   │   └── workouts/
│   ├── login/
│   ├── layout.tsx
│   └── page.tsx
├── lib/
│   ├── auth.ts             # 認証ユーティリティ
│   ├── prisma.ts           # Prisma Client
│   ├── tags.ts             # キャッシュタグ定義
│   └── date.ts             # 日付ユーティリティ
├── components/
│   └── ui/                 # shadcn/ui コンポーネント
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
└── package.json
```

---

## ✅ 受入条件（Done の定義）

1. ✅ Passkey ログイン成功 → TOP 遷移
2. ✅ 1 日 1 件のワークアウトが作成/更新できる
3. ✅ 種目追加後、即利用できる（再検証 OK）
4. ✅ セット追加でダッシュボードの数値/チャートが更新される（タグ再検証で反映）
5. ✅ 週/月切替が動作し、部位別ボリュームがチャート表示される
6. ✅ 関数単位キャッシュはすべて `"use cache"`、`cache()` 不使用

---

## 🔁 改善提案の扱い

- UX 改善（キーボード操作、ショートカット、行コピー）やキャッシュ最適化の提案は歓迎
- ただし仕様変更は実装前に要相談

---

## 📝 実装時の注意事項

### コミット方針

- タスクごとに小さくコミット
- 1 コミット = 1 機能/1 タスク

### 型安全性

- TypeScript を厳密に使用
- `zod` でバリデーション
- `conform` でフォーム処理

### パフォーマンス

- Server Components を優先
- クライアントコンポーネントは必要最小限
- Suspense で段階的ローディング

### アクセシビリティ

- shadcn/ui のアクセシビリティ機能を活用
- キーボード操作対応
- 適切なラベル付け
