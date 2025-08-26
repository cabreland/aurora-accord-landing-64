
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Save } from 'lucide-react';
import { useSettings } from '@/hooks/useSettings';

const AccessPolicyTab: React.FC = () => {
  const { settings, loading, updateSetting } = useSettings();
  const [localSettings, setLocalSettings] = useState<Record<string, any>>({});

  const getSettingValue = (key: string, defaultValue: any = '') => {
    if (localSettings[key] !== undefined) {
      return localSettings[key];
    }
    const setting = settings.find(s => s.key === key);
    return setting?.value ?? defaultValue;
  };

  const handleSettingChange = (key: string, value: any) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    for (const [key, value] of Object.entries(localSettings)) {
      await updateSetting(key, value);
    }
    setLocalSettings({});
  };

  const hasChanges = Object.keys(localSettings).length > 0;

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground">Access Policy Settings</CardTitle>
        <p className="text-sm text-muted-foreground">
          Configure how users can request and receive access to documents
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Label>Allow Access Requests</Label>
            <p className="text-sm text-muted-foreground">
              Enable investors to request access to higher confidentiality levels
            </p>
          </div>
          <Switch
            checked={getSettingValue('allow_requests', true)}
            onCheckedChange={(checked) => handleSettingChange('allow_requests', checked)}
          />
        </div>

        <div>
          <Label htmlFor="default_confidential">Default Confidentiality Level</Label>
          <Select 
            value={getSettingValue('default_confidential', 'nda_only')} 
            onValueChange={(value) => handleSettingChange('default_confidential', value)}
          >
            <SelectTrigger className="bg-background border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="public">Public</SelectItem>
              <SelectItem value="nda_only">NDA Required</SelectItem>
              <SelectItem value="restricted">Restricted</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground mt-1">
            Default access level for new documents
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label>Auto-Version Documents</Label>
            <p className="text-sm text-muted-foreground">
              Automatically create new versions when documents are updated
            </p>
          </div>
          <Switch
            checked={getSettingValue('auto_version', true)}
            onCheckedChange={(checked) => handleSettingChange('auto_version', checked)}
          />
        </div>

        <div>
          <Label htmlFor="max_versions">Maximum Document Versions</Label>
          <Input
            id="max_versions"
            type="number"
            value={getSettingValue('max_versions', 10)}
            onChange={(e) => handleSettingChange('max_versions', parseInt(e.target.value) || 10)}
            min="1"
            max="50"
            className="bg-background border-border"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Maximum number of versions to keep per document (1-50)
          </p>
        </div>

        {hasChanges && (
          <div className="flex justify-end pt-4 border-t border-border">
            <Button onClick={handleSave} disabled={loading} className="flex items-center gap-2">
              <Save className="w-4 h-4" />
              Save Changes
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AccessPolicyTab;
