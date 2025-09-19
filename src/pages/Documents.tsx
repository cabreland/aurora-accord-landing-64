import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import DocumentsToolbar from '@/components/documents/DocumentsToolbar';
import SimpleDocumentList from '@/components/documents/SimpleDocumentList';
import { useAuth } from '@/hooks/useAuth';

const Documents = () => {
  const [selectedDealId, setSelectedDealId] = useState<string>('all');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  // Check for deal parameter in URL
  useEffect(() => {
    const dealParam = searchParams.get('deal');
    if (dealParam) {
      setSelectedDealId(dealParam);
    }
  }, [searchParams]);

  if (!user) {
    return <div>Please sign in to access documents.</div>;
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Document Management</h1>
        
        <DocumentsToolbar 
          onDealSelect={setSelectedDealId}
          selectedDealId={selectedDealId}
        />
        
        <SimpleDocumentList 
          dealId={selectedDealId !== 'all' ? selectedDealId : undefined}
        />
      </div>
    </div>
  );
};

export default Documents;