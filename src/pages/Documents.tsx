
import React, { useState } from 'react';
import DashboardLayout from '@/components/investor/DashboardLayout';
import { FileText } from 'lucide-react';
import CompanySelector from '@/components/documents/CompanySelector';
import DocumentCategoriesView from '@/components/documents/DocumentCategoriesView';

const DocumentsPage = () => {
  const [selectedDealId, setSelectedDealId] = useState<string>('all');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleDealSelect = (dealId: string) => {
    setSelectedDealId(dealId);
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <DashboardLayout activeTab="documents">
      <div className="space-y-4">
        {/* Compact Header */}
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5 text-primary" />
          <h1 className="text-xl font-semibold text-foreground">Document Management</h1>
        </div>

        {/* Company Selector */}
        <CompanySelector 
          selectedDealId={selectedDealId}
          onDealSelect={handleDealSelect}
        />

        {/* Document Categories */}
        <DocumentCategoriesView
          dealId={selectedDealId}
          onRefresh={() => setRefreshTrigger(prev => prev + 1)}
        />
      </div>
    </DashboardLayout>
  );
};

export default DocumentsPage;
