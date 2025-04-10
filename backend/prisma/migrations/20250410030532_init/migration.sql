-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "utorid" TEXT NOT NULL,
    "password" TEXT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "birthday" TEXT,
    "role" TEXT NOT NULL DEFAULT 'regular',
    "suspicious" BOOLEAN NOT NULL DEFAULT false,
    "points" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastLogin" DATETIME,
    "verified" BOOLEAN NOT NULL,
    "avatarUrl" TEXT
);

-- CreateTable
CREATE TABLE "ResetToken" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "token" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isExpired" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "ResetToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "utorid" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "spent" REAL,
    "redeemed" INTEGER,
    "suspicious" BOOLEAN,
    "relatedId" INTEGER,
    "remark" TEXT,
    "createdBy" TEXT NOT NULL,
    "processed" BOOLEAN,
    CONSTRAINT "Transaction_utorid_fkey" FOREIGN KEY ("utorid") REFERENCES "User" ("utorid") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Event" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "startTime" DATETIME NOT NULL,
    "endTime" DATETIME NOT NULL,
    "capacity" INTEGER,
    "pointsRemain" INTEGER NOT NULL,
    "pointsAwarded" INTEGER NOT NULL DEFAULT 0,
    "published" BOOLEAN NOT NULL DEFAULT false
);

-- CreateTable
CREATE TABLE "Promotion" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "startTime" DATETIME NOT NULL,
    "endTime" DATETIME NOT NULL,
    "minSpending" REAL NOT NULL DEFAULT 0,
    "rate" REAL NOT NULL DEFAULT 0,
    "points" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "UserPromotions" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "promotionId" INTEGER NOT NULL,
    CONSTRAINT "UserPromotions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "UserPromotions_promotionId_fkey" FOREIGN KEY ("promotionId") REFERENCES "Promotion" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TransactionPromotions" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "transactionId" INTEGER NOT NULL,
    "promotionId" INTEGER NOT NULL,
    CONSTRAINT "TransactionPromotions_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TransactionPromotions_promotionId_fkey" FOREIGN KEY ("promotionId") REFERENCES "Promotion" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_EventOrganizers" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_EventOrganizers_A_fkey" FOREIGN KEY ("A") REFERENCES "Event" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_EventOrganizers_B_fkey" FOREIGN KEY ("B") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_EventGuests" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_EventGuests_A_fkey" FOREIGN KEY ("A") REFERENCES "Event" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_EventGuests_B_fkey" FOREIGN KEY ("B") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_utorid_key" ON "User"("utorid");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "ResetToken_token_key" ON "ResetToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "UserPromotions_userId_promotionId_key" ON "UserPromotions"("userId", "promotionId");

-- CreateIndex
CREATE UNIQUE INDEX "TransactionPromotions_transactionId_promotionId_key" ON "TransactionPromotions"("transactionId", "promotionId");

-- CreateIndex
CREATE UNIQUE INDEX "_EventOrganizers_AB_unique" ON "_EventOrganizers"("A", "B");

-- CreateIndex
CREATE INDEX "_EventOrganizers_B_index" ON "_EventOrganizers"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_EventGuests_AB_unique" ON "_EventGuests"("A", "B");

-- CreateIndex
CREATE INDEX "_EventGuests_B_index" ON "_EventGuests"("B");
