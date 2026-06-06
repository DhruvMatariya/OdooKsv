import {
  LayoutDashboard, Users, FileText, MessageSquare, CheckSquare,
  ShoppingCart, Receipt, BarChart2, Activity, Settings,
  ChevronLeft, ChevronRight, UserCog, Send
} from 'lucide-react';
import { cn } from './ui/utils';
import { useAuth, type UserRole } from '../context/AuthContext';

export type Page =
  | 'dashboard'
  | 'vendors' | 'rfq-list' | 'rfq-create' | 'quotations'
  | 'approvals' | 'purchase-orders' | 'invoices'
  | 'reports' | 'activity-logs'
  | 'vendor-rfqs' | 'vendor-quotations' | 'vendor-orders'
  | 'manager-approvals' | 'manager-monitor'
  | 'user-management'
  | 'settings';

interface NavItem {
  id: Page;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: UserRole[];
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['procurement', 'manager', 'admin'] },
  { id: 'vendors', label: 'Vendors', icon: Users, roles: ['procurement', 'admin'] },
  { id: 'rfq-list', label: 'RFQs', icon: FileText, roles: ['procurement'] },
  { id: 'quotations', label: 'Compare Quotes', icon: MessageSquare, roles: ['procurement'] },
  { id: 'approvals', label: 'Approvals', icon: CheckSquare, roles: ['procurement'] },
  { id: 'purchase-orders', label: 'Purchase Orders', icon: ShoppingCart, roles: ['procurement'] },
  { id: 'invoices', label: 'Invoices', icon: Receipt, roles: ['procurement'] },
  { id: 'reports', label: 'Reports', icon: BarChart2, roles: ['procurement', 'manager', 'admin'] },
  { id: 'activity-logs', label: 'Activity Logs', icon: Activity, roles: ['procurement', 'admin'] },
  { id: 'vendor-rfqs', label: 'Active RFQs', icon: FileText, roles: ['vendor'] },
  { id: 'vendor-quotations', label: 'My Quotations', icon: Send, roles: ['vendor'] },
  { id: 'vendor-orders', label: 'Purchase Orders', icon: ShoppingCart, roles: ['vendor'] },
  { id: 'manager-approvals', label: 'Approvals', icon: CheckSquare, roles: ['manager'] },
  { id: 'manager-monitor', label: 'Procurement Monitor', icon: BarChart2, roles: ['manager'] },
  { id: 'user-management', label: 'User Management', icon: UserCog, roles: ['admin'] },
  { id: 'settings', label: 'Settings', icon: Settings, roles: ['procurement', 'vendor', 'manager', 'admin'] },
];

interface SidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  collapsed: boolean;
  onToggle: () => void;
}

const roleLabels: Record<UserRole, string> = {
  procurement: 'Procurement',
  vendor: 'Vendor Portal',
  manager: 'Manager',
  admin: 'Admin',
};

export function Sidebar({ currentPage, onNavigate, collapsed, onToggle }: SidebarProps) {
  const { user } = useAuth();
  const role = user?.role ?? 'procurement';
  const visibleItems = navItems.filter(item => item.roles.includes(role));

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-full flex flex-col z-30 transition-all duration-300 ease-in-out',
        collapsed ? 'w-[68px]' : 'w-[236px]'
      )}
      style={{ background: '#004643', boxShadow: '2px 0 24px rgba(0,0,0,0.18)' }}>

      {/* Logo */}
      <div className={cn(
        'flex items-center h-16 flex-shrink-0 px-4 border-b',
        collapsed ? 'justify-center' : 'gap-3'
      )} style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
        <div className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center bg-white/15 border border-white/20">
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="font-bold text-white truncate" style={{ fontSize: 15 }}>VendorBridge</p>
            <p className="truncate text-white/50" style={{ fontSize: 10 }}>{roleLabels[role]}</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 overflow-y-auto overflow-x-hidden">
        <div className="flex flex-col gap-0.5 px-2">
          {visibleItems.map(({ id, label, icon: Icon }) => {
            const isActive = currentPage === id;
            return (
              <button
                key={id}
                onClick={() => onNavigate(id)}
                className={cn(
                  'flex items-center gap-3 rounded-lg transition-all duration-150 relative group',
                  collapsed ? 'h-10 w-10 justify-center mx-auto' : 'h-10 px-3 w-full',
                  isActive
                    ? 'bg-white/15 text-white'
                    : 'text-white/55 hover:bg-white/10 hover:text-white/90'
                )}>

                {isActive && !collapsed && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-white" />
                )}

                <Icon className="flex-shrink-0 w-4 h-4" />

                {!collapsed && (
                  <span className="text-sm font-medium truncate">{label}</span>
                )}

                {collapsed && (
                  <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-[#0D1F1E] text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity shadow-lg">
                    {label}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* User info */}
      {/* Removed user info section */}

      {/* Collapse toggle */}
      <div className={cn('p-2 border-t', !collapsed && 'pt-0 border-0')} style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
        <button
          onClick={onToggle}
          className={cn(
            'flex items-center gap-2 rounded-lg h-9 text-white/50 hover:bg-white/10 hover:text-white transition-colors w-full',
            collapsed ? 'justify-center' : 'px-3'
          )}>
          {collapsed ? <ChevronRight className="w-4 h-4" /> : (
            <><ChevronLeft className="w-4 h-4" /><span className="text-sm">Collapse</span></>
          )}
        </button>
      </div>
    </aside>
  );
}
