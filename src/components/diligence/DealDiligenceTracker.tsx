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
  Users,
  Settings,
  Cpu,
  Leaf,
  Folder,
  CheckCircle,
  AlertCircle,
  Filter,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  useDiligenceRequests, 
  useDiligenceCategories, 
  useDiligenceSubcategories,
  DiligenceRequest,
} from '@/hooks/useDiligenceTracker';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import DiligenceRequestTable from './DiligenceRequestTable';
import DiligenceRequestModal from './DiligenceRequestModal';
import AddRequestDialog from './AddRequestDialog';

const iconMap: Record<string, React.ComponentType<any>> = {
  'bar-chart-3': BarChart3,
  'scale': Scale,
  'users': Users,
  'settings': Settings,
  'cpu': Cpu,
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
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [addRequestOpen, setAddRequestOpen] = useState(false);
  
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
  
  // Expand all categories by default
  React.useEffect(() => {
    if (categories.length > 0 && expandedCategories.size === 0) {
      setExpandedCategories(new Set(categories.map(c => c.id)));
    }
  }, [categories]);
  
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
      
      // Status filter
      if (statusFilter !== 'all' && request.status !== statusFilter) {
        return false;
      }
      
      // Priority filter
      if (priorityFilter !== 'all' && request.priority !== priorityFilter) {
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
  }, [requests, selectedCategoryId, selectedSubcategoryId, statusFilter, priorityFilter, searchQuery]);
  
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

  // Get category progress indicator
  const getCategoryProgressIndicator = (categoryId: string) => {
    const count = categoryCounts[categoryId] || { total: 0, completed: 0 };
    if (count.total === 0) return null;
    
    const pct = (count.completed / count.total) * 100;
    
    if (pct === 100) {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    } else if (pct > 0) {
      return <div className="w-2 h-2 rounded-full bg-amber-500" />;
    } else {
      return <div className="w-2 h-2 rounded-full bg-red-500" />;
    }
  };

  return (
    <div className="h-full flex flex-col bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/dashboard/diligence-tracker')}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="h-6 w-px bg-gray-200" />
            <div>
              <h1 className="text-lg font-semibold text-gray-900">{deal?.company_name || 'Loading...'}</h1>
              <p className="text-sm text-gray-500">Due Diligence Tracker</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Progress Circle */}
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12">
                <svg className="w-12 h-12 transform -rotate-90">
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    stroke="#E5E7EB"
                    strokeWidth="4"
                    fill="none"
                  />
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    stroke="#10B981"
                    strokeWidth="4"
                    fill="none"
                    strokeDasharray={`${progressPercentage * 1.25} 125`}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-gray-900">
                  {progressPercentage}%
                </span>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">{completedRequests}/{totalRequests}</div>
                <div className="text-xs text-gray-500">Resolved</div>
              </div>
            </div>
            
            <Button 
              onClick={() => setAddRequestOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Request
            </Button>
          </div>
        </div>
      </div>
      
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Category Tree */}
        <div className="w-72 bg-gray-50 border-r border-gray-200 overflow-y-auto">
          <div className="p-4">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Categories
            </h2>
            
            {/* All requests button */}
            <button
              onClick={() => selectCategory(null)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors mb-2 ${
                !selectedCategoryId 
                  ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center gap-2">
                <Folder className="w-4 h-4" />
                <span className="font-medium text-sm">All Requests</span>
              </div>
              <Badge variant="secondary" className="text-xs bg-gray-200 text-gray-700">
                {totalRequests}
              </Badge>
            </button>
            
            <div className="h-px bg-gray-200 my-3" />
            
            {/* Category list */}
            <div className="space-y-1">
              {categories.map((cat) => {
                const count = categoryCounts[cat.id] || { total: 0, completed: 0 };
                const Icon = iconMap[cat.icon || 'folder'] || Folder;
                const isExpanded = expandedCategories.has(cat.id);
                const catSubs = subcategories.filter(s => s.category_id === cat.id);
                const hasSubcategories = catSubs.length > 0;
                const isSelected = selectedCategoryId === cat.id && !selectedSubcategoryId;
                
                return (
                  <div key={cat.id}>
                    <div 
                      className={`flex items-center rounded-lg transition-colors ${
                        isSelected 
                          ? 'bg-blue-50 border border-blue-200' 
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      {hasSubcategories && (
                        <button
                          onClick={() => toggleCategory(cat.id)}
                          className="p-2 text-gray-400 hover:text-gray-600"
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
                        className={`flex-1 flex items-center gap-2 py-2.5 pr-3 ${
                          !hasSubcategories ? 'pl-3' : ''
                        }`}
                      >
                        <Icon 
                          className="w-4 h-4" 
                          style={{ color: cat.color || '#6B7280' }} 
                        />
                        <span className={`flex-1 text-left text-sm font-medium ${
                          isSelected ? 'text-blue-700' : 'text-gray-700'
                        }`}>
                          {cat.name}
                        </span>
                        <div className="flex items-center gap-2">
                          {getCategoryProgressIndicator(cat.id)}
                          <span className={`text-xs ${
                            isSelected ? 'text-blue-600' : 'text-gray-500'
                          }`}>
                            {count.completed}/{count.total}
                          </span>
                        </div>
                      </button>
                    </div>
                    
                    {isExpanded && hasSubcategories && (
                      <div className="ml-6 mt-1 space-y-0.5 border-l border-gray-200 pl-3">
                        {catSubs.map((sub) => {
                          const subCount = subcategoryCounts[sub.id] || { total: 0, completed: 0 };
                          const isSubSelected = selectedSubcategoryId === sub.id;
                          
                          return (
                            <button
                              key={sub.id}
                              onClick={() => selectSubcategory(sub.id)}
                              className={`w-full flex items-center justify-between px-3 py-1.5 rounded text-sm transition-colors ${
                                isSubSelected
                                  ? 'bg-blue-50 text-blue-700' 
                                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                              }`}
                            >
                              <span>{sub.name}</span>
                              <span className="text-xs text-gray-400">
                                {subCount.completed}/{subCount.total}
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
          </div>
        </div>
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden bg-white">
          {/* Filter Bar */}
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search requests..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px] bg-white border-gray-300">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-gray-400" />
                    <SelectValue placeholder="Status" />
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Resolved</SelectItem>
                  <SelectItem value="blocked">Blocked</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-[140px] bg-white border-gray-300">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-gray-400" />
                    <SelectValue placeholder="Priority" />
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200">
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Request Table */}
          <div className="flex-1 overflow-auto p-4">
            <DiligenceRequestTable 
              requests={filteredRequests}
              categories={categories}
              subcategories={subcategories}
              onSelectRequest={setSelectedRequest}
              isLoading={isLoading}
              dealId={dealId}
              onAddRequest={() => setAddRequestOpen(true)}
            />
          </div>
        </div>
      </div>
      
      {/* Request Detail Modal */}
      <DiligenceRequestModal
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
