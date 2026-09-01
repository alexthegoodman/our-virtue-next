-- CreateEnum
CREATE TYPE "public"."StudyGroupPreference" AS ENUM ('IN_PERSON', 'ONLINE', 'NO');

-- CreateEnum
CREATE TYPE "public"."EmailPreference" AS ENUM ('VERSES', 'DIRECT_OUTREACH', 'NOTHING');

-- AlterTable
ALTER TABLE "public"."email_subscribers" ADD COLUMN     "emailPreference" "public"."EmailPreference",
ADD COLUMN     "studyGroupPreference" "public"."StudyGroupPreference";
