import React, { useState, useEffect } from 'react';
import type { AdminOrder } from '../stores/adminStore';

interface Props {
  order?: AdminOrder | null;
}

export default function GSTInvoiceModal({ order: propOrder }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeOrder, setActiveOrder] = useState<AdminOrder | null>(propOrder || null);

  useEffect(() => {
    const handleOpen = (e: CustomEvent<AdminOrder>) => {
      setActiveOrder(e.detail);
      setIsOpen(true);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('satvastones:open_invoice' as any, handleOpen);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('satvastones:open_invoice' as any, handleOpen);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  if (!isOpen || !activeOrder) return null;

  const invoiceNumber = `INV-${activeOrder.orderNumber.replace('SAT-', '')}`;
  const invoiceDate = new Date(activeOrder.createdAt || Date.now()).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  const isInterstate = activeOrder.state.toLowerCase() !== 'gujarat';
  const taxableValue = Math.round(activeOrder.subtotalPaise / 1.03); // 3% GST on jewellery
  const gstAmount = activeOrder.subtotalPaise - taxableValue;
  const cgstAmount = isInterstate ? 0 : Math.round(gstAmount / 2);
  const sgstAmount = isInterstate ? 0 : gstAmount - cgstAmount;
  const igstAmount = isInterstate ? gstAmount : 0;

  const formatINR = (paise: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(Math.round(paise / 100));
  };

  return (
    <div
      className="fixed inset-0 z-[999999] overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 print:p-0 print:bg-white"
      onClick={(e) => {
        if (e.target === e.currentTarget) setIsOpen(false);
      }}
    >
      <div className="bg-white w-full max-w-3xl rounded-[20px] shadow-2xl border border-gray-300 flex flex-col h-[94vh] max-h-[94vh] overflow-hidden relative print:border-none print:shadow-none print:w-full print:max-w-none print:max-h-none print:h-auto">
        
        {/* Sticky Top Control Bar (Always visible in PC & Mobile, hidden when printing) */}
        <div className="sticky top-0 z-30 px-4 py-3 sm:px-6 sm:py-3.5 bg-white border-b border-gray-200 flex items-center justify-between shadow-xs print:hidden shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm font-extrabold text-gray-900 tracking-tight">Official GST Tax Invoice</span>
            <span className="hidden sm:inline-block text-[11px] bg-emerald-50 text-emerald-700 font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">
              Valid Tax Document
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => window.print()}
              className="bg-[#111111] hover:bg-black text-white px-3.5 py-2 text-xs font-bold uppercase tracking-wider rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Print Invoice"
            >
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z" />
              </svg>
              <span className="hidden sm:inline">Print / PDF</span>
              <span className="sm:hidden">Print</span>
            </button>
            
            {/* Highly Prominent Close Button */}
            <button
              id="invoice-top-close-btn"
              onClick={() => setIsOpen(false)}
              className="bg-rose-600 hover:bg-rose-700 text-white px-3.5 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-sm hover:shadow"
              title="Close Invoice (Esc)"
              aria-label="Close Invoice"
            >
              <svg className="w-4 h-4 text-white stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span>Close (Esc)</span>
            </button>
          </div>
        </div>

        {/* Scrollable Printable Invoice Canvas */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-10 space-y-6 text-xs text-gray-800 bg-white" id="printable-tax-invoice">
          
          {/* Header & Seller Provenance */}
          <div className="flex flex-col sm:flex-row justify-between items-start pb-6 border-b-2 border-gray-900 gap-4">
            <div>
              <img
                src="/satvastones-logo.png"
                alt="Satvastones"
                className="h-9 sm:h-11 w-auto object-contain mb-2"
              />
              <p className="font-extrabold text-sm text-gray-900">SATVASTONES JEWELLERY</p>
              <p className="text-[11px] text-gray-600">Legal Name: <strong>Anirudh A Verma (Sole Proprietorship)</strong></p>
              <p className="text-[11px] text-gray-600">Chala, Vapi, Valsad District, Gujarat - 396191</p>
              <p className="text-[11px] text-gray-600">GSTIN: <strong>24DDAPV4074H1ZF</strong> • State Code: 24 (Gujarat)</p>
              <p className="text-[11px] text-gray-600">Email: support@satvastones.in</p>
            </div>

            <div className="sm:text-right space-y-1">
              <span className="inline-block bg-black text-white text-[10px] font-bold uppercase px-3 py-1 rounded tracking-wider">
                ORIGINAL FOR RECIPIENT
              </span>
              <h2 className="text-xl font-extrabold text-gray-900 tracking-tight pt-1">TAX INVOICE</h2>
              <p className="font-bold text-gray-900">Invoice No: {invoiceNumber}</p>
              <p className="text-gray-600">Date of Issue: {invoiceDate}</p>
              <p className="text-gray-600">Order Ref: <strong>{activeOrder.orderNumber}</strong></p>
              <p className="text-gray-600">Fulfillment: <strong>Chala Store Atelier, Vapi (396191)</strong></p>
            </div>
          </div>

          {/* Billing & Shipping Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
            <div className="space-y-1">
              <h3 className="font-bold text-gray-900 uppercase tracking-wider text-[10px]">Billed &amp; Shipped To:</h3>
              <p className="font-bold text-sm text-gray-900">{activeOrder.customerName}</p>
              <p className="text-gray-600">{activeOrder.address}</p>
              <p className="text-gray-600">{activeOrder.city}, {activeOrder.state} - {activeOrder.pincode}</p>
              <p className="text-gray-600">Phone: {activeOrder.phone}</p>
              <p className="text-gray-600">Email: {activeOrder.email}</p>
            </div>

            <div className="space-y-1 sm:text-right">
              <h3 className="font-bold text-gray-900 uppercase tracking-wider text-[10px]">Logistics &amp; Dispatch Details:</h3>
              <p className="text-gray-600">Courier Partner: <strong>{activeOrder.courierPartner || 'BlueDart Air Express'}</strong></p>
              <p className="text-gray-600">Airway Bill (AWB): <strong>{activeOrder.trackingNumber || 'BLR-892147321'}</strong></p>
              <p className="text-gray-600">Dispatch Location: <strong>Chala Store Atelier, Vapi, Gujarat (396191)</strong></p>
              <p className="text-gray-600">Payment Mode: <strong>{activeOrder.paymentMethod}</strong></p>
              <p className="text-gray-600">Status: <span className="font-bold text-emerald-700">{activeOrder.paymentStatus}</span></p>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border border-gray-200">
              <thead className="bg-gray-100 text-gray-900 font-bold border-b border-gray-200 text-[11px]">
                <tr>
                  <th className="p-2.5">#</th>
                  <th className="p-2.5">Item Description</th>
                  <th className="p-2.5">HSN Code</th>
                  <th className="p-2.5 text-center">Qty</th>
                  <th className="p-2.5 text-right">Taxable Value</th>
                  <th className="p-2.5 text-right">GST Rate</th>
                  <th className="p-2.5 text-right">Total (INR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-[11px]">
                {activeOrder.items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="p-2.5 text-gray-500">{idx + 1}</td>
                    <td className="p-2.5 font-medium text-gray-900">
                      {item.name}
                      <span className="block text-[10px] text-gray-500 font-normal">316L Stainless Steel • 18K Gold PVD</span>
                    </td>
                    <td className="p-2.5 text-gray-600">7117</td>
                    <td className="p-2.5 text-center font-bold">{item.quantity}</td>
                    <td className="p-2.5 text-right text-gray-600">
                      {formatINR(Math.round((item.pricePaise * item.quantity) / 1.03))}
                    </td>
                    <td className="p-2.5 text-right text-gray-600">3%</td>
                    <td className="p-2.5 text-right font-bold text-gray-900">
                      {formatINR(item.pricePaise * item.quantity)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Calculation & Tax Breakdown */}
          <div className="flex flex-col sm:flex-row justify-between items-start pt-2 gap-4">
            <div className="text-[11px] text-gray-600 space-y-1 max-w-sm">
              <p className="font-bold text-gray-900 uppercase tracking-wider text-[10px]">Statutory Declarations:</p>
              <p>• Goods once sold and dispatched from Vapi cannot be cancelled or returned for cash refund.</p>
              <p>• Transit damage claims strictly require an unedited, continuous 360° unboxing video proof.</p>
              <p>• Certified imitation fine jewellery coated with 18K gold PVD under HSN 7117.</p>
            </div>

            <div className="w-full sm:w-72 space-y-1.5 text-right text-[11px] bg-gray-50 p-4 rounded-xl border border-gray-200">
              <div className="flex justify-between">
                <span>Taxable Value:</span>
                <span>{formatINR(taxableValue)}</span>
              </div>
              {isInterstate ? (
                <div className="flex justify-between">
                  <span>IGST (3%):</span>
                  <span>{formatINR(igstAmount)}</span>
                </div>
              ) : (
                <>
                  <div className="flex justify-between">
                    <span>CGST (1.5%):</span>
                    <span>{formatINR(cgstAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>SGST (1.5%):</span>
                    <span>{formatINR(sgstAmount)}</span>
                  </div>
                </>
              )}
              {activeOrder.discountPaise > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Coupon Discount:</span>
                  <span>− {formatINR(activeOrder.discountPaise)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping:</span>
                <span className="font-bold text-emerald-700">
                  {activeOrder.shippingPaise === 0 ? 'FREE' : formatINR(activeOrder.shippingPaise)}
                </span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-gray-900 pt-2 border-t-2 border-gray-900">
                <span>Total Amount:</span>
                <span className="text-[#f2707f]">{formatINR(activeOrder.totalPaise)}</span>
              </div>
            </div>
          </div>

          {/* Authorised Seal & Signatory */}
          <div className="pt-6 border-t border-gray-200 flex justify-between items-end">
            <div className="text-[10px] text-gray-500">
              <p>Generated automatically via SatvaStones Billing Engine.</p>
              <p>This is a computer generated invoice and does not require a physical signature.</p>
            </div>

            <div className="text-center space-y-1">
              <div className="w-32 h-12 border border-dashed border-gray-300 rounded flex items-center justify-center text-[10px] text-gray-400 mx-auto">
                [Digital Verified Seal]
              </div>
              <p className="font-bold text-[11px] text-gray-900">For SATVASTONES JEWELLERY</p>
              <p className="text-[10px] text-gray-500">Authorized Signatory (Anirudh A Verma)</p>
            </div>
          </div>

          {/* Bottom Close Button for extra usability */}
          <div className="pt-4 text-center print:hidden border-t border-gray-100">
            <button
              onClick={() => setIsOpen(false)}
              className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-6 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              Close Invoice
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
