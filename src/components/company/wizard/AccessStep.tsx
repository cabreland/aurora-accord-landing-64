
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CompanyFormData } from '../CompanyWizard';

interface AccessStepProps {
  data: CompanyFormData;
  onChange: (data: Partial<CompanyFormData>) => void;
  isValid: boolean;
}

const AccessStep: React.FC<AccessStepProps> = ({ data, onChange, isValid }) => {
  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-foreground mb-2">Access Defaults</h3>
        <p className="text-muted-foreground">
          Set default access controls for this company's documents and information
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="passcode" className="text-foreground">Optional Access Passcode</Label>
          <Input
            id="passcode"
            value={data.passcode}
            onChange={(e) => onChange({ passcode: e.target.value })}
            placeholder="Leave blank for standard access control"
            className="bg-background border-border"
          />
          <p className="text-xs text-muted-foreground mt-1">
            If set, users will need this passcode in addition to normal permissions to access confidential documents
          </p>
        </div>

        <div className="p-4 bg-muted/50 rounded-lg border border-border">
          <h4 className="font-medium text-foreground mb-2">Default Access Levels</h4>
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex justify-between">
              <span>Public Information:</span>
              <span className="text-foreground">All users</span>
            </div>
            <div className="flex justify-between">
              <span>Basic Financials:</span>
              <span className="text-foreground">NDA accepted</span>
            </div>
            <div className="flex justify-between">
              <span>Detailed Documents:</span>
              <span className="text-foreground">Approved access</span>
            </div>
            <div className="flex justify-between">
              <span>Sensitive Materials:</span>
              <span className="text-foreground">Admin approval + passcode</span>
            </div>
          </div>
        </div>

        <div className="p-4 bg-blue-50/50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            <strong>Note:</strong> These settings establish the baseline security for this company. 
            Individual documents can have additional restrictions applied during upload.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AccessStep;
