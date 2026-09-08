-- CreateTable
CREATE TABLE "DemoTrades" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "symbol" TEXT NOT NULL DEFAULT 'XAUUSD',
    "entryTime" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "entryPrice" REAL NOT NULL,
    "entryType" TEXT NOT NULL,
    "exitTime" DATETIME,
    "exitPrice" REAL,
    "lotSize" REAL NOT NULL DEFAULT 0.01,
    "pips" REAL,
    "profitLoss" REAL,
    "status" TEXT NOT NULL DEFAULT 'open',
    "entryReason" TEXT,
    "exitReason" TEXT,
    "learningChapter" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DemoTrades_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MarketData" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "symbol" TEXT NOT NULL DEFAULT 'XAUUSD',
    "timeframe" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL,
    "open" REAL NOT NULL,
    "high" REAL NOT NULL,
    "low" REAL NOT NULL,
    "close" REAL NOT NULL,
    "ema20" REAL,
    "ema75" REAL,
    "ema200" REAL,
    "rsi" REAL,
    "atr" REAL,
    "fomc" BOOLEAN NOT NULL DEFAULT false,
    "nfp" BOOLEAN NOT NULL DEFAULT false,
    "cpi" REAL,
    "dollarIndex" REAL,
    "vix" REAL
);

-- CreateIndex
CREATE UNIQUE INDEX "MarketData_symbol_timeframe_timestamp_key" ON "MarketData"("symbol", "timeframe", "timestamp");
