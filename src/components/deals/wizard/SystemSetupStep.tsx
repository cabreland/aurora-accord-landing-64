import React from 'react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { CheckCircle2, Folder, Lock, Info } from 'lucide-react';
import { DealFormData } from './DealWizard';

interface SystemSetupStepProps {
  data: DealFormData;
  onChange: (updates: Partial<DealFormData>) => void;
  isValid: boolean;
}

export const SystemSetupStep: React.FC<SystemSetupStepProps> = ({
  data,
  onChange,
  isValid
}) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-2">System Setup</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Automatically create supporting systems for this deal
        </p>
      </div>

      <div className="space-y-3">
        {/* Due Diligence Tracker */}
        <div 
          className={`flex items-start gap-3 p-4 border rounded-lg transition-colors cursor-pointer
            ${data.createDueDiligence 
              ? 'border-primary bg-primary/5' 
              : 'border-border hover:border-primary/50'
            }`}
          onClick={() => onChange({ createDueDiligence: !data.createDueDiligence })}
        >
          <Checkbox
            id="create-diligence"
            checked={data.createDueDiligence}
            onCheckedChange={(checked) => onChange({ createDueDiligence: checked as boolean })}
            className="mt-1"
          />
          <div className="flex-1">
            <Label 
              htmlFor="create-diligence"
              className="font-semibold text-foreground cursor-pointer"
            >
              Create Due Diligence Tracker
            </Label>
            <p className="text-xs text-muted-foreground mt-1">
              Sets up 10 categories with standard subcategories for tracking seller diligence requests
            </p>
            {data.createDueDiligence && (
              <div className="mt-3 space-y-2">
                <p className="text-xs font-semibold text-foreground">Will create:</p>
                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-green-600" />
                    Corporate & Legal
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-green-600" />
                    Financials
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-green-600" />
                    Operations
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-green-600" />
                    + 7 more categories
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Data Room */}
        <div 
          className={`flex items-start gap-3 p-4 border rounded-lg transition-colors cursor-pointer
            ${data.createDataRoom 
              ? 'border-primary bg-primary/5' 
              : 'border-border hover:border-primary/50'
            }`}
          onClick={() => onChange({ createDataRoom: !data.createDataRoom })}
        >
          <Checkbox
            id="create-dataroom"
            checked={data.createDataRoom}
            onCheckedChange={(checked) => onChange({ createDataRoom: checked as boolean })}
            className="mt-1"
          />
          <div className="flex-1">
            <Label 
              htmlFor="create-dataroom"
              className="font-semibold text-foreground cursor-pointer"
            >
              Create Data Room
            </Label>
            <p className="text-xs text-muted-foreground mt-1">
              Sets up secure document storage with 10 standard folders + LOI-Restricted folder
            </p>
            {data.createDataRoom && (
              <div className="mt-3 space-y-2">
                <p className="text-xs font-semibold text-foreground">Will create:</p>
                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Folder className="w-3 h-3 text-primary" />
                    10 Standard Folders
                  </div>
                  <div className="flex items-center gap-1">
                    <Lock className="w-3 h-3 text-destructive" />
                    LOI-Restricted Folder
                  </div>
                </div>
                <p className="text-xs text-muted-foreground italic">
                  Status: Draft (ready for document uploads)
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Recommended Setup */}
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-foreground mb-1">Recommended:</p>
              <p className="text-xs text-muted-foreground">
                Enable both for sell-side deals. This creates a complete workflow from document collection to buyer access.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Setup Summary */}
      <div className="bg-muted/30 rounded-lg p-4">
        <h4 className="font-medium text-foreground mb-3">Setup Summary</h4>
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Due Diligence Tracker:</span>
            <span className={`font-medium ${data.createDueDiligence ? 'text-green-600' : 'text-muted-foreground'}`}>
              {data.createDueDiligence ? 'Will be created' : 'Not selected'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Data Room:</span>
            <span className={`font-medium ${data.createDataRoom ? 'text-green-600' : 'text-muted-foreground'}`}>
              {data.createDataRoom ? 'Will be created' : 'Not selected'}
            </span>
          </div>
          {(data.createDueDiligence || data.createDataRoom) && (
            <div className="pt-2 border-t border-border mt-2">
              <p className="text-xs text-muted-foreground">
                {data.createDueDiligence && data.createDataRoom 
                  ? 'Full deal workflow will be set up automatically'
                  : data.createDueDiligence 
                    ? 'Diligence tracking will be ready immediately after deal creation'
                    : 'Data room folders will be ready for document uploads'
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
