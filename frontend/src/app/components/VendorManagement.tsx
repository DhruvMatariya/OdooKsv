import { useState, useEffect, useCallback } from 'react';
import { Search, Plus, Eye, Edit2, Ban, X, ChevronDown, CheckCircle, Building2, Phone, Mail, MapPin, CreditCard, Loader2, AlertCircle } from 'lucide-react';
import { cn } from './ui/utils';
import { api } from '../lib/api';
import { toast } from 'sonner';

interface BackendVendor {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string | null;
  city: string | null;
  state: string | null;
  gstNumber: string;
  category: string;
  status: 'ACTIVE' | 'INACTIVE';
  rating: number;
  totalOrders: number;
  createdAt: string;
  _count?: {
    quotations: number;
    purchaseOrders: number;
  };
}

const statusConfig = {
  ACTIVE: { label: 'Active', color: '#00706A', bg: '#D4EEEC' },
  INACTIVE: { label: 'Inactive', color: '#527270', bg: '#D8EDEB' },
  BLACKLISTED: { label: 'Blacklisted', color: '#C0392B', bg: '#FDECEA' },
};

const categories = ['All Categories', 'IT', 'Logistics', 'Office Supplies', 'Manufacturing'];
const statusFilters = ['All', 'Active', 'Inactive'];

export function VendorManagement() {
  const [vendors, setVendors] = useState<BackendVendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All Categories');
  const [statusFilter, setStatusFilter] = useState('All');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<BackendVendor | null>(null);
  const [drawerMode, setDrawerMode] = useState<'add' | 'edit'>('add');
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    gstNumber: '',
    category: 'IT',
    status: 'ACTIVE',
  });

  const fetchVendors = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let endpoint = '/vendors?limit=100';
      if (search) endpoint += `&search=${encodeURIComponent(search)}`;
      if (category !== 'All Categories') endpoint += `&category=${category}`;
      if (statusFilter !== 'All') endpoint += `&status=${statusFilter}`;
      
      const data = await api.get<{ vendors: BackendVendor[] }>(endpoint);
      setVendors(data.vendors);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch vendors');
      toast.error('Error fetching vendors');
    } finally {
      setLoading(false);
    }
  }, [search, category, statusFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchVendors();
    }, 500);
    return () => clearTimeout(timer);
  }, [fetchVendors]);

  const handleOpenDrawer = (mode: 'add' | 'edit', vendor: BackendVendor | null = null) => {
    setDrawerMode(mode);
    if (vendor) {
      setSelectedVendor(vendor);
      setFormData({
        name: vendor.name,
        email: vendor.email,
        phone: vendor.phone,
        address: vendor.address || '',
        city: vendor.city || '',
        state: vendor.state || '',
        gstNumber: vendor.gstNumber,
        category: vendor.category,
        status: vendor.status,
      });
    } else {
      setSelectedVendor(null);
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        gstNumber: '',
        category: 'IT',
        status: 'ACTIVE',
      });
    }
    setDrawerOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (drawerMode === 'edit' && selectedVendor) {
        await api.patch(`/vendors/${selectedVendor.id}`, formData);
        toast.success('Vendor updated successfully');
      } else {
        await api.post('/vendors', formData);
        toast.success('Vendor added successfully');
      }
      setDrawerOpen(false);
      fetchVendors();
    } catch (err: any) {
      toast.error(err.message || 'Action failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeactivate = async (id: string) => {
    if (!confirm('Are you sure you want to deactivate this vendor?')) return;
    try {
      await api.patch(`/vendors/${id}`, { status: 'INACTIVE' });
      toast.success('Vendor deactivated');
      fetchVendors();
    } catch (err: any) {
      toast.error(err.message || 'Failed to deactivate vendor');
    }
  };

  return (
    <div className="space-y-5 relative">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[#527270] text-sm">Manage your supplier network</p>
        </div>
        <button onClick={() => handleOpenDrawer('add')}
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
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
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
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-[#C8E0DE]/60 overflow-hidden"
        style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
        <div className="overflow-x-auto">
          {loading && vendors.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-[#527270]">
              <Loader2 className="w-8 h-8 animate-spin mb-2" />
              <p>Loading vendors...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 text-red-500">
              <AlertCircle className="w-8 h-8 mb-2" />
              <p>{error}</p>
              <button onClick={() => fetchVendors()} className="mt-4 text-sm font-medium text-[#004643] underline">Try again</button>
            </div>
          ) : (
            <table className="w-full text-sm min-w-[900px]">
              <thead>
                <tr className="bg-[#EBF7F6] border-b border-[#C8E0DE]/60">
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-[#527270] uppercase tracking-wide">Vendor</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-[#527270] uppercase tracking-wide">Category</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-[#527270] uppercase tracking-wide">GST Number</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-[#527270] uppercase tracking-wide">Status</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-[#527270] uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody>
                {vendors.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-16 text-[#527270]">
                      <Building2 className="w-12 h-12 text-[#C8E0DE] mx-auto mb-3" />
                      <p className="font-medium text-[#0D1F1E]">No vendors found</p>
                    </td>
                  </tr>
                ) : (
                  vendors.map((v, i) => (
                    <tr key={v.id} className={cn('border-t border-[#D8EDEB] hover:bg-[#EEF7F6] transition-colors', i % 2 === 1 && 'bg-[#EEF7F6]')}>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-[#D4EEEC] flex items-center justify-center text-[#004643] font-semibold flex-shrink-0" style={{ fontSize: 11 }}>
                            {v.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-[#0D1F1E]">{v.name}</p>
                            <p className="text-xs text-[#527270]">{v.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-[#527270]">{v.category}</td>
                      <td className="px-5 py-4">
                        <span className="text-[#0D1F1E] font-mono text-xs">{v.gstNumber}</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium"
                          style={{ color: statusConfig[v.status]?.color, background: statusConfig[v.status]?.bg }}>
                          {statusConfig[v.status]?.label}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1">
                          <button onClick={() => handleOpenDrawer('edit', v)} className="p-1.5 rounded-lg text-[#527270] hover:bg-[#D4EEEC] hover:text-[#004643] transition-colors" title="Edit">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDeactivate(v.id)} className="p-1.5 rounded-lg text-[#527270] hover:bg-[#FDECEA] hover:text-[#C0392B] transition-colors" title="Deactivate">
                            <Ban className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Drawer */}
      {drawerOpen && (
        <>
          <div className="fixed inset-0 bg-black/30 z-40 backdrop-blur-[2px]" onClick={() => !submitting && setDrawerOpen(false)} />
          <div className="fixed right-0 top-0 h-full w-full max-w-[440px] bg-white z-50 flex flex-col shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#C8E0DE]">
              <div>
                <h3 className="font-semibold text-[#0D1F1E]">{drawerMode === 'add' ? 'Add New Vendor' : `Edit: ${selectedVendor?.name}`}</h3>
              </div>
              <button onClick={() => setDrawerOpen(false)} disabled={submitting} className="p-2 rounded-lg hover:bg-[#EBF7F6] text-[#527270]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-[#0D1F1E] mb-1.5">Vendor Name</label>
                <input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Zenith Supplies Co."
                  className="w-full px-3 py-2.5 border border-[#C8E0DE] rounded-lg text-sm focus:outline-none focus:border-[#004643] focus:ring-2 focus:ring-[#004643]/20" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#0D1F1E] mb-1.5">Email</label>
                <input type="email" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })}
                  placeholder="contact@vendor.com"
                  className="w-full px-3 py-2.5 border border-[#C8E0DE] rounded-lg text-sm focus:outline-none focus:border-[#004643] focus:ring-2 focus:ring-[#004643]/20" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#0D1F1E] mb-1.5">Phone</label>
                <input type="text" required value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full px-3 py-2.5 border border-[#C8E0DE] rounded-lg text-sm focus:outline-none focus:border-[#004643] focus:ring-2 focus:ring-[#004643]/20" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#0D1F1E] mb-1.5">GST Number</label>
                <input type="text" required value={formData.gstNumber} onChange={e => setFormData({ ...formData, gstNumber: e.target.value })}
                  placeholder="e.g. 29ABCDE1234F1Z5"
                  className="w-full px-3 py-2.5 border border-[#C8E0DE] rounded-lg text-sm focus:outline-none focus:border-[#004643] focus:ring-2 focus:ring-[#004643]/20" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#0D1F1E] mb-1.5">Category</label>
                <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2.5 border border-[#C8E0DE] rounded-lg text-sm bg-white focus:outline-none focus:border-[#004643] focus:ring-2 focus:ring-[#004643]/20">
                  {categories.filter(c => c !== 'All Categories').map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="border-t border-[#C8E0DE] pt-5 flex gap-3">
                <button type="button" onClick={() => setDrawerOpen(false)} disabled={submitting}
                  className="flex-1 py-2.5 border border-[#C8E0DE] rounded-lg text-sm font-medium text-[#527270] hover:bg-[#EBF7F6]">
                  Cancel
                </button>
                <button type="submit" disabled={submitting}
                  className="flex-1 py-2.5 rounded-lg text-sm font-medium text-white flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg, #004643, #00706A)' }}>
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {drawerMode === 'add' ? 'Add Vendor' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
