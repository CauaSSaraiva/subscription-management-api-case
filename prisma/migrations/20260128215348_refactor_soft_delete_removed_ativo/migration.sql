/*
  Warnings:

  - You are about to drop the column `ativo` on the `assinaturas` table. All the data in the column will be lost.
  - You are about to drop the column `ativo` on the `usuarios` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "assinaturas" DROP COLUMN "ativo";

-- AlterTable
ALTER TABLE "usuarios" DROP COLUMN "ativo";

-- CreateIndex
CREATE INDEX "assinaturas_servicoId_idx" ON "assinaturas"("servicoId");

-- CreateIndex
CREATE INDEX "assinaturas_responsavelId_idx" ON "assinaturas"("responsavelId");
