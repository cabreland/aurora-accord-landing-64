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
  Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUserProfile } from '@/hooks/useUserProfile';

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

const DashboardLayout = ({ children, activeTab = 'dashboard', onTabChange }: DashboardLayoutProps) => {
  const [internalActiveTab, setInternalActiveTab] = useState(activeTab);
  const navigate = useNavigate();
  const location = useLocation();
  const { getDisplayName, getRoleDisplayName, loading, canManageUsers } = useUserProfile();

  const isDemo = location.pathname === '/demo';
  const currentActiveTab = onTabChange ? activeTab : internalActiveTab;
  
  const handleTabChange = (tab: string) => {
    if (onTabChange) {
      onTabChange(tab);
    } else {
      setInternalActiveTab(tab);
    }
  };

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'deals', label: 'Deals', icon: BarChart3 },
    ...((!isDemo && canManageUsers()) ? [{ id: 'documents', label: 'Documents', icon: FileText }] : []),
    ...((!isDemo && canManageUsers()) ? [{ id: 'users', label: 'Users', icon: Users }] : []),
    ...((!isDemo && canManageUsers()) ? [{ id: 'settings', label: 'Settings', icon: Settings }] : []),
    ...((!isDemo && canManageUsers()) ? [{ id: 'activity', label: 'Activity', icon: Shield }] : []),
  ];

  return (
    <div className="min-h-screen bg-[#1C2526] flex">
      {/* Sidebar */}
      <div className="w-64 bg-gradient-to-b from-[#0A0F0F] to-[#1A1F2E] border-r border-[#D4AF37]/30 hidden lg:block">
        <div className="p-6">
          {/* Back to Home Button */}
          <Button 
            onClick={() => navigate('/')}
            className="w-full mb-6 bg-[#2A2F3A] border border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#0A0F0F] transition-all duration-300"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
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
              const isActive = currentActiveTab === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabChange(item.id)}
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
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6 lg:p-8">
          {children}
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
