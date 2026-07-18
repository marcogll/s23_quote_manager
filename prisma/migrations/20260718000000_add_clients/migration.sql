-- CreateTable
CREATE TABLE "Client" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "company" TEXT,
    "accountName" TEXT,
    "purchases" TEXT,
    "estimatedValue" DOUBLE PRECISION,
    "currency" TEXT NOT NULL DEFAULT 'MXN',
    "requiresInvoice" BOOLEAN NOT NULL DEFAULT false,
    "legalName" TEXT,
    "taxId" TEXT,
    "taxRegime" TEXT,
    "fiscalZipCode" TEXT,
    "cfdiUse" TEXT,
    "billingEmail" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "notes" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Client_userId_email_key" ON "Client"("userId", "email");
CREATE INDEX "Client_userId_name_idx" ON "Client"("userId", "name");
CREATE INDEX "Client_userId_company_idx" ON "Client"("userId", "company");

ALTER TABLE "Client" ADD CONSTRAINT "Client_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
