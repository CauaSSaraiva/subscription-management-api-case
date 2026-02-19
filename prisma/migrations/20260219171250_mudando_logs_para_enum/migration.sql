/*
  Warnings:

  - Changed the type of `acao` on the `logs` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `entidade` on the `logs` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "LogAction" AS ENUM ('CREATE', 'UPDATE', 'DELETE');

-- CreateEnum
CREATE TYPE "Entidade" AS ENUM ('Assinatura', 'Usuario', 'Servico', 'Departamento');

-- AlterTable
-- ALTER TABLE "logs" DROP COLUMN "acao",
-- ADD COLUMN     "acao" "LogAction" NOT NULL,
ALTER TABLE "logs" ALTER COLUMN "acao" TYPE "LogAction" USING ("acao"::"text"::"LogAction");

-- DROP COLUMN "entidade",
-- ADD COLUMN     "entidade" "Entidade" NOT NULL;
ALTER TABLE "logs" ALTER COLUMN "entidade" TYPE "Entidade" USING ("entidade"::"text"::"Entidade");
