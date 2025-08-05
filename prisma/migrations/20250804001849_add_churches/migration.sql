-- CreateEnum
CREATE TYPE "public"."ChurchCategory" AS ENUM ('PARENTS', 'YOUNG_PEOPLE', 'WORKERS');

-- CreateEnum
CREATE TYPE "public"."ChurchMemberRole" AS ENUM ('MEMBER', 'MODERATOR', 'ADMIN');

-- CreateTable
CREATE TABLE "public"."churches" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "imageUrl" TEXT,
    "category" "public"."ChurchCategory" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "creatorId" TEXT NOT NULL,

    CONSTRAINT "churches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."church_members" (
    "id" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "role" "public"."ChurchMemberRole" NOT NULL DEFAULT 'MEMBER',
    "churchId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "church_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."church_posts" (
    "id" TEXT NOT NULL,
    "title" TEXT,
    "content" TEXT NOT NULL,
    "imageUrl" TEXT,
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "churchId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,

    CONSTRAINT "church_posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."church_post_comments" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "postId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,

    CONSTRAINT "church_post_comments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "churches_slug_key" ON "public"."churches"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "church_members_churchId_userId_key" ON "public"."church_members"("churchId", "userId");

-- AddForeignKey
ALTER TABLE "public"."churches" ADD CONSTRAINT "churches_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."church_members" ADD CONSTRAINT "church_members_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "public"."churches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."church_members" ADD CONSTRAINT "church_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."church_posts" ADD CONSTRAINT "church_posts_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "public"."churches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."church_posts" ADD CONSTRAINT "church_posts_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."church_post_comments" ADD CONSTRAINT "church_post_comments_postId_fkey" FOREIGN KEY ("postId") REFERENCES "public"."church_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."church_post_comments" ADD CONSTRAINT "church_post_comments_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
