
import React, { useState } from 'react';
import DashboardLayout from '@/components/investor/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Upload, Plus } from 'lucide-react';
import DocumentList from '@/components/documents/DocumentList';
import EnhancedDocumentsToolbar from '@/components/documents/EnhancedDocumentsToolbar';
import DocumentStatusDashboard from '@/components/documents/DocumentStatusDashboard';
import EnhancedUploadDialog from '@/components/documents/EnhancedUploadDialog';

const DocumentsPage = () => {
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [selectedDealId, setSelectedDealId] = useState<string>('all');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleUploadComplete = () => {
    setRefreshTrigger(prev => prev + 1);
    setShowUploadDialog(false);
  };

  const handleDealSelect = (dealId: string) => {
    setSelectedDealId(dealId);
  };

  return (
    <DashboardLayout activeTab="documents">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold text-foreground">Document Management Center</h1>
              <p className="text-muted-foreground">
                Professional document organization and compliance tracking for all deals
              </p>
            </div>
          </div>
          
          <Button 
            onClick={() => setShowUploadDialog(true)}
            disabled={selectedDealId === 'all'}
            className="bg-primary hover:bg-primary/90"
          >
            <Plus className="w-4 h-4 mr-2" />
            Upload Documents
          </Button>
        </div>

        <EnhancedDocumentsToolbar 
          onDealSelect={handleDealSelect}
          selectedDealId={selectedDealId}
        />

        {selectedDealId === 'all' ? (
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">All Documents Across Deals</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <DocumentList
                dealId="all"
                canDownload={true}
                canDelete={true}
                refreshTrigger={refreshTrigger}
              />
            </CardContent>
          </Card>
        ) : (
          <DocumentStatusDashboard
            dealId={selectedDealId}
            onRefresh={() => setRefreshTrigger(prev => prev + 1)}
          />
        )}

        <EnhancedUploadDialog
          isOpen={showUploadDialog}
          onClose={() => setShowUploadDialog(false)}
          onUploadComplete={handleUploadComplete}
          selectedDealId={selectedDealId === 'all' ? '' : selectedDealId}
        />
      </div>
    </DashboardLayout>
  );
};

export default DocumentsPage;
