import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Plus, 
  Search,
  ChevronDown,
  ChevronRight,
  BarChart3,
  Scale,
  Receipt,
  Users,
  Settings,
  Cpu,
  ShoppingCart,
  Leaf,
  Folder
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  useDiligenceRequests, 
  useDiligenceCategories, 
  useDiligenceSubcategories,
  DiligenceRequest,
  DiligenceCategory
} from '@/hooks/useDiligenceTracker';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import DiligenceRequestTable from './DiligenceRequestTable';
import DiligenceRequestPanel from './DiligenceRequestPanel';
import AddRequestDialog from './AddRequestDialog';

const iconMap: Record<string, React.ComponentType<any>> = {
  'bar-chart-3': BarChart3,
  'scale': Scale,
  'receipt': Receipt,
  'users': Users,
  'settings': Settings,
  'cpu': Cpu,
  'shopping-cart': ShoppingCart,
  'leaf': Leaf,
  'folder': Folder,
};

const DealDiligenceTracker: React.FC = () => {
  const { dealId } = useParams<{ dealId: string }>();
  const navigate = useNavigate();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [selectedRequest, setSelectedRequest] = useState<DiligenceRequest | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [addRequestOpen, setAddRequestOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('requests');
  
  const { data: deal } = useQuery({
    queryKey: ['deal', dealId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('deals')
        .select('*')
        .eq('id', dealId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!dealId
  });
  
  const { data: requests = [], isLoading } = useDiligenceRequests(dealId);
  const { data: categories = [] } = useDiligenceCategories();
  const { data: subcategories = [] } = useDiligenceSubcategories();
  
  // Calculate counts per category and subcategory
  const categoryCounts = useMemo(() => {
    const counts: Record<string, { total: number; completed: number }> = {};
    
    categories.forEach(cat => {
      const catRequests = requests.filter(r => r.category_id === cat.id);
      counts[cat.id] = {
        total: catRequests.length,
        completed: catRequests.filter(r => r.status === 'completed').length
      };
    });
    
    return counts;
  }, [categories, requests]);
  
  const subcategoryCounts = useMemo(() => {
    const counts: Record<string, { total: number; completed: number }> = {};
    
    subcategories.forEach(sub => {
      const subRequests = requests.filter(r => r.subcategory_id === sub.id);
      counts[sub.id] = {
        total: subRequests.length,
        completed: subRequests.filter(r => r.status === 'completed').length
      };
    });
    
    return counts;
  }, [subcategories, requests]);
  
  // Filter requests
  const filteredRequests = useMemo(() => {
    return requests.filter(request => {
      // Category filter
      if (selectedCategoryId && request.category_id !== selectedCategoryId) {
        return false;
      }
      
      // Subcategory filter
      if (selectedSubcategoryId && request.subcategory_id !== selectedSubcategoryId) {
        return false;
      }
      
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return request.title.toLowerCase().includes(query) ||
               request.description?.toLowerCase().includes(query);
      }
      
      return true;
    });
  }, [requests, selectedCategoryId, selectedSubcategoryId, searchQuery]);
  
  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };
  
  const selectCategory = (categoryId: string | null) => {
    setSelectedCategoryId(categoryId);
    setSelectedSubcategoryId(null);
  };
  
  const selectSubcategory = (subcategoryId: string) => {
    setSelectedSubcategoryId(subcategoryId);
    const sub = subcategories.find(s => s.id === subcategoryId);
    if (sub) {
      setSelectedCategoryId(sub.category_id);
    }
  };
  
  // Overall progress
  const totalRequests = requests.length;
  const completedRequests = requests.filter(r => r.status === 'completed').length;
  const progressPercentage = totalRequests > 0 ? Math.round((completedRequests / totalRequests) * 100) : 0;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/dashboard/diligence-tracker')}
          className="text-gray-400 hover:text-white mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">{deal?.company_name || 'Loading...'}</h1>
            <p className="text-gray-400">Due Diligence Tracker</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm text-gray-400">Overall Progress</div>
              <div className="text-xl font-bold text-[#D4AF37]">{progressPercentage}%</div>
            </div>
            <div className="w-24 h-2 bg-[#2A2F3A] rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#D4AF37] transition-all"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="bg-[#1A1F2E] border border-[#2A2F3A] mb-4 w-fit">
          <TabsTrigger value="overview" className="data-[state=active]:bg-[#D4AF37]/20 data-[state=active]:text-[#D4AF37]">
            Overview
          </TabsTrigger>
          <TabsTrigger value="requests" className="data-[state=active]:bg-[#D4AF37]/20 data-[state=active]:text-[#D4AF37]">
            Requests
          </TabsTrigger>
          <TabsTrigger value="timeline" className="data-[state=active]:bg-[#D4AF37]/20 data-[state=active]:text-[#D4AF37]">
            Timeline
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="flex-1">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {categories.slice(0, 8).map((cat) => {
              const count = categoryCounts[cat.id] || { total: 0, completed: 0 };
              const Icon = iconMap[cat.icon] || Folder;
              const pct = count.total > 0 ? Math.round((count.completed / count.total) * 100) : 0;
              
              return (
                <Card 
                  key={cat.id}
                  className="bg-[#1A1F2E] border-[#2A2F3A] hover:border-[#D4AF37]/50 cursor-pointer"
                  onClick={() => {
                    selectCategory(cat.id);
                    setActiveTab('requests');
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${cat.color}20` }}
                      >
                        <Icon className="w-5 h-5" style={{ color: cat.color }} />
                      </div>
                      <div>
                        <div className="font-medium text-white">{cat.name}</div>
                        <div className="text-xs text-gray-400">{count.completed}/{count.total}</div>
                      </div>
                    </div>
                    <div className="w-full h-1.5 bg-[#2A2F3A] rounded-full overflow-hidden">
                      <div 
                        className="h-full transition-all"
                        style={{ width: `${pct}%`, backgroundColor: cat.color }}
                      />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
        
        <TabsContent value="requests" className="flex-1 flex gap-6">
          {/* Left Panel - Category Tree */}
          <div className="w-64 shrink-0 space-y-2">
            <button
              onClick={() => selectCategory(null)}
              className={`w-full flex items-center justify-between px-4 py-2 rounded-lg transition-colors ${
                !selectedCategoryId 
                  ? 'bg-[#D4AF37]/20 text-[#D4AF37]' 
                  : 'text-gray-300 hover:bg-[#2A2F3A]'
              }`}
            >
              <span className="font-medium">All</span>
              <Badge variant="outline" className="text-xs">{totalRequests}</Badge>
            </button>
            
            {categories.map((cat) => {
              const count = categoryCounts[cat.id] || { total: 0, completed: 0 };
              const Icon = iconMap[cat.icon] || Folder;
              const isExpanded = expandedCategories.has(cat.id);
              const catSubs = subcategories.filter(s => s.category_id === cat.id);
              const hasSubcategories = catSubs.length > 0 && catSubs.some(s => (subcategoryCounts[s.id]?.total || 0) > 0);
              
              if (count.total === 0) return null;
              
              return (
                <div key={cat.id}>
                  <div className="flex items-center">
                    {hasSubcategories && (
                      <button
                        onClick={() => toggleCategory(cat.id)}
                        className="p-1 text-gray-400 hover:text-white"
                      >
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </button>
                    )}
                    <button
                      onClick={() => selectCategory(cat.id)}
                      className={`flex-1 flex items-center gap-2 px-2 py-2 rounded-lg transition-colors ${
                        selectedCategoryId === cat.id && !selectedSubcategoryId
                          ? 'bg-[#D4AF37]/20 text-[#D4AF37]' 
                          : 'text-gray-300 hover:bg-[#2A2F3A]'
                      } ${!hasSubcategories ? 'ml-5' : ''}`}
                    >
                      <Icon className="w-4 h-4" style={{ color: cat.color }} />
                      <span className="flex-1 text-left text-sm">{cat.name}</span>
                      <span className="text-xs text-gray-500">
                        ({count.completed}/{count.total})
                      </span>
                    </button>
                  </div>
                  
                  {isExpanded && hasSubcategories && (
                    <div className="ml-9 space-y-1 mt-1">
                      {catSubs.map((sub) => {
                        const subCount = subcategoryCounts[sub.id] || { total: 0, completed: 0 };
                        if (subCount.total === 0) return null;
                        
                        return (
                          <button
                            key={sub.id}
                            onClick={() => selectSubcategory(sub.id)}
                            className={`w-full flex items-center justify-between px-3 py-1.5 rounded text-sm transition-colors ${
                              selectedSubcategoryId === sub.id
                                ? 'bg-[#D4AF37]/10 text-[#D4AF37]' 
                                : 'text-gray-400 hover:text-white hover:bg-[#2A2F3A]/50'
                            }`}
                          >
                            <span>{sub.name}</span>
                            <span className="text-xs">
                              ({subCount.completed}/{subCount.total})
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          {/* Main Content - Request Table */}
          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search requests..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-[#1A1F2E] border-[#2A2F3A] text-white"
                />
              </div>
              <Button 
                onClick={() => setAddRequestOpen(true)}
                className="bg-[#D4AF37] hover:bg-[#B4941F] text-[#0A0F0F]"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Request
              </Button>
            </div>
            
            <DiligenceRequestTable 
              requests={filteredRequests}
              categories={categories}
              subcategories={subcategories}
              onSelectRequest={setSelectedRequest}
              isLoading={isLoading}
            />
          </div>
        </TabsContent>
        
        <TabsContent value="timeline" className="flex-1">
          <Card className="bg-[#1A1F2E] border-[#2A2F3A]">
            <CardContent className="p-12 text-center">
              <p className="text-gray-400">Timeline view coming soon</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Request Detail Panel */}
      <DiligenceRequestPanel
        request={selectedRequest}
        categories={categories}
        subcategories={subcategories}
        onClose={() => setSelectedRequest(null)}
      />
      
      {/* Add Request Dialog */}
      <AddRequestDialog
        open={addRequestOpen}
        onOpenChange={setAddRequestOpen}
        dealId={dealId || ''}
        categories={categories}
        subcategories={subcategories}
        defaultCategoryId={selectedCategoryId}
        defaultSubcategoryId={selectedSubcategoryId}
      />
    </div>
  );
};

export default DealDiligenceTracker;
