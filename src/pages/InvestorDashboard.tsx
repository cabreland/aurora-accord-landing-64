
import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import DashboardLayout from '@/components/investor/DashboardLayout';
import DealFilters from '@/components/investor/DealFilters';
import DealCard from '@/components/investor/DealCard';
import DealMetrics from '@/components/investor/DealMetrics';
import DealDetailView from '@/components/investor/DealDetailView';

// Enhanced mock data with more deals
const mockDeals = [
  {
    id: 1,
    companyName: "TechFlow Solutions",
    industry: "SaaS",
    revenue: "$8.5M",
    ebitda: "$2.1M",
    stage: "NDA Signed",
    progress: 75,
    priority: "High",
    location: "Austin, TX",
    fitScore: 92,
    lastUpdated: "2 hours ago",
    description: "B2B workflow automation platform with 500+ enterprise clients"
  },
  {
    id: 2,
    companyName: "Green Energy Corp",
    industry: "Clean Tech",
    revenue: "$12.3M",
    ebitda: "$3.8M",
    stage: "Discovery Call",
    progress: 45,
    priority: "Medium",
    location: "Denver, CO",
    fitScore: 87,
    lastUpdated: "1 day ago",
    description: "Solar panel manufacturing with proprietary efficiency technology"
  },
  {
    id: 3,
    companyName: "MedDevice Innovations",
    industry: "Healthcare",
    revenue: "$15.7M",
    ebitda: "$4.2M",
    stage: "Due Diligence",
    progress: 85,
    priority: "High",
    location: "Boston, MA",
    fitScore: 95,
    lastUpdated: "4 hours ago",
    description: "FDA-approved medical devices for cardiac monitoring"
  },
  {
    id: 4,
    companyName: "RetailTech Systems",
    industry: "Retail",
    revenue: "$6.2M",
    ebitda: "$1.5M",
    stage: "Qualified Lead",
    progress: 25,
    priority: "Medium",
    location: "Miami, FL",
    fitScore: 78,
    lastUpdated: "3 days ago",
    description: "Point-of-sale and inventory management for retail chains"
  },
  {
    id: 5,
    companyName: "DataSecure Analytics",
    industry: "Cybersecurity",
    revenue: "$9.8M",
    ebitda: "$2.7M",
    stage: "NDA Signed",
    progress: 60,
    priority: "High",
    location: "Seattle, WA",
    fitScore: 89,
    lastUpdated: "1 day ago",
    description: "Enterprise data protection and analytics platform"
  },
  {
    id: 6,
    companyName: "LogiChain Solutions",
    industry: "Logistics",
    revenue: "$18.2M",
    ebitda: "$5.1M",
    stage: "Discovery Call",
    progress: 30,
    priority: "Medium",
    location: "Chicago, IL",
    fitScore: 82,
    lastUpdated: "2 days ago",
    description: "Supply chain optimization software for manufacturing"
  }
];

const InvestorDashboard = () => {
  const [filteredDeals, setFilteredDeals] = useState(mockDeals);
  const [selectedDeal, setSelectedDeal] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'dashboard' | 'detail'>('dashboard');

  const handleFilterChange = (filters: any) => {
    let filtered = mockDeals;
    
    if (filters.industry && filters.industry !== 'all') {
      filtered = filtered.filter(deal => deal.industry.toLowerCase() === filters.industry.toLowerCase());
    }
    
    if (filters.stage && filters.stage !== 'all') {
      filtered = filtered.filter(deal => deal.stage === filters.stage);
    }
    
    if (filters.priority && filters.priority !== 'all') {
      filtered = filtered.filter(deal => deal.priority === filters.priority);
    }
    
    if (filters.minRevenue) {
      filtered = filtered.filter(deal => {
        const revenue = parseFloat(deal.revenue.replace('$', '').replace('M', ''));
        return revenue >= filters.minRevenue;
      });
    }
    
    setFilteredDeals(filtered);
  };

  const handleDealClick = (dealId: number) => {
    setSelectedDeal(dealId);
    setViewMode('detail');
  };

  const handleBackToDashboard = () => {
    setViewMode('dashboard');
    setSelectedDeal(null);
  };

  const selectedDealData = mockDeals.find(deal => deal.id === selectedDeal);

  if (viewMode === 'detail' && selectedDealData) {
    return (
      <div className="min-h-screen bg-[#1C2526]">
        <DashboardLayout>
          <DealDetailView deal={selectedDealData} onBack={handleBackToDashboard} />
        </DashboardLayout>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1C2526]">
      <DashboardLayout>
        <div className="space-y-8">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#0A0F0F] to-[#1A1F2E] p-8 rounded-2xl border border-[#D4AF37]/30">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h1 className="text-4xl font-bold text-[#FAFAFA] mb-4">
                  Investor Portal
                </h1>
                <p className="text-xl text-[#F4E4BC] max-w-2xl">
                  Real-time access to curated M&A opportunities with comprehensive deal analytics
                </p>
              </div>
              <div className="mt-6 lg:mt-0">
                <Badge className="bg-gradient-to-r from-[#D4AF37] to-[#F4E4BC] text-[#0A0F0F] font-bold px-6 py-3 text-base">
                  Live Deals Dashboard
                </Badge>
              </div>
            </div>
          </div>

          {/* Metrics Overview */}
          <DealMetrics deals={mockDeals} />

          {/* Filters */}
          <DealFilters onFilterChange={handleFilterChange} />

          {/* Deals Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredDeals.map((deal) => (
              <DealCard
                key={deal.id}
                deal={deal}
                onClick={() => handleDealClick(deal.id)}
                isSelected={selectedDeal === deal.id}
              />
            ))}
          </div>

          {filteredDeals.length === 0 && (
            <div className="text-center py-12">
              <div className="text-[#F4E4BC] text-xl mb-4">No deals match your current filters</div>
              <Button 
                onClick={() => setFilteredDeals(mockDeals)}
                className="bg-[#D4AF37] hover:bg-[#F4E4BC] text-[#0A0F0F] font-bold"
              >
                Reset Filters
              </Button>
            </div>
          )}
        </div>
      </DashboardLayout>
    </div>
  );
};

export default InvestorDashboard;
