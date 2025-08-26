
import React from 'react';
import DashboardLayout from '@/components/investor/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity as ActivityIcon } from 'lucide-react';

const ActivityPage = () => {
  return (
    <DashboardLayout activeTab="activity">
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <ActivityIcon className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">Activity Log</h1>
            <p className="text-muted-foreground">
              Monitor system activity and user actions
            </p>
          </div>
        </div>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <ActivityIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                Activity Monitoring
              </h3>
              <p className="text-muted-foreground">
                TODO: Implement activity logging including:
                <br />• User login/logout events
                <br />• Document access logs
                <br />• Deal creation/updates
                <br />• System audit trail
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ActivityPage;
