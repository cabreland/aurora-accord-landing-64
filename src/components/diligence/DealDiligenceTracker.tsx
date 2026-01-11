import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Search,
  Filter,
  AlertCircle
} from 'lucide-react';
import { Input } from '@/components/ui/input';
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
import DiligenceHeader from './DiligenceHeader';
import EnhancedCategorySidebar from './EnhancedCategorySidebar';
import DiligenceTableSkeleton from './DiligenceTableSkeleton';

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
  useEffect(() => {
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

  // Calculate active filters count
  const activeFiltersCount = [
    statusFilter !== 'all',
    priorityFilter !== 'all',
    searchQuery.length > 0
  ].filter(Boolean).length;

  return (
    <div className="h-full flex flex-col bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Enterprise Header */}
      <DiligenceHeader
        deal={deal}
        completedCount={completedRequests}
        totalCount={totalRequests}
        activeFiltersCount={activeFiltersCount}
        onAddRequest={() => setAddRequestOpen(true)}
      />
      
      <div className="flex-1 flex overflow-hidden">
        {/* Enhanced Category Sidebar */}
        <EnhancedCategorySidebar
          categories={categories}
          subcategories={subcategories}
          categoryCounts={categoryCounts}
          subcategoryCounts={subcategoryCounts}
          selectedCategoryId={selectedCategoryId}
          selectedSubcategoryId={selectedSubcategoryId}
          expandedCategories={expandedCategories}
          totalRequests={totalRequests}
          onSelectCategory={selectCategory}
          onSelectSubcategory={selectSubcategory}
          onToggleCategory={toggleCategory}
        />
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden bg-white">
          {/* Filter Bar */}
          <div className="p-4 border-b border-gray-200 bg-gray-50/80">
            <div className="flex items-center gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search requests..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 h-9"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px] bg-white border-gray-300 h-9">
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
                <SelectTrigger className="w-[140px] bg-white border-gray-300 h-9">
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
            {isLoading ? (
              <DiligenceTableSkeleton />
            ) : (
              <DiligenceRequestTable 
                requests={filteredRequests}
                categories={categories}
                subcategories={subcategories}
                onSelectRequest={setSelectedRequest}
                isLoading={false}
                dealId={dealId}
                onAddRequest={() => setAddRequestOpen(true)}
              />
            )}
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
