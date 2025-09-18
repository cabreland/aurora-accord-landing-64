import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Eye, Save, FileText, Info } from 'lucide-react';
import { useRegistrationSettingsUnified } from '@/hooks/useRegistrationSettingsUnified';

export const NDASettingsTab: React.FC = () => {
  const { loading, saving, updateSetting, getSetting } = useRegistrationSettingsUnified();
  const [activeTab, setActiveTab] = useState('master');
  const [previewMode, setPreviewMode] = useState(false);

  const [masterTitle, setMasterTitle] = useState('');
  const [masterContent, setMasterContent] = useState('');
  const [singleTitle, setSingleTitle] = useState('');
  const [singleContent, setSingleContent] = useState('');

  React.useEffect(() => {
    if (!loading) {
      setMasterTitle(getSetting('nda_master_title', 'Master Non-Disclosure Agreement'));
      setMasterContent(getSetting('nda_master_content', ''));
      setSingleTitle(getSetting('nda_single_title', 'Non-Disclosure Agreement'));
      setSingleContent(getSetting('nda_single_content', ''));
    }
  }, [loading]);

  const handleSave = async () => {
    await Promise.all([
      updateSetting('nda_master_title', masterTitle),
      updateSetting('nda_master_content', masterContent),
      updateSetting('nda_single_title', singleTitle),
      updateSetting('nda_single_content', singleContent),
    ]);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Configure the NDA content that will be displayed to investors during registration. 
          Master NDAs are used for portfolio access, while single NDAs are for individual deal access.
        </AlertDescription>
      </Alert>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="master">Master NDA</TabsTrigger>
            <TabsTrigger value="single">Single Deal NDA</TabsTrigger>
          </TabsList>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setPreviewMode(!previewMode)}
              className="flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              {previewMode ? 'Edit Mode' : 'Preview'}
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={saving}
              className="flex items-center gap-2"
            >
              {saving ? (
                <LoadingSpinner className="w-4 h-4" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Save Changes
            </Button>
          </div>
        </div>

        <TabsContent value="master" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Master NDA Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="master-title">Document Title</Label>
                <Input
                  id="master-title"
                  value={masterTitle}
                  onChange={(e) => setMasterTitle(e.target.value)}
                  placeholder="Master Non-Disclosure Agreement"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="master-content">Document Content</Label>
                {previewMode ? (
                  <Card className="p-4 bg-muted/30 max-h-96 overflow-y-auto">
                    <div className="whitespace-pre-line text-sm">
                      {masterContent}
                    </div>
                  </Card>
                ) : (
                  <Textarea
                    id="master-content"
                    value={masterContent}
                    onChange={(e) => setMasterContent(e.target.value)}
                    rows={15}
                    className="font-mono text-sm"
                    placeholder="Enter the complete master NDA text..."
                  />
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="single" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Single Deal NDA Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="single-title">Document Title</Label>
                <Input
                  id="single-title"
                  value={singleTitle}
                  onChange={(e) => setSingleTitle(e.target.value)}
                  placeholder="Non-Disclosure Agreement"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="single-content">Document Content</Label>
                {previewMode ? (
                  <Card className="p-4 bg-muted/30 max-h-96 overflow-y-auto">
                    <div className="whitespace-pre-line text-sm">
                      {singleContent}
                    </div>
                  </Card>
                ) : (
                  <Textarea
                    id="single-content"
                    value={singleContent}
                    onChange={(e) => setSingleContent(e.target.value)}
                    rows={15}
                    className="font-mono text-sm"
                    placeholder="Enter the complete single deal NDA text..."
                  />
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};