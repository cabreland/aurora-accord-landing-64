import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Building2, 
  FileText, 
  CheckCircle, 
  AlertTriangle,
  RefreshCw,
  Calendar,
  DollarSign
} from 'lucide-react';

interface Deal {
  id: string;
  title: string;
  company_name: string;
  status: string;
  revenue?: string;
  ebitda?: string;
  created_at: string;
  document_stats?: {
    total: number;
    uploaded: number;
    missing: number;
    categories: Record<string, number>;
  };
}

interface EnhancedDocumentsToolbarProps {
  onDealSelect: (dealId: string) => void;
  selectedDealId: string;
}

const REQUIRED_DOCUMENT_CATEGORIES = [
  'cim',
  'financials', 
  'legal',
  'due_diligence'
];

const ALL_CATEGORIES = [
  'cim',
  'nda', 
  'financials',
  'buyer_notes',
  'legal',
  'due_diligence',
  'other'
];

const EnhancedDocumentsToolbar = ({ onDealSelect, selectedDealId }: EnhancedDocumentsToolbarProps) => {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchDealsWithDocumentStats();
  }, []);

  const fetchDealsWithDocumentStats = async () => {
    try {
      setIsLoading(true);
      
      // Fetch deals with document counts
      const { data: dealsData, error: dealsError } = await supabase
        .from('deals')
        .select(`
          id, title, company_name, status, revenue, ebitda, created_at
        `)
        .order('created_at', { ascending: false });

      if (dealsError) throw dealsError;

      // Fetch document stats for each deal
      const dealsWithStats = await Promise.all(
        (dealsData || []).map(async (deal) => {
          const { data: docsData, error: docsError } = await supabase
            .from('documents')
            .select('tag')
            .eq('deal_id', deal.id);

          if (docsError) {
            console.error('Error fetching docs for deal:', deal.id, docsError);
            return { ...deal, document_stats: { total: 0, uploaded: 0, missing: 4, categories: {} } };
          }

          const categories = docsData?.reduce((acc, doc) => {
            acc[doc.tag] = (acc[doc.tag] || 0) + 1;
            return acc;
          }, {} as Record<string, number>) || {};

          const uploaded = docsData?.length || 0;
          const hasRequiredDocs = REQUIRED_DOCUMENT_CATEGORIES.filter(cat => categories[cat] > 0).length;
          const missing = REQUIRED_DOCUMENT_CATEGORIES.length - hasRequiredDocs;

          return {
            ...deal,
            document_stats: {
              total: uploaded,
              uploaded: hasRequiredDocs,
              missing,
              categories
            }
          };
        })
      );

      setDeals(dealsWithStats);
    } catch (error) {
      console.error('Error fetching deals:', error);
      toast({
        title: "Error",
        description: "Failed to load deals and document stats",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchDealsWithDocumentStats();
  };

  const getCompletionPercentage = (stats?: Deal['document_stats']) => {
    if (!stats) return 0;
    return Math.round((stats.uploaded / REQUIRED_DOCUMENT_CATEGORIES.length) * 100);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'draft': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      'active': 'bg-green-500/20 text-green-400 border-green-500/30',
      'archived': 'bg-gray-500/20 text-gray-400 border-gray-500/30',
      'pending': 'bg-blue-500/20 text-blue-400 border-blue-500/30'
    };
    return colors[status] || colors.draft;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <p className="text-muted-foreground">Loading deals...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Select Company</h3>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            className="border-border hover:bg-muted"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDealSelect('all')}
            className={selectedDealId === 'all' ? 'bg-primary text-primary-foreground' : ''}
          >
            View All Documents
          </Button>
        </div>
      </div>

      {/* Company Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {deals.map((deal) => {
          const completionPercentage = getCompletionPercentage(deal.document_stats);
          const isSelected = selectedDealId === deal.id;
          
          return (
            <Card 
              key={deal.id}
              className={`cursor-pointer transition-all hover:shadow-lg border-2 ${
                isSelected 
                  ? 'border-primary bg-primary/5' 
                  : 'border-border hover:border-primary/50'
              }`}
              onClick={() => onDealSelect(deal.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-sm font-semibold text-foreground truncate">
                      {deal.company_name}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground truncate mt-1">
                      {deal.title}
                    </p>
                  </div>
                  <Badge variant="outline" className={getStatusColor(deal.status)}>
                    {deal.status.toUpperCase()}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0 space-y-4">
                {/* Financial Info */}
                <div className="flex items-center gap-4 text-xs">
                  {deal.revenue && (
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-3 h-3 text-muted-foreground" />
                      <span className="text-muted-foreground">Rev:</span>
                      <span className="text-foreground font-medium">{deal.revenue}</span>
                    </div>
                  )}
                  {deal.ebitda && (
                    <div className="flex items-center gap-1">
                      <span className="text-muted-foreground">EBITDA:</span>
                      <span className="text-foreground font-medium">{deal.ebitda}</span>
                    </div>
                  )}
                </div>

                {/* Document Progress */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Document Progress</span>
                    </div>
                    <span className="text-xs font-medium text-foreground">
                      {completionPercentage}%
                    </span>
                  </div>
                  
                  <Progress value={completionPercentage} className="h-2" />
                  
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <CheckCircle className="w-3 h-3 text-green-400" />
                        <span className="text-muted-foreground">
                          {deal.document_stats?.uploaded || 0} Complete
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-orange-400" />
                        <span className="text-muted-foreground">
                          {deal.document_stats?.missing || 0} Missing
                        </span>
                      </div>
                    </div>
                    <span className="text-muted-foreground">
                      {deal.document_stats?.total || 0} docs
                    </span>
                  </div>
                </div>

                {/* Creation Date */}
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="w-3 h-3" />
                  <span>
                    Created {new Date(deal.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {deals.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            No deals found. Create a deal to start managing documents.
          </p>
        </div>
      )}
    </div>
  );
};

export default EnhancedDocumentsToolbar;