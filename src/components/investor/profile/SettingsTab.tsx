import React, { useState } from 'react';
import { Bell, Shield, Lock, Download, Trash2, Smartphone, Monitor, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';

interface SettingsTabProps {
  profileData: {
    email: string;
    fullName: string;
  };
}

export const SettingsTab: React.FC<SettingsTabProps> = ({ profileData }) => {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState({
    newDealMatches: true,
    dealUpdates: true,
    accessApproved: true,
    weeklySummary: false,
    marketing: false,
  });

  const [privacy, setPrivacy] = useState({
    profileVisible: true,
    shareInvestmentCriteria: true,
    allowDirectContact: true,
  });

  const handleNotificationChange = (key: keyof typeof notifications) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
    toast({
      title: 'Settings Updated',
      description: 'Your notification preferences have been saved.',
    });
  };

  const handlePrivacyChange = (key: keyof typeof privacy) => {
    setPrivacy(prev => ({ ...prev, [key]: !prev[key] }));
    toast({
      title: 'Settings Updated',
      description: 'Your privacy settings have been saved.',
    });
  };

  const handleDownloadData = () => {
    toast({
      title: 'Download Started',
      description: 'Your data export is being prepared and will download shortly.',
    });
  };

  return (
    <div className="space-y-6">
      {/* Email Preferences */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-[hsl(var(--primary))]" />
            <CardTitle className="text-lg text-foreground">Email Preferences</CardTitle>
          </div>
          <CardDescription>
            Manage what emails you receive from us
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-foreground">New Deal Matches</Label>
              <p className="text-sm text-muted-foreground">
                Get notified when new deals match your criteria
              </p>
            </div>
            <Switch 
              checked={notifications.newDealMatches}
              onCheckedChange={() => handleNotificationChange('newDealMatches')}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-foreground">Deal Updates</Label>
              <p className="text-sm text-muted-foreground">
                Updates on deals you're watching or interested in
              </p>
            </div>
            <Switch 
              checked={notifications.dealUpdates}
              onCheckedChange={() => handleNotificationChange('dealUpdates')}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-foreground">Access Request Approved</Label>
              <p className="text-sm text-muted-foreground">
                When your access requests are approved
              </p>
            </div>
            <Switch 
              checked={notifications.accessApproved}
              onCheckedChange={() => handleNotificationChange('accessApproved')}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-foreground">Weekly Summary</Label>
              <p className="text-sm text-muted-foreground">
                A weekly digest of new deals and activity
              </p>
            </div>
            <Switch 
              checked={notifications.weeklySummary}
              onCheckedChange={() => handleNotificationChange('weeklySummary')}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-foreground">Marketing Communications</Label>
              <p className="text-sm text-muted-foreground">
                News, tips, and promotional content
              </p>
            </div>
            <Switch 
              checked={notifications.marketing}
              onCheckedChange={() => handleNotificationChange('marketing')}
            />
          </div>
        </CardContent>
      </Card>

      {/* Privacy Settings */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-[hsl(var(--primary))]" />
            <CardTitle className="text-lg text-foreground">Privacy Settings</CardTitle>
          </div>
          <CardDescription>
            Control who can see your information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-foreground">Profile Visibility</Label>
              <p className="text-sm text-muted-foreground">
                Make your profile visible to brokers
              </p>
            </div>
            <Switch 
              checked={privacy.profileVisible}
              onCheckedChange={() => handlePrivacyChange('profileVisible')}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-foreground">Share Investment Criteria</Label>
              <p className="text-sm text-muted-foreground">
                Allow your criteria to be used for deal matching
              </p>
            </div>
            <Switch 
              checked={privacy.shareInvestmentCriteria}
              onCheckedChange={() => handlePrivacyChange('shareInvestmentCriteria')}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-foreground">Direct Contact</Label>
              <p className="text-sm text-muted-foreground">
                Allow brokers to contact you directly
              </p>
            </div>
            <Switch 
              checked={privacy.allowDirectContact}
              onCheckedChange={() => handlePrivacyChange('allowDirectContact')}
            />
          </div>
        </CardContent>
      </Card>

      {/* Data & Export */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-[hsl(var(--primary))]" />
            <CardTitle className="text-lg text-foreground">Data & Export</CardTitle>
          </div>
          <CardDescription>
            Download or delete your data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-foreground">Download My Data</Label>
              <p className="text-sm text-muted-foreground">
                Export all your data in a portable format
              </p>
            </div>
            <Button variant="outline" onClick={handleDownloadData}>
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-foreground text-red-500">Delete Account</Label>
              <p className="text-sm text-muted-foreground">
                Permanently delete your account and all data
              </p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                    Delete Account?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your account
                    and remove all your data from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction className="bg-red-500 hover:bg-red-600">
                    Delete Account
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>

      {/* Security */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-[hsl(var(--primary))]" />
            <CardTitle className="text-lg text-foreground">Security</CardTitle>
          </div>
          <CardDescription>
            Manage your account security settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-foreground">Change Password</Label>
              <p className="text-sm text-muted-foreground">
                Update your password regularly for security
              </p>
            </div>
            <Button variant="outline">
              <Lock className="w-4 h-4 mr-2" />
              Change
            </Button>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-foreground">Two-Factor Authentication</Label>
              <p className="text-sm text-muted-foreground">
                Add an extra layer of security to your account
              </p>
            </div>
            <Badge variant="outline" className="border-yellow-500 text-yellow-500">
              Not Enabled
            </Badge>
          </div>
          <Separator />
          <div>
            <Label className="text-foreground mb-3 block">Active Sessions</Label>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <Monitor className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Current Session</p>
                    <p className="text-xs text-muted-foreground">Chrome on macOS • Now</p>
                  </div>
                </div>
                <Badge variant="secondary">Current</Badge>
              </div>
            </div>
            <Button variant="link" className="mt-2 px-0 text-[hsl(var(--primary))]">
              Sign out all other sessions
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
