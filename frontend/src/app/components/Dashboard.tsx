import { useState, useEffect } from 'react';
import { TrendingUp, Clock, FileText, ShoppingCart, Receipt, Plus, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { cn } from './ui/utils';
import type { Page } from './Sidebar';
import { api } from '../lib/api';
import { toast } from 'sonner';

interface DashboardProps {
  onNavigate: (page: Page) => void;
}

interface BackendDashboardData {
  pendingApprovals: number;
  activeRFQs: number;
  recentPurchaseOrders: any[];
  recentInvoices: any[];
  totalVendors: number;
  totalSpend: number;
  monthlySpend: number;
}

const statusConfig = {
  CONFIRMED: { label: 'Confirmed', color: '#00706A', bg: '#D4EEEC' },
  DELIVERED: { label: 'Delivered', color: '#004643', bg: '#D4EEEC' },
  CANCELLED: { label: 'Cancelled', color: '#C0392B', bg: '#FDECEA' },
  DRAFT: { label: 'Draft', color: '#527270', bg: '#D8EDEB' },
  SENT: { label: 'Sent', color: '#9A6800', bg: '#FFF0C8' },
  PAID: { label: 'Paid', color: '#00706A', bg: '#D4EEEC' },
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

const formatCurrency = (val: number) => {
  if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
  if (val >= 1000) return `₹${(val / 1000).toFixed(1)}K`;
  return `₹${val.toFixed(0)}`;
};

export function Dashboard({ onNavigate }: DashboardProps) {
  const [data, setData] = useState<BackendDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const result = await api.get<BackendDashboardData>('/dashboard');
        setData(result);
      } catch (err: any) {
        setError(err.message || 'Failed to load dashboard');
        toast.error('Error loading dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 text-[#527270]">
        <Loader2 className="w-10 h-10 animate-spin mb-4" />
        <p className="font-medium">Loading your dashboard...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center py-40 text-red-500">
        <AlertCircle className="w-10 h-10 mb-4" />
        <p className="font-medium">{error || 'Something went wrong'}</p>
        <button onClick={() => window.location.reload()} className="mt-4 text-[#004643] underline">Try refreshing</button>
      </div>
    );
  }

  const kpis = [
    {
      title: 'Pending Approvals',
      value: data.pendingApprovals.toString(),
      icon: Clock,
      accent: '#9A6800',
      accentBg: '#FFF3CC',
      desc: 'Requires action',
    },
    {
      title: 'Active RFQs',
      value: data.activeRFQs.toString(),
      icon: FileText,
      accent: '#004643',
      accentBg: '#C8E8E6',
      desc: 'Currently published',
    },
    {
      title: 'Total Vendors',
      value: data.totalVendors.toString(),
      icon: ShoppingCart,
      accent: '#00706A',
      accentBg: '#C8F0EC',
      desc: 'Onboarded',
    },
    {
      title: 'Total Spend',
      value: formatCurrency(data.totalSpend),
      icon: Receipt,
      accent: '#1A5276',
      accentBg: '#D4E8F5',
      desc: 'All time',
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
      </div>

      {/* Tables row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* Recent POs */}
        <div className="bg-white rounded-xl border border-[#C8E0DE]/60 overflow-hidden"
          style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#D8EDEB]">
            <div>
              <h3 className="font-semibold text-[#0D1F1E] text-sm">Recent Purchase Orders</h3>
            </div>
            <button onClick={() => onNavigate('purchase-orders')} className="text-xs text-[#004643] hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#EBF7F6]">
                  {['PO Number', 'Vendor', 'Amount', 'Status'].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-[#527270] uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.recentPurchaseOrders.length === 0 ? (
                  <tr><td colSpan={4} className="px-5 py-10 text-center text-[#527270]">No recent orders</td></tr>
                ) : (
                  data.recentPurchaseOrders.map((po, i) => (
                    <tr key={po.id} className={cn('border-t border-[#D8EDEB] hover:bg-[#EBF7F6] transition-colors cursor-pointer', i % 2 === 1 && 'bg-[#EEF7F6]')}>
                      <td className="px-5 py-3.5 font-medium text-[#004643]">{po.poNumber}</td>
                      <td className="px-5 py-3.5 text-[#0D1F1E]">{po.vendor.name}</td>
                      <td className="px-5 py-3.5 font-medium text-[#0D1F1E]">₹{po.totalAmount.toLocaleString('en-IN')}</td>
                      <td className="px-5 py-3.5"><StatusBadge status={po.status} /></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Invoices */}
        <div className="bg-white rounded-xl border border-[#C8E0DE]/60 overflow-hidden"
          style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#D8EDEB]">
            <h3 className="font-semibold text-[#0D1F1E] text-sm">Recent Invoices</h3>
            <button onClick={() => onNavigate('invoices')} className="text-xs text-[#004643] hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#EBF7F6]">
                  {['Invoice', 'Vendor', 'Amount', 'Status'].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-[#527270] uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.recentInvoices.length === 0 ? (
                  <tr><td colSpan={4} className="px-5 py-10 text-center text-[#527270]">No recent invoices</td></tr>
                ) : (
                  data.recentInvoices.map((inv, i) => (
                    <tr key={inv.id} className={cn('border-t border-[#D8EDEB] hover:bg-[#EBF7F6] transition-colors cursor-pointer', i % 2 === 1 && 'bg-[#EEF7F6]')}>
                      <td className="px-5 py-3.5 font-medium text-[#004643]">{inv.invoiceNumber}</td>
                      <td className="px-5 py-3.5 text-[#0D1F1E]">{inv.purchaseOrder.vendor.name}</td>
                      <td className="px-5 py-3.5 font-medium text-[#0D1F1E]">₹{inv.grandTotal.toLocaleString('en-IN')}</td>
                      <td className="px-5 py-3.5"><StatusBadge status={inv.status} /></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
