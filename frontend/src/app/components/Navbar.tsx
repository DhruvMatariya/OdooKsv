import { Bell, Search, LogOut, User, Settings } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from './ui/utils';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';

interface NavbarProps {
  pageTitle: string;
  onNavigate?: (page: string) => void;
}

interface ActivityNotif {
  id: string;
  action: string;
  description: string;
  createdAt: string;
}

export function Navbar({ pageTitle, onNavigate }: NavbarProps) {
  const { user, logout } = useAuth();
  const [showNotifs, setShowNotifs] = useState(false);
  const [showUser, setShowUser] = useState(false);
  const [notifications, setNotifications] = useState<ActivityNotif[]>([]);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    api.get<{ items: ActivityNotif[] }>('/activity-logs?limit=6')
      .then(data => setNotifications(data.items || []))
      .catch(() => setNotifications([]));
  }, []);

  const unreadCount = notifications.filter(n => !readIds.has(n.id)).length;

  const markAllRead = () => setReadIds(new Set(notifications.map(n => n.id)));

  return (
    <header className="h-16 bg-white border-b border-[#C8E0DE] flex items-center px-6 gap-4 sticky top-0 z-20"
      style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
      <div className="flex-1">
        <h1 className="text-[#0D1F1E] font-semibold" style={{ fontSize: 18 }}>{pageTitle}</h1>
      </div>

      <div className="relative hidden md:flex items-center">
        <Search className="absolute left-3 w-4 h-4 text-[#527270]" />
        <input type="text" placeholder="Search anything..."
          className="pl-9 pr-4 py-2 bg-[#EBF7F6] border border-[#C8E0DE] rounded-lg text-sm text-[#0D1F1E] placeholder:text-[#527270] focus:outline-none focus:border-[#004643] focus:ring-2 focus:ring-[#004643]/20 w-64 transition-all" />
      </div>

      <div className="relative">
        <button onClick={() => { setShowNotifs(!showNotifs); setShowUser(false); }}
          className="relative w-9 h-9 flex items-center justify-center rounded-lg hover:bg-[#EBF7F6] text-[#527270] hover:text-[#0D1F1E] transition-colors">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-[#C0392B] rounded-full flex items-center justify-center text-white" style={{ fontSize: 9 }}>
              {unreadCount}
            </span>
          )}
        </button>

        {showNotifs && (
          <div className="absolute right-0 top-11 w-80 bg-white border border-[#C8E0DE] rounded-xl shadow-lg z-50 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#C8E0DE]">
              <span className="font-semibold text-[#0D1F1E] text-sm">Notifications</span>
              <button onClick={markAllRead} className="text-xs text-[#004643] hover:underline">Mark all read</button>
            </div>
            <div className="divide-y divide-[#D8EDEB] max-h-72 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="px-4 py-6 text-sm text-[#527270] text-center">No recent activity</p>
              ) : notifications.map(n => (
                <div key={n.id} className={cn('px-4 py-3 hover:bg-[#EBF7F6] cursor-pointer', !readIds.has(n.id) && 'bg-[#D4EEEC]/50')}>
                  <div className="flex items-start gap-2">
                    {!readIds.has(n.id) && <span className="mt-1.5 w-2 h-2 bg-[#004643] rounded-full flex-shrink-0" />}
                    {readIds.has(n.id) && <span className="mt-1.5 w-2 h-2 rounded-full flex-shrink-0" />}
                    <div>
                      <p className="text-sm font-medium text-[#0D1F1E]">{n.action.replace(/_/g, ' ')}</p>
                      <p className="text-xs text-[#527270] mt-0.5">{n.description}</p>
                      <p className="text-xs text-[#527270] mt-1 opacity-70">
                        {new Date(n.createdAt).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="relative">
        <button onClick={() => { setShowUser(!showUser); setShowNotifs(false); }}
          className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-lg hover:bg-[#EBF7F6] transition-colors">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold"
            style={{ background: 'linear-gradient(135deg, #004643, #00706A)' }}>
            {user?.avatarInitials || 'U'}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-sm font-medium text-[#0D1F1E] leading-tight">{user?.firstName} {user?.lastName}</p>
            <p className="text-xs text-[#527270] capitalize">{user?.role}</p>
          </div>
        </button>

        {showUser && (
          <div className="absolute right-0 top-11 w-48 bg-white border border-[#C8E0DE] rounded-xl shadow-lg z-50 overflow-hidden py-1">
            <button onClick={() => { onNavigate?.('settings'); setShowUser(false); }}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#0D1F1E] hover:bg-[#EBF7F6] transition-colors">
              <Settings className="w-4 h-4 text-[#527270]" /> Settings
            </button>
            <button onClick={() => { onNavigate?.('settings'); setShowUser(false); }}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#0D1F1E] hover:bg-[#EBF7F6] transition-colors">
              <User className="w-4 h-4 text-[#527270]" /> Profile
            </button>
            <div className="border-t border-[#D8EDEB] my-1" />
            <button onClick={logout}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#C0392B] hover:bg-[#FDECEA] transition-colors">
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
