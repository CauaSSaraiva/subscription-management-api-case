-- CreateEnum
CREATE TYPE "AcessoStatus" AS ENUM ('SUCCESS', 'FAILURE');

-- CreateTable
CREATE TABLE "logs_acesso" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "email" TEXT NOT NULL,
    "ip" TEXT,
    "userAgent" TEXT,
    "status" "AcessoStatus" NOT NULL,
    "motivo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "logs_acesso_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "logs_acesso_email_idx" ON "logs_acesso"("email");

-- CreateIndex
CREATE INDEX "logs_acesso_ip_idx" ON "logs_acesso"("ip");

-- CreateIndex
CREATE INDEX "logs_acesso_createdAt_idx" ON "logs_acesso"("createdAt");

-- AddForeignKey
ALTER TABLE "logs_acesso" ADD CONSTRAINT "logs_acesso_userId_fkey" FOREIGN KEY ("userId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;
