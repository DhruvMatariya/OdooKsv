import { Bell, Search, LogOut, User, Settings } from 'lucide-react';
import { useState } from 'react';
import { cn } from './ui/utils';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  pageTitle: string;
}

const notifications = [
  { id: 1, title: 'New quotation received', desc: 'TechParts Ltd submitted a quotation for RFQ-2024-089', time: '5m ago', read: false },
  { id: 2, title: 'Approval required', desc: 'PO-2024-142 is pending your approval', time: '1h ago', read: false },
  { id: 3, title: 'Invoice paid', desc: 'INV-2024-056 marked as paid by Zenith Supplies', time: '3h ago', read: true },
  { id: 4, title: 'RFQ deadline approaching', desc: 'RFQ-2024-087 closes in 24 hours', time: '5h ago', read: true },
];

export function Navbar({ pageTitle }: NavbarProps) {
  const { user, logout } = useAuth();
  const [showNotifs, setShowNotifs] = useState(false);
  const [showUser, setShowUser] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="h-16 bg-white border-b border-[#C8E0DE] flex items-center px-6 gap-4 sticky top-0 z-20"
      style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
      <div className="flex-1">
        <h1 className="text-[#0D1F1E] font-semibold" style={{ fontSize: 18 }}>{pageTitle}</h1>
      </div>

      {/* Search */}
      <div className="relative hidden md:flex items-center">
        <Search className="absolute left-3 w-4 h-4 text-[#527270]" />
        <input
          type="text"
          placeholder="Search anything..."
          className="pl-9 pr-4 py-2 bg-[#EBF7F6] border border-[#C8E0DE] rounded-lg text-sm text-[#0D1F1E] placeholder:text-[#527270] focus:outline-none focus:border-[#004643] focus:ring-2 focus:ring-[#004643]/20 w-64 transition-all"
        />
      </div>

      {/* Notifications */}
      <div className="relative">
        <button
          onClick={() => { setShowNotifs(!showNotifs); setShowUser(false); }}
          className="relative w-9 h-9 flex items-center justify-center rounded-lg hover:bg-[#EBF7F6] text-[#527270] hover:text-[#0D1F1E] transition-colors"
        >
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
              <button className="text-xs text-[#004643] hover:underline">Mark all read</button>
            </div>
            <div className="divide-y divide-[#D8EDEB] max-h-72 overflow-y-auto">
              {notifications.map(n => (
                <div key={n.id} className={cn('px-4 py-3 hover:bg-[#EBF7F6] cursor-pointer', !n.read && 'bg-[#D4EEEC]/50')}>
                  <div className="flex items-start gap-2">
                    {!n.read && <span className="mt-1.5 w-2 h-2 bg-[#004643] rounded-full flex-shrink-0" />}
                    {n.read && <span className="mt-1.5 w-2 h-2 rounded-full flex-shrink-0" />}
                    <div>
                      <p className="text-sm font-medium text-[#0D1F1E]">{n.title}</p>
                      <p className="text-xs text-[#527270] mt-0.5">{n.desc}</p>
                      <p className="text-xs text-[#527270] mt-1 opacity-70">{n.time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* User dropdown */}
      <div className="relative">
        <button
          onClick={() => { setShowUser(!showUser); setShowNotifs(false); }}
          className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-[#EBF7F6] transition-colors"
        >
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold" style={{ fontSize: 13, background: '#004643' }}>
            {user?.avatarInitials || 'U'}
          </div>
        </button>

        {showUser && (
          <div className="absolute right-0 top-11 w-48 bg-white border border-[#C8E0DE] rounded-xl shadow-lg z-50 overflow-hidden py-1">
            <button className="flex items-center gap-2 px-4 py-2.5 w-full hover:bg-[#EBF7F6] text-sm text-[#0D1F1E]">
              <User className="w-4 h-4 text-[#527270]" /> My Profile
            </button>
            <button className="flex items-center gap-2 px-4 py-2.5 w-full hover:bg-[#EBF7F6] text-sm text-[#0D1F1E]">
              <Settings className="w-4 h-4 text-[#527270]" /> Settings
            </button>
            <div className="h-px bg-[#C8E0DE] mx-2 my-1" />
            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2.5 w-full hover:bg-[#FDECEA] text-sm text-[#C0392B]"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
