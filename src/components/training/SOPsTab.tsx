import React from 'react';
import { FileText, Clock, User, ChevronRight, FolderOpen } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface SOPsTabProps {
  searchQuery: string;
}

// Mock SOP categories for now
const sopCategories = [
  {
    id: '1',
    name: 'Deal Sourcing',
    description: 'Processes for finding and qualifying new deals',
    sopCount: 5,
    icon: '🎯',
  },
  {
    id: '2',
    name: 'Due Diligence',
    description: 'Standard procedures for deal evaluation',
    sopCount: 8,
    icon: '🔍',
  },
  {
    id: '3',
    name: 'Client Communication',
    description: 'Guidelines for investor and seller communication',
    sopCount: 4,
    icon: '💬',
  },
  {
    id: '4',
    name: 'Document Management',
    description: 'File organization and data room procedures',
    sopCount: 3,
    icon: '📁',
  },
  {
    id: '5',
    name: 'Closing Procedures',
    description: 'End-to-end transaction closing workflows',
    sopCount: 6,
    icon: '✅',
  },
];

// Mock recent SOPs
const recentSOPs = [
  {
    id: '1',
    title: 'NDA Processing Workflow',
    category: 'Due Diligence',
    lastUpdated: '2 days ago',
    author: 'Sarah Johnson',
    status: 'published',
  },
  {
    id: '2',
    title: 'Initial Deal Screening Checklist',
    category: 'Deal Sourcing',
    lastUpdated: '1 week ago',
    author: 'Michael Chen',
    status: 'published',
  },
  {
    id: '3',
    title: 'Data Room Setup Guide',
    category: 'Document Management',
    lastUpdated: '3 days ago',
    author: 'Emily Davis',
    status: 'draft',
  },
];

export const SOPsTab = ({ searchQuery }: SOPsTabProps) => {
  const filteredCategories = sopCategories.filter(cat =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cat.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredSOPs = recentSOPs.filter(sop =>
    sop.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sop.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* SOP Categories Grid */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">SOP Categories</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCategories.map((category) => (
            <Card 
              key={category.id} 
              className="cursor-pointer hover:shadow-md transition-shadow border-border bg-card group"
            >
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className="text-3xl">{category.icon}</div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground group-hover:text-[#D4AF37] transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {category.description}
                    </p>
                    <div className="flex items-center gap-2 mt-3">
                      <Badge variant="secondary" className="text-xs">
                        {category.sopCount} SOPs
                      </Badge>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-[#D4AF37] transition-colors" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent SOPs */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">Recently Updated SOPs</h2>
        <Card className="border-border bg-card">
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {filteredSOPs.map((sop) => (
                <div 
                  key={sop.id}
                  className="p-4 hover:bg-muted/50 cursor-pointer transition-colors flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-[#D4AF37]/10 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-[#D4AF37]" />
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">{sop.title}</h4>
                      <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <FolderOpen className="w-3.5 h-3.5" />
                          {sop.category}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {sop.lastUpdated}
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5" />
                          {sop.author}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge 
                      variant={sop.status === 'published' ? 'default' : 'secondary'}
                      className={sop.status === 'published' ? 'bg-green-100 text-green-700' : ''}
                    >
                      {sop.status}
                    </Badge>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Empty state for no results */}
      {filteredCategories.length === 0 && filteredSOPs.length === 0 && searchQuery && (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No SOPs found</h3>
          <p className="text-muted-foreground">
            No SOPs match your search for "{searchQuery}"
          </p>
        </div>
      )}
    </div>
  );
};
