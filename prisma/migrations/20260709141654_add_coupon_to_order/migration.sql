-- AlterTable: Add coupon tracking fields to Order
ALTER TABLE "Order" ADD COLUMN "couponId" TEXT;
ALTER TABLE "Order" ADD COLUMN "couponCode" TEXT;

-- CreateIndex
CREATE INDEX "Order_couponId_idx" ON "Order"("couponId");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES "Coupon"("id") ON DELETE SET NULL ON UPDATE CASCADE;
