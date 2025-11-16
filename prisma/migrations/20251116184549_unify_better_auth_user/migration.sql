-- 既存のbetter-authテーブルから新しいデフォルト命名テーブルへデータ移行
-- 注意: 既存のデータを保持するため、まずデータをコピーしてからテーブルを再作成

-- Step 1: 既存のbetter_auth_userのデータを一時テーブルに保存
CREATE TABLE "_temp_better_auth_user" AS SELECT * FROM "better_auth_user";
CREATE TABLE "_temp_better_auth_session" AS SELECT * FROM "better_auth_session";
CREATE TABLE "_temp_better_auth_account" AS SELECT * FROM "better_auth_account";
CREATE TABLE "_temp_better_auth_verification" AS SELECT * FROM "better_auth_verification";
CREATE TABLE "_temp_better_auth_passkey" AS SELECT * FROM "better_auth_passkey";

-- Step 2: 古いUserテーブルのWorkoutデータを一時保存（externalIdとuserIdのマッピング用）
CREATE TABLE "_temp_user_workout_mapping" AS 
SELECT u."externalId", w."id" as "workoutId", w."userId" as "oldUserId"
FROM "User" u
JOIN "Workout" w ON w."userId" = u."id";

-- Step 3: 外部キー制約を削除
ALTER TABLE "Workout" DROP CONSTRAINT IF EXISTS "Workout_userId_fkey";
ALTER TABLE "better_auth_session" DROP CONSTRAINT IF EXISTS "better_auth_session_userId_fkey";
ALTER TABLE "better_auth_account" DROP CONSTRAINT IF EXISTS "better_auth_account_userId_fkey";
ALTER TABLE "better_auth_passkey" DROP CONSTRAINT IF EXISTS "better_auth_passkey_userId_fkey";

-- Step 4: 古いテーブルを削除
DROP TABLE IF EXISTS "User" CASCADE;
DROP TABLE IF EXISTS "better_auth_user" CASCADE;
DROP TABLE IF EXISTS "better_auth_session" CASCADE;
DROP TABLE IF EXISTS "better_auth_account" CASCADE;
DROP TABLE IF EXISTS "better_auth_verification" CASCADE;
DROP TABLE IF EXISTS "better_auth_passkey" CASCADE;

-- Step 5: 新しいデフォルト命名のテーブルを作成
-- CreateTable: user
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable: session
CREATE TABLE "session" (
    "id" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable: account
CREATE TABLE "account" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "expiresAt" TIMESTAMP(3),
    "password" TEXT,
    "scope" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable: verification
CREATE TABLE "verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable: passkey
CREATE TABLE "passkey" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "publicKey" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "credentialId" TEXT NOT NULL,
    "counter" BIGINT NOT NULL DEFAULT 0,
    "deviceType" TEXT NOT NULL,
    "backedUp" BOOLEAN NOT NULL DEFAULT false,
    "transports" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "passkey_pkey" PRIMARY KEY ("id")
);

-- Step 6: データを復元（明示的にカラムを指定して型を保証）
INSERT INTO "user" ("id", "name", "email", "emailVerified", "image", "createdAt", "updatedAt")
SELECT "id", "name", "email", "emailVerified", "image", "createdAt"::TIMESTAMP(3), "updatedAt"::TIMESTAMP(3)
FROM "_temp_better_auth_user";

INSERT INTO "session" ("id", "expiresAt", "token", "ipAddress", "userAgent", "userId", "createdAt", "updatedAt")
SELECT "id", "expiresAt"::TIMESTAMP(3), "token", "ipAddress", "userAgent", "userId", "createdAt"::TIMESTAMP(3), "updatedAt"::TIMESTAMP(3)
FROM "_temp_better_auth_session";

INSERT INTO "account" ("id", "accountId", "providerId", "userId", "accessToken", "refreshToken", "idToken", "expiresAt", "password", "scope", "createdAt", "updatedAt")
SELECT "id", "accountId", "providerId", "userId", "accessToken", "refreshToken", "idToken", "expiresAt"::TIMESTAMP(3), "password", "scope", "createdAt"::TIMESTAMP(3), "updatedAt"::TIMESTAMP(3)
FROM "_temp_better_auth_account";

INSERT INTO "verification" ("id", "identifier", "value", "expiresAt", "createdAt", "updatedAt")
SELECT "id", "identifier", "value", "expiresAt"::TIMESTAMP(3), "createdAt"::TIMESTAMP(3), "updatedAt"::TIMESTAMP(3)
FROM "_temp_better_auth_verification";

INSERT INTO "passkey" ("id", "name", "publicKey", "userId", "credentialId", "counter", "deviceType", "backedUp", "transports", "createdAt", "updatedAt")
SELECT "id", "name", "publicKey", "userId", "credentialId", "counter", "deviceType", "backedUp", "transports", "createdAt"::TIMESTAMP(3), "updatedAt"::TIMESTAMP(3)
FROM "_temp_better_auth_passkey";

-- Step 7: WorkoutテーブルのuserIdを更新（externalIdから新しいuser.idへ）
UPDATE "Workout" w
SET "userId" = u."id"
FROM "_temp_user_workout_mapping" m
JOIN "user" u ON u."id" = m."externalId"
WHERE w."id" = m."workoutId";

-- Step 8: 一時テーブルを削除
DROP TABLE "_temp_better_auth_user";
DROP TABLE "_temp_better_auth_session";
DROP TABLE "_temp_better_auth_account";
DROP TABLE "_temp_better_auth_verification";
DROP TABLE "_temp_better_auth_passkey";
DROP TABLE "_temp_user_workout_mapping";

-- Step 9: インデックスと制約を追加
-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

CREATE UNIQUE INDEX "session_token_key" ON "session"("token");
CREATE INDEX "session_userId_idx" ON "session"("userId");
CREATE INDEX "session_token_idx" ON "session"("token");

CREATE UNIQUE INDEX "account_providerId_accountId_key" ON "account"("providerId", "accountId");
CREATE INDEX "account_userId_idx" ON "account"("userId");

CREATE UNIQUE INDEX "verification_identifier_value_key" ON "verification"("identifier", "value");

CREATE UNIQUE INDEX "passkey_credentialId_key" ON "passkey"("credentialId");
CREATE INDEX "passkey_userId_idx" ON "passkey"("userId");
CREATE INDEX "passkey_credentialId_idx" ON "passkey"("credentialId");

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "passkey" ADD CONSTRAINT "passkey_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Workout" ADD CONSTRAINT "Workout_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

