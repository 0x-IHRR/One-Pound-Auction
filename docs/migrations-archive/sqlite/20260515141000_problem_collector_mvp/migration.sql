ALTER TABLE "AuctionItem" ADD COLUMN "fulfillmentMode" TEXT NOT NULL DEFAULT 'PAID_UNLOCK';
ALTER TABLE "AuctionItem" ADD COLUMN "problemStatus" TEXT;
ALTER TABLE "AuctionItem" ADD COLUMN "sourceType" TEXT NOT NULL DEFAULT 'CREATOR';
ALTER TABLE "AuctionItem" ADD COLUMN "submitterContact" TEXT;
ALTER TABLE "AuctionItem" ADD COLUMN "submitterContext" TEXT;
ALTER TABLE "AuctionItem" ADD COLUMN "sourceUrl" TEXT;

CREATE INDEX "AuctionItem_fulfillmentMode_problemStatus_idx" ON "AuctionItem"("fulfillmentMode", "problemStatus");
CREATE INDEX "AuctionItem_sourceType_createdAt_idx" ON "AuctionItem"("sourceType", "createdAt");
