-- CreateEnum
CREATE TYPE "public"."SignupVariant" AS ENUM ('A', 'B', 'C');

-- CreateEnum
CREATE TYPE "public"."ScheduledEmailStatus" AS ENUM ('PENDING', 'SENT', 'FAILED');

-- AlterTable
ALTER TABLE "public"."email_subscribers" ADD COLUMN     "answer" TEXT,
ADD COLUMN     "variant" "public"."SignupVariant";

-- CreateTable
CREATE TABLE "public"."signup_variant_stats" (
    "variant" "public"."SignupVariant" NOT NULL,
    "views" INTEGER NOT NULL DEFAULT 0,
    "submissions" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "signup_variant_stats_pkey" PRIMARY KEY ("variant")
);

-- CreateTable
CREATE TABLE "public"."scheduled_emails" (
    "id" TEXT NOT NULL,
    "subscriberId" TEXT NOT NULL,
    "variant" "public"."SignupVariant" NOT NULL,
    "answer" TEXT NOT NULL,
    "scheduledFor" TIMESTAMP(3) NOT NULL,
    "sentAt" TIMESTAMP(3),
    "status" "public"."ScheduledEmailStatus" NOT NULL DEFAULT 'PENDING',
    "lastError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "scheduled_emails_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "scheduled_emails_status_scheduledFor_idx" ON "public"."scheduled_emails"("status", "scheduledFor");

-- AddForeignKey
ALTER TABLE "public"."scheduled_emails" ADD CONSTRAINT "scheduled_emails_subscriberId_fkey" FOREIGN KEY ("subscriberId") REFERENCES "public"."email_subscribers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
