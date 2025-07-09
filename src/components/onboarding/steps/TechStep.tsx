import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import type { OnboardingData } from '../OnboardingQuestionnaire';

interface TechStepProps {
  data: OnboardingData;
  updateData: (data: Partial<OnboardingData>) => void;
}

const commonTechStacks = [
  'React', 'Vue.js', 'Angular', 'Node.js', 'Python', 'PHP', 'Ruby on Rails',
  'WordPress', 'Shopify', 'Laravel', 'Django', 'Express.js', 'Next.js',
  'AWS', 'Google Cloud', 'Azure', 'Docker', 'Kubernetes'
];

export const TechStep = ({ data, updateData }: TechStepProps) => {
  const [newTech, setNewTech] = React.useState('');

  const handleTechToggle = (tech: string) => {
    const updated = data.preferredTechStacks.includes(tech)
      ? data.preferredTechStacks.filter(t => t !== tech)
      : [...data.preferredTechStacks, tech];
    updateData({ preferredTechStacks: updated });
  };

  const addCustomTech = () => {
    if (newTech.trim() && !data.preferredTechStacks.includes(newTech.trim())) {
      updateData({ preferredTechStacks: [...data.preferredTechStacks, newTech.trim()] });
      setNewTech('');
    }
  };

  const removeTech = (tech: string) => {
    updateData({ preferredTechStacks: data.preferredTechStacks.filter(t => t !== tech) });
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-xl font-semibold text-foreground">Tech Preferences</h2>
        <p className="text-muted-foreground">
          Optional: Let us know what tech stacks or platforms you prefer (if any).
        </p>
      </div>
      
      <div className="space-y-6">
        <div className="space-y-3">
          <Label>Popular Tech Stacks</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {commonTechStacks.map((tech) => (
              <div
                key={tech}
                className={`p-2 rounded-md border cursor-pointer transition-colors text-center ${
                  data.preferredTechStacks.includes(tech)
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-background hover:bg-accent'
                }`}
                onClick={() => handleTechToggle(tech)}
              >
                <span className="text-sm">{tech}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="space-y-3">
          <Label>Add Custom Tech Stack</Label>
          <div className="flex gap-2">
            <Input
              value={newTech}
              onChange={(e) => setNewTech(e.target.value)}
              placeholder="e.g., Flutter, GraphQL, MongoDB"
              onKeyDown={(e) => e.key === 'Enter' && addCustomTech()}
            />
            <Button type="button" onClick={addCustomTech} variant="outline">
              Add
            </Button>
          </div>
        </div>
        
        {data.preferredTechStacks.length > 0 && (
          <div className="space-y-3">
            <Label>Selected Tech Stacks</Label>
            <div className="flex flex-wrap gap-2">
              {data.preferredTechStacks.map((tech) => (
                <Badge key={tech} variant="secondary" className="flex items-center gap-1">
                  {tech}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0.5"
                    onClick={() => removeTech(tech)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};