
import { Download, TrendingUp, TrendingDown, Calendar, FileText, ArrowRight } from 'lucide-react';
import {
  PieChart, Pie, Cell, Legend, ResponsiveContainer, Tooltip
} from 'recharts';
import { motion } from 'motion/react';
import { cn } from './ui/utils';


const categorySpend = [
  { name: 'Metals & Alloys', value: 28, color: '#004643' },
  { name: 'IT Equipment', value: 22, color: '#005F5B' },
  { name: 'Raw Materials', value: 18, color: '#00706A' },
  { name: 'Logistics', value: 14, color: '#9A6800' },
  { name: 'Office Supplies', value: 10, color: '#C0392B' },
  { name: 'Others', value: 8, color: '#A3C8C6' },
];

const topVendors = [
  { name: 'Zenith Supplies Co.', spend: 18.4, pos: 142 },
  { name: 'TechParts Ltd', spend: 15.2, pos: 118 },
  { name: 'Global Metals Inc.', spend: 12.8, pos: 96 },
  { name: 'EcoPlast Industries', spend: 9.6, pos: 74 },
  { name: 'FastShip Logistics', spend: 7.3, pos: 55 },
];

const exportableReports = [
  { name: 'Monthly Spend Summary', type: 'Financial', range: 'Jun 2024', generatedBy: 'James Donovan' },
  { name: 'Vendor Performance Report', type: 'Vendor', range: 'Q2 2024', generatedBy: 'Sarah Johnson' },
  { name: 'PO Status Overview', type: 'Operations', range: 'Jun 2024', generatedBy: 'Raj Verma' },
  { name: 'Invoice Aging Report', type: 'Financial', range: 'Jun 2024', generatedBy: 'System' },
];


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
        {stats.map((s, idx) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: idx * 0.1 }}
            className="bg-white rounded-xl p-5 border border-[#C8E0DE]/60 hover:shadow-lg transition-all hover:-translate-y-1"
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
          </motion.div>
        ))}
      </div>
      {/* Charts row */}
      <div className="grid grid-cols-1 gap-5">
        {/* Procurement Breakdown Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-xl border border-[#C8E0DE]/60 p-5"
          style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>

          {/* Card Header */}
          <div className="mb-5">
            <h3 className="font-semibold text-[#0D1F1E] text-sm mb-1">Procurement Breakdown</h3>
            <p className="text-xs text-[#527270]">Spend by Category &amp; Top Performing Vendors</p>
          </div>

          {/* Two-column body */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">

            {/* LEFT — Pie chart */}
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                  <Pie
                    data={categorySpend}
                    cx="50%"
                    cy="46%"
                    innerRadius={70}
                    outerRadius={105}
                    paddingAngle={5}
                    dataKey="value"
                    animationDuration={1400}
                  >
                    {categorySpend.map((entry, i) => (
                      <Cell key={i} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val) => [`${val}%`, 'Share']} />
                  <Legend content={<CustomLegend />} verticalAlign="bottom" align="center" />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* RIGHT — Top 5 Vendors always visible */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-[11px] font-bold text-[#527270] uppercase tracking-wider">Top Performing Vendors</h4>
                <span className="text-[10px] text-[#527270] bg-[#F5F9F8] px-2 py-0.5 rounded border border-[#D8EDEB]">By Spend Volume</span>
              </div>
              <div className="flex flex-col gap-5">
                {topVendors.map((v, i) => (
                  <div key={v.name} className="group">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-lg bg-[#F5F9F8] text-[#004643] flex items-center justify-center text-[10px] font-bold border border-[#D4EEEC] group-hover:bg-[#004643] group-hover:text-white transition-colors flex-shrink-0">
                          {i + 1}
                        </span>
                        <span className="text-xs font-semibold text-[#0D1F1E] group-hover:text-[#004643] transition-colors">{v.name}</span>
                      </div>
                      <span className="text-xs font-bold text-[#0D1F1E] ml-2">₹{v.spend}L</span>
                    </div>
                    <div className="h-1.5 bg-[#D8EDEB] rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(v.spend / topVendors[0].spend) * 100}%` }}
                        transition={{ duration: 1.2, delay: 0.2 + i * 0.1 }}
                        className="h-full rounded-full bg-gradient-to-r from-[#004643] to-[#00706A]"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </motion.div>
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
