import { useState, useEffect } from 'react';
import { ChevronRight, Plus, Trash2, Calendar, ChevronDown, Loader2 } from 'lucide-react';
import { cn } from './ui/utils';
import type { Page } from './Sidebar';
import { api } from '../lib/api';
import { toast } from 'sonner';

interface LineItem {
  id: number;
  name: string;
  description: string;
  quantity: string;
  unit: string;
}

interface BackendVendor {
  id: string;
  name: string;
}

interface RFQCreateProps {
  onNavigate: (page: Page) => void;
}

const units = ['pcs', 'kg', 'mtr', 'box', 'set'];

export function RFQCreate({ onNavigate }: RFQCreateProps) {
  const [loadingVendors, setLoadingVendors] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [vendors, setVendors] = useState<BackendVendor[]>([]);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    deadline: '',
  });

  const [lineItems, setLineItems] = useState<LineItem[]>([
    { id: 1, name: '', description: '', quantity: '1', unit: 'pcs' },
  ]);
  const [selectedVendorIds, setSelectedVendorIds] = useState<string[]>([]);

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const data = await api.get<{ vendors: BackendVendor[] }>('/vendors?limit=100&status=ACTIVE');
        setVendors(data.vendors);
      } catch (err: any) {
        toast.error('Failed to load vendors');
      } finally {
        setLoadingVendors(false);
      }
    };
    fetchVendors();
  }, []);

  const addItem = () => {
    setLineItems(prev => [...prev, { id: Date.now(), name: '', description: '', quantity: '1', unit: 'pcs' }]);
  };

  const removeItem = (id: number) => {
    if (lineItems.length === 1) return;
    setLineItems(prev => prev.filter(i => i.id !== id));
  };

  const updateItem = (id: number, field: keyof LineItem, value: string) => {
    setLineItems(prev => prev.map(i => i.id === id ? { ...i, [field]: value } : i));
  };

  const toggleVendor = (id: string) => {
    setSelectedVendorIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedVendorIds.length === 0) {
      toast.error('Please select at least one vendor');
      return;
    }
    
    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        items: lineItems.map(({ id, ...rest }) => ({
          ...rest,
          quantity: parseFloat(rest.quantity) || 0
        })),
        vendorIds: selectedVendorIds,
      };

      await api.post('/rfqs', payload);
      toast.success('RFQ created successfully');
      onNavigate('rfq-list');
    } catch (err: any) {
      toast.error(err.message || 'Failed to create RFQ');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-5 max-w-5xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <button onClick={() => onNavigate('dashboard')} className="text-[#527270] hover:text-[#004643] transition-colors">Dashboard</button>
        <ChevronRight className="w-3.5 h-3.5 text-[#527270]" />
        <button onClick={() => onNavigate('rfq-list')} className="text-[#527270] hover:text-[#004643] transition-colors">RFQs</button>
        <ChevronRight className="w-3.5 h-3.5 text-[#527270]" />
        <span className="text-[#004643] font-medium">Create RFQ</span>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left column - RFQ Info */}
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white rounded-xl border border-[#C8E0DE]/60 p-6 space-y-5 shadow-sm">
            <h3 className="font-semibold text-[#0D1F1E]">RFQ Details</h3>

            <div>
              <label className="block text-sm font-medium text-[#0D1F1E] mb-1.5">RFQ Title <span className="text-[#C0392B]">*</span></label>
              <input type="text" required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Raw Steel Procurement — Q3 2024"
                className="w-full px-3 py-2.5 border border-[#C8E0DE] rounded-lg text-sm focus:outline-none focus:border-[#004643] focus:ring-2 focus:ring-[#004643]/20" />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#0D1F1E] mb-1.5">Description</label>
              <textarea rows={3} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}
                placeholder="Details about the procurement..."
                className="w-full px-3 py-2.5 border border-[#C8E0DE] rounded-lg text-sm focus:outline-none focus:border-[#004643] focus:ring-2 focus:ring-[#004643]/20 resize-none" />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#0D1F1E] mb-1.5">Submission Deadline <span className="text-[#C0392B]">*</span></label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#527270]" />
                <input type="date" required value={formData.deadline} onChange={e => setFormData({ ...formData, deadline: e.target.value })}
                  className="w-full pl-9 pr-4 py-2.5 border border-[#C8E0DE] rounded-lg text-sm focus:outline-none focus:border-[#004643] focus:ring-2 focus:ring-[#004643]/20" />
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div className="bg-white rounded-xl border border-[#C8E0DE]/60 p-6 space-y-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-[#0D1F1E]">Line Items</h3>
              <button type="button" onClick={addItem} className="text-[#004643] text-sm font-medium flex items-center gap-1 hover:underline">
                <Plus className="w-4 h-4" /> Add Item
              </button>
            </div>

            <div className="space-y-4">
              {lineItems.map((item, index) => (
                <div key={item.id} className="p-4 border border-[#C8E0DE] rounded-lg space-y-3 relative bg-[#F9FAFB]">
                  <button type="button" onClick={() => removeItem(item.id)} className="absolute top-2 right-2 p-1 text-[#C0392B] hover:bg-red-50 rounded">
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-[#527270] mb-1">Item Name</label>
                      <input type="text" required value={item.name} onChange={e => updateItem(item.id, 'name', e.target.value)}
                        className="w-full px-3 py-1.5 border border-[#C8E0DE] rounded text-sm focus:outline-none focus:border-[#004643]" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#527270] mb-1">Quantity & Unit</label>
                      <div className="flex gap-2">
                        <input type="number" required min="1" value={item.quantity} onChange={e => updateItem(item.id, 'quantity', e.target.value)}
                          className="w-full px-3 py-1.5 border border-[#C8E0DE] rounded text-sm focus:outline-none focus:border-[#004643]" />
                        <select value={item.unit} onChange={e => updateItem(item.id, 'unit', e.target.value)}
                          className="w-24 px-2 py-1.5 border border-[#C8E0DE] rounded text-sm bg-white focus:outline-none focus:border-[#004643]">
                          {units.map(u => <option key={u} value={u}>{u}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#527270] mb-1">Description</label>
                    <input type="text" value={item.description} onChange={e => updateItem(item.id, 'description', e.target.value)}
                      className="w-full px-3 py-1.5 border border-[#C8E0DE] rounded text-sm focus:outline-none focus:border-[#004643]" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column - Vendor Assignment */}
        <div className="space-y-5">
          <div className="bg-white rounded-xl border border-[#C8E0DE]/60 p-6 space-y-5 shadow-sm sticky top-5">
            <h3 className="font-semibold text-[#0D1F1E]">Vendor Assignment</h3>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-[#0D1F1E]">Select Vendors <span className="text-[#C0392B]">*</span></label>
              {loadingVendors ? (
                <div className="flex items-center gap-2 text-sm text-[#527270]">
                  <Loader2 className="w-4 h-4 animate-spin" /> Loading vendors...
                </div>
              ) : vendors.length === 0 ? (
                <p className="text-sm text-[#527270]">No active vendors found.</p>
              ) : (
                <div className="space-y-1 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                  {vendors.map(v => (
                    <label key={v.id} className={cn(
                      "flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer transition-all",
                      selectedVendorIds.includes(v.id) ? "bg-[#D4EEEC] border-[#004643]/30" : "border-transparent hover:bg-[#EBF7F6]"
                    )}>
                      <input type="checkbox" checked={selectedVendorIds.includes(v.id)} onChange={() => toggleVendor(v.id)}
                        className="w-4 h-4 rounded border-[#C8E0DE] text-[#004643] focus:ring-[#004643]" />
                      <span className="text-sm text-[#0D1F1E]">{v.name}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-5 border-t border-[#D8EDEB] space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-[#527270]">Selected Vendors:</span>
                <span className="font-semibold text-[#0D1F1E]">{selectedVendorIds.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#527270]">Line Items:</span>
                <span className="font-semibold text-[#0D1F1E]">{lineItems.length}</span>
              </div>
              
              <button type="submit" disabled={submitting}
                className="w-full py-3 mt-2 rounded-lg text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-70"
                style={{ background: 'linear-gradient(135deg, #004643, #00706A)' }}>
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Create & Publish RFQ
              </button>
              <button type="button" onClick={() => onNavigate('rfq-list')} disabled={submitting}
                className="w-full py-2.5 rounded-lg text-sm font-medium text-[#527270] border border-[#C8E0DE] hover:bg-[#EBF7F6]">
                Cancel
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
