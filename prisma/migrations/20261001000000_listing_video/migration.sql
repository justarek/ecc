-- AlterTable
ALTER TABLE "Listing" ADD COLUMN     "videoError" TEXT,
ADD COLUMN     "videoProgress" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "videoStatus" TEXT,
ADD COLUMN     "videoTaskId" TEXT,
ADD COLUMN     "videoUrl" TEXT;
