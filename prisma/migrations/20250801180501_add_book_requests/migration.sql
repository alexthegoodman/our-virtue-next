-- CreateEnum
CREATE TYPE "public"."BookRequestStatus" AS ENUM ('PENDING', 'PROCESSING', 'SHIPPED', 'CANCELLED');

-- CreateTable
CREATE TABLE "public"."book_requests" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zipCode" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'United States',
    "notes" TEXT,
    "status" "public"."BookRequestStatus" NOT NULL DEFAULT 'PENDING',
    "shippedAt" TIMESTAMP(3),
    "adminNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "book_requests_pkey" PRIMARY KEY ("id")
);
