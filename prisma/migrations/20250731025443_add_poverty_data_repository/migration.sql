-- CreateTable
CREATE TABLE "public"."poverty_data_sources" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "sourceUrl" TEXT NOT NULL,
    "sourceOrg" TEXT,
    "dataTable" JSONB NOT NULL,
    "geographicScope" TEXT NOT NULL,
    "timeRange" TEXT,
    "dataType" TEXT NOT NULL,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "submissionNotes" TEXT,
    "adminNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "submitterId" TEXT NOT NULL,

    CONSTRAINT "poverty_data_sources_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."poverty_data_sources" ADD CONSTRAINT "poverty_data_sources_submitterId_fkey" FOREIGN KEY ("submitterId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
