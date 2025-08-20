
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Plus, X } from 'lucide-react';
import { CompanyFormData } from '../CompanyWizard';

interface HighlightsStepProps {
  data: CompanyFormData;
  onChange: (data: Partial<CompanyFormData>) => void;
  isValid: boolean;
}

const HighlightsStep: React.FC<HighlightsStepProps> = ({ data, onChange, isValid }) => {
  const [newHighlight, setNewHighlight] = useState('');
  const [newRisk, setNewRisk] = useState('');

  const addHighlight = () => {
    if (newHighlight.trim()) {
      onChange({
        highlights: [...data.highlights, newHighlight.trim()]
      });
      setNewHighlight('');
    }
  };

  const removeHighlight = (index: number) => {
    onChange({
      highlights: data.highlights.filter((_, i) => i !== index)
    });
  };

  const addRisk = () => {
    if (newRisk.trim()) {
      onChange({
        risks: [...data.risks, newRisk.trim()]
      });
      setNewRisk('');
    }
  };

  const removeRisk = (index: number) => {
    onChange({
      risks: data.risks.filter((_, i) => i !== index)
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-foreground mb-2">Highlights & Risks</h3>
        <p className="text-muted-foreground">
          Add key strengths and potential risks for this opportunity
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Highlights */}
        <div className="space-y-4">
          <Label className="text-foreground font-medium">Company Highlights</Label>
          
          <div className="flex gap-2">
            <Input
              value={newHighlight}
              onChange={(e) => setNewHighlight(e.target.value)}
              placeholder="Add a highlight..."
              className="bg-background border-border"
              onKeyPress={(e) => e.key === 'Enter' && addHighlight()}
            />
            <Button
              type="button"
              onClick={addHighlight}
              disabled={!newHighlight.trim()}
              size="icon"
              variant="outline"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-2 max-h-40 overflow-y-auto">
            {data.highlights.map((highlight, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 bg-muted/50 rounded border border-border"
              >
                <span className="text-sm text-foreground">{highlight}</span>
                <Button
                  type="button"
                  onClick={() => removeHighlight(index)}
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6 text-muted-foreground hover:text-destructive"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>

          {data.highlights.length === 0 && (
            <p className="text-xs text-muted-foreground italic">No highlights added yet</p>
          )}
        </div>

        {/* Risks */}
        <div className="space-y-4">
          <Label className="text-foreground font-medium">Potential Risks</Label>
          
          <div className="flex gap-2">
            <Input
              value={newRisk}
              onChange={(e) => setNewRisk(e.target.value)}
              placeholder="Add a risk..."
              className="bg-background border-border"
              onKeyPress={(e) => e.key === 'Enter' && addRisk()}
            />
            <Button
              type="button"
              onClick={addRisk}
              disabled={!newRisk.trim()}
              size="icon"
              variant="outline"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-2 max-h-40 overflow-y-auto">
            {data.risks.map((risk, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 bg-muted/50 rounded border border-border"
              >
                <span className="text-sm text-foreground">{risk}</span>
                <Button
                  type="button"
                  onClick={() => removeRisk(index)}
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6 text-muted-foreground hover:text-destructive"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>

          {data.risks.length === 0 && (
            <p className="text-xs text-muted-foreground italic">No risks added yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default HighlightsStep;
