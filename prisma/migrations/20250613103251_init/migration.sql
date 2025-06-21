-- CreateEnum
CREATE TYPE "TemplateType" AS ENUM ('javascript', 'python', 'express', 'vite');

-- CreateEnum
CREATE TYPE "Privacy" AS ENUM ('public', 'private');

-- CreateTable
CREATE TABLE "Template" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "TemplateType" NOT NULL,
    "content" TEXT NOT NULL,
    "privacy" "Privacy" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "fileSystemTree" JSONB,

    CONSTRAINT "Template_pkey" PRIMARY KEY ("id")
);
