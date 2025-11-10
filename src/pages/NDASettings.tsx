import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { FileText, Settings as SettingsIcon, Clock, Mail } from 'lucide-react';
import DashboardLayout from '@/components/investor/DashboardLayout';

export const NDASettings = () => {
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    master_nda_content: '',
    single_deal_nda_content: '',
    default_expiry_days: 60,
    auto_expire_enabled: true,
    require_signature: true,
    send_expiry_warnings: true,
    warning_days_before: 7
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const { data } = await supabase
      .from('platform_settings')
      .select('*')
      .eq('key', 'nda_settings')
      .single();

    if (data?.value) {
      setSettings({ ...settings, ...data.value });
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('platform_settings')
        .upsert({
          key: 'nda_settings',
          value: settings
        });

      if (error) throw error;
      toast.success('NDA settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout activeTab="nda-settings">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2 text-foreground">
              <FileText className="h-8 w-8" />
              NDA Settings
            </h1>
            <p className="text-muted-foreground mt-2">
              Configure NDA templates, expiration, and signing requirements
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => window.open('/dashboard/ndas', '_blank')}
            >
              View Signed NDAs
            </Button>
            <Button onClick={saveSettings} disabled={saving}>
              {saving ? 'Saving...' : 'Save All Changes'}
            </Button>
          </div>
        </div>

        <Tabs defaultValue="templates" className="space-y-6">
          <TabsList>
            <TabsTrigger value="templates">
              <FileText className="h-4 w-4 mr-2" />
              NDA Templates
            </TabsTrigger>
            <TabsTrigger value="expiration">
              <Clock className="h-4 w-4 mr-2" />
              Expiration Settings
            </TabsTrigger>
            <TabsTrigger value="requirements">
              <SettingsIcon className="h-4 w-4 mr-2" />
              Signing Requirements
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <Mail className="h-4 w-4 mr-2" />
              Notifications
            </TabsTrigger>
          </TabsList>

          {/* Templates Tab */}
          <TabsContent value="templates" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Master NDA Template</CardTitle>
                <CardDescription>
                  Used for portfolio-wide access. This NDA covers all deals.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Document Title</Label>
                  <Input
                    value="Master Non-Disclosure Agreement"
                    placeholder="Master Non-Disclosure Agreement"
                  />
                </div>
                <div className="space-y-2">
                  <Label>NDA Content</Label>
                  <Textarea
                    value={settings.master_nda_content}
                    onChange={(e) => setSettings({ ...settings, master_nda_content: e.target.value })}
                    placeholder="Enter the complete master NDA text..."
                    rows={15}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    Available variables: {'{{investor_name}}'}, {'{{investor_email}}'}, {'{{date}}'}, {'{{company_name}}'}
                  </p>
                </div>
                <Button variant="outline">
                  Preview Template
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Single Deal NDA Template</CardTitle>
                <CardDescription>
                  Used for individual deal access. Specific to one opportunity.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Document Title</Label>
                  <Input
                    value="Non-Disclosure Agreement"
                    placeholder="Non-Disclosure Agreement"
                  />
                </div>
                <div className="space-y-2">
                  <Label>NDA Content</Label>
                  <Textarea
                    value={settings.single_deal_nda_content}
                    onChange={(e) => setSettings({ ...settings, single_deal_nda_content: e.target.value })}
                    placeholder="Enter the complete single deal NDA text..."
                    rows={15}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    Available variables: {'{{investor_name}}'}, {'{{deal_name}}'}, {'{{date}}'}, {'{{asking_price}}'}
                  </p>
                </div>
                <Button variant="outline">
                  Preview Template
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Expiration Tab */}
          <TabsContent value="expiration" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Default Expiration Period</CardTitle>
                <CardDescription>
                  How long should NDAs remain valid before requiring renewal?
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Default Expiry Duration</Label>
                  <Select
                    value={settings.default_expiry_days.toString()}
                    onValueChange={(value) => setSettings({ ...settings, default_expiry_days: parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 days</SelectItem>
                      <SelectItem value="60">60 days (Recommended)</SelectItem>
                      <SelectItem value="90">90 days</SelectItem>
                      <SelectItem value="180">180 days</SelectItem>
                      <SelectItem value="365">1 year</SelectItem>
                      <SelectItem value="0">Never expire</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    All new NDAs will automatically expire after this period
                  </p>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-0.5">
                    <Label>Auto-Expire NDAs</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically mark NDAs as expired when period ends
                    </p>
                  </div>
                  <Switch
                    checked={settings.auto_expire_enabled}
                    onCheckedChange={(checked) => setSettings({ ...settings, auto_expire_enabled: checked })}
                  />
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">What happens when NDAs expire?</h4>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li>Data room access is automatically revoked</li>
                    <li>Investor receives expiration notification</li>
                    <li>Investor must re-sign to regain access</li>
                    <li>Admin can manually extend expired NDAs</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Requirements Tab */}
          <TabsContent value="requirements" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Signing Requirements</CardTitle>
                <CardDescription>
                  Configure what's required for valid NDA signatures
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-0.5">
                    <Label>Require Electronic Signature</Label>
                    <p className="text-sm text-muted-foreground">
                      Investors must type their full name to sign
                    </p>
                  </div>
                  <Switch
                    checked={settings.require_signature}
                    onCheckedChange={(checked) => setSettings({ ...settings, require_signature: checked })}
                  />
                </div>

                <div className="p-4 border rounded-lg space-y-3">
                  <h4 className="font-medium">Captured Information</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 bg-green-500 rounded-full" />
                      <span>Signer name and email</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 bg-green-500 rounded-full" />
                      <span>Company name (if provided)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 bg-green-500 rounded-full" />
                      <span>IP address</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 bg-green-500 rounded-full" />
                      <span>Browser/device info</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 bg-green-500 rounded-full" />
                      <span>Timestamp</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 bg-green-500 rounded-full" />
                      <span>Full NDA content</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <SettingsIcon className="h-4 w-4" />
                    Legal Compliance
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Electronic signatures captured meet ESIGN Act requirements. All signatures are timestamped, 
                    IP-tracked, and stored with full audit trails for legal enforceability.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Expiration Warnings</CardTitle>
                <CardDescription>
                  Notify investors before their NDAs expire
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-0.5">
                    <Label>Send Expiry Warnings</Label>
                    <p className="text-sm text-muted-foreground">
                      Email investors before their NDA expires
                    </p>
                  </div>
                  <Switch
                    checked={settings.send_expiry_warnings}
                    onCheckedChange={(checked) => setSettings({ ...settings, send_expiry_warnings: checked })}
                  />
                </div>

                {settings.send_expiry_warnings && (
                  <div className="space-y-2">
                    <Label>Warning Period</Label>
                    <Select
                      value={settings.warning_days_before.toString()}
                      onValueChange={(value) => setSettings({ ...settings, warning_days_before: parseInt(value) })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3">3 days before</SelectItem>
                        <SelectItem value="7">7 days before</SelectItem>
                        <SelectItem value="14">14 days before</SelectItem>
                        <SelectItem value="30">30 days before</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground">
                      Send reminder email this many days before expiration
                    </p>
                  </div>
                )}

                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Email Preview</h4>
                  <div className="bg-muted p-4 rounded text-sm space-y-2">
                    <p className="font-medium">Subject: Your NDA is expiring soon</p>
                    <p className="text-muted-foreground">
                      Hi {'{{investor_name}}'}, <br /><br />
                      Your Non-Disclosure Agreement for <strong>{'{{deal_name}}'}</strong> will expire in {settings.warning_days_before} days 
                      on {'{{expiry_date}}'}.<br /><br />
                      To maintain access to the data room, please sign a new NDA before it expires.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Admin Notifications</CardTitle>
                <CardDescription>
                  Get notified about NDA activity
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-0.5">
                    <Label>New NDA Signatures</Label>
                    <p className="text-sm text-muted-foreground">
                      Notify admins when investors sign NDAs
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-0.5">
                    <Label>Expired NDAs</Label>
                    <p className="text-sm text-muted-foreground">
                      Daily summary of NDAs that expired
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default NDASettings;
