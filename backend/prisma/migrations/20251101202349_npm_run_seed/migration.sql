-- CreateEnum
CREATE TYPE "WineType" AS ENUM ('RED', 'WHITE', 'ROSE', 'SPARKLING', 'DESSERT', 'FORTIFIED', 'ORANGE');

-- CreateEnum
CREATE TYPE "Sweetness" AS ENUM ('BONE_DRY', 'DRY', 'OFF_DRY', 'MEDIUM_SWEET', 'SWEET', 'VERY_SWEET');

-- CreateEnum
CREATE TYPE "BottleSize" AS ENUM ('HALF', 'STANDARD', 'MAGNUM', 'DOUBLE_MAGNUM', 'JEROBOAM', 'IMPERIAL');

-- CreateEnum
CREATE TYPE "WineStatus" AS ENUM ('IN_CELLAR', 'READY_TO_DRINK', 'PAST_PEAK', 'RESERVED', 'CONSUMED', 'GIFTED', 'SOLD');

-- CreateEnum
CREATE TYPE "PhotoType" AS ENUM ('LABEL', 'BOTTLE', 'CORK', 'POUR', 'OTHER');

-- CreateTable
CREATE TABLE "Winery" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "region" TEXT,
    "country" TEXT,
    "website" TEXT,
    "description" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "foundedYear" INTEGER,
    "logo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Winery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Varietal" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "WineType",
    "description" TEXT,
    "commonRegions" TEXT[],
    "characteristics" TEXT[],
    "aliases" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Varietal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Wine" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "wineryId" TEXT NOT NULL,
    "vintage" INTEGER,
    "varietalId" TEXT,
    "region" TEXT,
    "subRegion" TEXT,
    "country" TEXT,
    "appellation" TEXT,
    "type" "WineType" NOT NULL DEFAULT 'RED',
    "sweetness" "Sweetness",
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "bottleSize" "BottleSize" NOT NULL DEFAULT 'STANDARD',
    "purchaseDate" TIMESTAMP(3),
    "purchasePrice" DECIMAL(10,2),
    "purchaseLocation" TEXT,
    "retailer" TEXT,
    "location" TEXT,
    "binNumber" TEXT,
    "rackNumber" TEXT,
    "cellarZone" TEXT,
    "drinkFrom" INTEGER,
    "drinkTo" INTEGER,
    "peakDrinking" INTEGER,
    "personalRating" INTEGER,
    "criticsRating" INTEGER,
    "criticName" TEXT,
    "personalNotes" TEXT,
    "tastingNotes" TEXT,
    "currentValue" DECIMAL(10,2),
    "estimatedValue" DECIMAL(10,2),
    "status" "WineStatus" NOT NULL DEFAULT 'IN_CELLAR',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Wine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Photo" (
    "id" TEXT NOT NULL,
    "wineId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "s3Key" TEXT,
    "type" "PhotoType" NOT NULL DEFAULT 'LABEL',
    "caption" TEXT,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Photo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CellarLocation" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "capacity" INTEGER,
    "temperature" TEXT,
    "humidity" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CellarLocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_TagToWine" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Winery_name_key" ON "Winery"("name");

-- CreateIndex
CREATE INDEX "Winery_name_idx" ON "Winery"("name");

-- CreateIndex
CREATE INDEX "Winery_country_idx" ON "Winery"("country");

-- CreateIndex
CREATE UNIQUE INDEX "Varietal_name_key" ON "Varietal"("name");

-- CreateIndex
CREATE INDEX "Varietal_name_idx" ON "Varietal"("name");

-- CreateIndex
CREATE INDEX "Varietal_type_idx" ON "Varietal"("type");

-- CreateIndex
CREATE INDEX "Wine_wineryId_idx" ON "Wine"("wineryId");

-- CreateIndex
CREATE INDEX "Wine_varietalId_idx" ON "Wine"("varietalId");

-- CreateIndex
CREATE INDEX "Wine_type_idx" ON "Wine"("type");

-- CreateIndex
CREATE INDEX "Wine_country_idx" ON "Wine"("country");

-- CreateIndex
CREATE INDEX "Wine_region_idx" ON "Wine"("region");

-- CreateIndex
CREATE INDEX "Wine_vintage_idx" ON "Wine"("vintage");

-- CreateIndex
CREATE INDEX "Wine_status_idx" ON "Wine"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_name_key" ON "Tag"("name");

-- CreateIndex
CREATE INDEX "Photo_wineId_isPrimary_idx" ON "Photo"("wineId", "isPrimary");

-- CreateIndex
CREATE UNIQUE INDEX "CellarLocation_name_key" ON "CellarLocation"("name");

-- CreateIndex
CREATE UNIQUE INDEX "_TagToWine_AB_unique" ON "_TagToWine"("A", "B");

-- CreateIndex
CREATE INDEX "_TagToWine_B_index" ON "_TagToWine"("B");

-- AddForeignKey
ALTER TABLE "Wine" ADD CONSTRAINT "Wine_wineryId_fkey" FOREIGN KEY ("wineryId") REFERENCES "Winery"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Wine" ADD CONSTRAINT "Wine_varietalId_fkey" FOREIGN KEY ("varietalId") REFERENCES "Varietal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Photo" ADD CONSTRAINT "Photo_wineId_fkey" FOREIGN KEY ("wineId") REFERENCES "Wine"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TagToWine" ADD CONSTRAINT "_TagToWine_A_fkey" FOREIGN KEY ("A") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TagToWine" ADD CONSTRAINT "_TagToWine_B_fkey" FOREIGN KEY ("B") REFERENCES "Wine"("id") ON DELETE CASCADE ON UPDATE CASCADE;
