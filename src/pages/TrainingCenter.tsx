import React, { useState } from 'react';
import { 
  GraduationCap, 
  Search, 
  FileText, 
  PlayCircle, 
  BookOpen 
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import DashboardLayout from '@/components/investor/DashboardLayout';
import { SOPsTab } from '@/components/training/SOPsTab';
import { ModulesTab } from '@/components/training/ModulesTab';
import { ResourcesTab } from '@/components/training/ResourcesTab';

type TrainingTab = 'sops' | 'modules' | 'resources';

const TrainingCenter = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<TrainingTab>('sops');

  const breadcrumbs = [
    { label: 'Training Center', href: '/training' }
  ];

  return (
    <DashboardLayout activeTab="training" breadcrumbs={breadcrumbs}>
      <div className="min-h-screen bg-secondary/30">
        {/* Header */}
        <div className="bg-card border-b border-border px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
                <GraduationCap className="w-8 h-8 text-[#D4AF37]" />
                EBB Training Center
              </h1>
              <p className="text-muted-foreground mt-1">
                SOPs, processes, and training resources for the team
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mt-6 max-w-2xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search SOPs, modules, resources..."
                className="pl-10 bg-muted/50 border-border h-11"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Content Area with Tabs */}
        <div className="px-6 py-6">
          {/* Tab Navigation */}
          <div className="border-b border-border mb-6">
            <nav className="flex gap-6">
              <button
                onClick={() => setActiveTab('sops')}
                className={cn(
                  'pb-3 text-sm font-medium border-b-2 transition-colors flex items-center',
                  activeTab === 'sops'
                    ? 'border-[#D4AF37] text-[#D4AF37]'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                )}
              >
                <FileText className="w-4 h-4 mr-2" />
                SOPs & Processes
              </button>
              
              <button
                onClick={() => setActiveTab('modules')}
                className={cn(
                  'pb-3 text-sm font-medium border-b-2 transition-colors flex items-center',
                  activeTab === 'modules'
                    ? 'border-[#D4AF37] text-[#D4AF37]'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                )}
              >
                <PlayCircle className="w-4 h-4 mr-2" />
                Training Modules
                <Badge className="ml-2 bg-blue-100 text-blue-700 text-xs">
                  Coming Soon
                </Badge>
              </button>

              <button
                onClick={() => setActiveTab('resources')}
                className={cn(
                  'pb-3 text-sm font-medium border-b-2 transition-colors flex items-center',
                  activeTab === 'resources'
                    ? 'border-[#D4AF37] text-[#D4AF37]'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                )}
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Resources
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === 'sops' && <SOPsTab searchQuery={searchQuery} />}
          {activeTab === 'modules' && <ModulesTab />}
          {activeTab === 'resources' && <ResourcesTab />}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TrainingCenter;
