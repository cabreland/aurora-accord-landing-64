import React from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, Lock, Bell, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

export const DealSettingsTab = () => {
  const { dealId } = useParams();

  if (!dealId) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        No deal selected
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Document uploads</Label>
              <p className="text-sm text-muted-foreground">
                Get notified when new documents are uploaded
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Request updates</Label>
              <p className="text-sm text-muted-foreground">
                Get notified when request status changes
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Team changes</Label>
              <p className="text-sm text-muted-foreground">
                Get notified when team members are added or removed
              </p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      {/* Access Control */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Lock className="h-5 w-5" />
            Access Control
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Require NDA for data room access</Label>
              <p className="text-sm text-muted-foreground">
                Investors must sign NDA before viewing documents
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Watermark documents</Label>
              <p className="text-sm text-muted-foreground">
                Add viewer email as watermark to downloaded documents
              </p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg text-destructive">
            <Trash2 className="h-5 w-5" />
            Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Archive Deal</Label>
              <p className="text-sm text-muted-foreground">
                Archive this deal and all associated data
              </p>
            </div>
            <Button variant="outline" className="text-destructive border-destructive/50 hover:bg-destructive/10">
              Archive
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DealSettingsTab;
