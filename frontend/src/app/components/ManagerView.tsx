import { useState } from 'react';
import { CheckCircle, XCircle, Clock, TrendingUp, AlertTriangle, Eye } from 'lucide-react';
import { cn } from './ui/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const pendingRequests = [
  { id: 'APR-2024-041', rfq: 'Server Infrastructure Upgrade', vendor: 'TechParts Ltd', amount: '₹12,85,000', requestedBy: 'James Donovan', date: '10 Jun 2024', urgency: 'high' },
  { id: 'APR-2024-039', rfq: 'Office Supplies Q3 2024', vendor: 'Prime Hardware', amount: '₹1,45,000', requestedBy: 'Meera Iyer', date: '08 Jun 2024', urgency: 'low' },
  { id: 'APR-2024-037', rfq: 'Industrial Safety Equipment', vendor: 'Zenith Supplies Co.', amount: '₹2,80,000', requestedBy: 'Anita Sharma', date: '06 Jun 2024', urgency: 'medium' },
];

const recentDecisions = [
  { id: 'APR-2024-040', rfq: 'Raw Steel Procurement Q3', amount: '₹8,20,000', action: 'approved', date: '09 Jun 2024' },
  { id: 'APR-2024-038', rfq: 'Fleet Vehicle Maintenance', amount: '₹3,12,000', action: 'rejected', date: '07 Jun 2024' },
];

const approvalTrend = [
  { month: 'Mar', approved: 12, rejected: 2 },
  { month: 'Apr', approved: 15, rejected: 3 },
  { month: 'May', approved: 18, rejected: 1 },
  { month: 'Jun', approved: 8, rejected: 1 },
];

const urgencyConfig = {
  high: { color: '#C0392B', bg: '#FDECEA', label: 'High Priority' },
  medium: { color: '#9A6800', bg: '#FFF0C8', label: 'Medium' },
  low: { color: '#00706A', bg: '#D4EEEC', label: 'Low' },
};

export function ManagerApprovals() {
  const [actionId, setActionId] = useState<string | null>(null);
  const [actionType, setActionType] = useState<'approved' | 'rejected' | null>(null);
  const [remark, setRemark] = useState('');

  const handleAction = (id: string, type: 'approved' | 'rejected') => {
    setActionId(id);
    setActionType(type);
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Pending Review', value: pendingRequests.length, color: '#9A6800', bg: '#FFF0C8', icon: Clock },
          { label: 'Approved This Month', value: 23, color: '#00706A', bg: '#D4EEEC', icon: CheckCircle },
          { label: 'Avg. Review Time', value: '2.4 days', color: '#004643', bg: '#D4EEEC', icon: TrendingUp },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl p-5 border border-[#C8E0DE]/60"
            style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: s.bg }}>
              <s.icon className="w-4 h-4" style={{ color: s.color }} />
            </div>
            <p className="font-bold text-[#0D1F1E] text-xl">{s.value}</p>
            <p className="text-sm text-[#527270] mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Pending approvals */}
        <div className="xl:col-span-2 space-y-3">
          <h3 className="font-semibold text-[#0D1F1E]">Pending Approvals</h3>
          {pendingRequests.map(req => {
            const done = actionId === req.id;
            const urg = urgencyConfig[req.urgency as keyof typeof urgencyConfig];
            return (
              <div key={req.id} className="bg-white rounded-xl border border-[#C8E0DE]/60 p-5"
                style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-[#527270]">{req.id}</span>
                      <span className="px-2 py-0.5 rounded text-xs font-medium" style={{ color: urg.color, background: urg.bg }}>{urg.label}</span>
                    </div>
                    <p className="font-semibold text-[#0D1F1E]">{req.rfq}</p>
                    <p className="text-sm text-[#527270] mt-0.5">{req.vendor} · Requested by {req.requestedBy}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-[#0D1F1E]">{req.amount}</p>
                    <p className="text-xs text-[#527270] mt-0.5">{req.date}</p>
                  </div>
                </div>

                {!done ? (
                  <div className="flex gap-2 mt-4">
                    <button onClick={() => handleAction(req.id, 'rejected')}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium border-2 border-[#C0392B] text-[#C0392B] hover:bg-[#FDECEA] transition-colors">
                      <XCircle className="w-4 h-4" /> Reject
                    </button>
                    <button onClick={() => handleAction(req.id, 'approved')}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium text-white transition-all hover:opacity-90"
                      style={{ background: 'linear-gradient(135deg, #00706A, #007870)' }}>
                      <CheckCircle className="w-4 h-4" /> Approve
                    </button>
                  </div>
                ) : (
                  <div className={cn(
                    'mt-4 flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium',
                    actionType === 'approved' ? 'bg-[#D4EEEC] text-[#00706A]' : 'bg-[#FDECEA] text-[#C0392B]'
                  )}>
                    {actionType === 'approved' ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                    {actionType === 'approved' ? 'Approved — PO will be generated' : 'Rejected — Requester notified'}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Recent decisions + chart */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-[#C8E0DE]/60 overflow-hidden"
            style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
            <div className="px-5 py-4 border-b border-[#D8EDEB]">
              <h4 className="font-semibold text-[#0D1F1E] text-sm">Recent Decisions</h4>
            </div>
            <div className="divide-y divide-[#D8EDEB]">
              {recentDecisions.map(d => (
                <div key={d.id} className="px-5 py-3.5 flex items-center gap-3">
                  {d.action === 'approved'
                    ? <CheckCircle className="w-4 h-4 text-[#00706A] flex-shrink-0" />
                    : <XCircle className="w-4 h-4 text-[#C0392B] flex-shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#0D1F1E] truncate">{d.rfq}</p>
                    <p className="text-xs text-[#527270]">{d.amount} · {d.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[#C8E0DE]/60 p-5"
            style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
            <h4 className="font-semibold text-[#0D1F1E] text-sm mb-4">Approval Trend</h4>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={approvalTrend} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#D8EDEB" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#527270' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#527270' }} axisLine={false} tickLine={false} />
                <Tooltip cursor={false} />
                <Bar dataKey="approved" name="Approved" fill="#00706A" radius={[3, 3, 0, 0]} maxBarSize={18} />
                <Bar dataKey="rejected" name="Rejected" fill="#C0392B" radius={[3, 3, 0, 0]} maxBarSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ManagerMonitor() {
  return (
    <div className="space-y-5">
      <p className="text-[#527270] text-sm">Overview of all active procurement workflows</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { label: 'Open RFQs', value: 27, trend: '+8 this week', color: '#004643', bg: '#D4EEEC' },
          { label: 'Pending POs', value: 14, trend: '3 high priority', color: '#9A6800', bg: '#FFF0C8' },
          { label: 'Active Vendors', value: 24, trend: '+3 this month', color: '#00706A', bg: '#D4EEEC' },
          { label: 'Overdue Invoices', value: 3, trend: 'Requires action', color: '#C0392B', bg: '#FDECEA' },
        ].map(s => (
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

      <div className="bg-white rounded-xl border border-[#C8E0DE]/60 p-5"
        style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-4 h-4 text-[#9A6800]" />
          <h3 className="font-semibold text-[#0D1F1E] text-sm">Items Requiring Attention</h3>
        </div>
        <div className="space-y-3">
          {[
            { text: 'PO-2024-141 approval has been pending for 3 days', type: 'warning' },
            { text: 'INV-2024-074 is overdue — follow up with Pacific Trading', type: 'error' },
            { text: 'RFQ-2024-089 has received 3 quotations and is ready for comparison', type: 'info' },
          ].map((item, i) => (
            <div key={i} className={cn(
              'flex items-start gap-3 px-4 py-3 rounded-lg',
              item.type === 'warning' ? 'bg-[#FFF0C8]' : item.type === 'error' ? 'bg-[#FDECEA]' : 'bg-[#D4EEEC]'
            )}>
              <div className={cn('w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0',
                item.type === 'warning' ? 'bg-[#9A6800]' : item.type === 'error' ? 'bg-[#C0392B]' : 'bg-[#004643]')} />
              <p className="text-sm text-[#0D1F1E]">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
