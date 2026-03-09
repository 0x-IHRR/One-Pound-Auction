-- RedefineTable
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AuctionItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "itemType" TEXT NOT NULL DEFAULT 'OFFER',
    "title" TEXT NOT NULL,
    "hook_description" TEXT NOT NULL,
    "hidden_content" TEXT NOT NULL,
    "price" REAL NOT NULL DEFAULT 1.0,
    "authorEmail" TEXT,
    "authorName" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PUBLISHED',
    "accepts_barter" BOOLEAN NOT NULL DEFAULT false,
    "barter_demand" TEXT,
    "sales_count" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "publishedAt" DATETIME,
    "deletedAt" DATETIME
);
INSERT INTO "new_AuctionItem" (
    "id",
    "itemType",
    "title",
    "hook_description",
    "hidden_content",
    "price",
    "accepts_barter",
    "barter_demand",
    "sales_count",
    "createdAt",
    "updatedAt",
    "publishedAt",
    "status"
)
SELECT
    "id",
    "itemType",
    "title",
    "hook_description",
    "hidden_content",
    "price",
    "accepts_barter",
    "barter_demand",
    "sales_count",
    "createdAt",
    CURRENT_TIMESTAMP,
    "createdAt",
    'PUBLISHED'
FROM "AuctionItem";
DROP TABLE "AuctionItem";
ALTER TABLE "new_AuctionItem" RENAME TO "AuctionItem";
CREATE INDEX "AuctionItem_status_deletedAt_idx" ON "AuctionItem"("status", "deletedAt");
CREATE INDEX "AuctionItem_authorEmail_status_idx" ON "AuctionItem"("authorEmail", "status");
CREATE INDEX "AuctionItem_itemType_status_idx" ON "AuctionItem"("itemType", "status");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
