/*
  Warnings:

  - You are about to drop the column `stanzaIndex` on the `threads` table. All the data in the column will be lost.
  - The `tags` column on the `threads` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "public"."threads" DROP COLUMN "stanzaIndex",
DROP COLUMN "tags",
ADD COLUMN     "tags" TEXT[];
