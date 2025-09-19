import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import DocumentsToolbar from '@/components/documents/DocumentsToolbar';
import DocumentCategoriesView from '@/components/documents/DocumentCategoriesView';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Building2 } from 'lucide-react';

const Documents = () => {
  const [selectedDealId, setSelectedDealId] = useState<string>('all');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [dealInfo, setDealInfo] = useState<{ title: string; company_name: string } | null>(null);
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Check for deal parameter in URL
  useEffect(() => {
    const dealParam = searchParams.get('deal');
    if (dealParam) {
      setSelectedDealId(dealParam);
    }
  }, [searchParams]);

  // Fetch deal info for navigation
  useEffect(() => {
    if (selectedDealId && selectedDealId !== 'all') {
      fetchDealInfo();
    } else {
      setDealInfo(null);
    }
  }, [selectedDealId]);

  const fetchDealInfo = async () => {
    try {
      const { data, error } = await supabase
        .from('deals')
        .select('title, company_name')
        .eq('id', selectedDealId)
        .single();

      if (error) throw error;
      setDealInfo(data);
    } catch (error) {
      console.error('Error fetching deal info:', error);
    }
  };

  if (!user) {
    return <div>Please sign in to access documents.</div>;
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="space-y-6">
        {/* Navigation Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/deal-management')}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Deals
            </Button>
            
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-foreground">Document Management</h1>
              {dealInfo && (
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-muted-foreground" />
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                    {dealInfo.title} • {dealInfo.company_name}
                  </Badge>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <DocumentsToolbar 
          onDealSelect={setSelectedDealId}
          selectedDealId={selectedDealId}
        />
        
        <DocumentCategoriesView 
          dealId={selectedDealId}
          onRefresh={() => setRefreshTrigger(prev => prev + 1)}
        />
      </div>
    </div>
  );
};

export default Documents;