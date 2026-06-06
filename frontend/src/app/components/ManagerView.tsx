import { useState, useEffect, useCallback } from 'react';
import { CheckCircle, XCircle, Clock, TrendingUp, AlertTriangle, Loader2 } from 'lucide-react';
import { cn } from './ui/utils';
import { api } from '../lib/api';
import { toast } from 'sonner';

interface BackendApproval {
  id: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  rfq: {
    id: string;
    rfqNumber: string;
    title: string;
    description: string;
    deadline: string;
    createdBy: {
      firstName: string;
      lastName: string;
    };
    _count: {
      items: number;
    };
  };
}

const urgencyConfig = {
  high: { color: '#C0392B', bg: '#FDECEA', label: 'High Priority' },
  medium: { color: '#9A6800', bg: '#FFF0C8', label: 'Medium' },
  low: { color: '#00706A', bg: '#D4EEEC', label: 'Low' },
};

export function ManagerApprovals() {
  const [approvals, setApprovals] = useState<BackendApproval[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<string | null>(null);

  const fetchApprovals = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get<BackendApproval[]>('/approvals?status=PENDING');
      setApprovals(Array.isArray(data) ? data : []);
    } catch (err: any) {
      toast.error('Failed to fetch approval requests');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApprovals();
  }, [fetchApprovals]);

  const handleAction = async (rfqId: string, status: 'APPROVED' | 'REJECTED') => {
    setSubmitting(rfqId);
    try {
      await api.post(`/rfqs/${rfqId}/approve`, { status, remarks: 'Processed via dashboard' });
      toast.success(`RFQ ${status === 'APPROVED' ? 'approved' : 'rejected'}`);
      fetchApprovals();
    } catch (err: any) {
      toast.error(err.message || 'Action failed');
    } finally {
      setSubmitting(null);
    }
  };

  if (loading && approvals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-[#527270]">
        <Loader2 className="w-8 h-8 animate-spin mb-2" />
        <p>Loading approval queue...</p>
      </div>
    );
  }

  return approvals.length === 0 ? (
    <div className="bg-white rounded-xl border border-[#C8E0DE]/60 p-10 text-center shadow-sm">
      <CheckCircle className="w-12 h-12 text-[#D4EEEC] mx-auto mb-3" />
      <p className="font-medium text-[#0D1F1E]">All clear!</p>
      <p className="text-sm text-[#527270] mt-1">No pending RFQ approvals at the moment.</p>
    </div>
  ) : (
    <div className="space-y-6">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="xl:col-span-2 space-y-3">
          <h3 className="font-semibold text-[#0D1F1E]">Pending Approvals ({approvals.length})</h3>
          {approvals.map(app => (
            <div key={app.id} className="bg-white rounded-xl border border-[#C8E0DE]/60 p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-[#004643]">{app.rfq.rfqNumber}</span>
                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-[#FFF0C8] text-[#9A6800]">Review Required</span>
                  </div>
                  <p className="font-semibold text-[#0D1F1E]">{app.rfq.title}</p>
                  <p className="text-sm text-[#527270] mt-0.5">
                    {app.rfq._count?.items || 0} items · Requested by {app.rfq.createdBy?.firstName || 'Unknown'} {app.rfq.createdBy?.lastName || ''}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-[#527270] mt-0.5">
                    Requested on {new Date(app.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                  </p>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <button 
                  onClick={() => handleAction(app.rfq.id, 'REJECTED')}
                  disabled={!!submitting}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium border-2 border-[#C0392B] text-[#C0392B] hover:bg-[#FDECEA] transition-colors disabled:opacity-50">
                  {submitting === app.rfq.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                  Reject
                </button>
                <button 
                  onClick={() => handleAction(app.rfq.id, 'APPROVED')}
                  disabled={!!submitting}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium text-white transition-all hover:opacity-90 disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, #00706A, #007870)' }}>
                  {submitting === app.rfq.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                  Approve
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-[#C8E0DE]/60 p-5 shadow-sm">
            <h4 className="font-semibold text-[#0D1F1E] text-sm mb-4">Approval Summary</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-[#527270]">Queue Depth</span>
                <span className="font-bold text-[#0D1F1E]">{approvals.length}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-[#527270]">Avg. Age</span>
                <span className="font-bold text-[#0D1F1E]">
                  {approvals.length > 0
                    ? `${(approvals.reduce((s, a) => s + (Date.now() - new Date(a.createdAt).getTime()), 0) / approvals.length / 86400000).toFixed(1)} days`
                    : '—'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ManagerMonitor() {
  const [stats, setStats] = useState<{ label: string; value: number | string; trend: string; color: string; bg: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [dash, analytics] = await Promise.all([
          api.get<{ activeRFQs: number; pendingApprovals: number; totalVendors: number; recentInvoices: any[] }>('/dashboard'),
          api.get<{ procurementStats: { totalPOs: number; totalInvoices: number } }>('/analytics?period=30'),
        ]);
        const overdue = (dash.recentInvoices || []).filter((inv: any) => inv.status !== 'PAID' && new Date(inv.dueDate) < new Date()).length;
        setStats([
          { label: 'Open RFQs', value: dash.activeRFQs, trend: 'published', color: '#004643', bg: '#D4EEEC' },
          { label: 'Pending Approvals', value: dash.pendingApprovals, trend: 'awaiting action', color: '#9A6800', bg: '#FFF0C8' },
          { label: 'Active Vendors', value: dash.totalVendors, trend: 'onboarded', color: '#00706A', bg: '#D4EEEC' },
          { label: 'POs (30 days)', value: analytics.procurementStats.totalPOs, trend: `${analytics.procurementStats.totalInvoices} invoices`, color: '#C0392B', bg: '#FDECEA' },
        ]);
        if (overdue > 0) {
          setStats(prev => prev.map(s => s.label === 'POs (30 days)' ? { ...s, trend: `${overdue} overdue invoices` } : s));
        }
      } catch {
        setStats([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-[#527270]">
        <Loader2 className="w-8 h-8 animate-spin mb-2" />
        <p>Loading monitor...</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <p className="text-[#527270] text-sm">Overview of all active procurement workflows</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {stats.map(s => (
          <div key={s.label} className="bg-white rounded-xl p-5 border border-[#C8E0DE]/60"
            style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-[#527270]">{s.label}</p>
                <p className="font-bold text-[#0D1F1E] mt-1" style={{ fontSize: 28 }}>{s.value}</p>
                <p className="text-xs mt-1" style={{ color: s.color }}>{s.trend}</p>
              </div>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: s.bg }}>
                <div className="w-3 h-3 rounded-full" style={{ background: s.color }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
