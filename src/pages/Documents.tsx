
import React from 'react';
import DashboardLayout from '@/components/investor/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';
import { withAuth } from '@/utils/withAuth';

const DocumentsPage = () => {
  return (
    <DashboardLayout activeTab="documents">
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <FileText className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">Document Management</h1>
            <p className="text-muted-foreground">
              Manage documents across all deals and companies
            </p>
          </div>
        </div>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Document Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                Document Management System
              </h3>
              <p className="text-muted-foreground">
                TODO: Implement global document management features including:
                <br />• Document search and filtering
                <br />• Bulk operations
                <br />• Access control management
                <br />• Version history
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default withAuth('admin')(DocumentsPage);
