import { useState } from 'react';
import { Search, Download, Send, Eye, Printer, CheckCircle, ChevronDown, FileText, Sparkles } from 'lucide-react';
import { cn } from './ui/utils';

const orders = [
  { id: 'PO-2024-142', rfq: 'Server Infrastructure Upgrade', vendor: 'TechParts Ltd', amount: '₹12,85,000', date: '12 Jun 2024', status: 'approved' },
  { id: 'PO-2024-141', rfq: 'Raw Steel Procurement Q3', vendor: 'Global Metals Inc.', amount: '₹8,20,000', date: '11 Jun 2024', status: 'pending' },
  { id: 'PO-2024-140', rfq: 'Packaging Materials Annual', vendor: 'EcoPlast Industries', amount: '₹5,60,000', date: '10 Jun 2024', status: 'approved' },
  { id: 'PO-2024-139', rfq: 'Fleet Vehicle Maintenance', vendor: 'FastShip Logistics', amount: '₹3,12,000', date: '09 Jun 2024', status: 'sent' },
  { id: 'PO-2024-138', rfq: 'Office Supplies Q3 2024', vendor: 'Prime Hardware', amount: '₹1,45,000', date: '08 Jun 2024', status: 'approved' },
];

const statusConfig = {
  approved: { label: 'Approved', color: '#00706A', bg: '#D4EEEC' },
  pending: { label: 'Pending', color: '#9A6800', bg: '#FFF0C8' },
  sent: { label: 'Sent', color: '#004643', bg: '#D4EEEC' },
  paid: { label: 'Paid', color: '#00706A', bg: '#D4EEEC' },
  unpaid: { label: 'Unpaid', color: '#9A6800', bg: '#FFF0C8' },
  overdue: { label: 'Overdue', color: '#C0392B', bg: '#FDECEA' },
};

const lineItems = [
  { name: 'Dell PowerEdge R750 Server', desc: '2U Rack-mounted, 2x Intel Xeon Gold', qty: 2, unit: 'pcs', unitPrice: 125000, tax: 18, taxAmt: 45000, total: 295000 },
  { name: 'Network Switches (48-port)', desc: 'Cisco Catalyst 9200L, managed', qty: 4, unit: 'pcs', unitPrice: 42000, tax: 18, taxAmt: 30240, total: 198240 },
  { name: 'UPS Battery Systems', desc: 'APC Smart-UPS SRT 10kVA', qty: 3, unit: 'pcs', unitPrice: 85000, tax: 18, taxAmt: 45900, total: 300900 },
  { name: 'SSD Storage Arrays (8TB)', desc: 'Dell EMC PowerVault ME5024', qty: 6, unit: 'pcs', unitPrice: 70000, tax: 18, taxAmt: 75600, total: 495600 },
];

export function PurchaseOrders() {
  const [view, setView] = useState<'list' | 'detail'>('list');
  const [selected, setSelected] = useState(orders[0]);
  const [docType, setDocType] = useState<'po' | 'invoice'>('po');
  const [search, setSearch] = useState('');
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [invoiceGenerated, setInvoiceGenerated] = useState<Record<string, boolean>>({});

  const handleGenerateInvoice = (orderId: string) => {
    setInvoiceGenerated(prev => ({ ...prev, [orderId]: true }));
    // Navigate to detail as invoice view
    const order = orders.find(o => o.id === orderId);
    if (order) { setSelected(order); setDocType('invoice'); setView('detail'); }
  };

  const filtered = orders.filter(o =>
    o.id.toLowerCase().includes(search.toLowerCase()) ||
    o.vendor.toLowerCase().includes(search.toLowerCase())
  );

  const subtotal = lineItems.reduce((s, i) => s + i.qty * i.unitPrice, 0);
  const totalTax = lineItems.reduce((s, i) => s + i.taxAmt, 0);
  const grandTotal = subtotal + totalTax;

  if (view === 'detail') {
    return (
      <div className="space-y-5 max-w-4xl">
        <div className="flex items-center gap-3">
          <button onClick={() => setView('list')} className="flex items-center gap-1 text-sm text-[#527270] hover:text-[#004643] transition-colors">
            ← Back to list
          </button>
          <div className="flex gap-2 ml-auto">
            {docType === 'po' && (
              <button onClick={() => handleGenerateInvoice(selected.id)}
                className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium text-white transition-all hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #004643, #00706A)' }}>
                <Sparkles className="w-4 h-4" /> Generate Invoice
              </button>
            )}
            <button onClick={() => setDocType(docType === 'po' ? 'invoice' : 'po')}
              className="px-3 py-1.5 rounded-lg text-sm border border-[#C8E0DE] text-[#527270] hover:bg-[#EBF7F6] transition-colors">
              View as {docType === 'po' ? 'Invoice' : 'PO'}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#C8E0DE]/60 overflow-hidden"
          style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
          {/* Document header */}
          <div className="p-8 border-b border-[#D8EDEB]">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-8 h-8 bg-[#004643] rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold" style={{ fontSize: 12 }}>VB</span>
                  </div>
                  <span className="font-bold text-[#0D1F1E]" style={{ fontSize: 18 }}>VendorBridge</span>
                </div>
                <p className="text-[#527270] text-xs mt-1">123 Business Park, Andheri East</p>
                <p className="text-[#527270] text-xs">Mumbai, Maharashtra — 400069</p>
                <p className="text-[#527270] text-xs">GST: 27AAACV0100R1ZP</p>
              </div>
              <div className="text-right">
                <h2 className="font-bold text-[#004643]" style={{ fontSize: 24 }}>
                  {docType === 'po' ? 'PURCHASE ORDER' : 'INVOICE'}
                </h2>
                <p className="text-[#0D1F1E] font-semibold mt-1">{docType === 'po' ? selected.id : 'INV-2024-078'}</p>
                <p className="text-xs text-[#527270] mt-1">{docType === 'po' ? 'PO Date' : 'Invoice Date'}: {selected.date}</p>
                <p className="text-xs text-[#527270]">Due Date: 26 Jun 2024</p>
                {docType === 'invoice' && (
                  <span className="inline-flex mt-2 px-2.5 py-0.5 rounded-md text-xs font-medium bg-[#FFF0C8] text-[#9A6800]">Unpaid</span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8 mt-8">
              <div>
                <p className="text-xs font-semibold text-[#527270] uppercase tracking-wide mb-2">Bill To</p>
                <p className="font-semibold text-[#0D1F1E]">VendorBridge Corp.</p>
                <p className="text-sm text-[#527270]">123 Business Park, Andheri East</p>
                <p className="text-sm text-[#527270]">Mumbai, MH 400069</p>
                <p className="text-sm text-[#527270]">procurement@vendorbridge.in</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-[#527270] uppercase tracking-wide mb-2">Vendor Details</p>
                <p className="font-semibold text-[#0D1F1E]">{selected.vendor}</p>
                <p className="text-sm text-[#527270]">456 Industrial Zone, Thane</p>
                <p className="text-sm text-[#527270]">Maharashtra — 400601</p>
                <p className="text-sm text-[#527270]">GST: 27FGHIJ5678K2Y6</p>
              </div>
            </div>
          </div>

          {/* Line items */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#EBF7F6] border-b border-[#C8E0DE]/60">
                  {['Item', 'Description', 'Qty', 'Unit Price', 'Tax %', 'Tax Amt', 'Total'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-[#527270] uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {lineItems.map((item, i) => (
                  <tr key={item.name} className={cn('border-t border-[#D8EDEB]', i % 2 === 1 && 'bg-[#EEF7F6]')}>
                    <td className="px-5 py-3.5 font-medium text-[#0D1F1E]" style={{ fontSize: 13 }}>{item.name}</td>
                    <td className="px-5 py-3.5 text-[#527270] text-xs max-w-[180px]">{item.desc}</td>
                    <td className="px-5 py-3.5 text-[#0D1F1E]">{item.qty} {item.unit}</td>
                    <td className="px-5 py-3.5 text-[#0D1F1E]">₹{item.unitPrice.toLocaleString('en-IN')}</td>
                    <td className="px-5 py-3.5 text-[#527270]">{item.tax}%</td>
                    <td className="px-5 py-3.5 text-[#527270]">₹{item.taxAmt.toLocaleString('en-IN')}</td>
                    <td className="px-5 py-3.5 font-semibold text-[#0D1F1E]">₹{item.total.toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary */}
          <div className="flex justify-end p-6 border-t border-[#D8EDEB]">
            <div className="w-72 space-y-2">
              <div className="flex justify-between text-sm text-[#527270]">
                <span>Subtotal</span>
                <span>₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-sm text-[#527270]">
                <span>Total Tax (GST 18%)</span>
                <span>₹{totalTax.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between font-bold text-[#0D1F1E] pt-2 border-t border-[#C8E0DE] text-base">
                <span>Grand Total</span>
                <span className="text-[#004643]">₹{grandTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* T&C */}
          <div className="px-6 pb-6">
            <p className="text-xs font-semibold text-[#527270] uppercase tracking-wide mb-2">Terms & Conditions</p>
            <p className="text-xs text-[#527270] leading-relaxed">
              1. Payment is due within 30 days of invoice date. 2. Goods must be delivered to the specified address in good condition.
              3. Any discrepancies must be reported within 7 days of receipt. 4. This PO is subject to the standard procurement terms of VendorBridge Corp.
            </p>
          </div>
        </div>

        {/* Action bar */}
        <div className="flex flex-wrap gap-3 bg-white rounded-xl border border-[#C8E0DE]/60 px-6 py-4"
          style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
          {docType === 'po' && (
            <button onClick={() => handleGenerateInvoice(selected.id)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-white transition-all hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #004643, #00706A)', boxShadow: '0 4px 12px rgba(121,80,242,0.3)' }}>
              <Sparkles className="w-4 h-4" /> Generate Invoice
            </button>
          )}
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium border border-[#C8E0DE] text-[#527270] hover:bg-[#EBF7F6] transition-colors">
            <Download className="w-4 h-4" /> Download PDF
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium border border-[#C8E0DE] text-[#527270] hover:bg-[#EBF7F6] transition-colors">
            <Printer className="w-4 h-4" /> Print
          </button>
          <button onClick={() => setShowEmailModal(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium border border-[#C8E0DE] text-[#527270] hover:bg-[#EBF7F6] transition-colors">
            <Send className="w-4 h-4" /> Send via Email
          </button>
          {docType === 'invoice' && (
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-white ml-auto transition-all hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #00706A, #007870)' }}>
              <CheckCircle className="w-4 h-4" /> Mark as Paid
            </button>
          )}
        </div>

        {/* Email modal */}
        {showEmailModal && (
          <>
            <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-40" onClick={() => setShowEmailModal(false)} />
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-2xl shadow-2xl z-50 p-6">
              <h3 className="font-bold text-[#0D1F1E] mb-4">Send Invoice via Email</h3>
              <div className="space-y-3">
                {[
                  { label: 'To', value: 'sunita@techparts.in' },
                  { label: 'CC', value: '' },
                  { label: 'Subject', value: `Invoice INV-2024-078 — VendorBridge Corp.` },
                ].map(f => (
                  <div key={f.label}>
                    <label className="block text-sm font-medium text-[#0D1F1E] mb-1">{f.label}</label>
                    <input type="text" defaultValue={f.value}
                      className="w-full px-3 py-2.5 border border-[#C8E0DE] rounded-lg text-sm focus:outline-none focus:border-[#004643] focus:ring-2 focus:ring-[#004643]/20 transition-all" />
                  </div>
                ))}
                <div>
                  <label className="block text-sm font-medium text-[#0D1F1E] mb-1">Message</label>
                  <textarea rows={3} defaultValue="Dear TechParts Ltd,&#10;&#10;Please find attached Invoice INV-2024-078 for the Server Infrastructure Upgrade order. Kindly process payment within 30 days.&#10;&#10;Regards, Procurement Team"
                    className="w-full px-3 py-2.5 border border-[#C8E0DE] rounded-lg text-sm focus:outline-none focus:border-[#004643] focus:ring-2 focus:ring-[#004643]/20 transition-all resize-none" />
                </div>
              </div>
              <div className="flex gap-3 mt-5">
                <button onClick={() => setShowEmailModal(false)} className="flex-1 py-2.5 border border-[#C8E0DE] rounded-lg text-sm font-medium text-[#527270] hover:bg-[#EBF7F6]">Cancel</button>
                <button onClick={() => setShowEmailModal(false)}
                  className="flex-1 py-2.5 rounded-lg text-sm font-medium text-white"
                  style={{ background: 'linear-gradient(135deg, #004643, #00706A)' }}>
                  Send Email
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-[#527270] text-sm">Manage purchase orders and generate invoices</p>
      </div>

      <div className="bg-white rounded-xl p-4 border border-[#C8E0DE]/60 flex gap-3 items-center"
        style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#527270]" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by PO number or vendor..."
            className="w-full pl-9 pr-4 py-2 border border-[#C8E0DE] rounded-lg text-sm focus:outline-none focus:border-[#004643] focus:ring-2 focus:ring-[#004643]/20 transition-all" />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#C8E0DE]/60 overflow-hidden"
        style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr className="bg-[#EBF7F6] border-b border-[#C8E0DE]/60">
                {['PO Number', 'RFQ Title', 'Vendor', 'Amount', 'Date', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-[#527270] uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((order, i) => {
                const sc = statusConfig[order.status as keyof typeof statusConfig];
                return (
                  <tr key={order.id} className={cn('border-t border-[#D8EDEB] hover:bg-[#EEF7F6] transition-colors cursor-pointer', i % 2 === 1 && 'bg-[#EEF7F6]')}>
                    <td className="px-5 py-4 font-medium text-[#004643]">{order.id}</td>
                    <td className="px-5 py-4 text-[#0D1F1E]">{order.rfq}</td>
                    <td className="px-5 py-4 text-[#0D1F1E]">{order.vendor}</td>
                    <td className="px-5 py-4 font-semibold text-[#0D1F1E]">{order.amount}</td>
                    <td className="px-5 py-4 text-[#527270]">{order.date}</td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium"
                        style={{ color: sc.color, background: sc.bg }}>
                        {sc.label}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-1 items-center">
                        {order.status === 'approved' && (
                          <button
                            onClick={() => handleGenerateInvoice(order.id)}
                            className={cn(
                              'flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all',
                              invoiceGenerated[order.id]
                                ? 'bg-[#D4EEEC] text-[#00706A] border border-[#00706A]/30'
                                : 'text-white hover:opacity-90'
                            )}
                            style={!invoiceGenerated[order.id] ? { background: 'linear-gradient(135deg, #004643, #00706A)' } : {}}>
                            {invoiceGenerated[order.id] ? <><CheckCircle className="w-3 h-3" /> Invoiced</> : <><Sparkles className="w-3 h-3" /> Invoice</>}
                          </button>
                        )}
                        <button onClick={() => { setSelected(order); setDocType('po'); setView('detail'); }}
                          className="p-1.5 rounded-lg text-[#527270] hover:bg-[#D4EEEC] hover:text-[#004643] transition-colors" title="View">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 rounded-lg text-[#527270] hover:bg-[#D4EEEC] hover:text-[#004643] transition-colors" title="Download">
                          <Download className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 rounded-lg text-[#527270] hover:bg-[#D4EEEC] hover:text-[#004643] transition-colors" title="Send">
                          <Send className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-[#D8EDEB] bg-[#EBF7F6]">
          <p className="text-xs text-[#527270]">Showing {filtered.length} of {orders.length} purchase orders</p>
        </div>
      </div>
    </div>
  );
}
