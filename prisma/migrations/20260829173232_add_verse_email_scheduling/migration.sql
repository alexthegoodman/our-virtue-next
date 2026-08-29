-- AlterTable
ALTER TABLE "public"."email_subscribers" ADD COLUMN     "lastVerseEmailAt" TIMESTAMP(3),
ADD COLUMN     "nextVerseEmailAt" TIMESTAMP(3),
ADD COLUMN     "unsubscribedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "email_subscribers_unsubscribedAt_nextVerseEmailAt_idx" ON "public"."email_subscribers"("unsubscribedAt", "nextVerseEmailAt");
