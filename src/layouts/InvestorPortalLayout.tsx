import React, { useState } from 'react';
import { 
  BarChart3, 
  User, 
  Heart,
  Lock,
  FileCheck,
  Menu
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocation, Link } from 'react-router-dom';
import { useUserProfile } from '@/hooks/useUserProfile';
import UserMenuDropdown from '@/components/ui/UserMenuDropdown';
import { NotificationBell } from '@/components/dashboard/NotificationBell';
import { Breadcrumbs, BreadcrumbItem } from '@/components/navigation/Breadcrumbs';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

interface NavItem {
  id: string;
  label: string;
  icon: any;
  path: string;
}

interface InvestorPortalLayoutProps {
  children: React.ReactNode;
  activeTab?: string;
  breadcrumbs?: BreadcrumbItem[];
}

const InvestorPortalLayout = ({ children, activeTab = 'browse-deals', breadcrumbs }: InvestorPortalLayoutProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { profile, getDisplayName, getRoleDisplayName, loading } = useUserProfile();

  // Helper function to determine if nav item is active
  const isNavItemActive = (path: string) => {
    if (path === '/investor-portal') {
      return location.pathname === '/investor-portal';
    }
    if (path === '/investor-portal/watchlist') {
      return location.pathname === '/investor-portal/watchlist';
    }
    if (path === '/investor-portal/requests') {
      return location.pathname === '/investor-portal/requests';
    }
    if (path === '/investor-portal/ndas') {
      return location.pathname === '/investor-portal/ndas';
    }
    if (path === '/investor-portal/profile') {
      return location.pathname === '/investor-portal/profile';
    }
    return location.pathname === path;
  };

  // Investor navigation (5 items) - ALWAYS show investor nav
  const navigationItems: NavItem[] = [
    { id: 'browse-deals', label: 'Browse Deals', icon: BarChart3, path: '/investor-portal' },
    { id: 'watchlist', label: 'My Watchlist', icon: Heart, path: '/investor-portal/watchlist' },
    { id: 'my-requests', label: 'My Requests', icon: Lock, path: '/investor-portal/requests' },
    { id: 'my-ndas', label: 'My NDAs', icon: FileCheck, path: '/investor-portal/ndas' },
    { id: 'profile', label: 'Profile', icon: User, path: '/investor-portal/profile' },
  ];

  // Sidebar content component
  const SidebarContent = ({ onNavigate }: { onNavigate?: () => void }) => (
    <div className="p-6 h-full flex flex-col">
      {/* Logo Area */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-[#D4AF37] mb-2">M&A Portal</h2>
        <p className="text-sm text-[#F4E4BC]/60">Investor Portal</p>
      </div>

      {/* User Info */}
      <div className="bg-[#2A2F3A]/60 rounded-xl p-4 mb-6 border border-[#D4AF37]/20">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-[#D4AF37] to-[#F4E4BC] rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-[#0A0F0F]" />
          </div>
          <div>
            <div className="text-[#FAFAFA] font-medium">
              {loading ? 'Loading...' : getDisplayName()}
            </div>
            <div className="text-[#F4E4BC]/60 text-sm">
              {loading ? 'Loading...' : getRoleDisplayName()}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="space-y-1 flex-1">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = isNavItemActive(item.path);
          
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
            </Link>
          );
        })}
      </nav>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#1C2526] flex">
      {/* Desktop Sidebar - Fixed position */}
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
      <div className="flex-1 lg:ml-64 overflow-auto">
        {/* Header with Notification Bell and User Menu */}
        <div className="bg-gradient-to-b from-[#0A0F0F] to-[#1A1F2E] border-b border-[#D4AF37]/30 p-4 lg:p-6 sticky top-0 z-30">
          <div className="flex justify-end items-center">
            <div className="flex items-center gap-3">
              <NotificationBell />
              <UserMenuDropdown />
            </div>
          </div>
        </div>
        
        {/* Breadcrumbs - Below header, above page content */}
        <div className="px-4 lg:px-6 pt-4 lg:pt-6">
          <Breadcrumbs items={breadcrumbs} />
        </div>
        
        {/* Page Content */}
        <div className="p-4 lg:p-6 pt-0 lg:pt-0">
          {children}
        </div>
      </div>
    </div>
  );
};

export default InvestorPortalLayout;