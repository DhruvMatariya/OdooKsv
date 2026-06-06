import { useState } from 'react';
import { CheckCircle, XCircle, Clock, ChevronRight, MessageSquare, User, AlertCircle } from 'lucide-react';
import { cn } from './ui/utils';

const approvalRequests = [
  { id: 'APR-2024-041', rfq: 'Server Infrastructure Upgrade', vendor: 'TechParts Ltd', amount: '₹12,85,000', requestedBy: 'Sarah Johnson', date: '10 Jun 2024', status: 'pending' },
  { id: 'APR-2024-040', rfq: 'Raw Steel Procurement Q3', vendor: 'Global Metals Inc.', amount: '₹8,20,000', requestedBy: 'Raj Verma', date: '09 Jun 2024', status: 'approved' },
  { id: 'APR-2024-039', rfq: 'Office Supplies Q3 2024', vendor: 'Prime Hardware', amount: '₹1,45,000', requestedBy: 'Meera Iyer', date: '08 Jun 2024', status: 'pending' },
  { id: 'APR-2024-038', rfq: 'Fleet Vehicle Maintenance', vendor: 'FastShip Logistics', amount: '₹3,12,000', requestedBy: 'Kiran Desai', date: '07 Jun 2024', status: 'rejected' },
  { id: 'APR-2024-037', rfq: 'Industrial Safety Equipment', vendor: 'Zenith Supplies Co.', amount: '₹2,80,000', requestedBy: 'Anita Sharma', date: '06 Jun 2024', status: 'approved' },
];

const statusConfig = {
  pending: { label: 'Pending', color: '#9A6800', bg: '#FFF0C8', icon: Clock },
  approved: { label: 'Approved', color: '#00706A', bg: '#D4EEEC', icon: CheckCircle },
  rejected: { label: 'Rejected', color: '#C0392B', bg: '#FDECEA', icon: XCircle },
};

const statusFilters = ['All', 'Pending', 'Approved', 'Rejected'];

const timelineSteps = [
  { step: 'Created', actor: 'Sarah Johnson', role: 'Procurement Officer', date: '10 Jun 2024, 09:15', done: true, remark: 'RFQ published and vendor quotations collected.' },
  { step: 'Submitted', actor: 'Sarah Johnson', role: 'Procurement Officer', date: '11 Jun 2024, 14:30', done: true, remark: 'Best quotation from TechParts Ltd submitted for approval.' },
  { step: 'Under Review', actor: 'James Donovan', role: 'Manager', date: '12 Jun 2024, 10:00', done: true, remark: 'Reviewing vendor credentials and pricing breakdown.' },
  { step: 'Pending Decision', actor: 'Awaiting', role: '', date: '', done: false, remark: '' },
];

const lineItems = [
  { name: 'Dell PowerEdge R750 Server', qty: 2, unit: 'pcs', price: 250000, total: 500000 },
  { name: 'Network Switches (48-port)', qty: 4, unit: 'pcs', price: 45000, total: 180000 },
  { name: 'UPS Battery Systems', qty: 3, unit: 'pcs', price: 93333, total: 280000 },
  { name: 'SSD Storage Arrays (8TB)', qty: 6, unit: 'pcs', price: 70000, total: 420000 },
  { name: 'Server Rack Enclosures', qty: 2, unit: 'pcs', price: 107500, total: 215000 },
  { name: 'Installation & Configuration', qty: 1, unit: 'service', price: 190000, total: 190000 },
];

export function ApprovalWorkflow() {
  const [filter, setFilter] = useState('All');
  const [selected, setSelected] = useState<typeof approvalRequests[0] | null>(approvalRequests[0]);
  const [remark, setRemark] = useState('');
  const [action, setAction] = useState<'approved' | 'rejected' | null>(null);

  const filtered = approvalRequests.filter(r =>
    filter === 'All' || r.status === filter.toLowerCase()
  );

  return (
    <div className="space-y-5">
      {/* Filter tabs */}
      <div className="flex rounded-lg overflow-hidden border border-[#C8E0DE] w-fit">
        {statusFilters.map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={cn(
              'px-4 py-2 text-sm transition-colors',
              filter === s ? 'bg-[#004643] text-white' : 'bg-white text-[#527270] hover:bg-[#EBF7F6]'
            )}>
            {s}
            {s !== 'All' && (
              <span className={cn('ml-1.5 text-xs px-1.5 py-0.5 rounded-full',
                filter === s ? 'bg-white/20 text-white' : 'bg-[#D8EDEB] text-[#527270]')}>
                {approvalRequests.filter(r => r.status === s.toLowerCase()).length}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">
        {/* Request list */}
        <div className="xl:col-span-2 space-y-3">
          {filtered.map(req => {
            const sc = statusConfig[req.status as keyof typeof statusConfig];
            const Icon = sc.icon;
            const isSelected = selected?.id === req.id;
            return (
              <div key={req.id}
                onClick={() => setSelected(req)}
                className={cn(
                  'bg-white rounded-xl border p-4 cursor-pointer transition-all',
                  isSelected ? 'border-[#004643] shadow-md' : 'border-[#C8E0DE]/60 hover:border-[#004643]/40'
                )}
                style={{ boxShadow: isSelected ? '0 4px 20px rgba(0,70,67,0.12)' : '0 2px 12px rgba(0,0,0,0.05)' }}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-[#0D1F1E] text-sm">{req.rfq}</p>
                    <p className="text-xs text-[#527270] mt-0.5">{req.id}</p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium flex-shrink-0"
                    style={{ color: sc.color, background: sc.bg }}>
                    <Icon className="w-3 h-3" />
                    {sc.label}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <p className="text-[#527270]">Vendor</p>
                    <p className="font-medium text-[#0D1F1E] mt-0.5">{req.vendor}</p>
                  </div>
                  <div>
                    <p className="text-[#527270]">Amount</p>
                    <p className="font-bold text-[#0D1F1E] mt-0.5">{req.amount}</p>
                  </div>
                  <div>
                    <p className="text-[#527270]">Requested by</p>
                    <p className="font-medium text-[#0D1F1E] mt-0.5">{req.requestedBy}</p>
                  </div>
                  <div>
                    <p className="text-[#527270]">Date</p>
                    <p className="font-medium text-[#0D1F1E] mt-0.5">{req.date}</p>
                  </div>
                </div>

                {req.status === 'pending' && (
                  <div className="mt-3 flex items-center gap-1.5 text-[#9A6800] text-xs">
                    <AlertCircle className="w-3.5 h-3.5" />
                    Awaiting your review
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Detail panel */}
        {selected && (
          <div className="xl:col-span-3 space-y-4">
            {/* Header */}
            <div className="bg-white rounded-xl border border-[#C8E0DE]/60 p-5"
              style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-bold text-[#0D1F1E]">{selected.rfq}</h3>
                  <p className="text-sm text-[#527270] mt-0.5">{selected.id} · {selected.vendor}</p>
                </div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium"
                  style={{ color: statusConfig[selected.status as keyof typeof statusConfig].color, background: statusConfig[selected.status as keyof typeof statusConfig].bg }}>
                  {selected.status}
                </span>
              </div>

              {/* Timeline */}
              <div className="flex items-center gap-0">
                {timelineSteps.map((step, i) => (
                  <div key={step.step} className="flex items-center flex-1">
                    <div className="flex flex-col items-center">
                      <div className={cn(
                        'w-7 h-7 rounded-full flex items-center justify-center border-2 text-xs font-bold',
                        step.done ? 'bg-[#004643] border-[#004643] text-white' : 'bg-white border-[#C8E0DE] text-[#527270]'
                      )}>
                        {step.done ? '✓' : i + 1}
                      </div>
                      <p className="text-xs text-[#527270] mt-1 text-center whitespace-nowrap" style={{ fontSize: 10 }}>{step.step}</p>
                    </div>
                    {i < timelineSteps.length - 1 && (
                      <div className={cn('flex-1 h-0.5 mx-1', step.done ? 'bg-[#004643]' : 'bg-[#C8E0DE]')} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Line items */}
            <div className="bg-white rounded-xl border border-[#C8E0DE]/60 overflow-hidden"
              style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
              <div className="px-5 py-3.5 border-b border-[#D8EDEB]">
                <h4 className="font-semibold text-[#0D1F1E] text-sm">Line Items — {selected.vendor}</h4>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#EBF7F6]">
                    {['Item', 'Qty', 'Unit Price', 'Total'].map(h => (
                      <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-[#527270] uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {lineItems.map((item, i) => (
                    <tr key={item.name} className={cn('border-t border-[#D8EDEB]', i % 2 === 1 && 'bg-[#EEF7F6]')}>
                      <td className="px-5 py-3 text-[#0D1F1E] font-medium" style={{ fontSize: 13 }}>{item.name}</td>
                      <td className="px-5 py-3 text-[#527270]">{item.qty} {item.unit}</td>
                      <td className="px-5 py-3 text-[#0D1F1E]">₹{item.price.toLocaleString('en-IN')}</td>
                      <td className="px-5 py-3 font-semibold text-[#0D1F1E]">₹{item.total.toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-[#C8E0DE]/60 bg-[#D4EEEC]">
                    <td colSpan={3} className="px-5 py-3 font-bold text-[#0D1F1E] text-right">Grand Total</td>
                    <td className="px-5 py-3 font-bold text-[#004643] text-base">₹12,85,000</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Approval action card */}
            {selected.status === 'pending' && !action && (
              <div className="bg-white rounded-xl border border-[#C8E0DE]/60 p-5"
                style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
                <h4 className="font-semibold text-[#0D1F1E] mb-3">Review & Decision</h4>
                <div>
                  <label className="block text-sm font-medium text-[#0D1F1E] mb-1.5">Remarks</label>
                  <textarea rows={3} value={remark} onChange={e => setRemark(e.target.value)}
                    placeholder="Add your review comments or justification..."
                    className="w-full px-3 py-2.5 border border-[#C8E0DE] rounded-lg text-sm text-[#0D1F1E] placeholder:text-[#527270]/60 focus:outline-none focus:border-[#004643] focus:ring-2 focus:ring-[#004643]/20 transition-all resize-none" />
                </div>
                <div className="flex gap-3 mt-4">
                  <button onClick={() => setAction('rejected')}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium border-2 border-[#C0392B] text-[#C0392B] hover:bg-[#FDECEA] transition-colors">
                    <XCircle className="w-4 h-4" /> Reject
                  </button>
                  <button onClick={() => setAction('approved')}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium text-white transition-all hover:opacity-90"
                    style={{ background: 'linear-gradient(135deg, #00706A, #007870)' }}>
                    <CheckCircle className="w-4 h-4" /> Approve
                  </button>
                </div>
              </div>
            )}

            {action && (
              <div className={cn(
                'rounded-xl border p-5 flex items-center gap-4',
                action === 'approved' ? 'bg-[#D4EEEC] border-[#00706A]/30' : 'bg-[#FDECEA] border-[#C0392B]/30'
              )}>
                {action === 'approved'
                  ? <CheckCircle className="w-8 h-8 text-[#00706A] flex-shrink-0" />
                  : <XCircle className="w-8 h-8 text-[#C0392B] flex-shrink-0" />}
                <div>
                  <p className="font-semibold text-[#0D1F1E]">
                    {action === 'approved' ? 'Approval Granted' : 'Request Rejected'}
                  </p>
                  <p className="text-sm text-[#527270] mt-0.5">
                    {action === 'approved'
                      ? 'Purchase order will be generated and sent to the vendor.'
                      : 'The requester has been notified of the rejection.'}
                  </p>
                </div>
              </div>
            )}

            {/* Timeline history */}
            <div className="bg-white rounded-xl border border-[#C8E0DE]/60 p-5"
              style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
              <h4 className="font-semibold text-[#0D1F1E] mb-4">Approval History</h4>
              <div className="space-y-4">
                {timelineSteps.filter(t => t.done).map((step, i) => (
                  <div key={step.step} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-[#D4EEEC] flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4 text-[#004643]" />
                      </div>
                      {i < timelineSteps.filter(t => t.done).length - 1 && (
                        <div className="w-0.5 h-full bg-[#C8E0DE] mt-2 mb-0 flex-1 min-h-[24px]" />
                      )}
                    </div>
                    <div className="pb-4">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-[#0D1F1E] text-sm">{step.actor}</span>
                        <span className="text-xs text-[#527270] bg-[#D8EDEB] px-2 py-0.5 rounded">{step.role}</span>
                      </div>
                      <p className="text-xs text-[#527270] mt-0.5">{step.step} · {step.date}</p>
                      {step.remark && <p className="text-sm text-[#0D1F1E] mt-1.5 bg-[#EBF7F6] rounded-lg px-3 py-2">{step.remark}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
