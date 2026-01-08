-- CreateTable
CREATE TABLE "public"."swipe_events" (
    "id" TEXT NOT NULL,
    "poemSlug" TEXT NOT NULL,
    "stanzaSlug" TEXT NOT NULL,
    "direction" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "swipe_events_pkey" PRIMARY KEY ("id")
);
