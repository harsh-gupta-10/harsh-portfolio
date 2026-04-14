/**
 * Dynamic UPI Link and QR Generator
 */

/**
 * Builds a UPI Deep Link (RFC 2396 compliant)
 * Works with GPay, PhonePe, Paytm, BHIM, etc.
 * 
 * @param {Object} options
 * @param {number} options.amount - Total amount (formatted to 2 decimal places)
 * @param {string} options.invoiceNumber - Unique invoice reference
 * @param {string} options.upiId - Merchant UPI VPA (e.g., harshgupta10@upi)
 * @param {string} options.name - Merchant Display Name
 * @returns {string} - The deep link URL
 */
export function buildUPILink({
  amount,
  invoiceNumber,
  upiId = "harshgupta10@upi",
  name = "MrHarshRameshGupta",
}) {
  const params = new URLSearchParams({
    pa: upiId,
    pn: name,
    cu: "INR",
    am: Number(amount).toFixed(2),
    tn: `Payment for ${invoiceNumber}`,
    mode: "02",
    purpose: "00",
  });
  return `upi://pay?${params.toString()}`;
}

/**
 * Generates a base64 PNG for PDF/Email embedding
 * (Server-side/Node.js compatible)
 * 
 * @param {string} upiLink - The deep link to encode
 * @returns {Promise<string>} - Data URL string
 */
export async function generateQRBase64(upiLink) {
  const QRCode = await import("qrcode");
  return QRCode.default.toDataURL(upiLink, {
    width: 150,
    margin: 2,
    errorCorrectionLevel: "M",
    color: {
      dark: "#000000",
      light: "#ffffff",
    },
  });
}
