import { useState } from 'react';
import { AuthProvider, useAuth, type UserRole } from './context/AuthContext';
import { Sidebar, type Page } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { Login } from './components/Login';
import { Dashboard } from './components/Dashboard';
import { VendorManagement } from './components/VendorManagement';
import { RFQList } from './components/RFQList';
import { RFQCreate } from './components/RFQCreate';
import { QuotationComparison } from './components/QuotationComparison';
import { ApprovalWorkflow } from './components/ApprovalWorkflow';
import { PurchaseOrders } from './components/PurchaseOrders';
import { ActivityLogs } from './components/ActivityLogs';
import { Reports } from './components/Reports';
import { VendorRFQs, VendorQuotations, VendorOrders } from './components/VendorPortal';
import { ManagerApprovals, ManagerMonitor } from './components/ManagerView';
import { UserManagement } from './components/UserManagement';

// ─── Page title map ──────────────────────────────────────────────────────────

const pageTitles: Record<string, string> = {
  dashboard: 'Dashboard',
  vendors: 'Vendors',
  'rfq-list': 'RFQs',
  'rfq-create': 'Create RFQ',
  quotations: 'Compare Quotations',
  approvals: 'Approval Requests',
  'purchase-orders': 'Purchase Orders',
  invoices: 'Invoices',
  reports: 'Reports & Analytics',
  'activity-logs': 'Activity Logs',
  'vendor-rfqs': 'Active RFQs',
  'vendor-quotations': 'My Quotations',
  'vendor-orders': 'Purchase Orders',
  'manager-approvals': 'Approval Queue',
  'manager-monitor': 'Procurement Monitor',
  'user-management': 'User Management',
  settings: 'Settings',
};

// ─── Default page per role ───────────────────────────────────────────────────

const defaultPage: Record<UserRole, Page> = {
  procurement: 'dashboard',
  vendor: 'vendor-rfqs',
  manager: 'manager-approvals',
  admin: 'user-management',
};

// ─── Settings page (shared) ──────────────────────────────────────────────────

function SettingsPage() {
  const { user } = useAuth();
  return (
    <div className="max-w-2xl space-y-5">
      <div className="bg-white rounded-xl border border-[#C8E0DE]/60 p-6"
        style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
        <h3 className="font-semibold text-[#0D1F1E] mb-5">Profile Settings</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#0D1F1E] mb-1.5">First Name</label>
              <input type="text" defaultValue={user?.firstName || ''}
                className="w-full px-3 py-2.5 border border-[#C8E0DE] rounded-lg text-sm focus:outline-none focus:border-[#004643] focus:ring-2 focus:ring-[#004643]/20 transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#0D1F1E] mb-1.5">Last Name</label>
              <input type="text" defaultValue={user?.lastName || ''}
                className="w-full px-3 py-2.5 border border-[#C8E0DE] rounded-lg text-sm focus:outline-none focus:border-[#004643] focus:ring-2 focus:ring-[#004643]/20 transition-all" />
            </div>
          </div>
          {[
            { label: 'Email Address', value: user?.email || '' },
            { label: 'Phone Number', value: user?.phone || '' },
            { label: 'Country', value: user?.country || '' },
          ].map(f => (
            <div key={f.label}>
              <label className="block text-sm font-medium text-[#0D1F1E] mb-1.5">{f.label}</label>
              <input type="text" defaultValue={f.value}
                className="w-full px-3 py-2.5 border border-[#C8E0DE] rounded-lg text-sm focus:outline-none focus:border-[#004643] focus:ring-2 focus:ring-[#004643]/20 transition-all" />
            </div>
          ))}
        </div>
        <button className="mt-5 px-5 py-2.5 rounded-lg text-sm font-medium text-white"
          style={{ background: 'linear-gradient(135deg, #004643, #00706A)' }}>
          Save Changes
        </button>
      </div>

      <div className="bg-white rounded-xl border border-[#C8E0DE]/60 p-6"
        style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
        <h3 className="font-semibold text-[#0D1F1E] mb-4">Change Password</h3>
        <div className="space-y-4">
          {['Current Password', 'New Password', 'Confirm New Password'].map(f => (
            <div key={f}>
              <label className="block text-sm font-medium text-[#0D1F1E] mb-1.5">{f}</label>
              <input type="password" placeholder="••••••••"
                className="w-full px-3 py-2.5 border border-[#C8E0DE] rounded-lg text-sm focus:outline-none focus:border-[#004643] focus:ring-2 focus:ring-[#004643]/20 transition-all" />
            </div>
          ))}
        </div>
        <button className="mt-5 px-5 py-2.5 rounded-lg text-sm font-medium border border-[#C8E0DE] text-[#527270] hover:bg-[#EBF7F6] transition-colors">
          Update Password
        </button>
      </div>
    </div>
  );
}

// ─── Authenticated App Shell ─────────────────────────────────────────────────

function AppShell() {
  const { user } = useAuth();
  const role = user!.role;
  const [currentPage, setCurrentPage] = useState<Page>(defaultPage[role]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const navigate = (page: Page) => setCurrentPage(page);
  const sidebarWidth = sidebarCollapsed ? 72 : 240;

  const renderPage = () => {
    switch (currentPage) {
      // ── Procurement Officer ──
      case 'dashboard': return <Dashboard onNavigate={navigate} />;
      case 'vendors': return <VendorManagement />;
      case 'rfq-list': return <RFQList onNavigate={navigate} />;
      case 'rfq-create': return <RFQCreate onNavigate={navigate} />;
      case 'quotations': return <QuotationComparison />;
      case 'approvals': return <ApprovalWorkflow />;
      case 'purchase-orders': return <PurchaseOrders />;
      case 'invoices': return <PurchaseOrders />;
      case 'reports': return <Reports />;
      case 'activity-logs': return <ActivityLogs />;

      // ── Vendor ──
      case 'vendor-rfqs': return <VendorRFQs onNavigate={navigate} />;
      case 'vendor-quotations': return <VendorQuotations />;
      case 'vendor-orders': return <VendorOrders />;

      // ── Manager ──
      case 'manager-approvals': return <ManagerApprovals />;
      case 'manager-monitor': return <ManagerMonitor />;

      // ── Admin ──
      case 'user-management': return <UserManagement />;

      // ── Common ──
      case 'settings': return <SettingsPage />;

      default: return <Dashboard onNavigate={navigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F6F5]" style={{ fontFamily: 'Poppins, sans-serif' }}>
      <Sidebar
        currentPage={currentPage}
        onNavigate={navigate}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <div
        className="transition-all duration-300 ease-in-out flex flex-col min-h-screen"
        style={{ marginLeft: sidebarWidth }}>
        <Navbar pageTitle={pageTitles[currentPage] || 'VendorBridge'} />

        <main className="flex-1 p-6 lg:p-8">
          {/* Context-aware banners */}
          {currentPage === 'rfq-list' && role === 'procurement' && (
            <div className="mb-5 p-3.5 bg-[#D4EEEC] border border-[#004643]/20 rounded-xl flex items-center gap-3">
              <div className="w-1 h-9 bg-[#004643] rounded-full" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-[#0D1F1E]">RFQ-2024-088 is ready for comparison</p>
                <p className="text-xs text-[#527270]">6 quotations received from 3 vendors — compare and proceed</p>
              </div>
              <button onClick={() => navigate('quotations')}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-[#004643] border border-[#004643]/30 hover:bg-[#004643] hover:text-white transition-all whitespace-nowrap">
                Compare Now →
              </button>
            </div>
          )}

          {currentPage === 'manager-approvals' && (
            <div className="mb-5 p-3.5 bg-[#FFF0C8] border border-[#9A6800]/20 rounded-xl flex items-center gap-3">
              <div className="w-1 h-9 bg-[#9A6800] rounded-full" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-[#0D1F1E]">3 requests pending your approval</p>
                <p className="text-xs text-[#527270]">Including 1 high-priority item over ₹10L</p>
              </div>
            </div>
          )}

          {renderPage()}
        </main>
      </div>
    </div>
  );
}

// ─── Root App ────────────────────────────────────────────────────────────────

function AppInner() {
  const { user } = useAuth();
  return user ? <AppShell /> : (
    <div style={{ fontFamily: 'Poppins, sans-serif' }}>
      <Login />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}
