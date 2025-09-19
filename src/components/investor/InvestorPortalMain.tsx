import React, { useState } from 'react';
import { 
  TrendingUp, 
  Building2, 
  AlertTriangle, 
  CheckCircle2,
  Filter,
  ArrowLeft,
  User,
  Home,
  BarChart3,
  FileText,
  Settings,
  Shield,
  Users,
  DollarSign,
  MapPin,
  Clock,
  Star,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useUserProfile } from '@/hooks/useUserProfile';
import { getDashboardRoute } from '@/lib/auth-utils';
import { useInvestorContext } from '@/hooks/useInvestorContext';
import { useInvestorDeals } from '@/hooks/useInvestorDeals';
import UserMenuDropdown from '@/components/ui/UserMenuDropdown';

// Sample data for deals
const sampleDeals = [
  {
    id: '1',
    name: 'TechFlow Solutions',
    industry: 'SaaS',
    description: 'B2B workflow automation platform with 500+ enterprise clients',
    revenue: '$8.5M',
    ebitda: '$2.1M',
    stage: 'NDA Signed',
    priority: 'High',
    fitScore: 92,
    location: 'Austin, TX',
    lastUpdated: '2 hours ago',
    progress: 75
  },
  {
    id: '2',
    name: 'Green Energy Corp',
    industry: 'Clean Tech',
    description: 'Solar panel manufacturing with proprietary efficiency technology',
    revenue: '$12.3M',
    ebitda: '$3.8M',
    stage: 'Discovery Call',
    priority: 'Medium',
    fitScore: 87,
    location: 'Denver, CO',
    lastUpdated: '5 hours ago',
    progress: 45
  },
  {
    id: '3',
    name: 'MedDevice Innovations',
    industry: 'Healthcare',
    description: 'FDA-approved medical devices for cardiac monitoring',
    revenue: '$15.7M',
    ebitda: '$4.2M',
    stage: 'Due Diligence',
    priority: 'High',
    fitScore: 95,
    location: 'Boston, MA',
    lastUpdated: '1 hour ago',
    progress: 85
  },
  {
    id: '4',
    name: 'RetailTech Systems',
    industry: 'Retail',
    description: 'Point-of-sale and inventory management for retail chains',
    revenue: '$6.2M',
    ebitda: '$1.5M',
    stage: 'Qualified Lead',
    priority: 'Medium',
    fitScore: 78,
    location: 'Miami, FL',
    lastUpdated: '3 days ago',
    progress: 25
  },
  {
    id: '5',
    name: 'DataSecure Analytics',
    industry: 'Cybersecurity',
    description: 'Enterprise data protection and analytics platform',
    revenue: '$9.8M',
    ebitda: '$2.7M',
    stage: 'NDA Signed',
    priority: 'High',
    fitScore: 89,
    location: 'Seattle, WA',
    lastUpdated: '1 day ago',
    progress: 60
  },
  {
    id: '6',
    name: 'LogiChain Solutions',
    industry: 'Logistics',
    description: 'Supply chain optimization software for manufacturing',
    revenue: '$18.2M',
    ebitda: '$5.1M',
    stage: 'Discovery Call',
    priority: 'Medium',
    fitScore: 82,
    location: 'Chicago, IL',
    lastUpdated: '2 days ago',
    progress: 30
  }
];

const InvestorPortalMain = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile, isAdmin, isEditor, getDisplayName, getRoleDisplayName, loading: profileLoading } = useUserProfile();
  const { metrics, investorInfo, loading: contextLoading } = useInvestorContext();
  const { filteredDeals, loading: dealsLoading, handleDealClick } = useInvestorDeals();
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const loading = profileLoading || contextLoading || dealsLoading;

  const handleDealCardClick = (dealId: string) => {
    handleDealClick(dealId); // Log activity via hook
    navigate(`/deal/${dealId}`);
  };

  const toggleFilter = (filter: string) => {
    setActiveFilters(prev => 
      prev.includes(filter) 
        ? prev.filter(f => f !== filter)
        : [...prev, filter]
    );
  };

  // Helper function to determine if nav item is active
  const isNavItemActive = (path: string) => {
    if (path === '/investor-portal') {
      return location.pathname === '/investor-portal';
    }
    if (path === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    if (path === '/deals') {
      return location.pathname.startsWith('/deals') || location.pathname.startsWith('/deal/');
    }
    return location.pathname === path;
  };

  const getNavigationItems = () => {
    const dashboardPath = (isAdmin() || isEditor()) ? '/dashboard' : '/investor-portal';
    const baseItems = [
      { id: 'dashboard', label: 'Dashboard', icon: Home, path: dashboardPath, badge: null },
      { id: 'deals', label: 'Active Deals', icon: BarChart3, path: '/deals', badge: '4' },
      { id: 'documents', label: 'Documents', icon: FileText, path: '/documents', badge: null },
      { id: 'analytics', label: 'Analytics', icon: TrendingUp, path: '/analytics', badge: null },
      { id: 'compliance', label: 'Compliance', icon: Shield, path: '/compliance', badge: null },
      { id: 'settings', label: 'Settings', icon: Settings, path: '/settings', badge: null }
    ];

    // Admin only items
    const adminItems = [
      { id: 'users', label: 'Users', icon: Users, path: '/users', badge: null },
      { id: 'activity', label: 'Activity', icon: Shield, path: '/activity', badge: null }
    ];

    if (isAdmin()) {
      return [...baseItems, ...adminItems];
    }

    return baseItems;
  };

  const navigationItems = getNavigationItems();

  const getPriorityColor = (priority: string) => {
    return priority === 'High' ? 'bg-[#F28C38] text-[#0A0F0F]' : 'bg-[#3B82F6] text-white';
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'NDA Signed': return 'text-[#22C55E]';
      case 'Due Diligence': return 'text-[#D4AF37]';
      case 'Discovery Call': return 'text-[#F28C38]';
      default: return 'text-[#F4E4BC]';
    }
  };

  return (
    <div className="min-h-screen bg-[#1C2526] flex">
      {/* Sidebar */}
      <div className="w-64 bg-gradient-to-b from-[#0A0F0F] to-[#1A1F2E] border-r border-[#D4AF37]/30 flex-shrink-0">
        <div className="p-6">
          {/* Back to Dashboard Button */}
          <Button 
            onClick={() => navigate(profile?.role ? getDashboardRoute(profile.role) : '/dashboard')}
            className="w-full mb-6 bg-transparent border border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#0A0F0F] transition-all duration-300"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>

          {/* Logo Area */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-[#D4AF37] mb-2">M&A Portal</h2>
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
                  {loading ? 'Loading…' : (investorInfo?.name || getDisplayName())}
                </div>
                <div className="text-[#F4E4BC]/60 text-sm">
                  {loading ? '' : (investorInfo?.company || getRoleDisplayName())}
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
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                    isActive 
                      ? 'bg-gradient-to-r from-[#D4AF37]/20 to-[#F4E4BC]/10 text-[#D4AF37] border border-[#D4AF37]/30' 
                      : 'text-[#F4E4BC] hover:bg-[#D4AF37]/10 hover:text-[#D4AF37]'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                  {item.badge && (
                    <Badge className="ml-auto bg-[#F28C38] text-[#0A0F0F] text-xs">
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
      <div className="flex-1 p-6 lg:p-8 overflow-auto">
        {/* Header Section */}
        <Card className="bg-gradient-to-r from-[#0A0F0F] to-[#1A1F2E] border-[#D4AF37]/30 mb-8">
          <CardContent className="p-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-[#FAFAFA] mb-4">Investor Portal</h1>
                <p className="text-xl text-[#F4E4BC]">
                  Real-time access to curated M&A opportunities with comprehensive deal analytics
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Badge className="bg-gradient-to-r from-[#D4AF37] to-[#F4E4BC] text-[#0A0F0F] px-6 py-3 text-base font-bold rounded-full">
                  Live Deals Dashboard
                </Badge>
                <UserMenuDropdown />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Metrics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-[#2A2F3A] to-[#1A1F2E] border-[#D4AF37]/20 hover:border-[#D4AF37]/50 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <TrendingUp className="w-8 h-8 text-[#D4AF37]" />
                <div className="w-2 h-2 bg-[#22C55E] rounded-full"></div>
              </div>
               <div className="space-y-1">
                <div className="text-2xl font-bold text-[#FAFAFA]">
                  {loading ? 'Loading...' : (metrics?.totalPipeline || '$0M')}
                </div>
                <div className="text-sm text-[#F4E4BC]/60">Total Pipeline</div>
                <div className="text-xs text-[#F4E4BC]/40">Combined revenue</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-[#2A2F3A] to-[#1A1F2E] border-[#D4AF37]/20 hover:border-[#D4AF37]/50 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Building2 className="w-8 h-8 text-[#D4AF37]" />
                <div className="w-2 h-2 bg-[#F28C38] rounded-full"></div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-[#FAFAFA]">
                  {loading ? '...' : (metrics?.activeDeals || 0)}
                </div>
                <div className="text-sm text-[#F4E4BC]/60">Active Deals</div>
                <div className="text-xs text-[#F4E4BC]/40">In pipeline</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-[#2A2F3A] to-[#1A1F2E] border-[#D4AF37]/20 hover:border-[#D4AF37]/50 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <AlertTriangle className="w-8 h-8 text-[#D4AF37]" />
                <div className="w-2 h-2 bg-[#F28C38] rounded-full"></div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-[#FAFAFA]">
                  {loading ? '...' : (metrics?.highPriorityDeals || 0)}
                </div>
                <div className="text-sm text-[#F4E4BC]/60">High Priority</div>
                <div className="text-xs text-[#F4E4BC]/40">Urgent deals</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-[#2A2F3A] to-[#1A1F2E] border-[#D4AF37]/20 hover:border-[#D4AF37]/50 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <CheckCircle2 className="w-8 h-8 text-[#D4AF37]" />
                <div className="w-2 h-2 bg-[#22C55E] rounded-full"></div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-[#FAFAFA]">
                  {loading ? '...' : (metrics?.ndaSignedDeals || 0)}
                </div>
                <div className="text-sm text-[#F4E4BC]/60">NDA Signed</div>
                <div className="text-xs text-[#F4E4BC]/40">Ready for review</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter Section */}
        <Card className="bg-gradient-to-br from-[#2A2F3A] to-[#1A1F2E] border-[#D4AF37]/20 mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Filter className="w-5 h-5 text-[#D4AF37]" />
                <h3 className="text-lg font-bold text-[#FAFAFA]">Filter Deals</h3>
                {activeFilters.length > 0 && (
                  <Badge className="bg-[#D4AF37] text-[#0A0F0F]">{activeFilters.length}</Badge>
                )}
              </div>
              <Button
                variant="ghost"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="text-[#D4AF37] hover:bg-[#D4AF37]/10"
              >
                Advanced <ChevronDown className="w-4 h-4 ml-1" />
              </Button>
            </div>
            
            <div className="flex gap-3 flex-wrap">
              <Button
                variant={activeFilters.includes('High Priority') ? 'default' : 'outline'}
                onClick={() => toggleFilter('High Priority')}
                className={`${
                  activeFilters.includes('High Priority')
                    ? 'bg-[#F28C38] text-[#0A0F0F] hover:bg-[#F28C38]/80'
                    : 'border-[#F28C38] text-[#F28C38] hover:bg-[#F28C38]/10'
                }`}
              >
                High Priority
              </Button>
              <Button
                variant={activeFilters.includes('NDA Signed') ? 'default' : 'outline'}
                onClick={() => toggleFilter('NDA Signed')}
                className={`${
                  activeFilters.includes('NDA Signed')
                    ? 'bg-[#22C55E] text-[#0A0F0F] hover:bg-[#22C55E]/80'
                    : 'border-[#22C55E] text-[#22C55E] hover:bg-[#22C55E]/10'
                }`}
              >
                NDA Signed
              </Button>
              <Button
                variant={activeFilters.includes('$10M+ Revenue') ? 'default' : 'outline'}
                onClick={() => toggleFilter('$10M+ Revenue')}
                className={`${
                  activeFilters.includes('$10M+ Revenue')
                    ? 'bg-[#D4AF37] text-[#0A0F0F] hover:bg-[#D4AF37]/80'
                    : 'border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37]/10'
                }`}
              >
                $10M+ Revenue
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Deal Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {loading ? (
            // Loading skeleton
            Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="bg-gradient-to-br from-[#2A2F3A] to-[#1A1F2E] border-[#D4AF37]/20">
                <CardContent className="p-6">
                  <div className="animate-pulse">
                    <div className="h-6 bg-[#D4AF37]/20 rounded mb-4"></div>
                    <div className="h-4 bg-[#F4E4BC]/20 rounded mb-2"></div>
                    <div className="h-4 bg-[#F4E4BC]/20 rounded w-3/4"></div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : filteredDeals.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-[#F4E4BC]/60 text-lg">No deals available with your current permissions.</p>
            </div>
          ) : (
            filteredDeals.map((deal) => (
            <Card 
              key={deal.id}
              className="bg-gradient-to-br from-[#2A2F3A] to-[#1A1F2E] border-[#D4AF37]/20 hover:border-[#D4AF37] hover:shadow-xl hover:shadow-[#D4AF37]/20 transition-all duration-300 cursor-pointer group"
              onClick={() => handleDealCardClick(deal.id)}
            >
              <CardContent className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xl font-bold text-[#FAFAFA] group-hover:text-[#D4AF37] transition-colors">
                        {deal.companyName}
                      </h3>
                      <Badge className={`text-xs ${getPriorityColor(deal.priority)}`}>
                        {deal.priority}
                      </Badge>
                    </div>
                    <Badge variant="outline" className="text-xs text-[#D4AF37] border-[#D4AF37]/40">
                      {deal.industry}
                    </Badge>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-[#F4E4BC]/80 mb-4 line-clamp-2">
                  {deal.description}
                </p>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-[#0A0F0F]/50 rounded-lg p-3">
                      <div className="text-[#F4E4BC]/60 text-xs mb-1">Revenue</div>
                      <div className="text-lg font-bold text-[#FAFAFA]">{deal.revenue}</div>
                    </div>
                    <div className="bg-[#0A0F0F]/50 rounded-lg p-3">
                      <div className="text-[#F4E4BC]/60 text-xs mb-1">EBITDA</div>
                      <div className="text-lg font-bold text-[#FAFAFA]">{deal.ebitda}</div>
                    </div>
                </div>

                {/* Stage */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[#F4E4BC]/60 text-xs">Deal Stage</span>
                    <span className={`text-sm font-medium ${getStageColor(deal.stage)}`}>
                      {deal.stage}
                    </span>
                  </div>
                  <Progress value={deal.progress} className="h-2 bg-[#1A1F2E]">
                    <div 
                      className="h-full bg-gradient-to-r from-[#D4AF37] to-[#F4E4BC] rounded-full transition-all"
                      style={{ width: `${deal.progress}%` }}
                    />
                  </Progress>
                </div>

                {/* Fit Score */}
                <div className="flex items-center gap-2 mb-4">
                  <Star className="w-4 h-4 text-[#D4AF37]" />
                  <span className="text-xs font-medium text-[#FAFAFA]">Fit Score</span>
                  <Badge className="bg-[#D4AF37]/20 text-[#D4AF37] ml-auto">
                    {deal.fitScore}%
                  </Badge>
                </div>

                {/* Location and Time */}
                <div className="flex items-center justify-between text-[#F4E4BC]/60 text-xs mb-6">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    <span>{deal.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{deal.lastUpdated}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button 
                    className="flex-1 bg-[#D4AF37] hover:bg-[#F4E4BC] text-[#0A0F0F] font-bold"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDealClick(deal.id);
                    }}
                  >
                    View Details
                  </Button>
                  <Button 
                    variant="outline"
                    className="border-[#F4E4BC] text-[#F4E4BC] hover:bg-[#F4E4BC] hover:text-[#0A0F0F]"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Documents
                  </Button>
                </div>
              </CardContent>
            </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default InvestorPortalMain;