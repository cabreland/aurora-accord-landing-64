import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Save, Plus, X, Info, Move, Settings } from 'lucide-react';
import { useRegistrationSettingsUnified } from '@/hooks/useRegistrationSettingsUnified';

interface InvestorType {
  value: string;
  label: string;
}

export const FormFieldsTab: React.FC = () => {
  const { loading, saving, updateSetting, getSetting } = useRegistrationSettingsUnified();
  
  const [requiredFields, setRequiredFields] = useState<string[]>([]);
  const [optionalFields, setOptionalFields] = useState<string[]>([]);
  const [investorTypes, setInvestorTypes] = useState<InvestorType[]>([]);

  const availableFields = [
    { key: 'email', label: 'Email Address', description: 'Investor email address' },
    { key: 'password', label: 'Password', description: 'Account password' },
    { key: 'firstName', label: 'First Name', description: 'Investor first name' },
    { key: 'lastName', label: 'Last Name', description: 'Investor last name' },
    { key: 'companyName', label: 'Company Name', description: 'Investor company or firm' },
    { key: 'phoneNumber', label: 'Phone Number', description: 'Contact phone number' },
    { key: 'investorType', label: 'Investor Type', description: 'Type of investor classification' },
  ];

  useEffect(() => {
    if (!loading) {
      setRequiredFields(getSetting('required_fields', ['email', 'password', 'firstName', 'lastName', 'investorType']));
      setOptionalFields(getSetting('optional_fields', ['companyName', 'phoneNumber']));
      setInvestorTypes(getSetting('investor_types', [
        { value: 'individual', label: 'Individual Investor' },
        { value: 'fund', label: 'Investment Fund' },
        { value: 'institution', label: 'Institution' },
        { value: 'family_office', label: 'Family Office' },
        { value: 'other', label: 'Other' }
      ]));
    }
  }, [loading]);

  const handleSave = async () => {
    await Promise.all([
      updateSetting('required_fields', requiredFields),
      updateSetting('optional_fields', optionalFields),
      updateSetting('investor_types', investorTypes),
    ]);
  };

  const moveFieldToRequired = (fieldKey: string) => {
    setOptionalFields(prev => prev.filter(f => f !== fieldKey));
    setRequiredFields(prev => [...prev, fieldKey]);
  };

  const moveFieldToOptional = (fieldKey: string) => {
    if (fieldKey === 'email' || fieldKey === 'password') return; // These should always be required
    setRequiredFields(prev => prev.filter(f => f !== fieldKey));
    setOptionalFields(prev => [...prev, fieldKey]);
  };

  const removeField = (fieldKey: string, fromRequired: boolean) => {
    if (fieldKey === 'email' || fieldKey === 'password') return; // These are always needed
    if (fromRequired) {
      setRequiredFields(prev => prev.filter(f => f !== fieldKey));
    } else {
      setOptionalFields(prev => prev.filter(f => f !== fieldKey));
    }
  };

  const addInvestorType = () => {
    setInvestorTypes(prev => [...prev, { value: '', label: '' }]);
  };

  const updateInvestorType = (index: number, field: 'value' | 'label', value: string) => {
    setInvestorTypes(prev => prev.map((type, i) => 
      i === index ? { ...type, [field]: value } : type
    ));
  };

  const removeInvestorType = (index: number) => {
    setInvestorTypes(prev => prev.filter((_, i) => i !== index));
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  const getFieldInfo = (fieldKey: string) => {
    return availableFields.find(f => f.key === fieldKey);
  };

  return (
    <div className="space-y-6">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Configure which fields appear in the registration form and whether they're required or optional. 
          Email and password are always required for account creation.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Required Fields */}
        <Card>
          <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Required Fields
          </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {requiredFields.map((fieldKey) => {
              const fieldInfo = getFieldInfo(fieldKey);
              if (!fieldInfo) return null;
              
              return (
                <div key={fieldKey} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{fieldInfo.label}</div>
                    <div className="text-sm text-muted-foreground">{fieldInfo.description}</div>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="destructive">Required</Badge>
                    {fieldKey !== 'email' && fieldKey !== 'password' && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => moveFieldToOptional(fieldKey)}
                        >
                          <Move className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => removeField(fieldKey, true)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Optional Fields */}
        <Card>
          <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Optional Fields
          </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {optionalFields.map((fieldKey) => {
              const fieldInfo = getFieldInfo(fieldKey);
              if (!fieldInfo) return null;
              
              return (
                <div key={fieldKey} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{fieldInfo.label}</div>
                    <div className="text-sm text-muted-foreground">{fieldInfo.description}</div>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="secondary">Optional</Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => moveFieldToRequired(fieldKey)}
                    >
                      <Move className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => removeField(fieldKey, false)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Investor Types */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Investor Type Options</span>
            <Button onClick={addInvestorType} size="sm" className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Type
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {investorTypes.map((type, index) => (
            <div key={index} className="flex gap-3 items-center p-3 border rounded-lg">
              <input
                type="text"
                value={type.value}
                onChange={(e) => updateInvestorType(index, 'value', e.target.value)}
                placeholder="value (e.g., individual)"
                className="flex-1 px-3 py-2 border rounded-md"
              />
              <input
                type="text"
                value={type.label}
                onChange={(e) => updateInvestorType(index, 'label', e.target.value)}
                placeholder="Display Label (e.g., Individual Investor)"
                className="flex-1 px-3 py-2 border rounded-md"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={() => removeInvestorType(index)}
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          ))}
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
          Save Form Configuration
        </Button>
      </div>
    </div>
  );
};