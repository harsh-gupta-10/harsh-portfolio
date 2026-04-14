import { buildUPILink, generateQRBase64 } from "../upi";

/**
 * Generates an HTML template for an invoice email with an embedded UPI QR code.
 * 
 * @param {Object} options
 * @param {Object} options.invoice - Invoice data
 * @param {Object} options.client - Client data
 * @param {Object} options.settings - Business settings
 * @returns {Promise<string>} - HTML string
 */
export async function generateInvoiceEmailHtml({ invoice, client, settings }) {
  const upiLink = buildUPILink({
    amount: invoice.total,
    invoiceNumber: invoice.invoice_number,
    upiId: settings.upi_id,
    name: settings.upi_name || settings.full_name
  });

  const qrBase64 = settings.show_qr_email ? await generateQRBase64(upiLink) : null;

  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <div style="background: #0f172a; padding: 40px; color: #fff; border-radius: 16px 16px 0 0;">
        <h1 style="margin: 0; font-size: 24px;">Invoice ${invoice.invoice_number}</h1>
        <p style="opacity: 0.7; margin-top: 8px;">From ${settings.full_name}</p>
      </div>
      
      <div style="padding: 40px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 16px 16px;">
        <p>Hi ${client.name},</p>
        <p>Please find the details of your invoice below. You can pay instantly by scanning the UPI QR code.</p>
        
        <div style="background: #f8fafc; padding: 24px; border-radius: 12px; margin: 32px 0;">
          <table style="width: 100%;">
            <tr>
              <td style="color: #64748b; font-size: 14px;">Amount Due</td>
              <td style="text-align: right; font-weight: bold; font-size: 18px;">₹${Number(invoice.total).toLocaleString('en-IN')}</td>
            </tr>
            <tr>
              <td style="color: #64748b; font-size: 14px;">Due Date</td>
              <td style="text-align: right; font-weight: bold;">${invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : 'Upon Receipt'}</td>
            </tr>
          </table>
        </div>

        ${qrBase64 ? `
        <div style="text-align: center; margin: 40px 0; padding: 32px; border: 2px dashed #e2e8f0; border-radius: 16px;">
          <p style="margin-top: 0; font-weight: bold; color: #0f172a;">Scan to Pay via UPI</p>
          <img src="${qrBase64}" width="150" height="150" alt="UPI QR Code" style="margin: 16px 0;" />
          <p style="font-size: 12px; color: #64748b; margin-bottom: 0;">Works with GPay, PhonePe, Paytm, and more</p>
        </div>
        ` : ''}

        <div style="margin-top: 40px; padding-top: 24px; border-top: 1px solid #e5e7eb; text-align: center;">
          <p style="font-size: 12px; color: #94a3b8;">${settings.invoice_footer_note || 'Thank you for your business!'}</p>
        </div>
      </div>
    </div>
  `;
}
