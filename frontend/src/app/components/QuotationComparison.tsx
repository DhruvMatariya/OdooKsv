import { useState, useEffect, useCallback, useMemo } from 'react';
import { Search, Filter, TrendingUp, CheckCircle, XCircle, ChevronRight, Loader2, AlertCircle, FileText, User, IndianRupee, Eye, ArrowLeftRight, Edit3, Save, RefreshCw } from 'lucide-react';
import { cn } from './ui/utils';
import { api } from '../lib/api';
import { toast } from 'sonner';

interface RFQ {
  id: string;
  rfqNumber: string;
  title: string;
}

interface QuotationItem {
  id: string;
  rfqItem: {
    name: string;
    quantity: number;
    unit: string;
  };
  unitPrice: number;
  totalPrice: number;
}

interface BackendQuotation {
  id: string;
  quotationNumber: string;
  vendor: {
    id: string;
    name: string;
  };
  rfq: {
    id: string;
    rfqNumber: string;
    title: string;
  };
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  deliveryDays: number;
  validUntil: string;
  status: 'PENDING' | 'SUBMITTED' | 'ACCEPTED' | 'REJECTED';
  createdAt: string;
  notes?: string;
  items: QuotationItem[];
}

interface ComparisonState {
  items: Array<{
    id: string;
    name: string;
    originalQuantity: number;
    unit: string;
    q1Price: number;
    q2Price: number;
    customQuantity?: number;
    customQ1Price?: number;
    customQ2Price?: number;
  }>;
}

interface QuotationComparisonProps {
  rfqId?: string;
  onNavigate?: (page: any) => void;
}

export function QuotationComparison({ rfqId: initialRfqId, onNavigate }: QuotationComparisonProps) {
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [selectedRfqId, setSelectedRfqId] = useState<string | undefined>(initialRfqId);
  const [quotations, setQuotations] = useState<BackendQuotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedQuotation, setSelectedQuotation] = useState<BackendQuotation | null>(null);
  const [comparisonIds, setComparisonIds] = useState<string[]>([]);
  const [isComparing, setIsComparing] = useState(false);
  const [comparisonData, setComparisonData] = useState<ComparisonState | null>(null);

  const fetchRfqs = async () => {
    try {
      const data = await api.get<{ rfqs: RFQ[] }>('/rfqs');
      setRfqs(data.rfqs || []);
    } catch (err) {
      console.error('Failed to fetch RFQs', err);
    }
  };

  const fetchQuotations = useCallback(async () => {
    if (!selectedRfqId && !initialRfqId) {
      setQuotations([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const id = selectedRfqId || initialRfqId;
      const endpoint = `/rfqs/${id}/quotations`;
      const data = await api.get<BackendQuotation[] | { quotations: BackendQuotation[] }>(endpoint);
      const list = Array.isArray(data) ? data : (data as any).quotations || [];
      setQuotations(list);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch quotations');
      toast.error('Error fetching quotations');
    } finally {
      setLoading(false);
    }
  }, [selectedRfqId, initialRfqId]);

  useEffect(() => {
    fetchRfqs();
  }, []);

  useEffect(() => {
    fetchQuotations();
  }, [fetchQuotations]);

  const toggleComparison = (id: string) => {
    setComparisonIds(prev => {
      if (prev.includes(id)) return prev.filter(i => i !== id);
      if (prev.length >= 2) {
        toast.info('You can only compare up to 2 quotations');
        return [prev[1], id];
      }
      return [...prev, id];
    });
  };

  const startComparison = () => {
    if (comparisonIds.length !== 2) {
      toast.error('Please select exactly 2 quotations to compare');
      return;
    }

    const q1 = quotations.find(q => q.id === comparisonIds[0])!;
    const q2 = quotations.find(q => q.id === comparisonIds[1])!;

    // Create a unified list of items from both quotations
    const itemNames = new Set([
      ...q1.items.map(i => i.rfqItem.name),
      ...q2.items.map(i => i.rfqItem.name)
    ]);

    const items = Array.from(itemNames).map(name => {
      const item1 = q1.items.find(i => i.rfqItem.name === name);
      const item2 = q2.items.find(i => i.rfqItem.name === name);
      return {
        id: name,
        name,
        originalQuantity: item1?.rfqItem.quantity || item2?.rfqItem.quantity || 1,
        unit: item1?.rfqItem.unit || item2?.rfqItem.unit || 'pcs',
        q1Price: item1?.unitPrice || 0,
        q2Price: item2?.unitPrice || 0,
      };
    });

    setComparisonData({ items });
    setIsComparing(true);
  };

  const updateComparisonItem = (name: string, field: keyof ComparisonState['items'][0], value: number) => {
    setComparisonData(prev => {
      if (!prev) return null;
      return {
        ...prev,
        items: prev.items.map(item => {
          if (item.name === name) {
            return { ...item, [field]: value };
          }
          return item;
        })
      };
    });
  };

  const resetComparison = () => {
    if (comparisonIds.length === 2) {
      const q1 = quotations.find(q => q.id === comparisonIds[0])!;
      const q2 = quotations.find(q => q.id === comparisonIds[1])!;
      const itemNames = new Set([
        ...q1.items.map(i => i.rfqItem.name),
        ...q2.items.map(i => i.rfqItem.name)
      ]);
      const items = Array.from(itemNames).map(name => {
        const item1 = q1.items.find(i => i.rfqItem.name === name);
        const item2 = q2.items.find(i => i.rfqItem.name === name);
        return {
          id: name,
          name,
          originalQuantity: item1?.rfqItem.quantity || item2?.rfqItem.quantity || 1,
          unit: item1?.rfqItem.unit || item2?.rfqItem.unit || 'pcs',
          q1Price: item1?.unitPrice || 0,
          q2Price: item2?.unitPrice || 0,
        };
      });
      setComparisonData({ items });
    }
  };

  const totals = useMemo(() => {
    if (!comparisonData) return { q1: 0, q2: 0 };
    return comparisonData.items.reduce((acc, item) => {
      const qty = item.customQuantity ?? item.originalQuantity;
      const p1 = item.customQ1Price ?? item.q1Price;
      const p2 = item.customQ2Price ?? item.q2Price;
      return {
        q1: acc.q1 + (qty * p1),
        q2: acc.q2 + (qty * p2)
      };
    }, { q1: 0, q2: 0 });
  }, [comparisonData]);

  const handleAccept = async (id: string) => {
    if (!confirm('Are you sure you want to accept this quotation? This will create a Purchase Order.')) return;
    try {
      const deliveryDate = new Date();
      deliveryDate.setDate(deliveryDate.getDate() + 7);

      await api.post('/purchase-orders', {
        quotationId: id,
        deliveryDate: deliveryDate.toISOString(),
        taxRate: 18,
      });

      toast.success('Quotation accepted and Purchase Order created');
      setSelectedQuotation(null);
      fetchQuotations();
    } catch (err: any) {
      toast.error(err.message || 'Failed to accept quotation');
    }
  };

  const handleReject = async (id: string) => {
    if (!confirm('Are you sure you want to reject this quotation?')) return;
    try {
      await api.patch(`/quotations/${id}/status`, { status: 'REJECTED' });
      toast.success('Quotation rejected');
      setSelectedQuotation(null);
      fetchQuotations();
    } catch (err: any) {
      toast.error(err.message || 'Failed to reject quotation');
    }
  };

  const filtered = quotations.filter(q => 
    q.vendor.name.toLowerCase().includes(search.toLowerCase()) ||
    q.rfq.rfqNumber.toLowerCase().includes(search.toLowerCase()) ||
    q.quotationNumber.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#0D1F1E]">
            {isComparing ? 'Side-by-Side Comparison' : selectedRfqId ? `Quotations for ${quotations[0]?.rfq.rfqNumber || 'RFQ'}` : 'All Quotations'}
          </h2>
          <p className="text-[#527270] text-sm">
            {isComparing ? 'Simulate scenarios by editing quantities and prices' : 'Compare vendor pricing and delivery terms'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {!isComparing && (
            <select 
              value={selectedRfqId || ''} 
              onChange={e => setSelectedRfqId(e.target.value || undefined)}
              className="px-3 py-2 bg-white border border-[#C8E0DE] rounded-lg text-sm focus:outline-none focus:border-[#004643] transition-all min-w-[200px]"
            >
              <option value="">Select RFQ to View...</option>
              {rfqs.map(rfq => (
                <option key={rfq.id} value={rfq.id}>{rfq.rfqNumber}: {rfq.title}</option>
              ))}
            </select>
          )}
          {comparisonIds.length === 2 && !isComparing && (
            <button 
              onClick={startComparison}
              className="px-4 py-2 bg-[#004643] text-white rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-[#003330] transition-colors shadow-sm"
            >
              <ArrowLeftRight className="w-4 h-4" /> Compare Selected ({comparisonIds.length})
            </button>
          )}
          {isComparing && (
            <button 
              onClick={() => setIsComparing(false)}
              className="px-4 py-2 border border-[#C8E0DE] text-[#527270] rounded-lg text-sm font-semibold hover:bg-white transition-colors"
            >
              Back to List
            </button>
          )}
        </div>
      </div>

      {isComparing && comparisonData ? (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="bg-white rounded-2xl border border-[#C8E0DE]/60 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F9FAFB] border-b border-[#C8E0DE]/60">
                    <th className="px-6 py-4 font-bold text-[#0D1F1E] text-sm w-1/3">Item Details</th>
                    <th className="px-6 py-4 font-bold text-[#0D1F1E] text-sm text-center">Quantity</th>
                    <th className="px-6 py-4 font-bold text-[#004643] text-sm text-right bg-[#EBF7F6]/30">
                      {quotations.find(q => q.id === comparisonIds[0])?.vendor.name}
                    </th>
                    <th className="px-6 py-4 font-bold text-[#004643] text-sm text-right bg-[#EBF7F6]/30">
                      {quotations.find(q => q.id === comparisonIds[1])?.vendor.name}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#C8E0DE]/40">
                  {comparisonData.items.map((item) => (
                    <tr key={item.id} className="hover:bg-[#F9FAFB] transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-bold text-[#0D1F1E]">{item.name}</p>
                        <p className="text-xs text-[#527270]">Unit: {item.unit}</p>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="inline-flex items-center gap-2 bg-white border border-[#C8E0DE] rounded-lg px-2 py-1">
                          <input 
                            type="number" 
                            defaultValue={item.originalQuantity}
                            onChange={(e) => updateComparisonItem(item.name, 'customQuantity', parseFloat(e.target.value) || 0)}
                            className="w-16 text-center text-sm font-semibold focus:outline-none"
                          />
                          <span className="text-[10px] text-[#527270] uppercase font-bold">{item.unit}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right bg-[#EBF7F6]/10">
                        <div className="flex flex-col items-end gap-1">
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-[#527270]">₹</span>
                            <input 
                              type="number" 
                              defaultValue={item.q1Price}
                              onChange={(e) => updateComparisonItem(item.name, 'customQ1Price', parseFloat(e.target.value) || 0)}
                              className="w-24 text-right text-sm font-bold text-[#004643] border-b border-transparent focus:border-[#004643] focus:outline-none bg-transparent"
                            />
                          </div>
                          <p className="text-[10px] text-[#527270] italic">
                            Sub: ₹{((item.customQuantity ?? item.originalQuantity) * (item.customQ1Price ?? item.q1Price)).toLocaleString('en-IN')}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right bg-[#EBF7F6]/10">
                        <div className="flex flex-col items-end gap-1">
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-[#527270]">₹</span>
                            <input 
                              type="number" 
                              defaultValue={item.q2Price}
                              onChange={(e) => updateComparisonItem(item.name, 'customQ2Price', parseFloat(e.target.value) || 0)}
                              className="w-24 text-right text-sm font-bold text-[#004643] border-b border-transparent focus:border-[#004643] focus:outline-none bg-transparent"
                            />
                          </div>
                          <p className="text-[10px] text-[#527270] italic">
                            Sub: ₹{((item.customQuantity ?? item.originalQuantity) * (item.customQ2Price ?? item.q2Price)).toLocaleString('en-IN')}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-[#004643] text-white">
                  <tr>
                    <td colSpan={2} className="px-6 py-6 font-bold text-lg">Total Simulated Quote</td>
                    <td className="px-6 py-6 text-right">
                      <p className="text-2xl font-black">₹{totals.q1.toLocaleString('en-IN')}</p>
                      {totals.q1 < totals.q2 && (
                        <span className="inline-block px-2 py-0.5 bg-white/20 rounded text-[10px] font-bold mt-1">BEST PRICE</span>
                      )}
                    </td>
                    <td className="px-6 py-6 text-right">
                      <p className="text-2xl font-black">₹{totals.q2.toLocaleString('en-IN')}</p>
                      {totals.q2 < totals.q1 && (
                        <span className="inline-block px-2 py-0.5 bg-white/20 rounded text-[10px] font-bold mt-1">BEST PRICE</span>
                      )}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <div className="flex justify-between items-center p-6 bg-[#EBF7F6] rounded-2xl border border-[#004643]/10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-[#004643] shadow-sm">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <p className="font-bold text-[#0D1F1E]">Savings Analysis</p>
                <p className="text-sm text-[#527270]">
                  Difference of <span className="font-bold text-[#004643]">₹{Math.abs(totals.q1 - totals.q2).toLocaleString('en-IN')}</span> between selected vendors
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={resetComparison}
                className="px-4 py-2 border border-[#004643]/20 text-[#004643] rounded-lg text-sm font-semibold hover:bg-white transition-colors flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" /> Reset Changes
              </button>
              <button 
                onClick={() => handleAccept(totals.q1 <= totals.q2 ? comparisonIds[0] : comparisonIds[1])}
                className="px-6 py-2 bg-[#004643] text-white rounded-lg text-sm font-semibold hover:bg-[#003330] transition-colors shadow-lg"
              >
                Accept Best Offer
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl p-4 border border-[#C8E0DE]/60 flex flex-wrap gap-3 items-center"
            style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#527270]" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search by vendor, RFQ or QT ID..."
                className="w-full pl-9 pr-4 py-2 border border-[#C8E0DE] rounded-lg text-sm focus:outline-none focus:border-[#004643] focus:ring-2 focus:ring-[#004643]/20 transition-all" />
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-[#527270]">
              <Loader2 className="w-8 h-8 animate-spin mb-2" />
              <p>Loading quotations...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 text-red-500">
              <AlertCircle className="w-8 h-8 mb-2" />
              <p>{error}</p>
              <button onClick={() => fetchQuotations()} className="mt-4 text-sm font-medium text-[#004643] underline">Try again</button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white rounded-xl border border-[#C8E0DE]/60 p-16 text-center">
              <FileText className="w-12 h-12 text-[#C8E0DE] mx-auto mb-3" />
              <p className="font-medium text-[#0D1F1E]">No quotations found</p>
              <p className="text-sm text-[#527270]">Select an RFQ above to see its quotations</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6">
              {filtered.map(q => {
                const isSelectedForComparison = comparisonIds.includes(q.id);
                return (
                  <div key={q.id} className={cn(
                    "bg-white rounded-xl border overflow-hidden shadow-sm flex flex-col transition-all",
                    isSelectedForComparison ? "border-[#004643] ring-2 ring-[#004643]/10" : "border-[#C8E0DE]/60"
                  )}>
                    <div className="p-5 border-b border-[#D8EDEB] bg-[#EBF7F6]/50 relative">
                      <div className="absolute top-4 right-4">
                        <input 
                          type="checkbox" 
                          checked={isSelectedForComparison}
                          onChange={() => toggleComparison(q.id)}
                          className="w-5 h-5 accent-[#004643] cursor-pointer"
                        />
                      </div>
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="text-xs font-bold text-[#004643] uppercase tracking-wider">{q.quotationNumber}</p>
                          <h3 className="font-bold text-[#0D1F1E] mt-1">{q.vendor.name}</h3>
                        </div>
                        <span className={cn(
                          "px-2.5 py-1 rounded-md text-[10px] font-bold uppercase",
                          q.status === 'ACCEPTED' ? "bg-[#D4EEEC] text-[#00706A]" : 
                          q.status === 'REJECTED' ? "bg-red-100 text-red-700" :
                          "bg-[#FFF0C8] text-[#9A6800]"
                        )}>
                          {q.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-[#527270]">
                        <FileText className="w-3.5 h-3.5" />
                        <span>Against {q.rfq.rfqNumber}: {q.rfq.title}</span>
                      </div>
                    </div>

                    <div className="p-5 flex-1 space-y-4">
                      <div className="space-y-2">
                        <p className="text-[10px] font-bold text-[#527270] uppercase tracking-widest">Item Highlights</p>
                        {q.items.slice(0, 3).map(item => (
                          <div key={item.id} className="flex justify-between text-sm">
                            <span className="text-[#0D1F1E] truncate mr-2">{item.rfqItem.name}</span>
                            <span className="font-medium text-[#0D1F1E] shrink-0">₹{item.totalPrice.toLocaleString('en-IN')}</span>
                          </div>
                        ))}
                        {q.items.length > 3 && (
                          <p className="text-xs text-[#527270] italic">+{q.items.length - 3} more items...</p>
                        )}
                      </div>

                      <div className="pt-4 border-t border-dashed border-[#C8E0DE] flex justify-between items-center">
                        <div>
                          <p className="text-[10px] font-bold text-[#527270] uppercase tracking-widest">Total Quote</p>
                          <p className="text-2xl font-black text-[#004643]">₹{q.totalAmount.toLocaleString('en-IN')}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-bold text-[#527270] uppercase tracking-widest">Delivery</p>
                          <p className="text-xs font-medium text-[#0D1F1E]">{q.deliveryDays} Days</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-[#F9FAFB] border-t border-[#D8EDEB] flex gap-2">
                      <button 
                        onClick={() => setSelectedQuotation(q)}
                        className="flex-1 py-2 rounded-lg text-sm font-semibold border border-[#C8E0DE] text-[#527270] hover:bg-white transition-colors flex items-center justify-center gap-2">
                        <Eye className="w-4 h-4" /> Details
                      </button>
                      <button 
                        onClick={() => toggleComparison(q.id)}
                        className={cn(
                          "flex-1 py-2 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2",
                          isSelectedForComparison 
                            ? "bg-white border border-[#004643] text-[#004643]" 
                            : "bg-white border border-[#C8E0DE] text-[#527270] hover:bg-white"
                        )}>
                        <ArrowLeftRight className="w-4 h-4" /> {isSelectedForComparison ? 'Selected' : 'Compare'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Detail Modal */}
      {selectedQuotation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-[#D8EDEB] flex justify-between items-center bg-[#EBF7F6]/30">
              <div>
                <h3 className="text-xl font-bold text-[#0D1F1E]">{selectedQuotation.quotationNumber}</h3>
                <p className="text-sm text-[#527270]">{selectedQuotation.vendor.name}</p>
              </div>
              <button onClick={() => setSelectedQuotation(null)} className="p-2 hover:bg-[#D8EDEB] rounded-full transition-colors">
                <XCircle className="w-6 h-6 text-[#527270]" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                <div>
                  <p className="text-[10px] font-bold text-[#527270] uppercase tracking-widest mb-1">Total Amount</p>
                  <p className="text-lg font-bold text-[#004643]">₹{selectedQuotation.totalAmount.toLocaleString('en-IN')}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-[#527270] uppercase tracking-widest mb-1">Delivery Time</p>
                  <p className="text-lg font-bold text-[#0D1F1E]">{selectedQuotation.deliveryDays} Days</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-[#527270] uppercase tracking-widest mb-1">Valid Until</p>
                  <p className="text-lg font-bold text-[#0D1F1E]">{new Date(selectedQuotation.validUntil).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-[#527270] uppercase tracking-widest mb-1">Status</p>
                  <span className={cn(
                    "inline-block px-2.5 py-1 rounded-md text-[10px] font-bold uppercase",
                    selectedQuotation.status === 'ACCEPTED' ? "bg-[#D4EEEC] text-[#00706A]" : 
                    selectedQuotation.status === 'REJECTED' ? "bg-red-100 text-red-700" :
                    "bg-[#FFF0C8] text-[#9A6800]"
                  )}>
                    {selectedQuotation.status}
                  </span>
                </div>
              </div>

              <div>
                <p className="text-[10px] font-bold text-[#527270] uppercase tracking-widest mb-4">Detailed Itemization</p>
                <div className="border border-[#C8E0DE]/60 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-[#F9FAFB] border-b border-[#C8E0DE]/60">
                      <tr>
                        <th className="px-4 py-3 font-semibold text-[#0D1F1E]">Item Name</th>
                        <th className="px-4 py-3 font-semibold text-[#0D1F1E] text-center">Qty</th>
                        <th className="px-4 py-3 font-semibold text-[#0D1F1E] text-right">Unit Price</th>
                        <th className="px-4 py-3 font-semibold text-[#0D1F1E] text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#C8E0DE]/40">
                      {selectedQuotation.items.map(item => (
                        <tr key={item.id} className="hover:bg-[#EBF7F6]/20 transition-colors">
                          <td className="px-4 py-3 text-[#0D1F1E] font-medium">{item.rfqItem.name}</td>
                          <td className="px-4 py-3 text-[#527270] text-center">{item.rfqItem.quantity} {item.rfqItem.unit}</td>
                          <td className="px-4 py-3 text-[#527270] text-right">₹{item.unitPrice.toLocaleString('en-IN')}</td>
                          <td className="px-4 py-3 text-[#0D1F1E] font-semibold text-right">₹{item.totalPrice.toLocaleString('en-IN')}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-[#EBF7F6]/30 font-bold border-t border-[#C8E0DE]/60">
                      <tr>
                        <td colSpan={3} className="px-4 py-4 text-[#0D1F1E] text-right">Grand Total</td>
                        <td className="px-4 py-4 text-[#004643] text-right text-lg">₹{selectedQuotation.totalAmount.toLocaleString('en-IN')}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {selectedQuotation.notes && (
                <div>
                  <p className="text-[10px] font-bold text-[#527270] uppercase tracking-widest mb-2">Vendor Notes</p>
                  <div className="p-4 bg-[#F9FAFB] border border-[#C8E0DE]/60 rounded-xl text-sm text-[#527270] italic">
                    "{selectedQuotation.notes}"
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 bg-[#F9FAFB] border-t border-[#D8EDEB] flex justify-end gap-3">
              <button 
                onClick={() => setSelectedQuotation(null)}
                className="px-6 py-2.5 rounded-lg text-sm font-semibold border border-[#C8E0DE] text-[#527270] hover:bg-white transition-colors">
                Close
              </button>
              {(selectedQuotation.status === 'SUBMITTED' || selectedQuotation.status === 'PENDING') && (
                <>
                  <button 
                    onClick={() => handleReject(selectedQuotation.id)}
                    className="px-6 py-2.5 rounded-lg text-sm font-semibold border border-red-200 text-red-600 hover:bg-red-50 transition-colors">
                    Reject Quotation
                  </button>
                  <button 
                    onClick={() => handleAccept(selectedQuotation.id)}
                    className="px-6 py-2.5 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90 shadow-md shadow-[#004643]/20"
                    style={{ background: 'linear-gradient(135deg, #004643, #00706A)' }}>
                    Accept & Create PO
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
