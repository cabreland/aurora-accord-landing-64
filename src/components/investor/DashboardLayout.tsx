
import React, { useState } from 'react';
import { 
  BarChart3, 
  FileText, 
  Settings, 
  Bell, 
  User, 
  Home,
  TrendingUp,
  Shield,
  Filter,
  ArrowLeft,
  Users,
  Mail
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useUserProfile } from '@/hooks/useUserProfile';
import { getDashboardRoute } from '@/lib/auth-utils';
import UserMenuDropdown from '@/components/ui/UserMenuDropdown';

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

const DashboardLayout = ({ children, activeTab = 'dashboard', onTabChange }: DashboardLayoutProps) => {
  const [internalActiveTab, setInternalActiveTab] = useState(activeTab);
  const navigate = useNavigate();
  const location = useLocation();
  const { profile, getDisplayName, getRoleDisplayName, loading, canManageUsers, isAdmin } = useUserProfile();

  const isDemo = location.pathname === '/demo';
  const currentActiveTab = onTabChange ? activeTab : internalActiveTab;
  
  const handleTabChange = (tab: string) => {
    if (onTabChange) {
      onTabChange(tab);
    } else {
      setInternalActiveTab(tab);
    }
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
    return location.pathname === path;
  };

  // Role-based navigation items
  const getNavigationItems = () => {
    const baseItems = [
      { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/dashboard' },
      { id: 'deals', label: 'Deals', icon: BarChart3, path: '/deals' },
    ];

    // Admin/Staff only items - based on USER ROLE, not current route
    const adminItems = [
      { id: 'documents', label: 'Documents', icon: FileText, path: '/documents' },
      { id: 'investor-invitations', label: 'Investor Relations', icon: Mail, path: '/investor-invitations' },
      { id: 'users', label: 'Users', icon: Users, path: '/users' },
      { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
      { id: 'activity', label: 'Activity', icon: Shield, path: '/activity' },
    ];

    // Return appropriate items based on role (not demo status)
    if (isDemo) {
      return baseItems; // Demo users only see basic items
    }

    // Check actual user permissions, not just admin role
    if (canManageUsers()) {
      return [...baseItems, ...adminItems]; // Users who can manage users see everything
    }

    return baseItems; // Regular investors see basic items
  };

  const navigationItems = getNavigationItems();

  return (
    <div className="min-h-screen bg-[#1C2526] flex">
      {/* Sidebar */}
      <div className="w-64 bg-gradient-to-b from-[#0A0F0F] to-[#1A1F2E] border-r border-[#D4AF37]/30 hidden lg:block">
        <div className="p-6">
          {/* Back to Dashboard Button */}
          <Button 
            onClick={() => navigate(profile?.role ? getDashboardRoute(profile.role) : '/dashboard')}
            className="w-full mb-6 bg-[#2A2F3A] border border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#0A0F0F] transition-all duration-300"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>

          {/* Logo Area */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-[#D4AF37] mb-2">
              {isDemo ? 'M&A Portal (Demo)' : 'M&A Portal'}
            </h2>
            <p className="text-sm text-[#F4E4BC]/60">Exclusive Business Brokers</p>
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
          <nav className="space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = isNavItemActive(item.path);
              
              return (
                <Link
                  key={item.id}
                  to={item.path}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
                    isActive 
                      ? 'bg-gradient-to-r from-[#D4AF37]/20 to-[#F4E4BC]/10 text-[#D4AF37] border border-[#D4AF37]/30' 
                      : 'text-[#F4E4BC] hover:bg-[#D4AF37]/10 hover:text-[#D4AF37]'
                  }`}
                >
                  <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-[#D4AF37]' : 'group-hover:text-[#D4AF37]'}`} />
                  <span className="font-medium">{item.label}</span>
                  {item.id === 'deals' && !isDemo && (
                    <Badge className="ml-auto bg-[#F28C38] text-[#0A0F0F] text-xs">4</Badge>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Header with User Menu */}
        <div className="bg-card border-b border-border p-4 lg:p-6">
          <div className="flex justify-end">
            <UserMenuDropdown />
          </div>
        </div>
        <div className="p-6 lg:p-8">
          {children}
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
