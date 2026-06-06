import { useState } from 'react';
import { Search, Plus, Eye, Edit2, Trash2, ChevronDown, FileText } from 'lucide-react';
import { cn } from './ui/utils';
import type { Page } from './Sidebar';

const rfqs = [
  { id: 'RFQ-2024-089', title: 'Office Supplies Q3 2024', category: 'Office Supplies', deadline: '20 Jun 2024', vendors: 5, quotations: 3, status: 'open' },
  { id: 'RFQ-2024-088', title: 'Server Infrastructure Upgrade', category: 'IT Equipment', deadline: '18 Jun 2024', vendors: 8, quotations: 6, status: 'under-review' },
  { id: 'RFQ-2024-087', title: 'Raw Steel Procurement — Q3', category: 'Metals & Alloys', deadline: '15 Jun 2024', vendors: 4, quotations: 4, status: 'closed' },
  { id: 'RFQ-2024-086', title: 'Fleet Vehicle Maintenance', category: 'Maintenance', deadline: '25 Jun 2024', vendors: 6, quotations: 2, status: 'open' },
  { id: 'RFQ-2024-085', title: 'Industrial Safety Equipment', category: 'Safety', deadline: '30 Jun 2024', vendors: 3, quotations: 1, status: 'draft' },
  { id: 'RFQ-2024-084', title: 'Packaging Materials Annual', category: 'Packaging', deadline: '08 Jun 2024', vendors: 7, quotations: 7, status: 'awarded' },
  { id: 'RFQ-2024-083', title: 'Cleaning & Janitorial Supplies', category: 'Facilities', deadline: '05 Jun 2024', vendors: 4, quotations: 3, status: 'closed' },
  { id: 'RFQ-2024-082', title: 'Cloud Software Licenses', category: 'IT Software', deadline: '12 Jun 2024', vendors: 5, quotations: 4, status: 'under-review' },
];

const statusConfig = {
  draft: { label: 'Draft', color: '#527270', bg: '#D8EDEB' },
  open: { label: 'Open', color: '#004643', bg: '#D4EEEC' },
  'under-review': { label: 'Under Review', color: '#9A6800', bg: '#FFF0C8' },
  closed: { label: 'Closed', color: '#527270', bg: '#D8EDEB' },
  awarded: { label: 'Awarded', color: '#00706A', bg: '#D4EEEC' },
};

const statusFilters = ['All', 'Draft', 'Open', 'Under Review', 'Closed', 'Awarded'];

interface RFQListProps {
  onNavigate: (page: Page) => void;
}

export function RFQList({ onNavigate }: RFQListProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const filtered = rfqs.filter(r => {
    const matchSearch = r.title.toLowerCase().includes(search.toLowerCase()) || r.id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || r.status.replace('-', ' ') === statusFilter.toLowerCase() || r.status === statusFilter.toLowerCase();
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-[#527270] text-sm">Manage and track all request for quotations</p>
        <button onClick={() => onNavigate('rfq-create')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-white transition-all hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, #004643, #00706A)', boxShadow: '0 4px 12px rgba(0,70,67,0.3)' }}>
          <Plus className="w-4 h-4" /> Create RFQ
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 border border-[#C8E0DE]/60 flex flex-wrap gap-3 items-center"
        style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#527270]" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by RFQ ID or title..."
            className="w-full pl-9 pr-4 py-2 border border-[#C8E0DE] rounded-lg text-sm focus:outline-none focus:border-[#004643] focus:ring-2 focus:ring-[#004643]/20 transition-all" />
        </div>

        <div className="flex rounded-lg overflow-hidden border border-[#C8E0DE]">
          {statusFilters.map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={cn(
                'px-3 py-2 text-xs transition-colors whitespace-nowrap',
                statusFilter === s ? 'bg-[#004643] text-white' : 'bg-white text-[#527270] hover:bg-[#EBF7F6]'
              )}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-[#C8E0DE]/60 overflow-hidden"
        style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[800px]">
            <thead>
              <tr className="bg-[#EBF7F6] border-b border-[#C8E0DE]/60">
                {['RFQ ID', 'Title', 'Category', 'Deadline', 'Vendors', 'Quotations', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-[#527270] uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-16">
                    <FileText className="w-12 h-12 text-[#C8E0DE] mx-auto mb-3" />
                    <p className="font-medium text-[#0D1F1E]">No RFQs found</p>
                    <p className="text-sm text-[#527270] mt-1">Create your first RFQ to get started</p>
                    <button onClick={() => onNavigate('rfq-create')}
                      className="mt-4 px-4 py-2 rounded-lg text-sm font-medium text-white inline-flex items-center gap-2"
                      style={{ background: '#004643' }}>
                      <Plus className="w-4 h-4" /> Create RFQ
                    </button>
                  </td>
                </tr>
              ) : filtered.map((rfq, i) => {
                const sc = statusConfig[rfq.status as keyof typeof statusConfig];
                return (
                  <tr key={rfq.id} className={cn('border-t border-[#D8EDEB] hover:bg-[#EEF7F6] transition-colors', i % 2 === 1 && 'bg-[#EEF7F6]')}>
                    <td className="px-5 py-4 font-medium text-[#004643]">{rfq.id}</td>
                    <td className="px-5 py-4">
                      <p className="font-medium text-[#0D1F1E]">{rfq.title}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className="px-2 py-0.5 bg-[#D8EDEB] text-[#527270] rounded text-xs">{rfq.category}</span>
                    </td>
                    <td className="px-5 py-4 text-[#527270]">{rfq.deadline}</td>
                    <td className="px-5 py-4">
                      <span className="font-medium text-[#0D1F1E]">{rfq.vendors}</span>
                      <span className="text-[#527270] text-xs ml-1">assigned</span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-[#D8EDEB] rounded-full h-1.5 w-16">
                          <div className="h-1.5 rounded-full bg-[#004643]" style={{ width: `${(rfq.quotations / rfq.vendors) * 100}%` }} />
                        </div>
                        <span className="text-xs text-[#527270]">{rfq.quotations}/{rfq.vendors}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium"
                        style={{ color: sc.color, background: sc.bg }}>
                        {sc.label}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1">
                        <button className="p-1.5 rounded-lg text-[#527270] hover:bg-[#D4EEEC] hover:text-[#004643] transition-colors" title="View">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 rounded-lg text-[#527270] hover:bg-[#D4EEEC] hover:text-[#004643] transition-colors" title="Edit">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 rounded-lg text-[#527270] hover:bg-[#FDECEA] hover:text-[#C0392B] transition-colors" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-[#D8EDEB] bg-[#EBF7F6]">
          <p className="text-xs text-[#527270]">Showing {filtered.length} of {rfqs.length} RFQs</p>
          <div className="flex items-center gap-1">
            {[1, 2].map(n => (
              <button key={n} className={cn(
                'w-7 h-7 rounded-lg text-xs font-medium transition-colors',
                n === 1 ? 'bg-[#004643] text-white' : 'text-[#527270] hover:bg-[#D4EEEC]'
              )}>{n}</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
