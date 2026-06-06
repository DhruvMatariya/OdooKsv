import { useState, useEffect, useCallback } from 'react';
import { Search, Plus, Edit2, Trash2, Shield, X, ChevronDown, Mail, Loader2, AlertCircle } from 'lucide-react';
import { cn } from './ui/utils';
import { roleLabels, type UserRole } from '../context/AuthContext';
import { api } from '../lib/api';
import { toast } from 'sonner';

interface BackendUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  phone: string | null;
  country: string | null;
  createdAt: string;
  vendor?: {
    id: string;
    name: string;
  };
}

const roleColors: Record<UserRole, { color: string; bg: string }> = {
  procurement: { color: '#004643', bg: '#D4EEEC' },
  vendor: { color: '#00706A', bg: '#D4EEEC' },
  manager: { color: '#9A6800', bg: '#FFF0C8' },
  admin: { color: '#004643', bg: '#D4EEEC' },
};

const roleMapping: Record<string, UserRole> = {
  'PROCUREMENT_OFFICER': 'procurement',
  'VENDOR': 'vendor',
  'MANAGER': 'manager',
  'ADMIN': 'admin',
};

const inverseRoleMapping: Record<UserRole, string> = {
  'procurement': 'PROCUREMENT_OFFICER',
  'vendor': 'VENDOR',
  'manager': 'MANAGER',
  'admin': 'ADMIN',
};

const allRoles: UserRole[] = ['procurement', 'vendor', 'manager', 'admin'];

export function UserManagement() {
  const [users, setUsers] = useState<BackendUser[]>([]);
  const [vendors, setVendors] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState<BackendUser | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'procurement' as UserRole,
    phone: '',
    country: '',
    vendorId: '',
  });

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let endpoint = '/users?limit=100';
      if (search) endpoint += `&search=${encodeURIComponent(search)}`;
      if (roleFilter !== 'all') endpoint += `&role=${inverseRoleMapping[roleFilter]}`;
      
      const [userData, vendorData] = await Promise.all([
        api.get<{ users: BackendUser[] }>(endpoint),
        api.get<any>('/vendors?limit=100')
      ]);

      setUsers(userData.users);
      // Map vendor data if it's in a different format
      const vendorsList = Array.isArray(vendorData) ? vendorData : vendorData.vendors || [];
      setVendors(vendorsList);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch users');
      toast.error('Error fetching users');
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 500); // Debounce search
    return () => clearTimeout(timer);
  }, [fetchUsers]);

  const handleOpenModal = (user: BackendUser | null = null) => {
    if (user) {
      setEditUser(user);
      setFormData({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: roleMapping[user.role] || 'procurement',
        phone: user.phone || '',
        country: user.country || '',
        vendorId: user.vendor?.id || '',
      });
    } else {
      setEditUser(null);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        role: 'procurement',
        phone: '',
        country: '',
        vendorId: '',
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        role: inverseRoleMapping[formData.role],
      };

      if (editUser) {
        await api.patch(`/users/${editUser.id}`, payload);
        toast.success('User updated successfully');
      } else {
        await api.post('/users', payload);
        toast.success('Invitation sent successfully');
      }
      setShowModal(false);
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message || 'Action failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    
    try {
      await api.delete(`/users/${id}`);
      toast.success('User deleted successfully');
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete user');
    }
  };

  const stats = {
    total: users.length,
    procurement: users.filter(u => roleMapping[u.role] === 'procurement').length,
    vendor: users.filter(u => roleMapping[u.role] === 'vendor').length,
    manager: users.filter(u => roleMapping[u.role] === 'manager').length,
    admin: users.filter(u => roleMapping[u.role] === 'admin').length,
  };

  return (
    <div className="space-y-5">
      {/* Role stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        {[
          { label: 'Total Users', value: stats.total, color: '#0D1F1E', bg: '#D8EDEB' },
          { label: 'Procurement', value: stats.procurement, ...roleColors.procurement },
          { label: 'Vendors', value: stats.vendor, ...roleColors.vendor },
          { label: 'Managers', value: stats.manager, ...roleColors.manager },
          { label: 'Admins', value: stats.admin, ...roleColors.admin },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl p-4 border border-[#C8E0DE]/60 text-center"
            style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
            <p className="font-bold text-2xl" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs text-[#527270] mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div className="bg-white rounded-xl p-4 border border-[#C8E0DE]/60 flex flex-wrap gap-3 items-center"
        style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#527270]" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full pl-9 pr-4 py-2 border border-[#C8E0DE] rounded-lg text-sm focus:outline-none focus:border-[#004643] focus:ring-2 focus:ring-[#004643]/20 transition-all" />
        </div>

        <div className="flex rounded-lg overflow-hidden border border-[#C8E0DE]">
          <button onClick={() => setRoleFilter('all')}
            className={cn('px-3 py-2 text-xs transition-colors', roleFilter === 'all' ? 'bg-[#004643] text-white' : 'bg-white text-[#527270] hover:bg-[#EBF7F6]')}>
            All
          </button>
          {allRoles.map(r => {
            const rc = roleColors[r];
            return (
              <button key={r} onClick={() => setRoleFilter(r)}
                className="px-3 py-2 text-xs transition-colors border-l border-[#C8E0DE]"
                style={roleFilter === r ? { background: rc.color, color: '#fff' } : { background: '#fff', color: '#527270' }}>
                {roleLabels[r].split(' ')[0]}
              </button>
            );
          })}
        </div>

        <button onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-all hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, #004643, #00706A)' }}>
          <Plus className="w-4 h-4" /> Invite User
        </button>
      </div>

      {/* User table */}
      <div className="bg-white rounded-xl border border-[#C8E0DE]/60 overflow-hidden"
        style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
        <div className="overflow-x-auto">
          {loading && users.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-[#527270]">
              <Loader2 className="w-8 h-8 animate-spin mb-2" />
              <p>Loading users...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 text-red-500">
              <AlertCircle className="w-8 h-8 mb-2" />
              <p>{error}</p>
              <button onClick={() => fetchUsers()} className="mt-4 text-sm font-medium text-[#004643] underline">Try again</button>
            </div>
          ) : (
            <table className="w-full text-sm min-w-[750px]">
              <thead>
                <tr className="bg-[#EBF7F6] border-b border-[#C8E0DE]/60">
                  {['User', 'Role', 'Vendor', 'Country', 'Joined', 'Actions'].map(h => (
                    <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-[#527270] uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-10 text-center text-[#527270]">No users found</td>
                  </tr>
                ) : users.map((u, i) => {
                  const role = roleMapping[u.role] || 'procurement';
                  const rc = roleColors[role];
                  return (
                    <tr key={u.id} className={cn('border-t border-[#D8EDEB] hover:bg-[#EEF7F6] transition-colors', i % 2 === 1 && 'bg-[#EEF7F6]')}>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                            style={{ background: rc.color }}>
                            {u.firstName[0]}{u.lastName[0]}
                          </div>
                          <div>
                            <p className="font-medium text-[#0D1F1E]">{u.firstName} {u.lastName}</p>
                            <p className="text-xs text-[#527270]">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium"
                          style={{ color: rc.color, background: rc.bg }}>
                          <Shield className="w-3 h-3" />
                          {roleLabels[role]}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-[#527270]">{u.vendor?.name || '-'}</td>
                      <td className="px-5 py-4 text-[#527270]">{u.country || '-'}</td>
                      <td className="px-5 py-4 text-[#527270] text-xs">
                        {new Date(u.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1">
                          <button onClick={() => handleOpenModal(u)}
                            className="p-1.5 rounded-lg text-[#527270] hover:bg-[#D4EEEC] hover:text-[#004643] transition-colors" title="Edit">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button className="p-1.5 rounded-lg text-[#527270] hover:bg-[#D4EEEC] hover:text-[#004643] transition-colors" title="Send email">
                            <Mail className="w-4 h-4" />
                          </button>
                          {role !== 'admin' && (
                            <button onClick={() => handleDelete(u.id)}
                              className="p-1.5 rounded-lg text-[#527270] hover:bg-[#FDECEA] hover:text-[#C0392B] transition-colors" title="Remove">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
        {!loading && !error && (
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-[#D8EDEB] bg-[#EBF7F6]">
            <p className="text-xs text-[#527270]">Showing {users.length} users</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <>
          <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-40" onClick={() => !submitting && setShowModal(false)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-2xl shadow-2xl z-50">
            <div className="flex items-center justify-between p-6 border-b border-[#D8EDEB]">
              <h3 className="font-bold text-xl text-[#0D1F1E]">{editUser ? 'Edit User' : 'Invite New User'}</h3>
              <button onClick={() => setShowModal(false)} disabled={submitting} className="p-1.5 rounded-lg hover:bg-[#EBF7F6] text-[#527270] disabled:opacity-50">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[#0D1F1E] mb-2">First Name</label>
                  <input type="text" required
                    value={formData.firstName}
                    onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-4 py-2.5 border border-[#C8E0DE] rounded-xl text-sm focus:outline-none focus:border-[#004643] focus:ring-2 focus:ring-[#004643]/10 transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#0D1F1E] mb-2">Last Name</label>
                  <input type="text" required
                    value={formData.lastName}
                    onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full px-4 py-2.5 border border-[#C8E0DE] rounded-xl text-sm focus:outline-none focus:border-[#004643] focus:ring-2 focus:ring-[#004643]/10 transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#0D1F1E] mb-2">Email</label>
                <input type="email" required
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2.5 border border-[#C8E0DE] rounded-xl text-sm focus:outline-none focus:border-[#004643] focus:ring-2 focus:ring-[#004643]/10 transition-all" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[#0D1F1E] mb-2">Phone</label>
                  <input type="text"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2.5 border border-[#C8E0DE] rounded-xl text-sm focus:outline-none focus:border-[#004643] focus:ring-2 focus:ring-[#004643]/10 transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#0D1F1E] mb-2">Country</label>
                  <input type="text"
                    value={formData.country}
                    onChange={e => setFormData({ ...formData, country: e.target.value })}
                    className="w-full px-4 py-2.5 border border-[#C8E0DE] rounded-xl text-sm focus:outline-none focus:border-[#004643] focus:ring-2 focus:ring-[#004643]/10 transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#0D1F1E] mb-2">Role</label>
                <div className="relative">
                  <select
                    value={formData.role}
                    onChange={e => setFormData({ ...formData, role: e.target.value as UserRole })}
                    className="w-full appearance-none px-4 py-2.5 border border-[#C8E0DE] rounded-xl text-sm bg-white focus:outline-none focus:border-[#004643] focus:ring-2 focus:ring-[#004643]/10 transition-all">
                    {allRoles.map(r => <option key={r} value={r}>{roleLabels[r]}</option>)}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#527270] pointer-events-none" />
                </div>
              </div>
              
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowModal(false)} disabled={submitting}
                  className="flex-1 py-3 border border-[#C8E0DE] rounded-xl text-sm font-semibold text-[#527270] hover:bg-[#EBF7F6] disabled:opacity-50 transition-all">
                  Cancel
                </button>
                <button type="submit" disabled={submitting}
                  className="flex-1 py-3 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-70 transition-all"
                  style={{ background: '#005D59' }}>
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editUser ? 'Save Changes' : 'Send Invite'}
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
