-- CreateEnum
CREATE TYPE "ConnectionStatus" AS ENUM ('PENDING', 'ACTIVE', 'REAUTH_REQUIRED', 'REVOKED', 'ERROR');

-- CreateEnum
CREATE TYPE "UploadStatus" AS ENUM ('INITIALIZED', 'UPLOADING', 'UPLOADED', 'PENDING_CREATOR_ACTION', 'PUBLISHING', 'PUBLISHED', 'FAILED', 'EXPIRED');

-- CreateTable
CREATE TABLE "OAuthState" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT,
    "clientId" TEXT,
    "initiatedByUserId" TEXT,
    "connectionProduct" TEXT NOT NULL DEFAULT 'DEVELOPER',
    "stateHash" TEXT NOT NULL,
    "redirectUri" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "consumedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OAuthState_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TikTokConnection" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT,
    "clientId" TEXT,
    "product" TEXT NOT NULL DEFAULT 'DEVELOPER',
    "externalSubject" TEXT,
    "encryptedAccessToken" TEXT NOT NULL,
    "encryptedRefreshToken" TEXT NOT NULL,
    "scopes" TEXT NOT NULL,
    "accessTokenExpiresAt" TIMESTAMP(3) NOT NULL,
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "verificationStatus" TEXT NOT NULL DEFAULT 'UNVERIFIED',
    "lastVerifiedAt" TIMESTAMP(3),
    "evidenceRef" TEXT,
    "sourceObservedAt" TIMESTAMP(3),
    "status" "ConnectionStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TikTokConnection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TikTokUpload" (
    "id" TEXT NOT NULL,
    "connectionId" TEXT NOT NULL,
    "publishId" TEXT NOT NULL,
    "uploadUrl" TEXT,
    "status" "UploadStatus" NOT NULL DEFAULT 'INITIALIZED',
    "source" TEXT NOT NULL,
    "fileSize" BIGINT,
    "contentType" TEXT,
    "failureReason" TEXT,
    "sourceObservedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TikTokUpload_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OAuthState_stateHash_key" ON "OAuthState"("stateHash");

-- CreateIndex
CREATE INDEX "TikTokConnection_organizationId_clientId_idx" ON "TikTokConnection"("organizationId", "clientId");

-- CreateIndex
CREATE INDEX "TikTokConnection_externalSubject_idx" ON "TikTokConnection"("externalSubject");

-- CreateIndex
CREATE UNIQUE INDEX "TikTokUpload_publishId_key" ON "TikTokUpload"("publishId");

-- CreateIndex
CREATE INDEX "TikTokUpload_connectionId_status_idx" ON "TikTokUpload"("connectionId", "status");

-- AddForeignKey
ALTER TABLE "TikTokUpload" ADD CONSTRAINT "TikTokUpload_connectionId_fkey" FOREIGN KEY ("connectionId") REFERENCES "TikTokConnection"("id") ON DELETE CASCADE ON UPDATE CASCADE;
