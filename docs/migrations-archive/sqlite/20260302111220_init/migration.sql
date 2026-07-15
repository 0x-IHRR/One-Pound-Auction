-- CreateTable
CREATE TABLE "BlindBox" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "hook_description" TEXT NOT NULL,
    "hidden_content" TEXT NOT NULL,
    "price" REAL NOT NULL DEFAULT 1.0,
    "sales_count" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
