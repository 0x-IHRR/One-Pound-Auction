-- AlterTable
ALTER TABLE "AuctionItem"
ADD COLUMN "fulfillmentMode" TEXT NOT NULL DEFAULT 'PAID_UNLOCK',
ADD COLUMN "problemStatus" TEXT,
ADD COLUMN "sourceType" TEXT NOT NULL DEFAULT 'CREATOR',
ADD COLUMN "submitterContact" TEXT,
ADD COLUMN "submitterContext" TEXT,
ADD COLUMN "sourceUrl" TEXT;

-- CreateIndex
CREATE INDEX "AuctionItem_fulfillmentMode_problemStatus_idx" ON "AuctionItem"("fulfillmentMode", "problemStatus");

-- CreateIndex
CREATE INDEX "AuctionItem_sourceType_createdAt_idx" ON "AuctionItem"("sourceType", "createdAt");
