
import React from 'react';
import { useParams } from 'react-router-dom';
import DashboardLayout from '@/components/investor/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2 } from 'lucide-react';

const DealDetailPage = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Building2 className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">Deal Details</h1>
            <p className="text-muted-foreground">
              Deal ID: {id}
            </p>
          </div>
        </div>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Deal Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <Building2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                Deal Detail View
              </h3>
              <p className="text-muted-foreground">
                TODO: Implement comprehensive deal details including:
                <br />• Company information and financials
                <br />• Document repository
                <br />• Access control settings
                <br />• Activity timeline
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default DealDetailPage;
