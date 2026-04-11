-- AlterTable
ALTER TABLE "Trip" ADD COLUMN     "budgetBreakdown" JSONB,
ADD COLUMN     "duration" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "hotelData" JSONB,
ADD COLUMN     "itineraryData" JSONB;
