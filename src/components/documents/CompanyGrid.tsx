import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Building2, 
  FileText, 
  Clock, 
  MoreHorizontal,
  Calendar,
  TrendingUp,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Deal {
  id: string;
  title: string;
  company_name: string;
  status: string;
  created_at: string;
  updated_at: string;
  document_count?: number;
  completion_percentage?: number;
  required_docs?: number;
  completed_docs?: number;
  last_activity?: string;
}

interface CompanyGridProps {
  searchQuery: string;
  selectedCompanyId: string | null;
  onCompanySelect: (companyId: string) => void;
  refreshTrigger?: number;
}

const CompanyGrid = ({ searchQuery, selectedCompanyId, onCompanySelect, refreshTrigger }: CompanyGridProps) => {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchDeals();
    
    // Subscribe to real-time document changes
    const channel = supabase
      .channel('company-grid-document-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'documents'
        },
        (payload) => {
          console.log('CompanyGrid: Document change detected:', payload);
          // Refresh deals when any document changes
          fetchDeals();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refreshTrigger]);

  const fetchDeals = async () => {
    try {
      setIsLoading(true);
      
      // Fetch deals with document counts
      const { data: dealsData, error: dealsError } = await supabase
        .from('deals')
        .select('id, title, company_name, status, created_at, updated_at')
        .order('updated_at', { ascending: false });

      if (dealsError) throw dealsError;

      // Calculate completion stats for each deal
      const dealsWithStats = await Promise.all(
        (dealsData || []).map(async (deal) => {
          // Get document counts
          const { count: totalDocs, error: countError } = await supabase
            .from('documents')
            .select('*', { count: 'exact', head: true })
            .eq('deal_id', deal.id);

          // Required document categories (from DocumentCategoriesView)
          const requiredCategories = ['cim', 'financials', 'legal', 'due_diligence'] as const;
          
          // Get completed required categories
          const { data: docs, error: docsError } = await supabase
            .from('documents')
            .select('tag')
            .eq('deal_id', deal.id)
            .in('tag', requiredCategories as any);

          if (countError || docsError) {
            console.error('Error fetching doc stats for deal:', deal.id);
          }

          const completedRequired = new Set(docs?.map(d => d.tag) || []).size;
          const completionPercentage = Math.round((completedRequired / requiredCategories.length) * 100);

          return {
            ...deal,
            document_count: totalDocs || 0,
            required_docs: requiredCategories.length,
            completed_docs: completedRequired,
            completion_percentage: completionPercentage,
            last_activity: deal.updated_at
          };
        })
      );

      setDeals(dealsWithStats);
    } catch (error) {
      console.error('Error fetching deals:', error);
      toast({
        title: "Error",
        description: "Failed to load companies",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Filter deals based on search query and apply filters
  const filteredDeals = deals.filter(deal => {
    // Search filter
    const matchesSearch = deal.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         deal.title.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSearch;
  });

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'draft': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      'active': 'bg-green-500/20 text-green-400 border-green-500/30',
      'archived': 'bg-gray-500/20 text-gray-400 border-gray-500/30',
      'pending': 'bg-blue-500/20 text-blue-400 border-blue-500/30'
    };
    return colors[status] || colors.draft;
  };

  const getCompletionIcon = (percentage: number) => {
    if (percentage === 100) {
      return <CheckCircle2 className="w-4 h-4 text-green-500" />;
    } else if (percentage >= 50) {
      return <Clock className="w-4 h-4 text-yellow-500" />;
    } else {
      return <AlertTriangle className="w-4 h-4 text-red-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="bg-card border-border animate-pulse">
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
                <div className="h-2 bg-muted rounded w-full"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {filteredDeals.map((deal) => (
        <Card 
          key={deal.id} 
          className={`bg-card border-border cursor-pointer transition-all hover:shadow-md ${
            selectedCompanyId === deal.id ? 'ring-2 ring-primary' : ''
          }`}
          onClick={() => onCompanySelect(deal.id)}
        >
          <CardContent className="p-4">
            <div className="space-y-3">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground truncate">
                    {deal.company_name}
                  </h3>
                  <p className="text-sm text-muted-foreground truncate">
                    {deal.title}
                  </p>
                </div>
                
                <div className="flex items-center gap-2 ml-2">
                  <Badge variant="outline" className={`${getStatusColor(deal.status)} text-xs`}>
                    {deal.status}
                  </Badge>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <MoreHorizontal className="w-3 h-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-background border-border">
                      <DropdownMenuItem className="text-sm">
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-sm">
                        Bulk Upload
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-sm">
                        Export Data
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-sm text-destructive">
                        Archive Deal
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Progress Section */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getCompletionIcon(deal.completion_percentage || 0)}
                    <span className="text-sm font-medium text-foreground">
                      {deal.completed_docs}/{deal.required_docs} Complete
                    </span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {deal.completion_percentage}%
                  </span>
                </div>
                
                <Progress 
                  value={deal.completion_percentage || 0} 
                  className="h-2"
                />
              </div>

              {/* Stats */}
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <FileText className="w-3 h-3" />
                  <span>{deal.document_count} docs</span>
                </div>
                
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>Updated {formatDate(deal.last_activity || deal.updated_at)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {filteredDeals.length === 0 && !isLoading && (
        <div className="col-span-full text-center py-8">
          <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <h3 className="text-lg font-medium text-foreground mb-1">No companies found</h3>
          <p className="text-muted-foreground">
            {searchQuery ? 'Try adjusting your search criteria' : 'No companies have been added yet'}
          </p>
        </div>
      )}
    </div>
  );
};

export default CompanyGrid;