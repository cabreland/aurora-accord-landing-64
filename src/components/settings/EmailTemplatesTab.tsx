import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Save, Mail, Eye, Info } from 'lucide-react';
import { useRegistrationSettingsUnified } from '@/hooks/useRegistrationSettingsUnified';

export const EmailTemplatesTab: React.FC = () => {
  const { loading, saving, updateSetting, getSetting } = useRegistrationSettingsUnified();
  
  const [welcomeSubject, setWelcomeSubject] = useState('');
  const [welcomeContent, setWelcomeContent] = useState('');
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    if (!loading) {
      setWelcomeSubject(getSetting('welcome_email_subject', 'Welcome to the Investor Portal'));
      setWelcomeContent(getSetting('welcome_email_content', ''));
    }
  }, [loading]);

  const handleSave = async () => {
    await Promise.all([
      updateSetting('welcome_email_subject', welcomeSubject),
      updateSetting('welcome_email_content', welcomeContent),
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
          Configure email templates sent to investors during the registration process. 
          You can use HTML formatting for rich content. Available variables: {'{firstName}'}, {'{lastName}'}, {'{email}'}, {'{companyName}'}.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Welcome Email Template
            </span>
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
                Save Template
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="welcome-subject">Email Subject Line</Label>
            <Input
              id="welcome-subject"
              value={welcomeSubject}
              onChange={(e) => setWelcomeSubject(e.target.value)}
              placeholder="Welcome to the Investor Portal"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="welcome-content">Email Content (HTML)</Label>
            {previewMode ? (
              <div className="space-y-4">
                <Card className="p-4 bg-muted/30">
                  <div className="mb-4 pb-4 border-b">
                    <h3 className="font-semibold">Subject:</h3>
                    <p className="text-sm text-muted-foreground">{welcomeSubject}</p>
                  </div>
                  <div 
                    className="prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ 
                      __html: welcomeContent.replace(
                        /\{firstName\}/g, 'John'
                      ).replace(
                        /\{lastName\}/g, 'Doe'
                      ).replace(
                        /\{email\}/g, 'john.doe@example.com'
                      ).replace(
                        /\{companyName\}/g, 'Example Investment Fund'
                      )
                    }} 
                  />
                </Card>
                <div className="text-xs text-muted-foreground">
                  <p className="font-medium mb-1">Preview shows sample data:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>{'{firstName}'} → John</li>
                    <li>{'{lastName}'} → Doe</li>
                    <li>{'{email}'} → john.doe@example.com</li>
                    <li>{'{companyName}'} → Example Investment Fund</li>
                  </ul>
                </div>
              </div>
            ) : (
              <Textarea
                id="welcome-content"
                value={welcomeContent}
                onChange={(e) => setWelcomeContent(e.target.value)}
                rows={12}
                className="font-mono text-sm"
                placeholder={`<h1>Welcome {firstName}!</h1>
<p>Thank you for completing your registration with our investor portal.</p>
<p>Your account has been created and you now have access to our exclusive investment opportunities.</p>
<p>Best regards,<br>The Investment Team</p>`}
              />
            )}
          </div>

          <div className="p-4 bg-muted/50 rounded-lg">
            <h4 className="font-medium mb-2">Available Template Variables:</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
              <code className="bg-background px-2 py-1 rounded">{'{firstName}'}</code>
              <code className="bg-background px-2 py-1 rounded">{'{lastName}'}</code>
              <code className="bg-background px-2 py-1 rounded">{'{email}'}</code>
              <code className="bg-background px-2 py-1 rounded">{'{companyName}'}</code>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};