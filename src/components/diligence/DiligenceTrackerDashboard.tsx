import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  BarChart3, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  Search,
  Building2,
  ChevronRight,
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useDealsWithDiligence, useDiligenceRequests } from '@/hooks/useDiligenceTracker';
import CreateTrackerDialog from './CreateTrackerDialog';

type FilterType = 'all' | 'due' | 'done' | 'risk';

const DiligenceTrackerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  
  const { data: deals = [], isLoading: dealsLoading } = useDealsWithDiligence();
  const { data: allRequests = [] } = useDiligenceRequests();
  
  // Calculate statistics
  const totalRequests = allRequests.length;
  const completedRequests = allRequests.filter(r => r.status === 'completed').length;
  const now = new Date();
  const dueSoonRequests = allRequests.filter(r => {
    if (!r.due_date || r.status === 'completed') return false;
    const dueDate = new Date(r.due_date);
    const daysDiff = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysDiff <= 7 && daysDiff >= 0;
  }).length;
  const atRiskRequests = allRequests.filter(r => {
    if (r.status === 'completed') return false;
    if (r.status === 'blocked') return true;
    if (!r.due_date) return false;
    const dueDate = new Date(r.due_date);
    return dueDate < now;
  }).length;
  
  // Filter deals based on search
  const filteredDeals = deals.filter(deal => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return deal.company_name.toLowerCase().includes(query) || 
             deal.title.toLowerCase().includes(query);
    }
    return true;
  }).filter(deal => {
    if (activeFilter === 'done') {
      return deal.progress_percentage === 100;
    }
    if (activeFilter === 'risk') {
      // Deals with overdue items
      return deal.progress_percentage < 50;
    }
    return true;
  });
  
  const stats = [
    { 
      id: 'all', 
      label: 'All Requests', 
      value: totalRequests, 
      icon: BarChart3, 
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10'
    },
    { 
      id: 'due', 
      label: 'Due Soon', 
      value: dueSoonRequests, 
      icon: Clock, 
      color: 'text-[#D4AF37]',
      bgColor: 'bg-[#D4AF37]/10'
    },
    { 
      id: 'done', 
      label: 'Completed', 
      value: completedRequests, 
      icon: CheckCircle2, 
      color: 'text-green-400',
      bgColor: 'bg-green-500/10'
    },
    { 
      id: 'risk', 
      label: 'At Risk', 
      value: atRiskRequests, 
      icon: AlertTriangle, 
      color: 'text-red-400',
      bgColor: 'bg-red-500/10'
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Diligence Tracker</h1>
          <p className="text-gray-400 mt-1">Manage due diligence across all deals</p>
        </div>
        <Button 
          onClick={() => setCreateDialogOpen(true)}
          className="bg-[#D4AF37] hover:bg-[#B4941F] text-[#0A0F0F]"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Tracker
        </Button>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const isActive = activeFilter === stat.id;
          return (
            <button
              key={stat.id}
              onClick={() => setActiveFilter(stat.id as FilterType)}
              className={`p-4 rounded-xl border transition-all ${
                isActive 
                  ? 'bg-[#D4AF37]/20 border-[#D4AF37]' 
                  : 'bg-[#1A1F2E] border-[#2A2F3A] hover:border-[#D4AF37]/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <div className="text-left">
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <div className="text-sm text-gray-400">{stat.label}</div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
      
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search deals..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-[#1A1F2E] border-[#2A2F3A] text-white"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[200px] bg-[#1A1F2E] border-[#2A2F3A] text-white">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent className="bg-[#1A1F2E] border-[#2A2F3A]">
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="financial">Financial</SelectItem>
            <SelectItem value="legal">Legal</SelectItem>
            <SelectItem value="hr">Human Resources</SelectItem>
            <SelectItem value="operations">Operations</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {/* Deals List */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <Building2 className="w-5 h-5 text-[#D4AF37]" />
          Active Deals
        </h2>
        
        {dealsLoading ? (
          <div className="text-center py-12 text-gray-400">Loading deals...</div>
        ) : filteredDeals.length === 0 ? (
          <Card className="bg-[#1A1F2E] border-[#2A2F3A]">
            <CardContent className="p-12 text-center">
              <BarChart3 className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No trackers found</h3>
              <p className="text-gray-400 mb-4">Create a diligence tracker to start managing due diligence</p>
              <Button 
                onClick={() => setCreateDialogOpen(true)}
                className="bg-[#D4AF37] hover:bg-[#B4941F] text-[#0A0F0F]"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Tracker
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredDeals.map((deal) => (
              <Card 
                key={deal.id}
                className="bg-[#1A1F2E] border-[#2A2F3A] hover:border-[#D4AF37]/50 transition-colors cursor-pointer"
                onClick={() => navigate(`/dashboard/diligence-tracker/${deal.id}`)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-12 h-12 bg-[#D4AF37]/20 rounded-lg flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-[#D4AF37]" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white">{deal.company_name}</h3>
                        <p className="text-sm text-gray-400">{deal.title}</p>
                        
                        <div className="mt-3 space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-400">
                              {deal.completed_requests}/{deal.total_requests} Requests Complete
                            </span>
                            <span className="text-[#D4AF37] font-medium">
                              {deal.progress_percentage}%
                            </span>
                          </div>
                          <Progress 
                            value={deal.progress_percentage} 
                            className="h-2 bg-[#2A2F3A]"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 ml-4">
                      <Badge 
                        variant="outline" 
                        className={`
                          ${deal.progress_percentage === 100 
                            ? 'border-green-500/50 text-green-400' 
                            : deal.progress_percentage >= 50 
                              ? 'border-[#D4AF37]/50 text-[#D4AF37]' 
                              : 'border-orange-500/50 text-orange-400'
                          }
                        `}
                      >
                        {deal.progress_percentage === 100 
                          ? 'Complete' 
                          : deal.progress_percentage >= 50 
                            ? 'In Progress' 
                            : 'Early Stage'
                        }
                      </Badge>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      
      <CreateTrackerDialog 
        open={createDialogOpen} 
        onOpenChange={setCreateDialogOpen} 
      />
    </div>
  );
};

export default DiligenceTrackerDashboard;
