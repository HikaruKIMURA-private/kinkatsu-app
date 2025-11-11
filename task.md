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

### Task 2: Prisma 初期化 → schema.prisma 反映 → prisma migrate dev → prisma db seed

**目的**: データベーススキーマの構築と初期データ投入

**作業内容**:

- [ ] Prisma のインストール
- [ ] `prisma/schema.prisma` の作成（仕様書のスキーマを反映）
- [ ] `lib/prisma.ts` の作成（Prisma Client のシングルトン）
- [ ] `prisma migrate dev --name init` でマイグレーション実行
- [ ] `prisma/seed.ts` の作成（初期種目データ）
- [ ] `package.json` に `prisma db seed` スクリプト追加
- [ ] `prisma db seed` で初期データ投入

**確認事項**:

- [ ] マイグレーションが正常に実行される
- [ ] スキーマが正しく反映されている
- [ ] 初期種目が 10 件投入されている
- [ ] Prisma Client が正しく初期化される

**コミットメッセージ例**:

```
feat: Prisma スキーマと初期データをセットアップ
```

---

### Task 3: Supabase 接続（DATABASE_URL）、pgBouncer（Tx モード）

**目的**: 本番環境用データベース接続の設定

**作業内容**:

- [ ] Supabase プロジェクトの作成（または既存プロジェクトの確認）
- [ ] `.env.local` に `DATABASE_URL` を設定（接続プール URL）
- [ ] pgBouncer の Transaction モード URL を設定
- [ ] Prisma の接続設定を確認
- [ ] 接続テスト（`prisma db pull` または `prisma migrate deploy`）

**確認事項**:

- [ ] `.env.local` が `.gitignore` に含まれている
- [ ] 接続プール URL が正しく設定されている
- [ ] Prisma が Supabase に接続できる

**コミットメッセージ例**:

```
feat: Supabase 接続設定を追加
```

**注意**: `.env.local` はコミットしない

---

### Task 4: better-auth（Passkey）導入 → /login

**目的**: 認証機能の実装

**作業内容**:

- [ ] better-auth のインストール
- [ ] better-auth の設定ファイル作成（Passkey 有効化）
- [ ] `lib/auth.ts` の作成（`getCurrentUser()` の骨子）
- [ ] `/login` ページの作成
- [ ] Passkey 登録/ログインの UI 実装
- [ ] 認証後のリダイレクト処理

**確認事項**:

- [ ] Passkey の登録ができる
- [ ] Passkey でログインができる
- [ ] ログイン後に適切なページにリダイレクトされる
- [ ] セッションが正しく保持される

**コミットメッセージ例**:

```
feat: better-auth と Passkey 認証を実装
```

---

### Task 5: getCurrentUser() 実装（externalId upsert）

**目的**: 認証ユーザーと DB ユーザーの同期

**作業内容**:

- [ ] `lib/auth.ts` の `getCurrentUser()` を完全実装
- [ ] better-auth のセッション取得ロジック
- [ ] `User.externalId` での upsert 処理
- [ ] エラーハンドリング

**確認事項**:

- [ ] 初回ログイン時にユーザーが作成される
- [ ] 2 回目以降のログインで既存ユーザーが取得される
- [ ] 未認証時は `null` を返す

**コミットメッセージ例**:

```
feat: getCurrentUser() でユーザー同期を実装
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
