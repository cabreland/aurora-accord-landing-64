
import React, { useState } from 'react';
import DashboardLayout from '@/components/investor/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Upload, Plus } from 'lucide-react';
import { withAuth } from '@/utils/withAuth';
import DocumentList from '@/components/documents/DocumentList';
import DocumentsToolbar from '@/components/documents/DocumentsToolbar';
import UploadDialog from '@/components/documents/UploadDialog';

const DocumentsPage = () => {
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [selectedDealId, setSelectedDealId] = useState<string>('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleUploadComplete = () => {
    setRefreshTrigger(prev => prev + 1);
    setShowUploadDialog(false);
  };

  return (
    <DashboardLayout activeTab="documents">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold text-foreground">Document Management</h1>
              <p className="text-muted-foreground">
                Manage documents across all deals and companies
              </p>
            </div>
          </div>
          
          <Button 
            onClick={() => setShowUploadDialog(true)}
            className="bg-primary hover:bg-primary/90"
          >
            <Plus className="w-4 h-4 mr-2" />
            Upload Documents
          </Button>
        </div>

        <DocumentsToolbar 
          onDealSelect={setSelectedDealId}
          selectedDealId={selectedDealId}
        />

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">All Documents</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <DocumentList
              dealId={selectedDealId || 'all'}
              canDownload={true}
              canDelete={true}
              refreshTrigger={refreshTrigger}
            />
          </CardContent>
        </Card>

        <UploadDialog
          isOpen={showUploadDialog}
          onClose={() => setShowUploadDialog(false)}
          onUploadComplete={handleUploadComplete}
          selectedDealId={selectedDealId}
        />
      </div>
    </DashboardLayout>
  );
};

export default withAuth('admin')(DocumentsPage);
