import { useState } from 'react';
import { ChevronRight, Upload, Plus, Trash2, Calendar, ChevronDown } from 'lucide-react';
import { cn } from './ui/utils';
import type { Page } from './Sidebar';

interface LineItem {
  id: number;
  name: string;
  description: string;
  quantity: string;
  unit: string;
  price: string;
}

interface RFQCreateProps {
  onNavigate: (page: Page) => void;
}

const vendorOptions = [
  'Zenith Supplies Co.',
  'TechParts Ltd',
  'Global Metals Inc.',
  'Pacific Trading',
  'FastShip Logistics',
  'Apex Components',
  'Prime Hardware',
  'EcoPlast Industries',
];

export function RFQCreate({ onNavigate }: RFQCreateProps) {
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { id: 1, name: 'Steel Rods (Grade 60)', description: 'High tensile strength', quantity: '500', unit: 'kg', price: '85' },
    { id: 2, name: 'Safety Helmets', description: 'ISI certified, yellow', quantity: '50', unit: 'pcs', price: '320' },
  ]);
  const [selectedVendors, setSelectedVendors] = useState<string[]>(['Zenith Supplies Co.', 'TechParts Ltd']);
  const [dragging, setDragging] = useState(false);
  const [priority, setPriority] = useState('Medium');

  const addItem = () => {
    setLineItems(prev => [...prev, { id: Date.now(), name: '', description: '', quantity: '', unit: 'pcs', price: '' }]);
  };

  const removeItem = (id: number) => {
    setLineItems(prev => prev.filter(i => i.id !== id));
  };

  const updateItem = (id: number, field: keyof LineItem, value: string) => {
    setLineItems(prev => prev.map(i => i.id === id ? { ...i, [field]: value } : i));
  };

  const toggleVendor = (v: string) => {
    setSelectedVendors(prev => prev.includes(v) ? prev.filter(x => x !== v) : [...prev, v]);
  };

  const totalEstimate = lineItems.reduce((sum, item) => {
    const qty = parseFloat(item.quantity) || 0;
    const price = parseFloat(item.price) || 0;
    return sum + qty * price;
  }, 0);

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

      {/* Main form card */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left column */}
        <div className="bg-white rounded-xl border border-[#C8E0DE]/60 p-6 space-y-5"
          style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
          <h3 className="font-semibold text-[#0D1F1E]">RFQ Details</h3>

          <div>
            <label className="block text-sm font-medium text-[#0D1F1E] mb-1.5">RFQ Title <span className="text-[#C0392B]">*</span></label>
            <input type="text" defaultValue="Raw Steel Procurement — Q3 2024"
              className="w-full px-3 py-2.5 border border-[#C8E0DE] rounded-lg text-sm text-[#0D1F1E] focus:outline-none focus:border-[#004643] focus:ring-2 focus:ring-[#004643]/20 transition-all" />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#0D1F1E] mb-1.5">Description</label>
            <textarea rows={3} defaultValue="Procurement of high-grade steel rods and related materials for the Q3 manufacturing cycle. Vendors must comply with BIS standards."
              className="w-full px-3 py-2.5 border border-[#C8E0DE] rounded-lg text-sm text-[#0D1F1E] focus:outline-none focus:border-[#004643] focus:ring-2 focus:ring-[#004643]/20 transition-all resize-none" />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#0D1F1E] mb-1.5">Category <span className="text-[#C0392B]">*</span></label>
            <div className="relative">
              <select className="w-full appearance-none px-3 py-2.5 border border-[#C8E0DE] rounded-lg text-sm text-[#0D1F1E] bg-white focus:outline-none focus:border-[#004643] focus:ring-2 focus:ring-[#004643]/20 transition-all">
                <option>Metals &amp; Alloys</option>
                <option>Electronics</option>
                <option>Raw Materials</option>
                <option>Office Supplies</option>
                <option>IT Equipment</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#527270] pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#0D1F1E] mb-1.5">Submission Deadline <span className="text-[#C0392B]">*</span></label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#527270]" />
              <input type="date" defaultValue="2024-06-30"
                className="w-full pl-9 pr-4 py-2.5 border border-[#C8E0DE] rounded-lg text-sm text-[#0D1F1E] focus:outline-none focus:border-[#004643] focus:ring-2 focus:ring-[#004643]/20 transition-all" />
            </div>
          </div>

          {/* Upload zone */}
          <div>
            <label className="block text-sm font-medium text-[#0D1F1E] mb-1.5">Attachments</label>
            <div
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={e => { e.preventDefault(); setDragging(false); }}
              className={cn(
                'border-2 border-dashed rounded-xl p-6 text-center transition-colors cursor-pointer',
                dragging ? 'border-[#004643] bg-[#D4EEEC]' : 'border-[#C8E0DE] hover:border-[#004643] hover:bg-[#EBF7F6]'
              )}>
              <Upload className="w-6 h-6 text-[#527270] mx-auto mb-2" />
              <p className="text-sm text-[#527270]">Drag & drop files or <span className="text-[#004643] font-medium">browse</span></p>
              <p className="text-xs text-[#527270] mt-1">PDF, DOC, XLSX — Max 10MB each</p>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-5">
          <div className="bg-white rounded-xl border border-[#C8E0DE]/60 p-6 space-y-5"
            style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
            <h3 className="font-semibold text-[#0D1F1E]">Vendor Assignment</h3>

            <div>
              <label className="block text-sm font-medium text-[#0D1F1E] mb-2">Select Vendors</label>
              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {vendorOptions.map(v => (
                  <label key={v} className="flex items-center gap-3 p-2.5 rounded-lg border border-transparent hover:border-[#C8E0DE] hover:bg-[#EBF7F6] cursor-pointer transition-all">
                    <div onClick={() => toggleVendor(v)}
                      className={cn(
                        'w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors',
                        selectedVendors.includes(v) ? 'bg-[#004643] border-[#004643]' : 'border-[#C8E0DE]'
                      )}>
                      {selectedVendors.includes(v) && (
                        <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className="text-sm text-[#0D1F1E]">{v}</span>
                  </label>
                ))}
              </div>
              {selectedVendors.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {selectedVendors.map(v => (
                    <span key={v} className="flex items-center gap-1 px-2.5 py-1 bg-[#D4EEEC] text-[#004643] rounded-md text-xs font-medium">
                      {v}
                      <button onClick={() => toggleVendor(v)} className="hover:text-[#C0392B]">×</button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-[#0D1F1E] mb-1.5">Priority Level</label>
              <div className="flex gap-2">
                {['Low', 'Medium', 'High'].map(p => (
                  <button key={p} onClick={() => setPriority(p)}
                    className={cn(
                      'flex-1 py-2 rounded-lg text-sm font-medium border transition-all',
                      priority === p
                        ? p === 'High' ? 'bg-[#C0392B] border-[#C0392B] text-white'
                          : p === 'Medium' ? 'bg-[#9A6800] border-[#9A6800] text-white'
                            : 'bg-[#00706A] border-[#00706A] text-white'
                        : 'border-[#C8E0DE] text-[#527270] hover:bg-[#EBF7F6]'
                    )}>
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Estimate card */}
          <div className="bg-[#D4EEEC] rounded-xl border border-[#004643]/20 p-5"
            style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
            <h4 className="font-semibold text-[#0D1F1E] text-sm mb-3">Estimated Value</h4>
            <p className="text-2xl font-bold text-[#004643]">
              ₹{totalEstimate.toLocaleString('en-IN')}
            </p>
            <p className="text-xs text-[#527270] mt-1">Based on {lineItems.length} line items</p>
            <div className="mt-3 pt-3 border-t border-[#004643]/20 flex justify-between text-xs text-[#527270]">
              <span>Vendors invited: <strong className="text-[#0D1F1E]">{selectedVendors.length}</strong></span>
              <span>Priority: <strong className="text-[#0D1F1E]">{priority}</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Line items */}
      <div className="bg-white rounded-xl border border-[#C8E0DE]/60 overflow-hidden"
        style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#D8EDEB]">
          <h3 className="font-semibold text-[#0D1F1E]">Line Items</h3>
          <button onClick={addItem}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-[#004643] border border-[#004643]/30 hover:bg-[#D4EEEC] transition-colors">
            <Plus className="w-4 h-4" /> Add Item
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr className="bg-[#EBF7F6] border-b border-[#C8E0DE]/60">
                {['Item Name', 'Description', 'Quantity', 'Unit', 'Est. Price (₹)', 'Total (₹)', ''].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#527270] uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {lineItems.map((item, i) => {
                const total = (parseFloat(item.quantity) || 0) * (parseFloat(item.price) || 0);
                return (
                  <tr key={item.id} className={cn('border-t border-[#D8EDEB]', i % 2 === 1 && 'bg-[#EEF7F6]')}>
                    <td className="px-4 py-2">
                      <input value={item.name} onChange={e => updateItem(item.id, 'name', e.target.value)}
                        placeholder="Item name"
                        className="w-full px-2.5 py-1.5 border border-[#C8E0DE] rounded text-sm focus:outline-none focus:border-[#004643] transition-colors" />
                    </td>
                    <td className="px-4 py-2">
                      <input value={item.description} onChange={e => updateItem(item.id, 'description', e.target.value)}
                        placeholder="Brief description"
                        className="w-full px-2.5 py-1.5 border border-[#C8E0DE] rounded text-sm focus:outline-none focus:border-[#004643] transition-colors" />
                    </td>
                    <td className="px-4 py-2 w-24">
                      <input type="number" value={item.quantity} onChange={e => updateItem(item.id, 'quantity', e.target.value)}
                        placeholder="0"
                        className="w-full px-2.5 py-1.5 border border-[#C8E0DE] rounded text-sm focus:outline-none focus:border-[#004643] transition-colors" />
                    </td>
                    <td className="px-4 py-2 w-20">
                      <select value={item.unit} onChange={e => updateItem(item.id, 'unit', e.target.value)}
                        className="w-full px-2 py-1.5 border border-[#C8E0DE] rounded text-sm bg-white focus:outline-none focus:border-[#004643] transition-colors">
                        <option>pcs</option>
                        <option>kg</option>
                        <option>ltr</option>
                        <option>box</option>
                        <option>set</option>
                      </select>
                    </td>
                    <td className="px-4 py-2 w-32">
                      <input type="number" value={item.price} onChange={e => updateItem(item.id, 'price', e.target.value)}
                        placeholder="0.00"
                        className="w-full px-2.5 py-1.5 border border-[#C8E0DE] rounded text-sm focus:outline-none focus:border-[#004643] transition-colors" />
                    </td>
                    <td className="px-4 py-2 w-28 font-medium text-[#0D1F1E]">
                      ₹{total.toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-2 w-10">
                      {lineItems.length > 1 && (
                        <button onClick={() => removeItem(item.id)} className="p-1 rounded hover:bg-[#FDECEA] text-[#527270] hover:text-[#C0392B] transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-[#C8E0DE]/60 bg-[#EBF7F6]">
                <td colSpan={5} className="px-4 py-3 font-semibold text-[#0D1F1E] text-right">Total Estimate:</td>
                <td className="px-4 py-3 font-bold text-[#004643]">₹{totalEstimate.toLocaleString('en-IN')}</td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Footer actions */}
      <div className="flex items-center justify-between bg-white rounded-xl border border-[#C8E0DE]/60 px-6 py-4"
        style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
        <button onClick={() => onNavigate('rfq-list')} className="px-4 py-2.5 rounded-lg text-sm font-medium text-[#527270] border border-[#C8E0DE] hover:bg-[#EBF7F6] transition-colors">
          Cancel
        </button>
        <div className="flex gap-3">
          <button className="px-5 py-2.5 rounded-lg text-sm font-medium border border-[#004643] text-[#004643] hover:bg-[#D4EEEC] transition-colors">
            Save as Draft
          </button>
          <button onClick={() => onNavigate('rfq-list')}
            className="px-5 py-2.5 rounded-lg text-sm font-medium text-white transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #004643, #00706A)', boxShadow: '0 4px 12px rgba(0,70,67,0.3)' }}>
            Publish RFQ
          </button>
        </div>
      </div>
    </div>
  );
}
