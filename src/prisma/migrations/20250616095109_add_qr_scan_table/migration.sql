-- CreateTable
CREATE TABLE "QrScan" (
    "id" TEXT NOT NULL,
    "qrCodeId" TEXT NOT NULL,
    "points" INTEGER NOT NULL,
    "bottles" INTEGER NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "isUsed" BOOLEAN NOT NULL DEFAULT false,
    "scannedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT,

    CONSTRAINT "QrScan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "QrScan_qrCodeId_key" ON "QrScan"("qrCodeId");

-- AddForeignKey
ALTER TABLE "QrScan" ADD CONSTRAINT "QrScan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
