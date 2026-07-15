-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "buyerEmail" TEXT NOT NULL,
    "buyerName" TEXT,
    "itemId" TEXT NOT NULL,
    "sellerEmail" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paidAt" DATETIME,
    "cancelledAt" DATETIME,
    CONSTRAINT "Order_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "AuctionItem" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerTradeNo" TEXT,
    "status" TEXT NOT NULL DEFAULT 'INITIATED',
    "amount" REAL NOT NULL,
    "callbackPayload" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Payment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UnlockRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "buyerEmail" TEXT NOT NULL,
    "unlockedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UnlockRecord_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "UnlockRecord_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "AuctionItem" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

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
CREATE UNIQUE INDEX "UnlockRecord_itemId_buyerEmail_key" ON "UnlockRecord"("itemId", "buyerEmail");

-- CreateIndex
CREATE INDEX "UnlockRecord_buyerEmail_unlockedAt_idx" ON "UnlockRecord"("buyerEmail", "unlockedAt");

-- CreateIndex
CREATE INDEX "UnlockRecord_itemId_unlockedAt_idx" ON "UnlockRecord"("itemId", "unlockedAt");
