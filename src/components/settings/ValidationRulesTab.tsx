import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Save, Shield, Info } from 'lucide-react';
import { useRegistrationSettingsUnified } from '@/hooks/useRegistrationSettingsUnified';

interface PasswordRequirements {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
}

export const ValidationRulesTab: React.FC = () => {
  const { loading, saving, updateSetting, getSetting } = useRegistrationSettingsUnified();
  
  const [passwordReqs, setPasswordReqs] = useState<PasswordRequirements>({
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
  });

  useEffect(() => {
    if (!loading) {
      const requirements = getSetting('password_requirements', {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: true,
      });
      setPasswordReqs(requirements);
    }
  }, [loading]);

  const handleSave = async () => {
    await updateSetting('password_requirements', passwordReqs);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  const getPasswordStrengthDescription = () => {
    const requirements = [];
    if (passwordReqs.minLength > 0) requirements.push(`at least ${passwordReqs.minLength} characters`);
    if (passwordReqs.requireUppercase) requirements.push('uppercase letters');
    if (passwordReqs.requireLowercase) requirements.push('lowercase letters');
    if (passwordReqs.requireNumbers) requirements.push('numbers');
    if (passwordReqs.requireSpecialChars) requirements.push('special characters');
    
    return `Password must contain ${requirements.join(', ')}.`;
  };

  return (
    <div className="space-y-6">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Configure validation rules for the registration form to ensure data quality and security. 
          These rules will be enforced both on the frontend and backend.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Password Requirements
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="min-length">Minimum Length</Label>
            <Input
              id="min-length"
              type="number"
              min="4"
              max="50"
              value={passwordReqs.minLength}
              onChange={(e) => setPasswordReqs(prev => ({ 
                ...prev, 
                minLength: parseInt(e.target.value) || 8 
              }))}
              className="w-32"
            />
            <p className="text-sm text-muted-foreground">
              Minimum number of characters required
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="require-uppercase">Require Uppercase Letters</Label>
                <p className="text-sm text-muted-foreground">
                  Password must contain at least one uppercase letter (A-Z)
                </p>
              </div>
              <Switch
                id="require-uppercase"
                checked={passwordReqs.requireUppercase}
                onCheckedChange={(checked) => setPasswordReqs(prev => ({ 
                  ...prev, 
                  requireUppercase: checked 
                }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="require-lowercase">Require Lowercase Letters</Label>
                <p className="text-sm text-muted-foreground">
                  Password must contain at least one lowercase letter (a-z)
                </p>
              </div>
              <Switch
                id="require-lowercase"
                checked={passwordReqs.requireLowercase}
                onCheckedChange={(checked) => setPasswordReqs(prev => ({ 
                  ...prev, 
                  requireLowercase: checked 
                }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="require-numbers">Require Numbers</Label>
                <p className="text-sm text-muted-foreground">
                  Password must contain at least one number (0-9)
                </p>
              </div>
              <Switch
                id="require-numbers"
                checked={passwordReqs.requireNumbers}
                onCheckedChange={(checked) => setPasswordReqs(prev => ({ 
                  ...prev, 
                  requireNumbers: checked 
                }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="require-special">Require Special Characters</Label>
                <p className="text-sm text-muted-foreground">
                  Password must contain at least one special character (!@#$%^&*()_+-=[]{}|;:,.&lt;&gt;?)
                </p>
              </div>
              <Switch
                id="require-special"
                checked={passwordReqs.requireSpecialChars}
                onCheckedChange={(checked) => setPasswordReqs(prev => ({ 
                  ...prev, 
                  requireSpecialChars: checked 
                }))}
              />
            </div>
          </div>

          <div className="p-4 bg-muted/50 rounded-lg">
            <h4 className="font-medium mb-2">Current Password Policy:</h4>
            <p className="text-sm text-muted-foreground">
              {getPasswordStrengthDescription()}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button 
          onClick={handleSave} 
          disabled={saving}
          size="lg"
          className="flex items-center gap-2"
        >
          {saving ? (
            <LoadingSpinner className="w-4 h-4" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Save Validation Rules
        </Button>
      </div>
    </div>
  );
};