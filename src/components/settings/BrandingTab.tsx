
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Save, Upload } from 'lucide-react';
import { useSettings } from '@/hooks/useSettings';

const BrandingTab: React.FC = () => {
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
        <CardTitle className="text-foreground">Branding Settings</CardTitle>
        <p className="text-sm text-muted-foreground">
          Customize your portal's brand identity and appearance
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label htmlFor="brand_name">Portal Brand Name</Label>
          <Input
            id="brand_name"
            value={getSettingValue('brand_name', 'Investor Portal')}
            onChange={(e) => handleSettingChange('brand_name', e.target.value)}
            placeholder="Your Company Name"
            className="bg-background border-border"
          />
          <p className="text-xs text-muted-foreground mt-1">
            This name will appear in the header and throughout the portal
          </p>
        </div>

        <div>
          <Label htmlFor="brand_logo_url">Logo URL</Label>
          <div className="flex gap-2">
            <Input
              id="brand_logo_url"
              value={getSettingValue('brand_logo_url', '')}
              onChange={(e) => handleSettingChange('brand_logo_url', e.target.value)}
              placeholder="https://example.com/logo.png"
              className="bg-background border-border"
            />
            <Button variant="outline" size="sm">
              <Upload className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Upload or provide a URL for your company logo
          </p>
        </div>

        <div>
          <Label htmlFor="theme_primary">Primary Theme Color</Label>
          <div className="flex gap-2 items-center">
            <Input
              id="theme_primary"
              type="color"
              value={getSettingValue('theme_primary', '#5B8CFF')}
              onChange={(e) => handleSettingChange('theme_primary', e.target.value)}
              className="w-16 h-10 p-1 bg-background border-border"
            />
            <Input
              value={getSettingValue('theme_primary', '#5B8CFF')}
              onChange={(e) => handleSettingChange('theme_primary', e.target.value)}
              placeholder="#5B8CFF"
              className="bg-background border-border"
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Primary color used for buttons, links, and highlights
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

export default BrandingTab;
