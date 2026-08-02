import { v4 as uuidv4 } from "uuid";
import { prisma } from "../lib/prisma.js";

/**
 * Generate secure download link + optional license key
 * and attach them to the OrderItem.
 * In production: create signed R2 URL with expiry.
 */
export async function deliverDigitalProduct(orderItemId: string, userId: string) {
  const item = await prisma.orderItem.findUnique({
    where: { id: orderItemId },
    include: { product: true },
  });

  if (!item) return;

  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + (item.product.linkExpiryHours || 72));

  // Demo signed URL — replace with real Cloudflare R2 signed URL
  const token = uuidv4();
  const downloadUrl = `${process.env.API_URL}/api/downloads/${token}`;

  // Generate license key if product needs one
  const licenseKey = `AX-${uuidv4().slice(0, 8).toUpperCase()}-${uuidv4().slice(0, 4).toUpperCase()}`;

  await prisma.orderItem.update({
    where: { id: orderItemId },
    data: {
      downloadUrl,
      licenseKey,
      expiresAt,
    },
  });

  // Log delivery
  await prisma.downloadLog.create({
    data: {
      userId,
      orderItemId,
      productId: item.productId,
      productName: item.product?.name,
    },
  });

  // TODO: send email with invoice + download links
  return { downloadUrl, licenseKey, expiresAt };
}
