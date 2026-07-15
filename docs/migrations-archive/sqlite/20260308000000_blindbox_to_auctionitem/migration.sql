PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;

CREATE TABLE "AuctionItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "itemType" TEXT NOT NULL DEFAULT 'OFFER',
    "title" TEXT NOT NULL,
    "hook_description" TEXT NOT NULL,
    "hidden_content" TEXT NOT NULL,
    "price" REAL NOT NULL DEFAULT 1.0,
    "accepts_barter" BOOLEAN NOT NULL DEFAULT false,
    "barter_demand" TEXT,
    "sales_count" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO "AuctionItem" (
    "id",
    "title",
    "hook_description",
    "hidden_content",
    "price",
    "sales_count",
    "createdAt"
)
SELECT
    "id",
    "title",
    "hook_description",
    "hidden_content",
    "price",
    "sales_count",
    "createdAt"
FROM "BlindBox";

DROP TABLE "BlindBox";

PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
