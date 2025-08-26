
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Save, Clock, AlertTriangle } from 'lucide-react';
import { useSettings } from '@/hooks/useSettings';

const DataRetentionTab: React.FC = () => {
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

  const ttlMinutes = getSettingValue('signed_url_ttl_minutes', 15);

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Data Retention Settings
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Configure how long sensitive data is accessible
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label htmlFor="signed_url_ttl_minutes">Signed URL TTL (Minutes)</Label>
          <Input
            id="signed_url_ttl_minutes"
            type="number"
            value={ttlMinutes}
            onChange={(e) => handleSettingChange('signed_url_ttl_minutes', parseInt(e.target.value) || 15)}
            min="5"
            max="1440"
            className="bg-background border-border"
          />
          <p className="text-xs text-muted-foreground mt-1">
            How long document download links remain valid (5-1440 minutes)
          </p>
          
          {ttlMinutes < 15 && (
            <div className="flex items-center gap-2 mt-2 p-2 bg-warning/10 border border-warning/20 rounded-md">
              <AlertTriangle className="w-4 h-4 text-warning" />
              <p className="text-xs text-warning">
                Very short TTL may impact user experience
              </p>
            </div>
          )}
          
          {ttlMinutes > 60 && (
            <div className="flex items-center gap-2 mt-2 p-2 bg-warning/10 border border-warning/20 rounded-md">
              <AlertTriangle className="w-4 h-4 text-warning" />
              <p className="text-xs text-warning">
                Longer TTL increases security risk if links are shared
              </p>
            </div>
          )}
        </div>

        <div className="bg-muted/50 border border-border rounded-md p-4">
          <h4 className="font-medium text-foreground mb-2">Security Impact</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Shorter TTL = Higher security, potential user friction</li>
            <li>• Longer TTL = Better user experience, higher security risk</li>
            <li>• Recommended: 15-30 minutes for sensitive documents</li>
          </ul>
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

export default DataRetentionTab;
