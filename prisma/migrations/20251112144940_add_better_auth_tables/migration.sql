-- CreateTable
CREATE TABLE "better_auth_user" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "better_auth_user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "better_auth_session" (
    "id" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "better_auth_session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "better_auth_account" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "expiresAt" TIMESTAMP(3),
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "better_auth_account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "better_auth_verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "better_auth_verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "better_auth_passkey" (
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

    CONSTRAINT "better_auth_passkey_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "better_auth_user_email_key" ON "better_auth_user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "better_auth_session_token_key" ON "better_auth_session"("token");

-- CreateIndex
CREATE INDEX "better_auth_session_userId_idx" ON "better_auth_session"("userId");

-- CreateIndex
CREATE INDEX "better_auth_session_token_idx" ON "better_auth_session"("token");

-- CreateIndex
CREATE INDEX "better_auth_account_userId_idx" ON "better_auth_account"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "better_auth_account_providerId_accountId_key" ON "better_auth_account"("providerId", "accountId");

-- CreateIndex
CREATE UNIQUE INDEX "better_auth_verification_identifier_value_key" ON "better_auth_verification"("identifier", "value");

-- CreateIndex
CREATE UNIQUE INDEX "better_auth_passkey_credentialId_key" ON "better_auth_passkey"("credentialId");

-- CreateIndex
CREATE INDEX "better_auth_passkey_userId_idx" ON "better_auth_passkey"("userId");

-- CreateIndex
CREATE INDEX "better_auth_passkey_credentialId_idx" ON "better_auth_passkey"("credentialId");

-- AddForeignKey
ALTER TABLE "better_auth_session" ADD CONSTRAINT "better_auth_session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "better_auth_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "better_auth_account" ADD CONSTRAINT "better_auth_account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "better_auth_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "better_auth_passkey" ADD CONSTRAINT "better_auth_passkey_userId_fkey" FOREIGN KEY ("userId") REFERENCES "better_auth_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
