import { useState, useEffect, useCallback } from 'react';
import { Search, Filter, Bell, CheckCircle, AlertTriangle, Info, Loader2, AlertCircle } from 'lucide-react';
import { cn } from './ui/utils';
import { api } from '../lib/api';

interface ActivityItem {
  id: string;
  action: string;
  entity: string;
  entityId: string;
  description: string;
  createdAt: string;
  user: { firstName: string; lastName: string };
}

const entityColors: Record<string, { color: string; bg: string }> = {
  RFQ: { color: '#004643', bg: '#D4EEEC' },
  Rfq: { color: '#004643', bg: '#D4EEEC' },
  PurchaseOrder: { color: '#00706A', bg: '#D4EEEC' },
  Invoice: { color: '#004643', bg: '#D4EEEC' },
  Vendor: { color: '#9A6800', bg: '#FFF0C8' },
  Approval: { color: '#9A6800', bg: '#FFF0C8' },
  Quotation: { color: '#004643', bg: '#D4EEEC' },
  User: { color: '#527270', bg: '#D8EDEB' },
};

const moduleFilters = ['All', 'RFQ', 'Rfq', 'PurchaseOrder', 'Invoice', 'Vendor', 'Approval', 'Quotation'];

function formatDateGroup(date: Date): string {
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  if (date > weekAgo) return 'This Week';
  return date.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
}

function getInitials(first: string, last: string) {
  return `${first?.[0] || ''}${last?.[0] || ''}`.toUpperCase() || 'SY';
}

export function ActivityLogs() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [moduleFilter, setModuleFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'logs' | 'notifications'>('logs');

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const entity = moduleFilter !== 'All' ? `&entity=${moduleFilter}` : '';
      const data = await api.get<{ items: ActivityItem[] }>(`/activity-logs?limit=50${entity}`);
      setActivities(data.items || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load activity logs');
    } finally {
      setLoading(false);
    }
  }, [moduleFilter]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const filtered = activities.filter(act => {
    const actor = `${act.user?.firstName || ''} ${act.user?.lastName || ''}`.trim();
    const q = search.toLowerCase();
    return actor.toLowerCase().includes(q) ||
      act.description.toLowerCase().includes(q) ||
      act.entity.toLowerCase().includes(q) ||
      act.action.toLowerCase().includes(q);
  });

  const grouped = filtered.reduce((acc, act) => {
    const date = formatDateGroup(new Date(act.createdAt));
    if (!acc[date]) acc[date] = [];
    acc[date].push(act);
    return acc;
  }, {} as Record<string, ActivityItem[]>);

  const notifIconMap = {
    success: { icon: CheckCircle, color: '#00706A', bg: '#D4EEEC' },
    warning: { icon: AlertTriangle, color: '#9A6800', bg: '#FFF0C8' },
    info: { icon: Info, color: '#004643', bg: '#D4EEEC' },
  };

  const notifications = activities.slice(0, 8).map((act, i) => ({
    id: act.id,
    type: act.action.includes('REJECT') ? 'warning' as const : act.action.includes('APPROV') || act.action.includes('PAID') ? 'success' as const : 'info' as const,
    title: act.action.replace(/_/g, ' '),
    desc: act.description,
    time: new Date(act.createdAt).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }),
    read: i > 2,
  }));

  return (
    <div className="space-y-5">
      <div className="flex gap-2">
        <button onClick={() => setActiveTab('logs')}
          className={cn('flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
            activeTab === 'logs' ? 'bg-[#004643] text-white' : 'bg-white border border-[#C8E0DE] text-[#527270] hover:bg-[#EBF7F6]')}>
          <Filter className="w-4 h-4" /> Activity Logs
        </button>
        <button onClick={() => setActiveTab('notifications')}
          className={cn('flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
            activeTab === 'notifications' ? 'bg-[#004643] text-white' : 'bg-white border border-[#C8E0DE] text-[#527270] hover:bg-[#EBF7F6]')}>
          <Bell className="w-4 h-4" /> Recent Activity
        </button>
      </div>

      {activeTab === 'logs' && (
        <>
          <div className="bg-white rounded-xl p-4 border border-[#C8E0DE]/60 flex flex-wrap gap-3 items-center"
            style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#527270]" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search activities..."
                className="w-full pl-9 pr-4 py-2 border border-[#C8E0DE] rounded-lg text-sm focus:outline-none focus:border-[#004643] focus:ring-2 focus:ring-[#004643]/20 transition-all" />
            </div>
            <div className="flex rounded-lg overflow-hidden border border-[#C8E0DE] flex-wrap">
              {moduleFilters.map(m => (
                <button key={m} onClick={() => setModuleFilter(m)}
                  className={cn('px-3 py-2 text-xs transition-colors whitespace-nowrap',
                    moduleFilter === m ? 'bg-[#004643] text-white' : 'bg-white text-[#527270] hover:bg-[#EBF7F6]')}>
                  {m === 'All' ? 'All' : m}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-[#527270]">
              <Loader2 className="w-8 h-8 animate-spin mb-2" />
              <p>Loading activity logs...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 text-red-500">
              <AlertCircle className="w-8 h-8 mb-2" />
              <p>{error}</p>
            </div>
          ) : Object.keys(grouped).length === 0 ? (
            <div className="bg-white rounded-xl border border-[#C8E0DE]/60 p-12 text-center text-[#527270]">
              No activity recorded yet.
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(grouped).map(([date, items]) => (
                <div key={date}>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-xs font-semibold text-[#527270] uppercase tracking-wide">{date}</span>
                    <div className="flex-1 h-px bg-[#C8E0DE]" />
                  </div>
                  <div className="bg-white rounded-xl border border-[#C8E0DE]/60 overflow-hidden divide-y divide-[#D8EDEB]"
                    style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
                    {items.map(act => {
                      const colors = entityColors[act.entity] || { color: '#527270', bg: '#D8EDEB' };
                      const actor = `${act.user?.firstName || 'System'} ${act.user?.lastName || ''}`.trim();
                      const time = new Date(act.createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
                      return (
                        <div key={act.id} className="flex items-start gap-4 px-5 py-4 hover:bg-[#EBF7F6] transition-colors">
                          <div className="w-1 h-10 rounded-full flex-shrink-0 mt-0.5" style={{ background: colors.color }} />
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0"
                            style={{ background: colors.color }}>
                            {getInitials(act.user?.firstName, act.user?.lastName)}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-[#0D1F1E]">
                              <span className="font-semibold">{actor}</span> — {act.description}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs px-1.5 py-0.5 rounded" style={{ color: colors.color, background: colors.bg }}>
                                {act.entity}
                              </span>
                              <span className="text-xs text-[#527270]">{time} · {date}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === 'notifications' && (
        <div className="bg-white rounded-xl border border-[#C8E0DE]/60 overflow-hidden divide-y divide-[#D8EDEB]"
          style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
          {notifications.length === 0 ? (
            <div className="py-12 text-center">
              <Bell className="w-10 h-10 text-[#C8E0DE] mx-auto mb-3" />
              <p className="font-medium text-[#0D1F1E]">No recent activity</p>
            </div>
          ) : notifications.map(n => {
            const cfg = notifIconMap[n.type];
            const Icon = cfg.icon;
            return (
              <div key={n.id} className={cn('flex items-start gap-4 px-5 py-4 hover:bg-[#EBF7F6] transition-colors', !n.read && 'bg-[#D4EEEC]/40')}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: cfg.bg }}>
                  <Icon className="w-4 h-4" style={{ color: cfg.color }} />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-[#0D1F1E] text-sm">{n.title}</p>
                  <p className="text-xs text-[#527270] mt-0.5">{n.desc}</p>
                  <p className="text-xs text-[#527270] mt-1 opacity-70">{n.time}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
