import { TrendingUp, TrendingDown, Clock, FileText, ShoppingCart, Receipt, Plus, ArrowRight, MoreHorizontal } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart
} from 'recharts';
import { cn } from './ui/utils';
import { Button } from './ui/button';
import type { Page } from './Sidebar';

interface DashboardProps {
  onNavigate: (page: Page) => void;
}

const monthlyData = [
  { month: 'Jul', spend: 420000, orders: 34 },
  { month: 'Aug', spend: 380000, orders: 28 },
  { month: 'Sep', spend: 510000, orders: 42 },
  { month: 'Oct', spend: 460000, orders: 37 },
  { month: 'Nov', spend: 490000, orders: 39 },
  { month: 'Dec', spend: 540000, orders: 45 },
  { month: 'Jan', spend: 390000, orders: 31 },
  { month: 'Feb', spend: 470000, orders: 38 },
  { month: 'Mar', spend: 620000, orders: 52 },
  { month: 'Apr', spend: 580000, orders: 48 },
  { month: 'May', spend: 710000, orders: 59 },
  { month: 'Jun', spend: 680000, orders: 55 },
];

const recentPOs = [
  { id: 'PO-2024-142', vendor: 'Zenith Supplies Co.', amount: '₹2,40,000', status: 'approved', date: '12 Jun 2024' },
  { id: 'PO-2024-141', vendor: 'TechParts Ltd', amount: '₹1,85,500', status: 'pending', date: '11 Jun 2024' },
  { id: 'PO-2024-140', vendor: 'Global Metals Inc.', amount: '₹5,20,000', status: 'approved', date: '10 Jun 2024' },
  { id: 'PO-2024-139', vendor: 'Pacific Trading', amount: '₹78,000', status: 'rejected', date: '09 Jun 2024' },
  { id: 'PO-2024-138', vendor: 'FastShip Logistics', amount: '₹3,12,000', status: 'approved', date: '08 Jun 2024' },
];

const recentInvoices = [
  { id: 'INV-2024-078', vendor: 'Zenith Supplies Co.', amount: '₹2,40,000', status: 'paid' },
  { id: 'INV-2024-077', vendor: 'TechParts Ltd', amount: '₹1,85,500', status: 'unpaid' },
  { id: 'INV-2024-076', vendor: 'Global Metals Inc.', amount: '₹5,20,000', status: 'overdue' },
  { id: 'INV-2024-075', vendor: 'Apex Components', amount: '₹92,000', status: 'paid' },
  { id: 'INV-2024-074', vendor: 'Pacific Trading', amount: '₹78,000', status: 'unpaid' },
];

const statusConfig = {
  approved: { label: 'Approved', color: '#00706A', bg: '#D4EEEC' },
  pending: { label: 'Pending', color: '#9A6800', bg: '#FFF0C8' },
  rejected: { label: 'Rejected', color: '#C0392B', bg: '#FDECEA' },
  paid: { label: 'Paid', color: '#00706A', bg: '#D4EEEC' },
  unpaid: { label: 'Unpaid', color: '#9A6800', bg: '#FFF0C8' },
  overdue: { label: 'Overdue', color: '#C0392B', bg: '#FDECEA' },
};

function StatusBadge({ status }: { status: keyof typeof statusConfig }) {
  const { label, color, bg } = statusConfig[status];
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium"
      style={{ color, background: bg }}>
      {label}
    </span>
  );
}

const formatCurrency = (val: number) =>
  val >= 100000 ? `₹${(val / 100000).toFixed(1)}L` : `₹${(val / 1000).toFixed(0)}K`;

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white border border-[#C8E0DE] rounded-xl p-3 shadow-lg">
        <p className="font-medium text-[#0D1F1E] text-sm mb-1">{label}</p>
        <p className="text-[#004643] text-sm">Spend: <span className="font-semibold">{formatCurrency(payload[0]?.value)}</span></p>
      </div>
    );
  }
  return null;
};

export function Dashboard({ onNavigate }: DashboardProps) {
  const kpis = [
    {
      title: 'Pending Approvals',
      value: '14',
      change: '+3',
      up: true,
      icon: Clock,
      accent: '#9A6800',
      accentBg: '#FFF3CC',
      desc: 'Requires action',
    },
    {
      title: 'Active RFQs',
      value: '27',
      change: '+8',
      up: true,
      icon: FileText,
      accent: '#004643',
      accentBg: '#C8E8E6',
      desc: 'This month',
    },
    {
      title: 'Purchase Orders',
      value: '55',
      change: '+12%',
      up: true,
      icon: ShoppingCart,
      accent: '#00706A',
      accentBg: '#C8F0EC',
      desc: 'This month',
    },
    {
      title: 'Invoices Generated',
      value: '₹68L',
      change: '-4%',
      up: false,
      icon: Receipt,
      accent: '#1A5276',
      accentBg: '#D4E8F5',
      desc: 'Total value',
    },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {kpis.map(kpi => (
          <div key={kpi.title}
            className="bg-white rounded-xl p-5 border border-[#C8E0DE]/60 hover:shadow-md transition-shadow"
            style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: kpi.accentBg }}>
                <kpi.icon className="w-5 h-5" style={{ color: kpi.accent }} />
              </div>
              <span className={cn(
                'flex items-center gap-0.5 text-xs font-medium px-2 py-0.5 rounded-full',
                kpi.up ? 'text-[#00706A] bg-[#D4EEEC]' : 'text-[#C0392B] bg-[#FDECEA]'
              )}>
                {kpi.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {kpi.change}
              </span>
            </div>
            <div>
              <p className="text-2xl font-bold text-[#0D1F1E]" style={{ fontSize: 28 }}>{kpi.value}</p>
              <p className="text-sm font-medium text-[#0D1F1E] mt-0.5">{kpi.title}</p>
              <p className="text-xs text-[#527270] mt-0.5">{kpi.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => onNavigate('rfq-create')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-white transition-all hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, #004643, #00706A)', boxShadow: '0 4px 12px rgba(0,70,67,0.3)' }}>
          <Plus className="w-4 h-4" /> Create RFQ
        </button>
        <button
          onClick={() => onNavigate('vendors')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium border border-[#004643] text-[#004643] bg-white hover:bg-[#D4EEEC] transition-colors">
          <Plus className="w-4 h-4" /> Add Vendor
        </button>
        <button
          onClick={() => onNavigate('reports')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium border border-[#C8E0DE] text-[#527270] bg-white hover:bg-[#EBF7F6] transition-colors">
          View Reports <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Tables row */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">
        {/* Recent POs */}
        <div className="xl:col-span-3 bg-white rounded-xl border border-[#C8E0DE]/60 overflow-hidden"
          style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#D8EDEB]">
            <div>
              <h3 className="font-semibold text-[#0D1F1E] text-sm">Recent Purchase Orders</h3>
              <p className="text-xs text-[#527270] mt-0.5">Last 5 orders across all vendors</p>
            </div>
            <button onClick={() => onNavigate('purchase-orders')} className="text-xs text-[#004643] hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#EBF7F6]">
                  {['PO Number', 'Vendor', 'Amount', 'Status', 'Date'].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-[#527270] uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentPOs.map((po, i) => (
                  <tr key={po.id} className={cn('border-t border-[#D8EDEB] hover:bg-[#EBF7F6] transition-colors cursor-pointer', i % 2 === 1 && 'bg-[#EEF7F6]')}>
                    <td className="px-5 py-3.5 font-medium text-[#004643]">{po.id}</td>
                    <td className="px-5 py-3.5 text-[#0D1F1E]">{po.vendor}</td>
                    <td className="px-5 py-3.5 font-medium text-[#0D1F1E]">{po.amount}</td>
                    <td className="px-5 py-3.5"><StatusBadge status={po.status as any} /></td>
                    <td className="px-5 py-3.5 text-[#527270]">{po.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Invoices */}
        <div className="xl:col-span-2 bg-white rounded-xl border border-[#C8E0DE]/60 overflow-hidden"
          style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#D8EDEB]">
            <div>
              <h3 className="font-semibold text-[#0D1F1E] text-sm">Recent Invoices</h3>
              <p className="text-xs text-[#527270] mt-0.5">Latest billing activity</p>
            </div>
            <button onClick={() => onNavigate('invoices')} className="text-xs text-[#004643] hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="divide-y divide-[#D8EDEB]">
            {recentInvoices.map((inv, i) => (
              <div key={inv.id} className={cn('flex items-center justify-between px-5 py-3.5 hover:bg-[#EBF7F6] cursor-pointer transition-colors', i % 2 === 1 && 'bg-[#EEF7F6]')}>
                <div>
                  <p className="font-medium text-[#004643] text-sm">{inv.id}</p>
                  <p className="text-xs text-[#527270] mt-0.5">{inv.vendor}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-[#0D1F1E] text-sm">{inv.amount}</p>
                  <div className="mt-0.5"><StatusBadge status={inv.status as any} /></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Trend chart */}
      <div className="bg-white rounded-xl border border-[#C8E0DE]/60 p-5"
        style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-semibold text-[#0D1F1E] text-sm">Monthly Procurement Spend</h3>
            <p className="text-xs text-[#527270] mt-0.5">12-month overview — Jul 2023 to Jun 2024</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-xs text-[#527270]">
              <span className="w-3 h-0.5 bg-[#004643] rounded-full inline-block" />
              Spend
            </span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={monthlyData} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
            <defs>
              <linearGradient id="spendGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#004643" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#004643" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#D8EDEB" />
            <XAxis dataKey="month" tick={{ fill: '#527270', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={formatCurrency} tick={{ fill: '#527270', fontSize: 11 }} axisLine={false} tickLine={false} width={52} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="spend" stroke="#004643" strokeWidth={2.5} fill="url(#spendGradient)" dot={false} activeDot={{ r: 5, fill: '#004643', strokeWidth: 0 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
