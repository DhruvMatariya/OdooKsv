import { useState, useEffect, useCallback } from 'react';
import { CheckCircle, XCircle, Clock, User, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from './ui/utils';
import { api } from '../lib/api';

interface BackendApproval {
  id: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  remarks?: string | null;
  createdAt: string;
  resolvedAt?: string | null;
  rfq: {
    id: string;
    rfqNumber: string;
    title: string;
    items: Array<{ name: string; quantity: number; unit: string; description?: string }>;
    createdBy: { firstName: string; lastName: string };
    quotations?: Array<{ totalAmount: number; vendor: { name: string }; items: Array<{ rfqItemName: string; quantity: number; unitPrice: number; totalPrice: number }> }>;
  };
  approver: { firstName: string; lastName: string };
}

const statusConfig = {
  PENDING: { label: 'Pending', color: '#9A6800', bg: '#FFF0C8', icon: Clock },
  APPROVED: { label: 'Approved', color: '#00706A', bg: '#D4EEEC', icon: CheckCircle },
  REJECTED: { label: 'Rejected', color: '#C0392B', bg: '#FDECEA', icon: XCircle },
};

const statusFilters = ['All', 'PENDING', 'APPROVED', 'REJECTED'];

export function ApprovalWorkflow() {
  const [approvals, setApprovals] = useState<BackendApproval[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [selected, setSelected] = useState<BackendApproval | null>(null);

  const fetchApprovals = useCallback(async () => {
    setLoading(true);
    try {
      const endpoint = filter !== 'All' ? `/approvals?status=${filter}` : '/approvals';
      const data = await api.get<BackendApproval[]>(endpoint);
      const list = Array.isArray(data) ? data : [];
      setApprovals(list);
      if (list.length > 0 && !selected) setSelected(list[0]);
      else if (list.length === 0) setSelected(null);
    } catch {
      setApprovals([]);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchApprovals();
  }, [fetchApprovals]);

  useEffect(() => {
    if (approvals.length > 0) {
      const stillExists = selected && approvals.find(a => a.id === selected.id);
      if (!stillExists) setSelected(approvals[0]);
    }
  }, [approvals, selected]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-[#527270]">
        <Loader2 className="w-8 h-8 animate-spin mb-2" />
        <p>Loading approvals...</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex rounded-lg overflow-hidden border border-[#C8E0DE] w-fit">
        {statusFilters.map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={cn('px-4 py-2 text-sm transition-colors',
              filter === s ? 'bg-[#004643] text-white' : 'bg-white text-[#527270] hover:bg-[#EBF7F6]')}>
            {s === 'All' ? 'All' : statusConfig[s as keyof typeof statusConfig]?.label || s}
            {s !== 'All' && (
              <span className={cn('ml-1.5 text-xs px-1.5 py-0.5 rounded-full',
                filter === s ? 'bg-white/20 text-white' : 'bg-[#D8EDEB] text-[#527270]')}>
                {approvals.filter(r => r.status === s).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {approvals.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#C8E0DE]/60 p-12 text-center">
          <CheckCircle className="w-12 h-12 text-[#D4EEEC] mx-auto mb-3" />
          <p className="font-medium text-[#0D1F1E]">No approval requests</p>
          <p className="text-sm text-[#527270] mt-1">RFQ approvals will appear here once created</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">
          <div className="xl:col-span-2 space-y-3">
            {approvals.map(req => {
              const sc = statusConfig[req.status];
              const Icon = sc.icon;
              const topQuote = req.rfq.quotations?.[0];
              return (
                <div key={req.id} onClick={() => setSelected(req)}
                  className={cn('bg-white rounded-xl border p-4 cursor-pointer transition-all',
                    selected?.id === req.id ? 'border-[#004643] shadow-md' : 'border-[#C8E0DE]/60 hover:border-[#004643]/40')}
                  style={{ boxShadow: selected?.id === req.id ? '0 4px 20px rgba(0,70,67,0.12)' : '0 2px 12px rgba(0,0,0,0.05)' }}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold text-[#0D1F1E] text-sm">{req.rfq.title}</p>
                      <p className="text-xs text-[#527270] mt-0.5">{req.rfq.rfqNumber}</p>
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium"
                      style={{ color: sc.color, background: sc.bg }}>
                      <Icon className="w-3 h-3" /> {sc.label}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <p className="text-[#527270]">Requested by</p>
                      <p className="font-medium text-[#0D1F1E] mt-0.5">{req.rfq.createdBy.firstName} {req.rfq.createdBy.lastName}</p>
                    </div>
                    <div>
                      <p className="text-[#527270]">Approver</p>
                      <p className="font-medium text-[#0D1F1E] mt-0.5">{req.approver.firstName} {req.approver.lastName}</p>
                    </div>
                    {topQuote && (
                      <>
                        <div>
                          <p className="text-[#527270]">Vendor</p>
                          <p className="font-medium text-[#0D1F1E] mt-0.5">{topQuote.vendor.name}</p>
                        </div>
                        <div>
                          <p className="text-[#527270]">Amount</p>
                          <p className="font-bold text-[#0D1F1E] mt-0.5">₹{topQuote.totalAmount.toLocaleString('en-IN')}</p>
                        </div>
                      </>
                    )}
                  </div>
                  {req.status === 'PENDING' && (
                    <div className="mt-3 flex items-center gap-1.5 text-[#9A6800] text-xs">
                      <AlertCircle className="w-3.5 h-3.5" />
                      Awaiting manager review
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {selected && (
            <div className="xl:col-span-3 space-y-4">
              <div className="bg-white rounded-xl border border-[#C8E0DE]/60 p-5"
                style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-[#0D1F1E]">{selected.rfq.title}</h3>
                    <p className="text-sm text-[#527270] mt-0.5">{selected.rfq.rfqNumber}</p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium"
                    style={{ color: statusConfig[selected.status].color, background: statusConfig[selected.status].bg }}>
                    {statusConfig[selected.status].label}
                  </span>
                </div>
                <div className="text-sm text-[#527270]">
                  Submitted {new Date(selected.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  {selected.resolvedAt && ` · Resolved ${new Date(selected.resolvedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}`}
                </div>
                {selected.remarks && (
                  <p className="mt-3 text-sm text-[#0D1F1E] bg-[#EBF7F6] rounded-lg px-3 py-2">{selected.remarks}</p>
                )}
              </div>

              <div className="bg-white rounded-xl border border-[#C8E0DE]/60 overflow-hidden"
                style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
                <div className="px-5 py-3.5 border-b border-[#D8EDEB]">
                  <h4 className="font-semibold text-[#0D1F1E] text-sm">RFQ Line Items</h4>
                </div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[#EBF7F6]">
                      {['Item', 'Qty', 'Unit'].map(h => (
                        <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-[#527270] uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {selected.rfq.items.map((item, i) => (
                      <tr key={item.name + i} className={cn('border-t border-[#D8EDEB]', i % 2 === 1 && 'bg-[#EEF7F6]')}>
                        <td className="px-5 py-3 text-[#0D1F1E] font-medium">{item.name}</td>
                        <td className="px-5 py-3 text-[#527270]">{item.quantity}</td>
                        <td className="px-5 py-3 text-[#527270]">{item.unit}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="bg-white rounded-xl border border-[#C8E0DE]/60 p-5"
                style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
                <h4 className="font-semibold text-[#0D1F1E] mb-4">Approval History</h4>
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#D4EEEC] flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-[#004643]" />
                    </div>
                    <div>
                      <span className="font-medium text-[#0D1F1E] text-sm">{selected.rfq.createdBy.firstName} {selected.rfq.createdBy.lastName}</span>
                      <p className="text-xs text-[#527270] mt-0.5">RFQ Created · {new Date(selected.createdAt).toLocaleDateString('en-GB')}</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#D4EEEC] flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-[#004643]" />
                    </div>
                    <div>
                      <span className="font-medium text-[#0D1F1E] text-sm">{selected.approver.firstName} {selected.approver.lastName}</span>
                      <p className="text-xs text-[#527270] mt-0.5">
                        {selected.status === 'PENDING' ? 'Under Review' : selected.status} · Manager
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
