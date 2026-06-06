import { useState, useEffect } from 'react';
import { Search, Download, Send, Eye, Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { cn } from './ui/utils';
import { api } from '../lib/api';
import { toast } from 'sonner';

interface BackendPO {
  id: string;
  poNumber: string;
  vendor: { name: string };
  totalAmount: number;
  status: string;
  createdAt: string;
  quotation: { rfq: { title: string } };
}

const statusConfig = {
  CONFIRMED: { label: 'Confirmed', color: '#00706A', bg: '#D4EEEC' },
  DELIVERED: { label: 'Delivered', color: '#004643', bg: '#D4EEEC' },
  CANCELLED: { label: 'Cancelled', color: '#C0392B', bg: '#FDECEA' },
};

function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status as keyof typeof statusConfig] || { label: status, color: '#527270', bg: '#D8EDEB' };
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium"
      style={{ color: config.color, background: config.bg }}>
      {config.label}
    </span>
  );
}

export function PurchaseOrders() {
  const [pos, setPos] = useState<BackendPO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const fetchPOs = async () => {
    setLoading(true);
    try {
      const data = await api.get<{ purchaseOrders: BackendPO[] }>('/purchase-orders?limit=100');
      setPos(data.purchaseOrders);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch POs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPOs();
  }, []);

  const filtered = pos.filter(o =>
    o.poNumber.toLowerCase().includes(search.toLowerCase()) ||
    o.vendor.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-[#527270] text-sm">Track and manage your purchase orders</p>
      </div>

      <div className="bg-white rounded-xl p-4 border border-[#C8E0DE]/60 flex flex-wrap gap-3 items-center"
        style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#527270]" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by PO number or vendor..."
            className="w-full pl-9 pr-4 py-2 border border-[#C8E0DE] rounded-lg text-sm focus:outline-none focus:border-[#004643] focus:ring-2 focus:ring-[#004643]/20 transition-all" />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#C8E0DE]/60 overflow-hidden"
        style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-[#527270]">
              <Loader2 className="w-8 h-8 animate-spin mb-2" />
              <p>Loading purchase orders...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 text-red-500">
              <AlertCircle className="w-8 h-8 mb-2" />
              <p>{error}</p>
              <button onClick={() => fetchPOs()} className="mt-4 text-sm font-medium text-[#004643] underline">Try again</button>
            </div>
          ) : (
            <table className="w-full text-sm min-w-[800px]">
              <thead>
                <tr className="bg-[#EBF7F6] border-b border-[#C8E0DE]/60">
                  {['PO Number', 'RFQ / Description', 'Vendor', 'Amount', 'Date', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-[#527270] uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={7} className="px-5 py-10 text-center text-[#527270]">No purchase orders found</td></tr>
                ) : (
                  filtered.map((po, i) => (
                    <tr key={po.id} className={cn('border-t border-[#D8EDEB] hover:bg-[#EEF7F6] transition-colors', i % 2 === 1 && 'bg-[#EEF7F6]')}>
                      <td className="px-5 py-4 font-medium text-[#004643]">{po.poNumber}</td>
                      <td className="px-5 py-4">
                        <p className="text-[#0D1F1E] font-medium">{po.quotation.rfq.title}</p>
                      </td>
                      <td className="px-5 py-4 text-[#0D1F1E]">{po.vendor.name}</td>
                      <td className="px-5 py-4 font-semibold text-[#0D1F1E]">₹{po.totalAmount.toLocaleString('en-IN')}</td>
                      <td className="px-5 py-4 text-[#527270] text-xs">
                        {new Date(po.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-5 py-4"><StatusBadge status={po.status} /></td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1">
                          <button className="p-1.5 rounded-lg text-[#527270] hover:bg-[#D4EEEC] hover:text-[#004643] transition-colors" title="View">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="p-1.5 rounded-lg text-[#527270] hover:bg-[#D4EEEC] hover:text-[#004643] transition-colors" title="Download">
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
