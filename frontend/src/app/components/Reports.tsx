import { useState, useEffect } from 'react';
import { Download, TrendingUp, Calendar, FileText, Loader2, AlertCircle } from 'lucide-react';
import { PieChart, Pie, Cell, Legend, ResponsiveContainer, Tooltip } from 'recharts';
import { motion } from 'motion/react';
import { cn } from './ui/utils';
import { api } from '../lib/api';

const CHART_COLORS = ['#004643', '#005F5B', '#00706A', '#9A6800', '#C0392B', '#A3C8C6'];

interface AnalyticsData {
  vendorPerformance: Array<{ vendorName: string; totalSpend: number; totalOrders: number }>;
  categoryBreakdown: Array<{ category: string; totalSpend: number; vendorCount: number }>;
  procurementStats: {
    totalRFQs: number;
    totalPOs: number;
    totalInvoices: number;
    totalSpend: number;
    avgApprovalTime: number;
  };
}

const CustomLegend = ({ payload }: any) => (
  <div className="flex flex-wrap gap-x-4 gap-y-2 justify-center mt-6">
    {payload?.map((entry: any) => (
      <div key={entry.value} className="flex items-center gap-2">
        <div className="w-2.5 h-2.5 rounded-full" style={{ background: entry.color }} />
        <span className="text-[11px] font-medium text-[#527270] whitespace-nowrap">{entry.value}</span>
      </div>
    ))}
  </div>
);

const formatCurrency = (val: number) => {
  if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
  if (val >= 1000) return `₹${(val / 1000).toFixed(1)}K`;
  return `₹${val.toFixed(0)}`;
};

export function Reports() {
  const [period, setPeriod] = useState('30');
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await api.get<AnalyticsData>(`/analytics?period=${period}`);
        setData(result);
      } catch (err: any) {
        setError(err.message || 'Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [period]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 text-[#527270]">
        <Loader2 className="w-10 h-10 animate-spin mb-4" />
        <p>Loading analytics...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center py-40 text-red-500">
        <AlertCircle className="w-10 h-10 mb-4" />
        <p>{error || 'Failed to load reports'}</p>
      </div>
    );
  }

  const totalCategorySpend = data.categoryBreakdown.reduce((s, c) => s + c.totalSpend, 0) || 1;
  const categorySpend = data.categoryBreakdown.map((c, i) => ({
    name: c.category.replace(/_/g, ' '),
    value: Math.round((c.totalSpend / totalCategorySpend) * 100) || 0,
    color: CHART_COLORS[i % CHART_COLORS.length],
  }));

  const topVendors = [...data.vendorPerformance]
    .sort((a, b) => b.totalSpend - a.totalSpend)
    .slice(0, 5)
    .map(v => ({ name: v.vendorName, spend: v.totalSpend / 100000, pos: v.totalOrders }));

  const avgDays = data.procurementStats.avgApprovalTime
    ? (data.procurementStats.avgApprovalTime / (1000 * 60 * 60 * 24)).toFixed(1)
    : '—';

  const stats = [
    { label: 'Total Spend (Period)', value: formatCurrency(data.procurementStats.totalSpend), change: `${period} days`, up: true },
    { label: 'POs Generated', value: String(data.procurementStats.totalPOs), change: 'in period', up: true },
    { label: 'RFQs Created', value: String(data.procurementStats.totalRFQs), change: 'in period', up: true },
    { label: 'Avg. Approval Time', value: avgDays === '—' ? '—' : `${avgDays} days`, change: 'resolved', up: true },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-[#527270] text-sm">Procurement analytics and performance overview</p>
        <div className="flex gap-3">
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#527270]" />
            <select value={period} onChange={e => setPeriod(e.target.value)}
              className="appearance-none pl-9 pr-8 py-2 border border-[#C8E0DE] rounded-lg text-sm bg-white text-[#0D1F1E] focus:outline-none focus:border-[#004643]">
              <option value="365">Last 12 months</option>
              <option value="180">Last 6 months</option>
              <option value="90">This quarter</option>
              <option value="30">This month</option>
            </select>
          </div>
          <button onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #004643, #00706A)' }}>
            <Download className="w-4 h-4" /> Export Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((s, idx) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: idx * 0.1 }}
            className="bg-white rounded-xl p-5 border border-[#C8E0DE]/60"
            style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
            <p className="text-xs text-[#527270] mb-2">{s.label}</p>
            <p className="font-bold text-[#0D1F1E]" style={{ fontSize: 22 }}>{s.value}</p>
            <span className="inline-flex items-center gap-0.5 text-xs mt-1.5 px-2 py-0.5 rounded-full font-medium text-[#00706A] bg-[#D4EEEC]">
              <TrendingUp className="w-3 h-3" /> {s.change}
            </span>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5">
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-xl border border-[#C8E0DE]/60 p-5"
          style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
          <div className="mb-5">
            <h3 className="font-semibold text-[#0D1F1E] text-sm mb-1">Procurement Breakdown</h3>
            <p className="text-xs text-[#527270]">Spend by category &amp; top performing vendors</p>
          </div>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
            <div className="h-[300px]">
              {categorySpend.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={categorySpend} cx="50%" cy="46%" innerRadius={70} outerRadius={105} paddingAngle={5} dataKey="value">
                      {categorySpend.map((entry, i) => <Cell key={i} fill={entry.color} stroke="none" />)}
                    </Pie>
                    <Tooltip formatter={(val) => [`${val}%`, 'Share']} />
                    <Legend content={<CustomLegend />} verticalAlign="bottom" align="center" />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-[#527270] text-sm">No category data yet</div>
              )}
            </div>
            <div className="flex flex-col gap-1">
              <h4 className="text-[11px] font-bold text-[#527270] uppercase tracking-wider mb-4">Top Performing Vendors</h4>
              {topVendors.length === 0 ? (
                <p className="text-sm text-[#527270]">No vendor spend data yet</p>
              ) : topVendors.map((v, i) => (
                <div key={v.name} className="group mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-lg bg-[#F5F9F8] text-[#004643] flex items-center justify-center text-[10px] font-bold border border-[#D4EEEC]">{i + 1}</span>
                      <span className="text-xs font-semibold text-[#0D1F1E]">{v.name}</span>
                    </div>
                    <span className="text-xs font-bold text-[#0D1F1E]">{formatCurrency(v.spend * 100000)}</span>
                  </div>
                  <div className="h-1.5 bg-[#D8EDEB] rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${topVendors[0]?.spend ? (v.spend / topVendors[0].spend) * 100 : 0}%` }}
                      className="h-full rounded-full bg-gradient-to-r from-[#004643] to-[#00706A]" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      <div className="bg-white rounded-xl border border-[#C8E0DE]/60 overflow-hidden"
        style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
        <div className="px-5 py-4 border-b border-[#D8EDEB]">
          <h3 className="font-semibold text-[#0D1F1E] text-sm">Summary Reports</h3>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#EBF7F6] border-b border-[#C8E0DE]/60">
              {['Report', 'Value', 'Period'].map(h => (
                <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-[#527270] uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              { name: 'Total Invoices', value: data.procurementStats.totalInvoices, period: `Last ${period} days` },
              { name: 'Total Purchase Orders', value: data.procurementStats.totalPOs, period: `Last ${period} days` },
              { name: 'Total RFQs', value: data.procurementStats.totalRFQs, period: `Last ${period} days` },
              { name: 'Active Vendors', value: data.vendorPerformance.filter(v => v.totalOrders > 0).length, period: 'All time' },
            ].map((r, i) => (
              <tr key={r.name} className={cn('border-t border-[#D8EDEB] hover:bg-[#EEF7F6]', i % 2 === 1 && 'bg-[#EEF7F6]')}>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#004643]" />
                    <span className="font-medium text-[#0D1F1E]">{r.name}</span>
                  </div>
                </td>
                <td className="px-5 py-3.5 font-semibold text-[#0D1F1E]">{r.value}</td>
                <td className="px-5 py-3.5 text-[#527270]">{r.period}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
