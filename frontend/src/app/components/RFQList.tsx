import { useState, useEffect, useCallback } from 'react';
import { Search, Plus, Eye, Edit2, Trash2, FileText, Loader2, AlertCircle } from 'lucide-react';
import { cn } from './ui/utils';
import type { Page } from './Sidebar';
import { api } from '../lib/api';
import { toast } from 'sonner';

interface BackendRFQ {
  id: string;
  rfqNumber: string;
  title: string;
  description: string;
  deadline: string;
  status: 'DRAFT' | 'PUBLISHED' | 'CLOSED';
  createdAt: string;
  _count: {
    items: number;
    vendors: number;
    quotations: number;
  };
  approval?: {
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    approverId: string;
  };
}

const statusConfig = {
  DRAFT: { label: 'Pending Approval', color: '#9A6800', bg: '#FFF0C8' },
  PUBLISHED: { label: 'Open', color: '#004643', bg: '#D4EEEC' },
  CLOSED: { label: 'Closed', color: '#527270', bg: '#D8EDEB' },
};

const statusFilters = ['All', 'Draft', 'Published', 'Closed'];

interface RFQListProps {
  onNavigate: (page: Page) => void;
}

export function RFQList({ onNavigate }: RFQListProps) {
  const [rfqs, setRfqs] = useState<BackendRFQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const fetchRfqs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let endpoint = '/rfqs?limit=100';
      if (statusFilter !== 'All') endpoint += `&status=${statusFilter}`;
      
      const data = await api.get<{ rfqs: BackendRFQ[] }>(endpoint);
      setRfqs(data.rfqs);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch RFQs');
      toast.error('Error fetching RFQs');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchRfqs();
  }, [fetchRfqs]);

  const filtered = rfqs.filter(r => {
    const matchSearch = r.title.toLowerCase().includes(search.toLowerCase()) || r.rfqNumber.toLowerCase().includes(search.toLowerCase());
    return matchSearch;
  });

  const handlePublish = async (id: string) => {
    try {
      await api.patch(`/rfqs/${id}/publish`, {});
      toast.success('RFQ published');
      fetchRfqs();
    } catch (err: any) {
      toast.error(err.message || 'Failed to publish RFQ');
    }
  };

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
          {loading && rfqs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-[#527270]">
              <Loader2 className="w-8 h-8 animate-spin mb-2" />
              <p>Loading RFQs...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 text-red-500">
              <AlertCircle className="w-8 h-8 mb-2" />
              <p>{error}</p>
              <button onClick={() => fetchRfqs()} className="mt-4 text-sm font-medium text-[#004643] underline">Try again</button>
            </div>
          ) : (
            <table className="w-full text-sm min-w-[800px]">
              <thead>
                <tr className="bg-[#EBF7F6] border-b border-[#C8E0DE]/60">
                  {['RFQ ID', 'Title', 'Deadline', 'Vendors', 'Quotations', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-[#527270] uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-16">
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
                ) : (
                  filtered.map((rfq, i) => {
                    const sc = statusConfig[rfq.status] || statusConfig.DRAFT;
                    return (
                      <tr key={rfq.id} className={cn('border-t border-[#D8EDEB] hover:bg-[#EEF7F6] transition-colors', i % 2 === 1 && 'bg-[#EEF7F6]')}>
                        <td className="px-5 py-4 font-medium text-[#004643]">{rfq.rfqNumber}</td>
                        <td className="px-5 py-4">
                          <p className="font-medium text-[#0D1F1E]">{rfq.title}</p>
                        </td>
                        <td className="px-5 py-4 text-[#527270]">
                          {new Date(rfq.deadline).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="px-5 py-4">
                          <span className="font-medium text-[#0D1F1E]">{rfq._count.vendors}</span>
                          <span className="text-[#527270] text-xs ml-1">assigned</span>
                        </td>
                        <td className="px-5 py-4 text-[#527270]">
                          {rfq._count.quotations} submitted
                        </td>
                        <td className="px-5 py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium"
                            style={{ color: sc.color, background: sc.bg }}>
                            {sc.label}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1">
                            <button 
                              onClick={() => onNavigate(`rfq-view-${rfq.id}` as any)}
                              className="p-1.5 rounded-lg text-[#527270] hover:bg-[#D4EEEC] hover:text-[#004643] transition-colors" title="View">
                              <Eye className="w-4 h-4" />
                            </button>
                            {rfq._count.quotations > 1 && (
                              <button 
                                onClick={() => onNavigate(`rfq-compare-${rfq.id}` as any)}
                                className="p-1.5 rounded-lg text-[#9A6800] hover:bg-[#FFF0C8] transition-colors" title="Compare Quotations">
                                <TrendingUp className="w-4 h-4" />
                              </button>
                            )}
                            {rfq.status === 'DRAFT' && (
                              <button onClick={() => handlePublish(rfq.id)} className="p-1.5 rounded-lg text-[#004643] hover:bg-[#D4EEEC] transition-colors" title="Publish">
                                <Plus className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
