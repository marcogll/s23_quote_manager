CREATE TABLE "Quote" (
    "id" TEXT NOT NULL,
    "quoteKey" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Quote_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Quote_userId_quoteKey_key" ON "Quote"("userId", "quoteKey");
CREATE INDEX "Quote_userId_updatedAt_idx" ON "Quote"("userId", "updatedAt");
ALTER TABLE "Quote" ADD CONSTRAINT "Quote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
