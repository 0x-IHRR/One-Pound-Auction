-- CreateTable
CREATE TABLE "AuctionItem" (
    "id" TEXT NOT NULL,
    "itemType" TEXT NOT NULL DEFAULT 'OFFER',
    "title" TEXT NOT NULL,
    "hook_description" TEXT NOT NULL,
    "hidden_content" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "authorEmail" TEXT,
    "authorName" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PUBLISHED',
    "livePlatform" TEXT,
    "liveUrl" TEXT,
    "liveStartsAt" TIMESTAMP(3),
    "liveStatus" TEXT,
    "accepts_barter" BOOLEAN NOT NULL DEFAULT false,
    "barter_demand" TEXT,
    "sales_count" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "AuctionItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityLog" (
    "id" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "buyerEmail" TEXT NOT NULL,
    "buyerName" TEXT,
    "itemId" TEXT NOT NULL,
    "sellerEmail" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paidAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerTradeNo" TEXT,
    "status" TEXT NOT NULL DEFAULT 'INITIATED',
    "amount" DOUBLE PRECISION NOT NULL,
    "callbackPayload" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UnlockRecord" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "buyerEmail" TEXT NOT NULL,
    "unlockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UnlockRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AuctionItem_status_deletedAt_idx" ON "AuctionItem"("status", "deletedAt");

-- CreateIndex
CREATE INDEX "AuctionItem_authorEmail_status_idx" ON "AuctionItem"("authorEmail", "status");

-- CreateIndex
CREATE INDEX "AuctionItem_itemType_status_idx" ON "AuctionItem"("itemType", "status");

-- CreateIndex
CREATE INDEX "AuctionItem_liveStatus_liveStartsAt_idx" ON "AuctionItem"("liveStatus", "liveStartsAt");

-- CreateIndex
CREATE INDEX "Order_buyerEmail_createdAt_idx" ON "Order"("buyerEmail", "createdAt");

-- CreateIndex
CREATE INDEX "Order_itemId_createdAt_idx" ON "Order"("itemId", "createdAt");

-- CreateIndex
CREATE INDEX "Order_status_createdAt_idx" ON "Order"("status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_orderId_key" ON "Payment"("orderId");

-- CreateIndex
CREATE INDEX "Payment_provider_providerTradeNo_idx" ON "Payment"("provider", "providerTradeNo");

-- CreateIndex
CREATE INDEX "Payment_status_updatedAt_idx" ON "Payment"("status", "updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "UnlockRecord_orderId_key" ON "UnlockRecord"("orderId");

-- CreateIndex
CREATE INDEX "UnlockRecord_buyerEmail_unlockedAt_idx" ON "UnlockRecord"("buyerEmail", "unlockedAt");

-- CreateIndex
CREATE INDEX "UnlockRecord_itemId_unlockedAt_idx" ON "UnlockRecord"("itemId", "unlockedAt");

-- CreateIndex
CREATE UNIQUE INDEX "UnlockRecord_itemId_buyerEmail_key" ON "UnlockRecord"("itemId", "buyerEmail");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "AuctionItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UnlockRecord" ADD CONSTRAINT "UnlockRecord_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UnlockRecord" ADD CONSTRAINT "UnlockRecord_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "AuctionItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
