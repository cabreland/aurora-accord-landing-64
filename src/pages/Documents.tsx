import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import DocumentsToolbar from '@/components/documents/DocumentsToolbar';
import DocumentCategoriesView from '@/components/documents/DocumentCategoriesView';
import StorageDebugger from '@/components/debug/StorageDebugger';
import UploadDebugger from '@/components/debug/UploadDebugger';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Building2, Bug } from 'lucide-react';
import DashboardLayout from '@/components/investor/DashboardLayout';

const Documents = () => {
  const [selectedDealId, setSelectedDealId] = useState<string>('all');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [dealInfo, setDealInfo] = useState<{ title: string; company_name: string } | null>(null);
  const [showDebugger, setShowDebugger] = useState(false);
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

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

  // Build breadcrumbs based on current context
  const breadcrumbs = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Documents' },
  ];
  
  if (dealInfo) {
    breadcrumbs.splice(1, 0, { label: 'Deals', path: '/deals' });
    breadcrumbs[2] = { label: dealInfo.title, path: `/deal/${selectedDealId}` };
    breadcrumbs.push({ label: 'Documents' });
  }

  return (
    <DashboardLayout breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-[#FAFAFA]">Document Management</h1>
              {dealInfo && (
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-[#F4E4BC]/60" />
                  <Badge variant="outline" className="bg-[#D4AF37]/10 text-[#D4AF37] border-[#D4AF37]/20">
                    {dealInfo.title} • {dealInfo.company_name}
                  </Badge>
                </div>
              )}
            </div>
          </div>
          
          {/* Debug Button - Only show for specific deal */}
          {selectedDealId !== 'all' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDebugger(!showDebugger)}
              className="gap-2 border-[#D4AF37]/30 text-[#D4AF37] hover:bg-[#D4AF37]/10"
            >
              <Bug className="w-4 h-4" />
              {showDebugger ? 'Hide' : 'Debug Storage'}
            </Button>
          )}
        </div>

        <DocumentsToolbar 
          onDealSelect={setSelectedDealId}
          selectedDealId={selectedDealId}
        />
        
        {/* Upload System Test - Only show when enabled and for specific deal */}
        {showDebugger && selectedDealId !== 'all' && (
          <div className="space-y-4">
            <StorageDebugger dealId={selectedDealId} />
            <UploadDebugger dealId={selectedDealId} />
          </div>
        )}
        
        <DocumentCategoriesView 
          dealId={selectedDealId}
          refreshTrigger={refreshTrigger}
          onRefresh={() => {
            console.log('🔄 Documents.tsx onRefresh called - incrementing refreshTrigger from', refreshTrigger, 'to', refreshTrigger + 1);
            setRefreshTrigger(prev => prev + 1);
          }}
        />
      </div>
    </DashboardLayout>
  );
};

export default Documents;