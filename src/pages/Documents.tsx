
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
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center gap-3">
          <FileText className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">Document Management</h1>
            <p className="text-muted-foreground">
              Organize and manage documents by company with compliance tracking
            </p>
          </div>
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
