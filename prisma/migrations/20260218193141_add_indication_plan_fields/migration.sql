-- AlterTable
ALTER TABLE "MedicalIndication" ADD COLUMN     "durationWeeks" INTEGER,
ADD COLUMN     "phaseOrder" INTEGER NOT NULL DEFAULT 0;
