import { useState } from 'react';
import { Search, Filter, Bell, CheckCircle, AlertTriangle, Info, X } from 'lucide-react';
import { cn } from './ui/utils';

const activities = [
  { id: 1, actor: 'James Donovan', actorInitials: 'JD', action: 'approved purchase order', module: 'PO', moduleId: 'PO-2024-142', time: '14:32', date: 'Today', color: '#00706A', bg: '#D4EEEC', type: 'Approvals' },
  { id: 2, actor: 'Sarah Johnson', actorInitials: 'SJ', action: 'submitted quotation for', module: 'RFQ', moduleId: 'RFQ-2024-088', time: '13:15', date: 'Today', color: '#004643', bg: '#D4EEEC', type: 'RFQ' },
  { id: 3, actor: 'System', actorInitials: 'SY', action: 'generated invoice', module: 'Invoice', moduleId: 'INV-2024-078', time: '12:00', date: 'Today', color: '#004643', bg: '#D4EEEC', type: 'Invoice' },
  { id: 4, actor: 'Raj Verma', actorInitials: 'RV', action: 'created new vendor profile', module: 'Vendor', moduleId: 'Prime Hardware', time: '10:45', date: 'Today', color: '#9A6800', bg: '#FFF0C8', type: 'Vendor' },
  { id: 5, actor: 'Meera Iyer', actorInitials: 'MI', action: 'published RFQ', module: 'RFQ', moduleId: 'RFQ-2024-089', time: '09:30', date: 'Today', color: '#004643', bg: '#D4EEEC', type: 'RFQ' },
  { id: 6, actor: 'James Donovan', actorInitials: 'JD', action: 'rejected approval request', module: 'Approvals', moduleId: 'APR-2024-038', time: '17:20', date: 'Yesterday', color: '#C0392B', bg: '#FDECEA', type: 'Approvals' },
  { id: 7, actor: 'TechParts Ltd', actorInitials: 'TP', action: 'submitted quotation for', module: 'RFQ', moduleId: 'RFQ-2024-087', time: '15:00', date: 'Yesterday', color: '#004643', bg: '#D4EEEC', type: 'RFQ' },
  { id: 8, actor: 'Kiran Desai', actorInitials: 'KD', action: 'updated vendor details for', module: 'Vendor', moduleId: 'Zenith Supplies Co.', time: '11:00', date: 'Yesterday', color: '#9A6800', bg: '#FFF0C8', type: 'Vendor' },
  { id: 9, actor: 'System', actorInitials: 'SY', action: 'marked invoice as overdue', module: 'Invoice', moduleId: 'INV-2024-074', time: '08:00', date: 'This Week', color: '#C0392B', bg: '#FDECEA', type: 'Invoice' },
  { id: 10, actor: 'Anita Sharma', actorInitials: 'AS', action: 'created RFQ', module: 'RFQ', moduleId: 'RFQ-2024-086', time: '16:45', date: 'This Week', color: '#004643', bg: '#D4EEEC', type: 'RFQ' },
];

const notifications = [
  { id: 1, type: 'info', title: 'New quotation received', desc: 'TechParts Ltd submitted for RFQ-2024-089', time: '5m', read: false },
  { id: 2, type: 'warning', title: 'Approval pending', desc: 'PO-2024-141 requires your approval', time: '1h', read: false },
  { id: 3, type: 'success', title: 'Invoice paid', desc: 'INV-2024-078 marked as paid by Zenith Supplies', time: '3h', read: true },
  { id: 4, type: 'info', title: 'RFQ deadline approaching', desc: 'RFQ-2024-087 closes in 24 hours', time: '5h', read: true },
  { id: 5, type: 'success', title: 'Vendor approved', desc: 'Prime Hardware is now active in your system', time: '1d', read: true },
];

const moduleFilters = ['All', 'RFQ', 'PO', 'Invoice', 'Vendor', 'Approvals'];

const notifIconMap = {
  success: { icon: CheckCircle, color: '#00706A', bg: '#D4EEEC' },
  warning: { icon: AlertTriangle, color: '#9A6800', bg: '#FFF0C8' },
  info: { icon: Info, color: '#004643', bg: '#D4EEEC' },
};

export function ActivityLogs() {
  const [moduleFilter, setModuleFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'logs' | 'notifications'>('logs');
  const [notifFilter, setNotifFilter] = useState('All');
  const [notifList, setNotifList] = useState(notifications);

  const grouped = activities.reduce((acc, act) => {
    if (!acc[act.date]) acc[act.date] = [];
    acc[act.date].push(act);
    return acc;
  }, {} as Record<string, typeof activities>);

  const filteredGroups = Object.entries(grouped).map(([date, items]) => ({
    date,
    items: items.filter(i => {
      const matchModule = moduleFilter === 'All' || i.type === moduleFilter;
      const matchSearch = i.actor.toLowerCase().includes(search.toLowerCase()) ||
        i.action.toLowerCase().includes(search.toLowerCase()) ||
        i.moduleId.toLowerCase().includes(search.toLowerCase());
      return matchModule && matchSearch;
    }),
  })).filter(g => g.items.length > 0);

  const markAllRead = () => setNotifList(prev => prev.map(n => ({ ...n, read: true })));
  const unreadCount = notifList.filter(n => !n.read).length;

  const filteredNotifs = notifList.filter(n => {
    if (notifFilter === 'Unread') return !n.read;
    if (notifFilter === 'All') return true;
    return n.type === notifFilter.toLowerCase() || n.type === notifFilter;
  });

  return (
    <div className="space-y-5">
      {/* Tab toggle */}
      <div className="flex gap-2">
        <button onClick={() => setActiveTab('logs')}
          className={cn('flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
            activeTab === 'logs' ? 'bg-[#004643] text-white' : 'bg-white border border-[#C8E0DE] text-[#527270] hover:bg-[#EBF7F6]')}>
          <Filter className="w-4 h-4" /> Activity Logs
        </button>
        <button onClick={() => setActiveTab('notifications')}
          className={cn('flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
            activeTab === 'notifications' ? 'bg-[#004643] text-white' : 'bg-white border border-[#C8E0DE] text-[#527270] hover:bg-[#EBF7F6]')}>
          <Bell className="w-4 h-4" /> Notifications
          {unreadCount > 0 && (
            <span className={cn('px-1.5 py-0.5 rounded-full text-xs', activeTab === 'notifications' ? 'bg-white/20 text-white' : 'bg-[#C0392B] text-white')}>
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {activeTab === 'logs' && (
        <>
          {/* Filter bar */}
          <div className="bg-white rounded-xl p-4 border border-[#C8E0DE]/60 flex flex-wrap gap-3 items-center"
            style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#527270]" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search activities..."
                className="w-full pl-9 pr-4 py-2 border border-[#C8E0DE] rounded-lg text-sm focus:outline-none focus:border-[#004643] focus:ring-2 focus:ring-[#004643]/20 transition-all" />
            </div>
            <div className="flex rounded-lg overflow-hidden border border-[#C8E0DE]">
              {moduleFilters.map(m => (
                <button key={m} onClick={() => setModuleFilter(m)}
                  className={cn(
                    'px-3 py-2 text-xs transition-colors whitespace-nowrap',
                    moduleFilter === m ? 'bg-[#004643] text-white' : 'bg-white text-[#527270] hover:bg-[#EBF7F6]'
                  )}>
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Timeline */}
          <div className="space-y-6">
            {filteredGroups.map(({ date, items }) => (
              <div key={date}>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-xs font-semibold text-[#527270] uppercase tracking-wide">{date}</span>
                  <div className="flex-1 h-px bg-[#C8E0DE]" />
                </div>
                <div className="bg-white rounded-xl border border-[#C8E0DE]/60 overflow-hidden divide-y divide-[#D8EDEB]"
                  style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
                  {items.map(act => (
                    <div key={act.id} className="flex items-start gap-4 px-5 py-4 hover:bg-[#EBF7F6] transition-colors">
                      <div className="w-1 h-10 rounded-full flex-shrink-0 mt-0.5" style={{ background: act.color }} />
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0"
                        style={{ background: act.color }}>
                        {act.actorInitials}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-[#0D1F1E]">
                          <span className="font-semibold">{act.actor}</span>{' '}
                          {act.action}{' '}
                          <span className="font-medium text-[#004643]">{act.moduleId}</span>
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs px-1.5 py-0.5 rounded" style={{ color: act.color, background: act.bg }}>
                            {act.type}
                          </span>
                          <span className="text-xs text-[#527270]">{act.time} · {act.date}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {activeTab === 'notifications' && (
        <>
          <div className="flex items-center justify-between">
            <div className="flex rounded-lg overflow-hidden border border-[#C8E0DE]">
              {['All', 'Unread', 'RFQ', 'Approvals', 'Invoice'].map(f => (
                <button key={f} onClick={() => setNotifFilter(f)}
                  className={cn(
                    'px-3 py-2 text-xs transition-colors whitespace-nowrap',
                    notifFilter === f ? 'bg-[#004643] text-white' : 'bg-white text-[#527270] hover:bg-[#EBF7F6]'
                  )}>
                  {f}
                </button>
              ))}
            </div>
            <button onClick={markAllRead} className="text-xs text-[#004643] hover:underline">Mark all as read</button>
          </div>

          <div className="bg-white rounded-xl border border-[#C8E0DE]/60 overflow-hidden divide-y divide-[#D8EDEB]"
            style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
            {filteredNotifs.map(n => {
              const cfg = notifIconMap[n.type as keyof typeof notifIconMap];
              const Icon = cfg.icon;
              return (
                <div key={n.id} className={cn('flex items-start gap-4 px-5 py-4 hover:bg-[#EBF7F6] transition-colors', !n.read && 'bg-[#D4EEEC]/40')}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: cfg.bg }}>
                    <Icon className="w-4 h-4" style={{ color: cfg.color }} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-[#0D1F1E] text-sm">{n.title}</p>
                      {!n.read && <span className="w-2 h-2 rounded-full bg-[#004643]" />}
                    </div>
                    <p className="text-xs text-[#527270] mt-0.5">{n.desc}</p>
                    <p className="text-xs text-[#527270] mt-1 opacity-70">{n.time} ago</p>
                  </div>
                  <button onClick={() => setNotifList(prev => prev.filter(x => x.id !== n.id))}
                    className="p-1 rounded hover:bg-[#D8EDEB] text-[#527270] transition-colors flex-shrink-0">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
            {filteredNotifs.length === 0 && (
              <div className="py-12 text-center">
                <Bell className="w-10 h-10 text-[#C8E0DE] mx-auto mb-3" />
                <p className="font-medium text-[#0D1F1E]">All caught up!</p>
                <p className="text-sm text-[#527270] mt-1">No notifications to show</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
