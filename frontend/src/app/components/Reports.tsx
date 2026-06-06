import { Download, TrendingUp, TrendingDown, Calendar, FileText } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line
} from 'recharts';
import { cn } from './ui/utils';

const monthlySpend = [
  { month: 'Jul', spend: 4.2 }, { month: 'Aug', spend: 3.8 }, { month: 'Sep', spend: 5.1 },
  { month: 'Oct', spend: 4.6 }, { month: 'Nov', spend: 4.9 }, { month: 'Dec', spend: 5.4 },
  { month: 'Jan', spend: 3.9 }, { month: 'Feb', spend: 4.7 }, { month: 'Mar', spend: 6.2 },
  { month: 'Apr', spend: 5.8 }, { month: 'May', spend: 7.1 }, { month: 'Jun', spend: 6.8 },
];

const categorySpend = [
  { name: 'Metals & Alloys', value: 28, color: '#004643' },
  { name: 'IT Equipment', value: 22, color: '#004643' },
  { name: 'Raw Materials', value: 18, color: '#00706A' },
  { name: 'Logistics', value: 14, color: '#9A6800' },
  { name: 'Office Supplies', value: 10, color: '#C0392B' },
  { name: 'Others', value: 8, color: '#C8E0DE' },
];

const topVendors = [
  { name: 'Zenith Supplies Co.', spend: 18.4, pos: 142 },
  { name: 'TechParts Ltd', spend: 15.2, pos: 118 },
  { name: 'Global Metals Inc.', spend: 12.8, pos: 96 },
  { name: 'EcoPlast Industries', spend: 9.6, pos: 74 },
  { name: 'FastShip Logistics', spend: 7.3, pos: 55 },
];

const procurementStatus = [
  { month: 'Mar', rfqs: 12, pos: 9, invoices: 7 },
  { month: 'Apr', rfqs: 15, pos: 12, invoices: 10 },
  { month: 'May', rfqs: 19, pos: 16, invoices: 14 },
  { month: 'Jun', rfqs: 22, pos: 18, invoices: 15 },
];

const exportableReports = [
  { name: 'Monthly Spend Summary', type: 'Financial', range: 'Jun 2024', generatedBy: 'James Donovan' },
  { name: 'Vendor Performance Report', type: 'Vendor', range: 'Q2 2024', generatedBy: 'Sarah Johnson' },
  { name: 'PO Status Overview', type: 'Operations', range: 'Jun 2024', generatedBy: 'Raj Verma' },
  { name: 'Invoice Aging Report', type: 'Financial', range: 'Jun 2024', generatedBy: 'System' },
];

const CustomTooltipBar = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white border border-[#C8E0DE] rounded-xl p-3 shadow-lg">
        <p className="font-medium text-[#0D1F1E] text-sm mb-1">{label}</p>
        {payload.map((p: any) => (
          <p key={p.name} className="text-sm" style={{ color: p.fill }}>
            {p.name}: <span className="font-semibold">{typeof p.value === 'number' && p.value < 20 ? `₹${p.value}L` : p.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const CustomLegend = ({ payload }: any) => (
  <div className="flex flex-wrap gap-3 justify-center mt-2">
    {payload?.map((entry: any) => (
      <div key={entry.value} className="flex items-center gap-1.5">
        <div className="w-2.5 h-2.5 rounded-full" style={{ background: entry.color }} />
        <span className="text-xs text-[#527270]">{entry.value}</span>
      </div>
    ))}
  </div>
);

export function Reports() {
  const stats = [
    { label: 'Total Spend This Month', value: '₹68.5L', change: '+12%', up: true },
    { label: 'POs Generated', value: '55', change: '+8', up: true },
    { label: 'Active Vendors', value: '24', change: '+3', up: true },
    { label: 'Avg. Approval Time', value: '2.4 days', change: '-18%', up: true },
  ];

  return (
    <div className="space-y-5">
      {/* Date range + export */}
      <div className="flex items-center justify-between">
        <p className="text-[#527270] text-sm">Procurement analytics and performance overview</p>
        <div className="flex gap-3">
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#527270]" />
            <select className="appearance-none pl-9 pr-8 py-2 border border-[#C8E0DE] rounded-lg text-sm bg-white text-[#0D1F1E] focus:outline-none focus:border-[#004643] focus:ring-2 focus:ring-[#004643]/20">
              <option>Last 12 months</option>
              <option>Last 6 months</option>
              <option>This quarter</option>
              <option>This month</option>
            </select>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #004643, #00706A)' }}>
            <Download className="w-4 h-4" /> Export Report
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className="bg-white rounded-xl p-5 border border-[#C8E0DE]/60"
            style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
            <p className="text-xs text-[#527270] mb-2">{s.label}</p>
            <p className="font-bold text-[#0D1F1E]" style={{ fontSize: 22 }}>{s.value}</p>
            <span className={cn(
              'inline-flex items-center gap-0.5 text-xs mt-1.5 px-2 py-0.5 rounded-full font-medium',
              s.up ? 'text-[#00706A] bg-[#D4EEEC]' : 'text-[#C0392B] bg-[#FDECEA]'
            )}>
              {s.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {s.change}
            </span>
          </div>
        ))}
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* Bar chart */}
        <div className="bg-white rounded-xl border border-[#C8E0DE]/60 p-5"
          style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
          <h3 className="font-semibold text-[#0D1F1E] text-sm mb-1">Monthly Procurement Spend</h3>
          <p className="text-xs text-[#527270] mb-4">Jul 2023 — Jun 2024 (in Lakhs ₹)</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlySpend} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#D8EDEB" />
              <XAxis dataKey="month" tick={{ fill: '#527270', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#527270', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltipBar />} />
              <Bar dataKey="spend" name="Spend (₹L)" fill="#004643" radius={[4, 4, 0, 0]} maxBarSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie chart */}
        <div className="bg-white rounded-xl border border-[#C8E0DE]/60 p-5"
          style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
          <h3 className="font-semibold text-[#0D1F1E] text-sm mb-1">Spend by Category</h3>
          <p className="text-xs text-[#527270] mb-4">Distribution of total procurement spend</p>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={categorySpend} cx="50%" cy="45%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                {categorySpend.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Legend content={<CustomLegend />} />
              <Tooltip formatter={(val) => [`${val}%`, 'Share']} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* Top vendors */}
        <div className="bg-white rounded-xl border border-[#C8E0DE]/60 p-5"
          style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
          <h3 className="font-semibold text-[#0D1F1E] text-sm mb-4">Top Vendors by Spend</h3>
          <div className="space-y-4">
            {topVendors.map((v, i) => (
              <div key={v.name}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#D4EEEC] text-[#004643] flex items-center justify-center text-xs font-bold">
                      {i + 1}
                    </span>
                    <span className="text-sm font-medium text-[#0D1F1E]">{v.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-[#0D1F1E]">₹{v.spend}L</span>
                    <span className="text-xs text-[#527270] ml-2">{v.pos} POs</span>
                  </div>
                </div>
                <div className="h-2 bg-[#D8EDEB] rounded-full">
                  <div className="h-2 rounded-full bg-gradient-to-r from-[#004643] to-[#00706A] transition-all"
                    style={{ width: `${(v.spend / topVendors[0].spend) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Procurement status stacked */}
        <div className="bg-white rounded-xl border border-[#C8E0DE]/60 p-5"
          style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
          <h3 className="font-semibold text-[#0D1F1E] text-sm mb-1">Procurement Status Overview</h3>
          <p className="text-xs text-[#527270] mb-4">RFQs, POs, Invoices per month</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={procurementStatus} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#D8EDEB" />
              <XAxis dataKey="month" tick={{ fill: '#527270', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#527270', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltipBar />} />
              <Bar dataKey="rfqs" name="RFQs" fill="#004643" radius={[4, 4, 0, 0]} maxBarSize={20} />
              <Bar dataKey="pos" name="POs" fill="#00706A" radius={[4, 4, 0, 0]} maxBarSize={20} />
              <Bar dataKey="invoices" name="Invoices" fill="#004643" radius={[4, 4, 0, 0]} maxBarSize={20} />
              <Legend content={<CustomLegend />} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Exportable reports */}
      <div className="bg-white rounded-xl border border-[#C8E0DE]/60 overflow-hidden"
        style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
        <div className="px-5 py-4 border-b border-[#D8EDEB]">
          <h3 className="font-semibold text-[#0D1F1E] text-sm">Exportable Reports</h3>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#EBF7F6] border-b border-[#C8E0DE]/60">
              {['Report Name', 'Type', 'Date Range', 'Generated By', 'Actions'].map(h => (
                <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-[#527270] uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {exportableReports.map((r, i) => (
              <tr key={r.name} className={cn('border-t border-[#D8EDEB] hover:bg-[#EEF7F6] transition-colors', i % 2 === 1 && 'bg-[#EEF7F6]')}>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#004643]" />
                    <span className="font-medium text-[#0D1F1E]">{r.name}</span>
                  </div>
                </td>
                <td className="px-5 py-3.5">
                  <span className="px-2 py-0.5 bg-[#D8EDEB] text-[#527270] rounded text-xs">{r.type}</span>
                </td>
                <td className="px-5 py-3.5 text-[#527270]">{r.range}</td>
                <td className="px-5 py-3.5 text-[#527270]">{r.generatedBy}</td>
                <td className="px-5 py-3.5">
                  <div className="flex gap-2">
                    <button className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border border-[#C8E0DE] text-[#527270] hover:bg-[#D4EEEC] hover:text-[#004643] hover:border-[#004643] transition-all">
                      <Download className="w-3 h-3" /> CSV
                    </button>
                    <button className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border border-[#C8E0DE] text-[#527270] hover:bg-[#D4EEEC] hover:text-[#004643] hover:border-[#004643] transition-all">
                      <Download className="w-3 h-3" /> PDF
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
