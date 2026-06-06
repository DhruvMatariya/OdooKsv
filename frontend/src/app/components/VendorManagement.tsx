import { useState } from 'react';
import { Search, Plus, Eye, Edit2, Ban, X, ChevronDown, CheckCircle, Building2, Phone, Mail, MapPin, CreditCard } from 'lucide-react';
import { cn } from './ui/utils';

const vendors = [
  { id: 1, name: 'Zenith Supplies Co.', initials: 'ZS', category: 'Raw Materials', gst: '29ABCDE1234F1Z5', contact: 'Rajan Mehta', email: 'rajan@zenith.co', phone: '+91 98765 43210', status: 'active', gstVerified: true },
  { id: 2, name: 'TechParts Ltd', initials: 'TP', category: 'Electronics', gst: '27FGHIJ5678K2Y6', contact: 'Sunita Patel', email: 'sunita@techparts.in', phone: '+91 87654 32109', status: 'active', gstVerified: true },
  { id: 3, name: 'Global Metals Inc.', initials: 'GM', category: 'Metals & Alloys', gst: '07KLMNO9012L3X7', contact: 'Arjun Singh', email: 'arjun@globalmetals.com', phone: '+91 76543 21098', status: 'active', gstVerified: false },
  { id: 4, name: 'Pacific Trading', initials: 'PT', category: 'Chemicals', gst: '19PQRST3456M4W8', contact: 'Priya Sharma', email: 'priya@pacific.trade', phone: '+91 65432 10987', status: 'inactive', gstVerified: true },
  { id: 5, name: 'FastShip Logistics', initials: 'FL', category: 'Logistics', gst: '33UVWXY7890N5V9', contact: 'Vikram Nair', email: 'vikram@fastship.in', phone: '+91 54321 09876', status: 'active', gstVerified: true },
  { id: 6, name: 'Apex Components', initials: 'AC', category: 'Electronics', gst: '06ZABCD2345O6U0', contact: 'Deepa Kumar', email: 'deepa@apex.com', phone: '+91 43210 98765', status: 'blacklisted', gstVerified: false },
  { id: 7, name: 'Prime Hardware', initials: 'PH', category: 'Tools & Hardware', gst: '24EFGHI6789P7T1', contact: 'Suresh Reddy', email: 'suresh@prime.hw', phone: '+91 32109 87654', status: 'active', gstVerified: true },
  { id: 8, name: 'EcoPlast Industries', initials: 'EP', category: 'Plastics', gst: '12JKLMN0123Q8S2', contact: 'Kavya Menon', email: 'kavya@ecoplast.in', phone: '+91 21098 76543', status: 'active', gstVerified: true },
];

const statusConfig = {
  active: { label: 'Active', color: '#00706A', bg: '#D4EEEC' },
  inactive: { label: 'Inactive', color: '#527270', bg: '#D8EDEB' },
  blacklisted: { label: 'Blacklisted', color: '#C0392B', bg: '#FDECEA' },
};

const categories = ['All Categories', 'Raw Materials', 'Electronics', 'Metals & Alloys', 'Chemicals', 'Logistics', 'Tools & Hardware', 'Plastics'];
const statusFilters = ['All', 'Active', 'Inactive', 'Blacklisted'];

export function VendorManagement() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All Categories');
  const [statusFilter, setStatusFilter] = useState('All');
  const [gstOnly, setGstOnly] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<typeof vendors[0] | null>(null);
  const [drawerMode, setDrawerMode] = useState<'add' | 'edit'>('add');

  const filtered = vendors.filter(v => {
    const matchSearch = v.name.toLowerCase().includes(search.toLowerCase()) ||
      v.contact.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === 'All Categories' || v.category === category;
    const matchStatus = statusFilter === 'All' || v.status === statusFilter.toLowerCase();
    const matchGst = !gstOnly || v.gstVerified;
    return matchSearch && matchCat && matchStatus && matchGst;
  });

  const openAdd = () => { setDrawerMode('add'); setSelectedVendor(null); setDrawerOpen(true); };
  const openEdit = (v: typeof vendors[0]) => { setDrawerMode('edit'); setSelectedVendor(v); setDrawerOpen(true); };

  return (
    <div className="space-y-5 relative">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[#527270] text-sm">Manage your supplier network</p>
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-white transition-all hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, #004643, #00706A)', boxShadow: '0 4px 12px rgba(0,70,67,0.3)' }}>
          <Plus className="w-4 h-4" /> Add Vendor
        </button>
      </div>

      {/* Filter bar */}
      <div className="bg-white rounded-xl p-4 border border-[#C8E0DE]/60 flex flex-wrap gap-3 items-center"
        style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#527270]" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search vendors..."
            className="w-full pl-9 pr-4 py-2 border border-[#C8E0DE] rounded-lg text-sm focus:outline-none focus:border-[#004643] focus:ring-2 focus:ring-[#004643]/20 transition-all" />
        </div>

        <div className="relative">
          <select value={category} onChange={e => setCategory(e.target.value)}
            className="appearance-none pl-3 pr-8 py-2 border border-[#C8E0DE] rounded-lg text-sm text-[#0D1F1E] bg-white focus:outline-none focus:border-[#004643] focus:ring-2 focus:ring-[#004643]/20 transition-all">
            {categories.map(c => <option key={c}>{c}</option>)}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#527270] pointer-events-none" />
        </div>

        <div className="flex rounded-lg overflow-hidden border border-[#C8E0DE]">
          {statusFilters.map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={cn(
                'px-3 py-2 text-sm transition-colors',
                statusFilter === s ? 'bg-[#004643] text-white' : 'bg-white text-[#527270] hover:bg-[#EBF7F6]'
              )}>
              {s}
            </button>
          ))}
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <div onClick={() => setGstOnly(!gstOnly)}
            className={cn('relative w-9 h-5 rounded-full transition-colors', gstOnly ? 'bg-[#004643]' : 'bg-[#C8E0DE]')}>
            <span className={cn('absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform', gstOnly ? 'translate-x-4' : 'translate-x-0.5')} />
          </div>
          <span className="text-sm text-[#527270]">GST Verified</span>
        </label>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-[#C8E0DE]/60 overflow-hidden"
        style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[900px]">
            <thead>
              <tr className="bg-[#EBF7F6] border-b border-[#C8E0DE]/60">
                <th className="px-5 py-3.5 text-left">
                  <input type="checkbox" className="rounded border-[#C8E0DE]" />
                </th>
                {['Vendor', 'Category', 'GST Number', 'Contact Person', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-[#527270] uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-16 text-[#527270]">
                    <Building2 className="w-12 h-12 text-[#C8E0DE] mx-auto mb-3" />
                    <p className="font-medium text-[#0D1F1E]">No vendors found</p>
                    <p className="text-sm mt-1">Try adjusting your filters</p>
                  </td>
                </tr>
              ) : filtered.map((v, i) => (
                <tr key={v.id} className={cn('border-t border-[#D8EDEB] hover:bg-[#EEF7F6] transition-colors', i % 2 === 1 && 'bg-[#EEF7F6]')}>
                  <td className="px-5 py-4"><input type="checkbox" className="rounded border-[#C8E0DE]" /></td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#D4EEEC] flex items-center justify-center text-[#004643] font-semibold flex-shrink-0" style={{ fontSize: 11 }}>
                        {v.initials}
                      </div>
                      <div>
                        <p className="font-medium text-[#0D1F1E]">{v.name}</p>
                        <p className="text-xs text-[#527270]">{v.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-[#527270]">{v.category}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[#0D1F1E] font-mono text-xs">{v.gst}</span>
                      {v.gstVerified && <CheckCircle className="w-3.5 h-3.5 text-[#00706A]" />}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div>
                      <p className="text-[#0D1F1E] font-medium">{v.contact}</p>
                      <p className="text-xs text-[#527270]">{v.phone}</p>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium"
                      style={{ color: statusConfig[v.status as keyof typeof statusConfig].color, background: statusConfig[v.status as keyof typeof statusConfig].bg }}>
                      {statusConfig[v.status as keyof typeof statusConfig].label}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEdit(v)} className="p-1.5 rounded-lg text-[#527270] hover:bg-[#D4EEEC] hover:text-[#004643] transition-colors" title="View">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button onClick={() => openEdit(v)} className="p-1.5 rounded-lg text-[#527270] hover:bg-[#D4EEEC] hover:text-[#004643] transition-colors" title="Edit">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 rounded-lg text-[#527270] hover:bg-[#FDECEA] hover:text-[#C0392B] transition-colors" title="Deactivate">
                        <Ban className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-[#D8EDEB] bg-[#EBF7F6]">
          <p className="text-xs text-[#527270]">Showing {filtered.length} of {vendors.length} vendors</p>
          <div className="flex items-center gap-1">
            {[1, 2, 3].map(n => (
              <button key={n} className={cn(
                'w-7 h-7 rounded-lg text-xs font-medium transition-colors',
                n === 1 ? 'bg-[#004643] text-white' : 'text-[#527270] hover:bg-[#D4EEEC]'
              )}>{n}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Drawer */}
      {drawerOpen && (
        <>
          <div className="fixed inset-0 bg-black/30 z-40 backdrop-blur-[2px]" onClick={() => setDrawerOpen(false)} />
          <div className="fixed right-0 top-0 h-full w-full max-w-[440px] bg-white z-50 flex flex-col shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#C8E0DE]">
              <div>
                <h3 className="font-semibold text-[#0D1F1E]">{drawerMode === 'add' ? 'Add New Vendor' : `Edit: ${selectedVendor?.name}`}</h3>
                <p className="text-xs text-[#527270] mt-0.5">Fill in the vendor details below</p>
              </div>
              <button onClick={() => setDrawerOpen(false)} className="p-2 rounded-lg hover:bg-[#EBF7F6] text-[#527270]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {[
                { label: 'Vendor Name', placeholder: 'e.g. Zenith Supplies Co.', icon: Building2, defaultVal: selectedVendor?.name },
                { label: 'Category', placeholder: 'e.g. Raw Materials', icon: null, defaultVal: selectedVendor?.category },
                { label: 'GST Number', placeholder: 'e.g. 29ABCDE1234F1Z5', icon: null, defaultVal: selectedVendor?.gst },
                { label: 'PAN Number', placeholder: 'e.g. ABCDE1234F', icon: null, defaultVal: '' },
                { label: 'Contact Person', placeholder: 'e.g. Rajan Mehta', icon: null, defaultVal: selectedVendor?.contact },
                { label: 'Email', placeholder: 'contact@vendor.com', icon: Mail, defaultVal: selectedVendor?.email },
                { label: 'Phone', placeholder: '+91 98765 43210', icon: Phone, defaultVal: selectedVendor?.phone },
                { label: 'Address', placeholder: '123 Business District, Mumbai', icon: MapPin, defaultVal: '' },
                { label: 'Bank Account No.', placeholder: 'Account number', icon: CreditCard, defaultVal: '' },
              ].map(field => (
                <div key={field.label}>
                  <label className="block text-sm font-medium text-[#0D1F1E] mb-1.5">{field.label}</label>
                  <input type="text" defaultValue={field.defaultVal || ''}
                    placeholder={field.placeholder}
                    className="w-full px-3 py-2.5 border border-[#C8E0DE] rounded-lg text-sm text-[#0D1F1E] placeholder:text-[#527270]/60 focus:outline-none focus:border-[#004643] focus:ring-2 focus:ring-[#004643]/20 transition-all" />
                </div>
              ))}

              <div>
                <label className="block text-sm font-medium text-[#0D1F1E] mb-1.5">Status</label>
                <div className="flex items-center gap-3">
                  <div className={cn('relative w-10 h-5 rounded-full transition-colors cursor-pointer', 'bg-[#004643]')}>
                    <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-white rounded-full shadow" />
                  </div>
                  <span className="text-sm text-[#0D1F1E]">Active</span>
                </div>
              </div>
            </div>

            <div className="border-t border-[#C8E0DE] px-6 py-4 flex gap-3">
              <button onClick={() => setDrawerOpen(false)}
                className="flex-1 py-2.5 border border-[#C8E0DE] rounded-lg text-sm font-medium text-[#527270] hover:bg-[#EBF7F6] transition-colors">
                Cancel
              </button>
              <button onClick={() => setDrawerOpen(false)}
                className="flex-1 py-2.5 rounded-lg text-sm font-medium text-white transition-all hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #004643, #00706A)' }}>
                {drawerMode === 'add' ? 'Add Vendor' : 'Save Changes'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
