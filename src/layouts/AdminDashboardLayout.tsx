import React, { useState } from 'react';
import { 
  BarChart3, 
  FileText, 
  Settings, 
  User, 
  Home,
  Shield,
  Users,
  Mail,
  Lock,
  FileCheck,
  ChevronDown,
  ChevronRight,
  Menu,
  ClipboardCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLocation, Link } from 'react-router-dom';
import { useUserProfile } from '@/hooks/useUserProfile';
import UserMenuDropdown from '@/components/ui/UserMenuDropdown';
import { NotificationBell } from '@/components/dashboard/NotificationBell';
import { usePendingAccessRequests } from '@/hooks/usePendingAccessRequests';
import { Breadcrumbs, BreadcrumbItem } from '@/components/navigation/Breadcrumbs';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

interface NavItem {
  id: string;
  label: string;
  icon: any;
  path: string;
  badge?: number;
  badgeColor?: string;
  submenu?: NavItem[];
}

interface AdminDashboardLayoutProps {
  children: React.ReactNode;
  activeTab?: string;
  breadcrumbs?: BreadcrumbItem[];
}

const AdminDashboardLayout = ({ children, activeTab = 'dashboard', breadcrumbs }: AdminDashboardLayoutProps) => {
  const [settingsExpanded, setSettingsExpanded] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { profile, getDisplayName, getRoleDisplayName, loading } = useUserProfile();
  const { count: pendingAccessCount } = usePendingAccessRequests();

  const isDemo = location.pathname === '/demo';

  // Helper function to determine if nav item is active
  const isNavItemActive = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    if (path === '/deals') {
      return location.pathname.startsWith('/deals') || location.pathname.startsWith('/deal/');
    }
    if (path === '/documents') {
      return location.pathname === '/documents' || location.pathname.startsWith('/documents');
    }
    if (path === '/dashboard/diligence-tracker') {
      return location.pathname.startsWith('/dashboard/diligence-tracker');
    }
    if (path === '/dashboard/access-requests') {
      return location.pathname.includes('access-requests');
    }
    if (path === '/dashboard/ndas') {
      return location.pathname.includes('/dashboard/ndas');
    }
    if (path === '/investor-invitations') {
      return location.pathname === '/investor-invitations';
    }
    return location.pathname === path;
  };

  // Admin/Broker navigation (8 items) - ALWAYS show admin nav
  const navigationItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/dashboard' },
    { id: 'deals', label: 'Deals', icon: BarChart3, path: '/deals' },
    { id: 'diligence-tracker', label: 'Diligence Tracker', icon: ClipboardCheck, path: '/dashboard/diligence-tracker' },
    { id: 'documents', label: 'Documents', icon: FileText, path: '/documents' },
    { id: 'access-requests', label: 'Access Requests', icon: Lock, path: '/dashboard/access-requests', badge: pendingAccessCount, badgeColor: 'bg-orange-500' },
    { id: 'ndas', label: 'Signed NDAs', icon: FileCheck, path: '/dashboard/ndas' },
    { id: 'investor-relations', label: 'Investor Relations', icon: Mail, path: '/investor-invitations' },
    { 
      id: 'settings', 
      label: 'Settings', 
      icon: Settings, 
      path: '/settings',
      submenu: [
        { id: 'user-management', label: 'User Management', path: '/users', icon: Users },
        { id: 'nda-config', label: 'NDA Configuration', path: '/dashboard/nda-settings', icon: Shield },
        { id: 'platform-settings', label: 'Platform Settings', path: '/settings', icon: Settings },
      ]
    },
  ];

  // Sidebar content component
  const SidebarContent = ({ onNavigate }: { onNavigate?: () => void }) => (
    <div className="p-6 h-full flex flex-col">
      {/* Logo Area */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-[#D4AF37] mb-2">
          {isDemo ? 'M&A Portal (Demo)' : 'M&A Portal'}
        </h2>
        <p className="text-sm text-[#F4E4BC]/60">Admin Dashboard</p>
      </div>

      {/* User Info */}
      <div className="bg-[#2A2F3A]/60 rounded-xl p-4 mb-6 border border-[#D4AF37]/20">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-[#D4AF37] to-[#F4E4BC] rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-[#0A0F0F]" />
          </div>
          <div>
            <div className="text-[#FAFAFA] font-medium">
              {isDemo ? 'Demo User' : (loading ? 'Loading...' : getDisplayName())}
            </div>
            <div className="text-[#F4E4BC]/60 text-sm">
              {isDemo ? 'Demo Viewer' : (loading ? 'Loading...' : getRoleDisplayName())}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="space-y-1 flex-1">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = isNavItemActive(item.path);
          const hasSubmenu = 'submenu' in item && item.submenu;
          
          if (hasSubmenu) {
            return (
              <div key={item.id}>
                <button
                  onClick={() => setSettingsExpanded(!settingsExpanded)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
                    location.pathname.includes('/settings') || location.pathname.includes('/users') || location.pathname.includes('/nda-settings')
                      ? 'bg-gradient-to-r from-[#D4AF37]/20 to-[#F4E4BC]/10 text-[#D4AF37]' 
                      : 'text-[#F4E4BC] hover:bg-[#D4AF37]/10 hover:text-[#D4AF37]'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium flex-1 text-left">{item.label}</span>
                  {settingsExpanded ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </button>
                
                {settingsExpanded && item.submenu && (
                  <div className="ml-4 mt-1 space-y-1">
                    {item.submenu.map((subItem) => {
                      const SubIcon = subItem.icon;
                      const isSubActive = isNavItemActive(subItem.path);
                      return (
                        <Link
                          key={subItem.id}
                          to={subItem.path}
                          onClick={onNavigate}
                          className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition-all duration-300 ${
                            isSubActive
                              ? 'bg-[#D4AF37]/10 text-[#D4AF37]'
                              : 'text-[#F4E4BC]/80 hover:bg-[#D4AF37]/5 hover:text-[#D4AF37]'
                          }`}
                        >
                          <SubIcon className="w-4 h-4" />
                          <span className="text-sm">{subItem.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }
          
          return (
            <Link
              key={item.id}
              to={item.path}
              onClick={onNavigate}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
                isActive 
                  ? 'bg-gradient-to-r from-[#D4AF37]/20 to-[#F4E4BC]/10 text-[#D4AF37]' 
                  : 'text-[#F4E4BC] hover:bg-[#D4AF37]/10 hover:text-[#D4AF37]'
              }`}
            >
              <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-[#D4AF37]' : 'group-hover:text-[#D4AF37]'}`} />
              <span className="font-medium">{item.label}</span>
              {item.badge && item.badge > 0 && (
                <Badge className={`ml-auto text-[#0A0F0F] text-xs ${item.badgeColor || 'bg-[#D4AF37]'}`}>
                  {item.badge}
                </Badge>
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar - Fixed position - KEEP DARK */}
      <div className="w-64 bg-gradient-to-b from-[#0A0F0F] to-[#1A1F2E] border-r border-[#D4AF37]/30 hidden lg:block fixed left-0 top-0 h-screen overflow-y-auto z-40">
        <SidebarContent />
      </div>

      {/* Mobile Menu Button - Fixed position */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button 
              variant="outline" 
              size="icon" 
              className="bg-[#0A0F0F] border-[#D4AF37]/30 text-[#D4AF37] hover:bg-[#D4AF37]/10"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0 bg-gradient-to-b from-[#0A0F0F] to-[#1A1F2E] border-r border-[#D4AF37]/30">
            <SidebarContent onNavigate={() => setMobileMenuOpen(false)} />
          </SheetContent>
        </Sheet>
      </div>

      {/* Main Content - With left margin for sidebar */}
      <div className="flex-1 lg:ml-64 overflow-auto bg-background">
        {/* Header - Light theme */}
        <div className="bg-card border-b border-border p-4 lg:p-6 sticky top-0 z-30">
          <div className="flex justify-end items-center">
            <div className="flex items-center gap-3">
              <NotificationBell />
              <UserMenuDropdown />
            </div>
          </div>
        </div>
        
        {/* Breadcrumbs - Below header, above page content */}
        <div className="px-4 lg:px-6 pt-4 lg:pt-6 bg-background">
          <Breadcrumbs items={breadcrumbs} />
        </div>
        
        {/* Page Content */}
        <div className="p-4 lg:p-6 pt-0 lg:pt-0 bg-background">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardLayout;