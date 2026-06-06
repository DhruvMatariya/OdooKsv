import { useState } from 'react';
import { Eye, Send, Clock, CheckCircle, AlertCircle, Upload, Calendar, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { cn } from './ui/utils';
import type { Page } from './Sidebar';

// ─── ACTIVE RFQs FOR VENDOR ─────────────────────────────────────────────────

const openRFQs = [
  { id: 'RFQ-2024-089', title: 'Office Supplies Q3 2024', buyer: 'VendorBridge Corp.', category: 'Office Supplies', deadline: '20 Jun 2024', items: 8, status: 'invited', daysLeft: 14 },
  { id: 'RFQ-2024-088', title: 'Server Infrastructure Upgrade', buyer: 'VendorBridge Corp.', category: 'IT Equipment', deadline: '18 Jun 2024', items: 6, status: 'submitted', daysLeft: 12 },
  { id: 'RFQ-2024-087', title: 'Raw Steel Procurement Q3', buyer: 'VendorBridge Corp.', category: 'Metals & Alloys', deadline: '15 Jun 2024', items: 4, status: 'closed', daysLeft: 0 },
  { id: 'RFQ-2024-086', title: 'Fleet Vehicle Maintenance', buyer: 'VendorBridge Corp.', category: 'Maintenance', deadline: '25 Jun 2024', items: 5, status: 'invited', daysLeft: 19 },
];

const rfqStatusConfig = {
  invited: { label: 'Invited', color: '#004643', bg: '#D4EEEC', icon: Clock },
  submitted: { label: 'Submitted', color: '#00706A', bg: '#D4EEEC', icon: CheckCircle },
  closed: { label: 'Closed', color: '#527270', bg: '#D8EDEB', icon: X },
};

export function VendorRFQs({ onNavigate }: { onNavigate: (page: Page) => void }) {
  const [selected, setSelected] = useState<typeof openRFQs[0] | null>(null);
  const [showSubmit, setShowSubmit] = useState(false);

  return (
    <div className="space-y-5">
      <p className="text-[#527270] text-sm">RFQs you've been invited to respond to</p>

      <div className="grid gap-4">
        {openRFQs.map(rfq => {
          const sc = rfqStatusConfig[rfq.status as keyof typeof rfqStatusConfig];
          const Icon = sc.icon;
          return (
            <div key={rfq.id} className="bg-white rounded-xl border border-[#C8E0DE]/60 p-5 hover:shadow-md transition-all"
              style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-[#527270]">{rfq.id}</span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium"
                      style={{ color: sc.color, background: sc.bg }}>
                      <Icon className="w-3 h-3" />{sc.label}
                    </span>
                  </div>
                  <h3 className="font-semibold text-[#0D1F1E]">{rfq.title}</h3>
                  <p className="text-xs text-[#527270] mt-1">{rfq.buyer} · {rfq.category} · {rfq.items} items</p>
                </div>

                <div className="text-right flex-shrink-0">
                  <p className="text-xs text-[#527270]">Deadline</p>
                  <p className={cn('font-semibold text-sm mt-0.5', rfq.daysLeft <= 5 && rfq.daysLeft > 0 ? 'text-[#C0392B]' : 'text-[#0D1F1E]')}>
                    {rfq.deadline}
                  </p>
                  {rfq.daysLeft > 0 && (
                    <p className={cn('text-xs mt-0.5', rfq.daysLeft <= 5 ? 'text-[#C0392B]' : 'text-[#527270]')}>
                      {rfq.daysLeft} days left
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <button onClick={() => setSelected(rfq)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm border border-[#C8E0DE] text-[#527270] hover:bg-[#EBF7F6] transition-colors">
                  <Eye className="w-3.5 h-3.5" /> View Details
                </button>
                {rfq.status === 'invited' && (
                  <button onClick={() => { setSelected(rfq); setShowSubmit(true); }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-white transition-all hover:opacity-90"
                    style={{ background: 'linear-gradient(135deg, #00706A, #007870)' }}>
                    <Send className="w-3.5 h-3.5" /> Submit Quotation
                  </button>
                )}
                {rfq.status === 'submitted' && (
                  <button onClick={() => onNavigate('vendor-quotations')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm border border-[#00706A] text-[#00706A] hover:bg-[#D4EEEC] transition-colors">
                    View My Quote →
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Quotation submit modal */}
      {showSubmit && selected && (
        <QuotationSubmitModal rfq={selected} onClose={() => setShowSubmit(false)} />
      )}
    </div>
  );
}

function QuotationSubmitModal({ rfq, onClose }: { rfq: typeof openRFQs[0]; onClose: () => void }) {
  const [submitted, setSubmitted] = useState(false);
  const [dragging, setDragging] = useState(false);

  const mockItems = [
    { name: 'Dell PowerEdge R750 Server', qty: 2, unit: 'pcs' },
    { name: 'Network Switches (48-port)', qty: 4, unit: 'pcs' },
    { name: 'UPS Battery Systems', qty: 3, unit: 'pcs' },
  ];
  const [prices, setPrices] = useState<Record<number, string>>({ 0: '125000', 1: '42000', 2: '85000' });

  const grandTotal = mockItems.reduce((s, item, i) => s + (parseFloat(prices[i] || '0') || 0) * item.qty, 0);

  if (submitted) {
    return (
      <>
        <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-40" onClick={onClose} />
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-white rounded-2xl shadow-2xl z-50 p-8 text-center">
          <div className="w-16 h-16 bg-[#D4EEEC] rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-[#00706A]" />
          </div>
          <h3 className="font-bold text-[#0D1F1E] text-lg mb-2">Quotation Submitted!</h3>
          <p className="text-sm text-[#527270]">Your quotation for <strong>{rfq.title}</strong> has been sent to the buyer.</p>
          <div className="bg-[#EBF7F6] rounded-xl p-4 mt-4 text-left">
            <div className="flex justify-between text-sm">
              <span className="text-[#527270]">Total Value</span>
              <span className="font-bold text-[#00706A]">₹{grandTotal.toLocaleString('en-IN')}</span>
            </div>
          </div>
          <button onClick={onClose} className="w-full mt-5 py-2.5 rounded-lg text-sm font-medium text-white"
            style={{ background: 'linear-gradient(135deg, #00706A, #007870)' }}>
            Done
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-40" onClick={onClose} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white rounded-2xl shadow-2xl z-50 flex flex-col max-h-[90vh]">
        <div className="flex items-start justify-between p-5 border-b border-[#D8EDEB]">
          <div>
            <h3 className="font-bold text-[#0D1F1E]">Submit Quotation</h3>
            <p className="text-xs text-[#527270] mt-0.5">{rfq.id} · {rfq.title}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[#EBF7F6] text-[#527270]"><X className="w-4 h-4" /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <div className="space-y-3">
            {mockItems.map((item, i) => {
              const total = (parseFloat(prices[i] || '0') || 0) * item.qty;
              return (
                <div key={i} className="bg-[#EBF7F6] rounded-xl p-3 flex items-center gap-3">
                  <div className="flex-1">
                    <p className="font-medium text-[#0D1F1E] text-sm">{item.name}</p>
                    <p className="text-xs text-[#527270] mt-0.5">Qty: {item.qty} {item.unit}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div>
                      <p className="text-xs text-[#527270] mb-1">Unit Price (₹)</p>
                      <input type="number" value={prices[i] || ''} onChange={e => setPrices(p => ({ ...p, [i]: e.target.value }))}
                        className="w-28 px-2.5 py-1.5 border border-[#C8E0DE] rounded-lg text-sm focus:outline-none focus:border-[#00706A] focus:ring-2 focus:ring-[#00706A]/20" />
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-[#527270] mb-1">Total</p>
                      <p className="font-medium text-[#00706A] text-sm">₹{total.toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-[#0D1F1E] mb-1.5">Delivery Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#527270]" />
                <input type="date" defaultValue="2024-06-28"
                  className="w-full pl-9 pr-3 py-2.5 border border-[#C8E0DE] rounded-lg text-sm focus:outline-none focus:border-[#00706A] focus:ring-2 focus:ring-[#00706A]/20" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#0D1F1E] mb-1.5">Validity (days)</label>
              <input type="number" defaultValue="30"
                className="w-full px-3 py-2.5 border border-[#C8E0DE] rounded-lg text-sm focus:outline-none focus:border-[#00706A] focus:ring-2 focus:ring-[#00706A]/20" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#0D1F1E] mb-1.5">Notes</label>
            <textarea rows={2} placeholder="Additional terms or conditions..."
              className="w-full px-3 py-2.5 border border-[#C8E0DE] rounded-lg text-sm focus:outline-none focus:border-[#00706A] focus:ring-2 focus:ring-[#00706A]/20 resize-none" />
          </div>

          <div onDragOver={e => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={e => { e.preventDefault(); setDragging(false); }}
            className={cn('border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors',
              dragging ? 'border-[#00706A] bg-[#D4EEEC]' : 'border-[#C8E0DE] hover:border-[#00706A]/50')}>
            <Upload className="w-5 h-5 text-[#527270] mx-auto mb-1" />
            <p className="text-xs text-[#527270]">Attach supporting documents <span className="text-[#00706A]">(optional)</span></p>
          </div>

          <div className="flex justify-between items-center pt-2 border-t border-[#D8EDEB]">
            <span className="font-semibold text-[#0D1F1E] text-sm">Grand Total</span>
            <span className="font-bold text-[#00706A] text-lg">₹{grandTotal.toLocaleString('en-IN')}</span>
          </div>
        </div>

        <div className="flex gap-3 p-5 border-t border-[#D8EDEB]">
          <button onClick={onClose} className="flex-1 py-2.5 border border-[#C8E0DE] rounded-lg text-sm font-medium text-[#527270] hover:bg-[#EBF7F6]">Cancel</button>
          <button onClick={() => setSubmitted(true)}
            className="flex-1 py-2.5 rounded-lg text-sm font-medium text-white"
            style={{ background: 'linear-gradient(135deg, #00706A, #007870)' }}>
            Submit Quotation
          </button>
        </div>
      </div>
    </>
  );
}

// ─── VENDOR QUOTATIONS LIST ──────────────────────────────────────────────────

const myQuotations = [
  { id: 'QT-2024-031', rfq: 'Server Infrastructure Upgrade', rfqId: 'RFQ-2024-088', submitted: '10 Jun 2024', total: '₹12,85,000', status: 'under-review', delivery: '28 Jun 2024' },
  { id: 'QT-2024-028', rfq: 'Raw Steel Procurement Q3', rfqId: 'RFQ-2024-087', submitted: '05 Jun 2024', total: '₹8,40,000', status: 'awarded', delivery: '20 Jun 2024' },
  { id: 'QT-2024-022', rfq: 'Packaging Materials Annual', rfqId: 'RFQ-2024-084', submitted: '01 Jun 2024', total: '₹5,10,000', status: 'rejected', delivery: '15 Jun 2024' },
];

const qStatusConfig = {
  'under-review': { label: 'Under Review', color: '#9A6800', bg: '#FFF0C8' },
  'awarded': { label: 'Awarded', color: '#00706A', bg: '#D4EEEC' },
  'rejected': { label: 'Not Selected', color: '#C0392B', bg: '#FDECEA' },
  'submitted': { label: 'Submitted', color: '#004643', bg: '#D4EEEC' },
};

export function VendorQuotations() {
  return (
    <div className="space-y-5">
      <p className="text-[#527270] text-sm">Track the status of your submitted quotations</p>

      <div className="bg-white rounded-xl border border-[#C8E0DE]/60 overflow-hidden"
        style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#EBF7F6] border-b border-[#C8E0DE]/60">
              {['Quote ID', 'RFQ', 'Submitted', 'Total Value', 'Delivery', 'Status'].map(h => (
                <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-[#527270] uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {myQuotations.map((q, i) => {
              const sc = qStatusConfig[q.status as keyof typeof qStatusConfig];
              return (
                <tr key={q.id} className={cn('border-t border-[#D8EDEB] hover:bg-[#EEF7F6] transition-colors', i % 2 === 1 && 'bg-[#EEF7F6]')}>
                  <td className="px-5 py-4 font-medium text-[#00706A]">{q.id}</td>
                  <td className="px-5 py-4">
                    <p className="font-medium text-[#0D1F1E]">{q.rfq}</p>
                    <p className="text-xs text-[#527270] mt-0.5">{q.rfqId}</p>
                  </td>
                  <td className="px-5 py-4 text-[#527270]">{q.submitted}</td>
                  <td className="px-5 py-4 font-semibold text-[#0D1F1E]">{q.total}</td>
                  <td className="px-5 py-4 text-[#527270]">{q.delivery}</td>
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium"
                      style={{ color: sc.color, background: sc.bg }}>
                      {sc.label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── VENDOR PURCHASE ORDERS ──────────────────────────────────────────────────

const vendorPOs = [
  { id: 'PO-2024-142', rfq: 'Server Infrastructure Upgrade', amount: '₹12,85,000', date: '12 Jun 2024', dueDate: '12 Jul 2024', status: 'active', invoiceStatus: 'unpaid' },
  { id: 'PO-2024-128', rfq: 'Raw Steel Procurement Q3', amount: '₹8,40,000', date: '01 Jun 2024', dueDate: '01 Jul 2024', status: 'completed', invoiceStatus: 'paid' },
];

export function VendorOrders() {
  return (
    <div className="space-y-5">
      <p className="text-[#527270] text-sm">Purchase orders issued to your company</p>

      <div className="grid gap-4">
        {vendorPOs.map(po => (
          <div key={po.id} className="bg-white rounded-xl border border-[#C8E0DE]/60 p-5"
            style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
            <div className="flex items-start justify-between">
              <div>
                <p className="font-bold text-[#00706A]">{po.id}</p>
                <p className="font-medium text-[#0D1F1E] mt-0.5">{po.rfq}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-[#0D1F1E] text-lg">{po.amount}</p>
                <span className={cn('inline-flex mt-1 px-2.5 py-0.5 rounded-md text-xs font-medium',
                  po.invoiceStatus === 'paid' ? 'bg-[#D4EEEC] text-[#00706A]' : 'bg-[#FFF0C8] text-[#9A6800]')}>
                  Invoice: {po.invoiceStatus === 'paid' ? 'Paid' : 'Unpaid'}
                </span>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-xs text-[#527270]">PO Date</p>
                <p className="font-medium text-[#0D1F1E] mt-0.5">{po.date}</p>
              </div>
              <div>
                <p className="text-xs text-[#527270]">Payment Due</p>
                <p className="font-medium text-[#0D1F1E] mt-0.5">{po.dueDate}</p>
              </div>
              <div>
                <p className="text-xs text-[#527270]">Status</p>
                <span className={cn('inline-flex mt-0.5 px-2 py-0.5 rounded text-xs font-medium',
                  po.status === 'completed' ? 'bg-[#D4EEEC] text-[#00706A]' : 'bg-[#D4EEEC] text-[#004643]')}>
                  {po.status === 'completed' ? 'Completed' : 'Active'}
                </span>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm border border-[#C8E0DE] text-[#527270] hover:bg-[#EBF7F6] transition-colors">
                <Eye className="w-3.5 h-3.5" /> View PO
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
