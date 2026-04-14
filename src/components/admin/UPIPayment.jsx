import React from "react";
import { QRCodeSVG } from "qrcode.react";
import { CheckCircle2, ShieldCheck, Zap } from "lucide-react";

/**
 * UPIPayment Component
 * Displays a scannable QR code and payment details.
 * 
 * @param {Object} props
 * @param {Object} props.invoice - The invoice data
 * @param {Object} props.settings - Business settings containing upi_id and upi_name
 */
export default function UPIPayment({ invoice, settings }) {
  if (!settings?.upi_id || !settings?.show_qr_invoice) return null;

  const upiLink = `upi://pay?pa=${settings.upi_id}&pn=${encodeURIComponent(settings.upi_name || settings.full_name)}&cu=INR&am=${Number(invoice.total).toFixed(2)}&tn=${encodeURIComponent(`Payment for ${invoice.invoice_number}`)}&mode=02&purpose=00`;

  const totalStr = Number(invoice.total || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  return (
    <div className="my-8 p-6 rounded-2xl bg-slate-50 border border-slate-200 shadow-sm overflow-hidden relative">
      {/* Decorative background element */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -translate-y-12 translate-x-12 blur-2xl pointer-events-none" />

      <div className="flex flex-col md:flex-row gap-8 items-center">
        {/* Left: QR Section */}
        <div className="flex flex-col items-center">
          <div className="bg-white p-4 rounded-xl shadow-md border border-slate-100 flex items-center justify-center">
            <QRCodeSVG
              value={upiLink}
              size={140}
              bgColor="#ffffff"
              fgColor="#0f172a"
              level="M"
              includeMargin={false}
            />
          </div>
          <p className="mt-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1">
            <ShieldCheck size={10} className="text-green-500" /> Secure UPI Transaction
          </p>
        </div>

        {/* Right: Info Section */}
        <div className="flex-1 text-center md:text-left space-y-4">
          <div>
            <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Pay Instantly via UPI</h4>
            <div className="mt-2 flex flex-wrap justify-center md:justify-start gap-2 text-xs font-medium">
              <div className="px-2 py-1 bg-white border border-slate-200 rounded-md text-slate-600 flex items-center gap-1.5 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> GPay
              </div>
              <div className="px-2 py-1 bg-white border border-slate-200 rounded-md text-slate-600 flex items-center gap-1.5 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500" /> PhonePe
              </div>
              <div className="px-2 py-1 bg-white border border-slate-200 rounded-md text-slate-600 flex items-center gap-1.5 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-500" /> Paytm
              </div>
              <div className="px-2 py-1 bg-white border border-slate-200 rounded-md text-slate-600 flex items-center gap-1.5 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500" /> BHIM
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200/60">
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-tighter">Amount Due</p>
              <p className="text-lg font-black text-slate-900">₹{totalStr}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-tighter">Invoice Ref</p>
              <p className="text-sm font-bold text-slate-700 truncate">{invoice.invoice_number}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-500 bg-blue-500/5 px-3 py-2 rounded-lg border border-blue-500/10">
             <Zap size={14} className="text-blue-500 shrink-0" />
             <span>Scan the QR code from any UPI app to pay directly. No manual entry needed.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
