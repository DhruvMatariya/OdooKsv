import { useState, useEffect } from 'react';
import { Search, Plus, Loader2, AlertCircle, CheckCircle, Send } from 'lucide-react';
import { cn } from './ui/utils';
import { api } from '../lib/api';
import { toast } from 'sonner';

interface BackendInvoice {
  id: string;
  invoiceNumber: string;
  grandTotal: number;
  status: string;
  dueDate: string;
  createdAt: string;
  purchaseOrder: {
    poNumber: string;
    vendor?: { name: string };
    quotation?: { vendor?: { name: string } };
  };
}

interface BackendPO {
  id: string;
  poNumber: string;
  grandTotal: number;
  vendor?: { name: string };
  quotation?: { vendor?: { name: string } };
  invoice?: { id: string } | null;
}

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  DRAFT: { label: 'Draft', color: '#527270', bg: '#D8EDEB' },
  SENT: { label: 'Sent', color: '#9A6800', bg: '#FFF0C8' },
  PAID: { label: 'Paid', color: '#00706A', bg: '#D4EEEC' },
};

function vendorName(inv: BackendInvoice) {
  return inv.purchaseOrder?.vendor?.name ?? inv.purchaseOrder?.quotation?.vendor?.name ?? '—';
}

function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] || { label: status, color: '#527270', bg: '#D8EDEB' };
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium"
      style={{ color: config.color, background: config.bg }}>
      {config.label}
    </span>
  );
}

export function Invoices() {
  const [invoices, setInvoices] = useState<BackendInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [posWithoutInvoice, setPosWithoutInvoice] = useState<BackendPO[]>([]);
  const [selectedPoId, setSelectedPoId] = useState('');
  const [creating, setCreating] = useState(false);

  const fetchInvoices = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get<{ invoices: BackendInvoice[] }>('/invoices?limit=100');
      setInvoices(data.invoices || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch invoices');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const openCreate = async () => {
    try {
      const data = await api.get<{ purchaseOrders: BackendPO[] }>('/purchase-orders?limit=100');
      const eligible = (data.purchaseOrders || []).filter(po => !po.invoice);
      setPosWithoutInvoice(eligible);
      setSelectedPoId(eligible[0]?.id || '');
      setShowCreate(true);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load purchase orders');
    }
  };

  const handleCreate = async () => {
    if (!selectedPoId) return;
    setCreating(true);
    try {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 30);
      await api.post('/invoices', {
        purchaseOrderId: selectedPoId,
        dueDate: dueDate.toISOString(),
      });
      toast.success('Invoice created');
      setShowCreate(false);
      fetchInvoices();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create invoice');
    } finally {
      setCreating(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await api.patch(`/invoices/${id}/status`, { status });
      toast.success(`Invoice marked as ${status.toLowerCase()}`);
      fetchInvoices();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update status');
    }
  };

  const filtered = invoices.filter(inv =>
    inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
    vendorName(inv).toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-[#527270] text-sm">Manage invoices linked to purchase orders</p>
        <button onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-white transition-all hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, #004643, #00706A)' }}>
          <Plus className="w-4 h-4" /> Create Invoice
        </button>
      </div>

      <div className="bg-white rounded-xl p-4 border border-[#C8E0DE]/60 flex flex-wrap gap-3 items-center"
        style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#527270]" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by invoice number or vendor..."
            className="w-full pl-9 pr-4 py-2 border border-[#C8E0DE] rounded-lg text-sm focus:outline-none focus:border-[#004643] focus:ring-2 focus:ring-[#004643]/20 transition-all" />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#C8E0DE]/60 overflow-hidden"
        style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-[#527270]">
            <Loader2 className="w-8 h-8 animate-spin mb-2" />
            <p>Loading invoices...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 text-red-500">
            <AlertCircle className="w-8 h-8 mb-2" />
            <p>{error}</p>
            <button onClick={fetchInvoices} className="mt-4 text-sm font-medium text-[#004643] underline">Try again</button>
          </div>
        ) : (
          <table className="w-full text-sm min-w-[800px]">
            <thead>
              <tr className="bg-[#EBF7F6] border-b border-[#C8E0DE]/60">
                {['Invoice', 'PO', 'Vendor', 'Amount', 'Due Date', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-[#527270] uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="px-5 py-10 text-center text-[#527270]">No invoices found</td></tr>
              ) : (
                filtered.map((inv, i) => (
                  <tr key={inv.id} className={cn('border-t border-[#D8EDEB] hover:bg-[#EEF7F6] transition-colors', i % 2 === 1 && 'bg-[#EEF7F6]')}>
                    <td className="px-5 py-4 font-medium text-[#004643]">{inv.invoiceNumber}</td>
                    <td className="px-5 py-4 text-[#527270]">{inv.purchaseOrder?.poNumber}</td>
                    <td className="px-5 py-4 text-[#0D1F1E]">{vendorName(inv)}</td>
                    <td className="px-5 py-4 font-semibold text-[#0D1F1E]">₹{inv.grandTotal.toLocaleString('en-IN')}</td>
                    <td className="px-5 py-4 text-[#527270] text-xs">
                      {new Date(inv.dueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-5 py-4"><StatusBadge status={inv.status} /></td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1">
                        {inv.status === 'DRAFT' && (
                          <button onClick={() => updateStatus(inv.id, 'SENT')} title="Mark sent"
                            className="p-1.5 rounded-lg text-[#9A6800] hover:bg-[#FFF0C8] transition-colors">
                            <Send className="w-4 h-4" />
                          </button>
                        )}
                        {(inv.status === 'DRAFT' || inv.status === 'SENT') && (
                          <button onClick={() => updateStatus(inv.id, 'PAID')} title="Mark paid"
                            className="p-1.5 rounded-lg text-[#00706A] hover:bg-[#D4EEEC] transition-colors">
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {showCreate && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <h3 className="font-semibold text-[#0D1F1E] mb-4">Create Invoice from PO</h3>
            {posWithoutInvoice.length === 0 ? (
              <p className="text-sm text-[#527270] mb-4">No confirmed purchase orders without an invoice.</p>
            ) : (
              <select value={selectedPoId} onChange={e => setSelectedPoId(e.target.value)}
                className="w-full px-3 py-2.5 border border-[#C8E0DE] rounded-lg text-sm mb-4 focus:outline-none focus:border-[#004643]">
                {posWithoutInvoice.map(po => (
                  <option key={po.id} value={po.id}>
                    {po.poNumber} — {po.vendor?.name ?? po.quotation?.vendor?.name} (₹{po.grandTotal.toLocaleString('en-IN')})
                  </option>
                ))}
              </select>
            )}
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowCreate(false)}
                className="px-4 py-2 rounded-lg text-sm border border-[#C8E0DE] text-[#527270] hover:bg-[#EBF7F6]">
                Cancel
              </button>
              <button onClick={handleCreate} disabled={creating || !selectedPoId}
                className="px-4 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-50"
                style={{ background: '#004643' }}>
                {creating ? 'Creating...' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
