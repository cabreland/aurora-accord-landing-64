
import React, { useState } from 'react';
import { 
  BarChart3, 
  FileText, 
  Settings, 
  User, 
  Home,
  Shield,
  ArrowLeft,
  Users,
  Mail,
  Lock,
  Heart,
  FileCheck,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useUserProfile } from '@/hooks/useUserProfile';
import { getDashboardRoute } from '@/lib/auth-utils';
import UserMenuDropdown from '@/components/ui/UserMenuDropdown';
import { useUnreadCount } from '@/hooks/useUnreadCount';
import { NotificationBell } from '@/components/dashboard/NotificationBell';
import { usePendingAccessRequests } from '@/hooks/usePendingAccessRequests';

interface NavItem {
  id: string;
  label: string;
  icon: any;
  path: string;
  badge?: number;
  badgeColor?: string;
  submenu?: NavItem[];
}

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

const DashboardLayout = ({ children, activeTab = 'dashboard', onTabChange }: DashboardLayoutProps) => {
  const [internalActiveTab, setInternalActiveTab] = useState(activeTab);
  const [settingsExpanded, setSettingsExpanded] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { profile, getDisplayName, getRoleDisplayName, loading } = useUserProfile();
  const unreadCount = useUnreadCount();
  const { count: pendingAccessCount } = usePendingAccessRequests();

  const isDemo = location.pathname === '/demo';
  const currentActiveTab = onTabChange ? activeTab : internalActiveTab;
  
  const handleTabChange = (tab: string) => {
    if (onTabChange) {
      onTabChange(tab);
    } else {
      setInternalActiveTab(tab);
    }
  };

  // Determine if user is admin/broker based on role
  const isAdminOrBroker = () => {
    if (!profile?.role) return false;
    return ['admin', 'super_admin', 'broker', 'editor'].includes(profile.role);
  };

  const isInvestor = () => {
    if (!profile?.role) return true; // Default to investor view (safer)
    return ['viewer', 'investor'].includes(profile.role);
  };

  // Helper function to determine if nav item is active
  const isNavItemActive = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    if (path === '/investor-portal') {
      return location.pathname === '/investor-portal';
    }
    if (path === '/deals') {
      return location.pathname.startsWith('/deals') || location.pathname.startsWith('/deal/');
    }
    if (path === '/access-requests') {
      return location.pathname.includes('access-requests');
    }
    if (path === '/ndas') {
      return location.pathname.includes('nda');
    }
    return location.pathname === path;
  };

  // Admin/Broker navigation (7 items)
  const getAdminNavigation = (): NavItem[] => [
    { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/dashboard' },
    { id: 'deals', label: 'Deals', icon: BarChart3, path: '/deals' },
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

  // Investor navigation (5 items)
  const getInvestorNavigation = (): NavItem[] => [
    { id: 'browse-deals', label: 'Browse Deals', icon: BarChart3, path: '/investor-portal' },
    { id: 'watchlist', label: 'My Watchlist', icon: Heart, path: '/investor-portal/watchlist' },
    { id: 'my-requests', label: 'My Requests', icon: Lock, path: '/investor-portal/requests' },
    { id: 'my-ndas', label: 'My NDAs', icon: FileCheck, path: '/investor-portal/ndas' },
    { id: 'profile', label: 'Profile', icon: User, path: '/investor-portal/profile' },
  ];

  const navigationItems = isAdminOrBroker() ? getAdminNavigation() : getInvestorNavigation();

  return (
    <div className="min-h-screen bg-[#1C2526] flex">
      {/* Sidebar */}
      <div className="w-64 bg-gradient-to-b from-[#0A0F0F] to-[#1A1F2E] border-r border-[#D4AF37]/30 hidden lg:block">
        <div className="p-6">
          {/* Logo Area - Only show for admin/broker */}
          {isAdminOrBroker() && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-[#D4AF37] mb-2">
                {isDemo ? 'M&A Portal (Demo)' : 'M&A Portal'}
              </h2>
              <p className="text-sm text-[#F4E4BC]/60">Admin Dashboard</p>
            </div>
          )}

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
          <nav className="space-y-1">
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
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Header with Notification Bell and User Menu */}
        <div className="bg-gradient-to-b from-[#0A0F0F] to-[#1A1F2E] border-b border-[#D4AF37]/30 p-4 lg:p-6">
          <div className="flex justify-end items-center gap-3">
            <NotificationBell />
            <UserMenuDropdown />
          </div>
        </div>
        {children}
      </div>
    </div>
  );
};

export default DashboardLayout;
