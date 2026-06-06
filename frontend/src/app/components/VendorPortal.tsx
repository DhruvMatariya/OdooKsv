import { useState, useEffect } from 'react';
import { Eye, Send, Clock, CheckCircle, AlertCircle, Upload, Calendar, X } from 'lucide-react';
import { cn } from './ui/utils';
import type { Page } from './Sidebar';
import { api } from '../lib/api';
import { toast } from 'sonner';

// ─── ACTIVE RFQs FOR VENDOR ─────────────────────────────────────────────────

const rfqStatusConfig: Record<string, any> = {
  PUBLISHED: { label: 'Open', color: '#004643', bg: '#D4EEEC', icon: Clock },
  CLOSED: { label: 'Closed', color: '#527270', bg: '#D8EDEB', icon: X },
};

export function VendorRFQs({ onNavigate }: { onNavigate: (page: Page) => void }) {
  const [rfqs, setRfqs] = useState<any[]>([]);
  const [selected, setSelected] = useState<any | null>(null);
  const [showSubmit, setShowSubmit] = useState(false);

  const fetchRFQs = async () => {
    try {
      const data = await api.get<{ rfqs: any[] }>('/rfqs');
      setRfqs(data.rfqs || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchRFQs();
  }, []);

  return (
    <div className="space-y-5">
      <p className="text-[#527270] text-sm">RFQs you've been invited to respond to</p>

      <div className="grid gap-4">
        {rfqs.map(rfq => {
          const sc = rfqStatusConfig[rfq.status] || rfqStatusConfig.PUBLISHED;
          const Icon = sc.icon;
          const daysLeft = Math.ceil((new Date(rfq.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

          return (
            <div key={rfq.id} className="bg-white rounded-xl border border-[#C8E0DE]/60 p-5 hover:shadow-md transition-all"
              style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-[#527270]">{rfq.rfqNumber}</span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium"
                      style={{ color: sc.color, background: sc.bg }}>
                      <Icon className="w-3 h-3" />{sc.label}
                    </span>
                  </div>
                  <h3 className="font-semibold text-[#0D1F1E]">{rfq.title}</h3>
                  <p className="text-xs text-[#527270] mt-1">{rfq.description?.substring(0, 50)}... · {rfq._count?.items} items</p>
                </div>

                <div className="text-right flex-shrink-0">
                  <p className="text-xs text-[#527270]">Deadline</p>
                  <p className={cn('font-semibold text-sm mt-0.5', daysLeft <= 5 && daysLeft > 0 ? 'text-[#C0392B]' : 'text-[#0D1F1E]')}>
                    {new Date(rfq.deadline).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </p>
                  {daysLeft > 0 && (
                    <p className={cn('text-xs mt-0.5', daysLeft <= 5 ? 'text-[#C0392B]' : 'text-[#527270]')}>
                      {daysLeft} days left
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                {rfq.status === 'PUBLISHED' && (
                  <button onClick={() => { setSelected(rfq); setShowSubmit(true); }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-white transition-all hover:opacity-90"
                    style={{ background: 'linear-gradient(135deg, #00706A, #007870)' }}>
                    <Send className="w-3.5 h-3.5" /> Submit Quotation
                  </button>
                )}
              </div>
            </div>
          );
        })}
        {rfqs.length === 0 && (
          <div className="bg-white rounded-xl border border-[#C8E0DE]/60 p-8 text-center text-[#527270]">
            No open RFQs at the moment.
          </div>
        )}
      </div>

      {showSubmit && selected && (
        <QuotationSubmitModal rfqId={selected.id} onClose={() => setShowSubmit(false)} onSubmitted={() => { setShowSubmit(false); fetchRFQs(); onNavigate('vendor-quotations'); }} />
      )}
    </div>
  );
}

function QuotationSubmitModal({ rfqId, onClose, onSubmitted }: { rfqId: string; onClose: () => void, onSubmitted: () => void }) {
  const [rfq, setRfq] = useState<any>(null);
  const [prices, setPrices] = useState<Record<number, string>>({});
  const [deliveryDays, setDeliveryDays] = useState('30');
  const [validUntil, setValidUntil] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get<any>(`/rfqs/${rfqId}`).then(setRfq);
  }, [rfqId]);

  if (!rfq) return null;

  const grandTotal = rfq.items?.reduce((s: number, item: any, i: number) => s + (parseFloat(prices[i] || '0') || 0) * item.quantity, 0) || 0;

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const payload = {
        totalAmount: grandTotal,
        deliveryDays: parseInt(deliveryDays),
        validUntil: validUntil || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        notes,
        items: rfq.items.map((item: any, i: number) => ({
          rfqItemName: item.name,
          quantity: item.quantity,
          unitPrice: parseFloat(prices[i] || '0') || 0,
          totalPrice: (parseFloat(prices[i] || '0') || 0) * item.quantity
        }))
      };

      await api.post(`/rfqs/${rfqId}/quotations`, payload);
      toast.success('Quotation submitted');
      onSubmitted();
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit quotation');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-40" onClick={onClose} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white rounded-2xl shadow-2xl z-50 flex flex-col max-h-[90vh]">
        <div className="flex items-start justify-between p-5 border-b border-[#D8EDEB]">
          <div>
            <h3 className="font-bold text-[#0D1F1E]">Submit Quotation</h3>
            <p className="text-xs text-[#527270] mt-0.5">{rfq.rfqNumber} · {rfq.title}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[#EBF7F6] text-[#527270]"><X className="w-4 h-4" /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <div className="space-y-3">
            {rfq.items?.map((item: any, i: number) => {
              const total = (parseFloat(prices[i] || '0') || 0) * item.quantity;
              return (
                <div key={i} className="bg-[#EBF7F6] rounded-xl p-3 flex items-center gap-3">
                  <div className="flex-1">
                    <p className="font-medium text-[#0D1F1E] text-sm">{item.name}</p>
                    <p className="text-xs text-[#527270] mt-0.5">Qty: {item.quantity} {item.unit}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div>
                      <p className="text-xs text-[#527270] mb-1">Unit Price (₹)</p>
                      <input type="number" value={prices[i] || ''} onChange={e => setPrices(p => ({ ...p, [i]: e.target.value }))}
                        className="w-28 px-2.5 py-1.5 border border-[#C8E0DE] rounded-lg text-sm focus:outline-none focus:border-[#00706A] focus:ring-2 focus:ring-[#00706A]/20" />
                    </div>
                    <div className="text-right w-20">
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
              <label className="block text-sm font-medium text-[#0D1F1E] mb-1.5">Validity Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#527270]" />
                <input type="date" value={validUntil} onChange={e => setValidUntil(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 border border-[#C8E0DE] rounded-lg text-sm focus:outline-none focus:border-[#00706A] focus:ring-2 focus:ring-[#00706A]/20" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#0D1F1E] mb-1.5">Delivery Time (days)</label>
              <input type="number" value={deliveryDays} onChange={e => setDeliveryDays(e.target.value)}
                className="w-full px-3 py-2.5 border border-[#C8E0DE] rounded-lg text-sm focus:outline-none focus:border-[#00706A] focus:ring-2 focus:ring-[#00706A]/20" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#0D1F1E] mb-1.5">Notes</label>
            <textarea rows={2} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Additional terms or conditions..."
              className="w-full px-3 py-2.5 border border-[#C8E0DE] rounded-lg text-sm focus:outline-none focus:border-[#00706A] focus:ring-2 focus:ring-[#00706A]/20 resize-none" />
          </div>

          <div className="flex justify-between items-center pt-2 border-t border-[#D8EDEB]">
            <span className="font-semibold text-[#0D1F1E] text-sm">Grand Total</span>
            <span className="font-bold text-[#00706A] text-lg">₹{grandTotal.toLocaleString('en-IN')}</span>
          </div>
        </div>

        <div className="flex gap-3 p-5 border-t border-[#D8EDEB]">
          <button onClick={onClose} disabled={submitting} className="flex-1 py-2.5 border border-[#C8E0DE] rounded-lg text-sm font-medium text-[#527270] hover:bg-[#EBF7F6]">Cancel</button>
          <button onClick={handleSubmit} disabled={submitting}
            className="flex-1 py-2.5 rounded-lg text-sm font-medium text-white disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #00706A, #007870)' }}>
            {submitting ? 'Submitting...' : 'Submit Quotation'}
          </button>
        </div>
      </div>
    </>
  );
}

// ─── VENDOR QUOTATIONS LIST ──────────────────────────────────────────────────

const qStatusConfig: Record<string, any> = {
  'SUBMITTED': { label: 'Under Review', color: '#9A6800', bg: '#FFF0C8' },
  'ACCEPTED': { label: 'Accepted', color: '#00706A', bg: '#D4EEEC' },
  'REJECTED': { label: 'Rejected', color: '#C0392B', bg: '#FDECEA' },
  'DRAFT': { label: 'Draft', color: '#527270', bg: '#D8EDEB' },
};

export function VendorQuotations() {
  const [quotations, setQuotations] = useState<any[]>([]);

  useEffect(() => {
    api.get<any[]>('/quotations')
      .then(data => setQuotations(Array.isArray(data) ? data : []))
      .catch(() => setQuotations([]));
  }, []);

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
            {quotations.map((q, i) => {
              const sc = qStatusConfig[q.status] || qStatusConfig.SUBMITTED;
              return (
                <tr key={q.id} className={cn('border-t border-[#D8EDEB] hover:bg-[#EEF7F6] transition-colors', i % 2 === 1 && 'bg-[#EEF7F6]')}>
                  <td className="px-5 py-4 font-medium text-[#00706A]">{q.quotationNumber}</td>
                  <td className="px-5 py-4">
                    <p className="font-medium text-[#0D1F1E]">{q.rfq?.title}</p>
                    <p className="text-xs text-[#527270] mt-0.5">{q.rfq?.rfqNumber}</p>
                  </td>
                  <td className="px-5 py-4 text-[#527270]">{new Date(q.createdAt).toLocaleDateString()}</td>
                  <td className="px-5 py-4 font-semibold text-[#0D1F1E]">₹{q.totalAmount.toLocaleString()}</td>
                  <td className="px-5 py-4 text-[#527270]">{q.deliveryDays} days</td>
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium"
                      style={{ color: sc.color, background: sc.bg }}>
                      {sc.label}
                    </span>
                  </td>
                </tr>
              );
            })}
            {quotations.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-[#527270]">No quotations submitted yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── VENDOR PURCHASE ORDERS ──────────────────────────────────────────────────

export function VendorOrders() {
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    api.get<{ purchaseOrders: any[] }>('/purchase-orders')
      .then(data => setOrders(data.purchaseOrders || []))
      .catch(() => setOrders([]));
  }, []);

  return (
    <div className="space-y-5">
      <p className="text-[#527270] text-sm">Purchase orders issued to your company</p>

      <div className="grid gap-4">
        {orders.map(po => (
          <div key={po.id} className="bg-white rounded-xl border border-[#C8E0DE]/60 p-5"
            style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
            <div className="flex items-start justify-between">
              <div>
                <p className="font-bold text-[#00706A]">{po.poNumber}</p>
                <p className="font-medium text-[#0D1F1E] mt-0.5">{po.quotation?.rfq?.title || 'Purchase Order'}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-[#0D1F1E] text-lg">₹{po.grandTotal.toLocaleString()}</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-xs text-[#527270]">PO Date</p>
                <p className="font-medium text-[#0D1F1E] mt-0.5">{new Date(po.createdAt).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-xs text-[#527270]">Delivery Expected</p>
                <p className="font-medium text-[#0D1F1E] mt-0.5">{new Date(po.deliveryDate).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-xs text-[#527270]">Status</p>
                <span className={cn('inline-flex mt-0.5 px-2 py-0.5 rounded text-xs font-medium',
                  po.status === 'DELIVERED' ? 'bg-[#D4EEEC] text-[#00706A]' : 'bg-[#D4EEEC] text-[#004643]')}>
                  {po.status}
                </span>
              </div>
            </div>
          </div>
        ))}
        {orders.length === 0 && (
          <div className="bg-white rounded-xl border border-[#C8E0DE]/60 p-8 text-center text-[#527270]">
            No purchase orders received yet.
          </div>
        )}
      </div>
    </div>
  );
}
