import { useState } from 'react';
import { Search, Plus, Edit2, Trash2, Shield, MoreHorizontal, X, ChevronDown, Mail } from 'lucide-react';
import { cn } from './ui/utils';
import { roleLabels, type UserRole } from '../context/AuthContext';

const users = [
  { id: 'usr_001', name: 'James Donovan', username: 'james.donovan', email: 'james@vendorbridge.in', role: 'procurement' as UserRole, country: 'India', status: 'active', joined: '01 Jan 2024' },
  { id: 'usr_002', name: 'Sunita Patel', username: 'techparts.vendor', email: 'sunita@techparts.in', role: 'vendor' as UserRole, country: 'India', status: 'active', joined: '15 Feb 2024' },
  { id: 'usr_003', name: 'Sarah Johnson', username: 'sarah.manager', email: 'sarah@vendorbridge.in', role: 'manager' as UserRole, country: 'India', status: 'active', joined: '10 Mar 2024' },
  { id: 'usr_004', name: 'Admin User', username: 'admin', email: 'admin@vendorbridge.in', role: 'admin' as UserRole, country: 'India', status: 'active', joined: '01 Jan 2024' },
  { id: 'usr_005', name: 'Raj Verma', username: 'raj.verma', email: 'raj@vendorbridge.in', role: 'procurement' as UserRole, country: 'India', status: 'active', joined: '20 Mar 2024' },
  { id: 'usr_006', name: 'Meera Iyer', username: 'meera.iyer', email: 'meera@vendorbridge.in', role: 'procurement' as UserRole, country: 'India', status: 'inactive', joined: '05 Apr 2024' },
  { id: 'usr_007', name: 'Global Metals Ltd', username: 'globalmetals.vendor', email: 'contact@globalmetals.com', role: 'vendor' as UserRole, country: 'India', status: 'active', joined: '12 Feb 2024' },
];

const roleColors: Record<UserRole, { color: string; bg: string }> = {
  procurement: { color: '#004643', bg: '#D4EEEC' },
  vendor: { color: '#00706A', bg: '#D4EEEC' },
  manager: { color: '#9A6800', bg: '#FFF0C8' },
  admin: { color: '#004643', bg: '#D4EEEC' },
};

const allRoles: UserRole[] = ['procurement', 'vendor', 'manager', 'admin'];

export function UserManagement() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState<typeof users[0] | null>(null);

  const filtered = users.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const stats = {
    total: users.length,
    procurement: users.filter(u => u.role === 'procurement').length,
    vendor: users.filter(u => u.role === 'vendor').length,
    manager: users.filter(u => u.role === 'manager').length,
    admin: users.filter(u => u.role === 'admin').length,
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
            placeholder="Search by name, username, or email..."
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

        <button onClick={() => { setEditUser(null); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-all hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, #004643, #00706A)' }}>
          <Plus className="w-4 h-4" /> Invite User
        </button>
      </div>

      {/* User table */}
      <div className="bg-white rounded-xl border border-[#C8E0DE]/60 overflow-hidden"
        style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[750px]">
            <thead>
              <tr className="bg-[#EBF7F6] border-b border-[#C8E0DE]/60">
                {['User', 'Username', 'Role', 'Country', 'Status', 'Joined', 'Actions'].map(h => (
                  <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-[#527270] uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((u, i) => {
                const rc = roleColors[u.role];
                return (
                  <tr key={u.id} className={cn('border-t border-[#D8EDEB] hover:bg-[#EEF7F6] transition-colors', i % 2 === 1 && 'bg-[#EEF7F6]')}>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                          style={{ background: rc.color }}>
                          {u.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                          <p className="font-medium text-[#0D1F1E]">{u.name}</p>
                          <p className="text-xs text-[#527270]">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-mono text-xs text-[#527270]">{u.username}</td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium"
                        style={{ color: rc.color, background: rc.bg }}>
                        <Shield className="w-3 h-3" />
                        {roleLabels[u.role]}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-[#527270]">{u.country}</td>
                    <td className="px-5 py-4">
                      <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium',
                        u.status === 'active' ? 'bg-[#D4EEEC] text-[#00706A]' : 'bg-[#D8EDEB] text-[#527270]')}>
                        {u.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-[#527270] text-xs">{u.joined}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1">
                        <button onClick={() => { setEditUser(u); setShowModal(true); }}
                          className="p-1.5 rounded-lg text-[#527270] hover:bg-[#D4EEEC] hover:text-[#004643] transition-colors" title="Edit">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 rounded-lg text-[#527270] hover:bg-[#D4EEEC] hover:text-[#004643] transition-colors" title="Send email">
                          <Mail className="w-4 h-4" />
                        </button>
                        {u.role !== 'admin' && (
                          <button className="p-1.5 rounded-lg text-[#527270] hover:bg-[#FDECEA] hover:text-[#C0392B] transition-colors" title="Remove">
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
        </div>
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-[#D8EDEB] bg-[#EBF7F6]">
          <p className="text-xs text-[#527270]">Showing {filtered.length} of {users.length} users</p>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <>
          <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-40" onClick={() => setShowModal(false)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-2xl shadow-2xl z-50">
            <div className="flex items-center justify-between p-5 border-b border-[#D8EDEB]">
              <h3 className="font-bold text-[#0D1F1E]">{editUser ? 'Edit User' : 'Invite New User'}</h3>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-[#EBF7F6] text-[#527270]"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-[#0D1F1E] mb-1.5">First Name</label>
                  <input type="text" defaultValue={editUser?.name.split(' ')[0] || ''}
                    className="w-full px-3 py-2.5 border border-[#C8E0DE] rounded-lg text-sm focus:outline-none focus:border-[#004643] focus:ring-2 focus:ring-[#004643]/20 transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#0D1F1E] mb-1.5">Last Name</label>
                  <input type="text" defaultValue={editUser?.name.split(' ')[1] || ''}
                    className="w-full px-3 py-2.5 border border-[#C8E0DE] rounded-lg text-sm focus:outline-none focus:border-[#004643] focus:ring-2 focus:ring-[#004643]/20 transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#0D1F1E] mb-1.5">Email</label>
                <input type="email" defaultValue={editUser?.email || ''}
                  className="w-full px-3 py-2.5 border border-[#C8E0DE] rounded-lg text-sm focus:outline-none focus:border-[#004643] focus:ring-2 focus:ring-[#004643]/20 transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#0D1F1E] mb-1.5">Role</label>
                <div className="relative">
                  <select defaultValue={editUser?.role || 'procurement'}
                    className="w-full appearance-none px-3 py-2.5 border border-[#C8E0DE] rounded-lg text-sm bg-white focus:outline-none focus:border-[#004643] focus:ring-2 focus:ring-[#004643]/20 transition-all">
                    {allRoles.map(r => <option key={r} value={r}>{roleLabels[r]}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#527270] pointer-events-none" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 border border-[#C8E0DE] rounded-lg text-sm font-medium text-[#527270] hover:bg-[#EBF7F6]">
                  Cancel
                </button>
                <button onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-lg text-sm font-medium text-white"
                  style={{ background: 'linear-gradient(135deg, #004643, #00706A)' }}>
                  {editUser ? 'Save Changes' : 'Send Invite'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
