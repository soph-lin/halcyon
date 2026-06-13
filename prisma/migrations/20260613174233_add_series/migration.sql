-- CreateTable
CREATE TABLE "Series" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "isOrdered" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Series_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SeriesEntry" (
    "id" TEXT NOT NULL,
    "seriesId" TEXT NOT NULL,
    "entryId" TEXT NOT NULL,
    "position" INTEGER,

    CONSTRAINT "SeriesEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Series_slug_key" ON "Series"("slug");

-- CreateIndex
CREATE INDEX "SeriesEntry_entryId_idx" ON "SeriesEntry"("entryId");

-- CreateIndex
CREATE UNIQUE INDEX "SeriesEntry_seriesId_entryId_key" ON "SeriesEntry"("seriesId", "entryId");

-- CreateIndex
CREATE UNIQUE INDEX "SeriesEntry_seriesId_position_key" ON "SeriesEntry"("seriesId", "position");

-- AddForeignKey
ALTER TABLE "SeriesEntry" ADD CONSTRAINT "SeriesEntry_seriesId_fkey" FOREIGN KEY ("seriesId") REFERENCES "Series"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeriesEntry" ADD CONSTRAINT "SeriesEntry_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "Entry"("id") ON DELETE CASCADE ON UPDATE CASCADE;
