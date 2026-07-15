ALTER TABLE "AuctionItem" ADD COLUMN "livePlatform" TEXT;
ALTER TABLE "AuctionItem" ADD COLUMN "liveUrl" TEXT;
ALTER TABLE "AuctionItem" ADD COLUMN "liveStartsAt" DATETIME;
ALTER TABLE "AuctionItem" ADD COLUMN "liveStatus" TEXT;

CREATE INDEX "AuctionItem_liveStatus_liveStartsAt_idx" ON "AuctionItem"("liveStatus", "liveStartsAt");
