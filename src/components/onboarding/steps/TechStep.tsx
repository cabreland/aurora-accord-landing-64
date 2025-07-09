import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { X, Code, Database, Globe, Smartphone } from 'lucide-react';
import type { OnboardingData } from '../OnboardingQuestionnaire';

interface TechStepProps {
  data: OnboardingData;
  updateData: (data: Partial<OnboardingData>) => void;
}

const techCategories = [
  {
    category: 'Frontend',
    icon: Globe,
    techs: ['React', 'Vue.js', 'Angular', 'Next.js', 'Svelte']
  },
  {
    category: 'Backend',
    icon: Database,
    techs: ['Node.js', 'Python', 'PHP', 'Ruby on Rails', 'Django']
  },
  {
    category: 'Mobile',
    icon: Smartphone,
    techs: ['React Native', 'Flutter', 'Swift', 'Kotlin', 'Xamarin']
  },
  {
    category: 'Platforms',
    icon: Code,
    techs: ['WordPress', 'Shopify', 'Laravel', 'Express.js', 'FastAPI']
  }
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
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Any specific tech preferences?
        </h1>
        <p className="text-xl text-gray-600">
          Optional: Let us know what technologies you prefer (if any)
        </p>
      </div>
      
      <div className="space-y-12">
        {techCategories.map((category) => {
          const IconComponent = category.icon;
          return (
            <div key={category.category}>
              <div className="flex items-center gap-3 mb-6">
                <IconComponent className="w-6 h-6 text-gray-600" />
                <h2 className="text-xl font-semibold text-gray-900">{category.category}</h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {category.techs.map((tech) => (
                  <Button
                    key={tech}
                    variant={data.preferredTechStacks.includes(tech) ? "default" : "outline"}
                    onClick={() => handleTechToggle(tech)}
                    className="h-12 text-sm"
                  >
                    {tech}
                  </Button>
                ))}
              </div>
            </div>
          );
        })}
        
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Add custom technology</h2>
          <div className="flex gap-3 mb-6">
            <Input
              value={newTech}
              onChange={(e) => setNewTech(e.target.value)}
              placeholder="e.g., GraphQL, MongoDB, Docker"
              onKeyDown={(e) => e.key === 'Enter' && addCustomTech()}
              className="h-12"
            />
            <Button type="button" onClick={addCustomTech} variant="outline" className="h-12">
              Add
            </Button>
          </div>
          
          {data.preferredTechStacks.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Selected technologies</h3>
              <div className="flex flex-wrap gap-2">
                {data.preferredTechStacks.map((tech) => (
                  <Badge key={tech} variant="secondary" className="flex items-center gap-1 py-2 px-3">
                    {tech}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0.5 hover:bg-transparent"
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
    </div>
  );
};