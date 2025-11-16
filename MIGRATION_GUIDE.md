# スキーマ修正手順ガイド

## 概要

better-authのデフォルト命名に統一し、不要なマッピングテーブルを削除するための手順です。

## 実行した手順

### 1. スキーマファイルの修正

`prisma/schema.prisma` を以下のように変更：

- 古い`User`モデル（`externalId`使用）を削除
- `BetterAuthUser` → `User`にリネーム
- `BetterAuthSession` → `Session`にリネーム
- `BetterAuthAccount` → `Account`にリネーム
- `BetterAuthVerification` → `Verification`にリネーム
- `BetterAuthPasskey` → `Passkey`にリネーム
- すべての`@@map`を削除（デフォルト命名を使用）
- `Workout`のリレーションを新しい`User`に変更

### 2. 認証設定の修正

`lib/auth.ts` を以下のように変更：

- `modelName`の指定を削除（デフォルト命名を使用）
- `getCurrentUser()`を簡素化（better-authの`User`を直接取得）

### 3. ドキュメントの更新

- `.cursor/rules/kinkatsu-app.md` のスキーマ定義を更新
- `task.md` のTask 5の説明を更新

### 4. マイグレーションファイルの作成

```bash
# マイグレーションディレクトリを作成（タイムスタンプ付き）
mkdir -p prisma/migrations/20251116184549_unify_better_auth_user
```

マイグレーションSQLファイルを作成：
- `prisma/migrations/20251116184549_unify_better_auth_user/migration.sql`

**注意**: マイグレーションSQLでは以下を実行：
1. 既存データを一時テーブルに保存
2. 外部キー制約を削除
3. 古いテーブルを削除
4. 新しいデフォルト命名のテーブルを作成
5. データを復元（型キャストを明示的に指定）
6. `Workout`テーブルの`userId`を更新
7. インデックスと外部キー制約を追加

### 5. Prisma Clientの再生成（マイグレーション前）

```bash
bunx prisma generate
```

### 6. マイグレーションの実行

```bash
# マイグレーションを適用
bunx prisma migrate deploy
```

**エラーが発生した場合**：

1. 失敗したマイグレーションを解決：
```bash
bunx prisma migrate resolve --rolled-back 20251116184549_unify_better_auth_user
```

2. マイグレーションSQLを修正（型エラーなど）

3. 再度マイグレーションを実行：
```bash
bunx prisma migrate deploy
```

### 7. Prisma Clientの再生成（マイグレーション後）

```bash
bunx prisma generate
```

## 実行したコマンド一覧

```bash
# 1. Prisma Clientの再生成（スキーマ変更後）
bunx prisma generate

# 2. マイグレーションディレクトリの作成
mkdir -p prisma/migrations/20251116184549_unify_better_auth_user

# 3. マイグレーションの適用（初回 - エラー発生）
bunx prisma migrate deploy

# 4. 失敗したマイグレーションの解決
bunx prisma migrate resolve --rolled-back 20251116184549_unify_better_auth_user

# 5. マイグレーションSQLを修正後、再度適用
bunx prisma migrate deploy

# 6. Prisma Clientの再生成（マイグレーション後）
bunx prisma generate
```

## 重要なポイント

### データ移行時の注意

- 既存データを保持するため、一時テーブルに保存してから移行
- `updatedAt`などのタイムスタンプ型は明示的に型キャストが必要：
  ```sql
  "updatedAt"::TIMESTAMP(3)
  ```

### マイグレーションエラー時の対処

1. `prisma migrate resolve --rolled-back <migration_name>` で失敗を解決
2. マイグレーションSQLを修正
3. 再度 `prisma migrate deploy` を実行

### テーブル名の変更

- `better_auth_user` → `user`
- `better_auth_session` → `session`
- `better_auth_account` → `account`
- `better_auth_verification` → `verification`
- `better_auth_passkey` → `passkey`

## 確認事項

マイグレーション成功後、以下を確認：

- [ ] 新しいテーブルが作成されている
- [ ] 既存データが正しく移行されている
- [ ] `Workout`テーブルの`userId`が正しく更新されている
- [ ] 外部キー制約が正しく設定されている
- [ ] Prisma Clientが正しく生成されている

## 参考

- [Prisma Migrate ドキュメント](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [better-auth Prisma Adapter](https://www.better-auth.com/docs/adapters/prisma)

