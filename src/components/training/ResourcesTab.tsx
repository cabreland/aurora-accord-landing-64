import React from 'react';
import { 
  BookOpen, 
  ExternalLink, 
  Download, 
  FileText, 
  Video, 
  Link as LinkIcon,
  Bookmark 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

// Mock resources
const resourceCategories = [
  {
    id: '1',
    title: 'Templates & Forms',
    description: 'Downloadable templates for common workflows',
    icon: FileText,
    resources: [
      { name: 'Deal Evaluation Template', type: 'xlsx', size: '45 KB' },
      { name: 'NDA Template - Standard', type: 'docx', size: '32 KB' },
      { name: 'Client Intake Form', type: 'pdf', size: '128 KB' },
    ],
  },
  {
    id: '2',
    title: 'Industry Guides',
    description: 'Reference materials for different sectors',
    icon: BookOpen,
    resources: [
      { name: 'SaaS Valuation Guide', type: 'pdf', size: '2.1 MB' },
      { name: 'Healthcare M&A Overview', type: 'pdf', size: '1.8 MB' },
      { name: 'Manufacturing Due Diligence', type: 'pdf', size: '1.2 MB' },
    ],
  },
  {
    id: '3',
    title: 'Video Tutorials',
    description: 'Short how-to videos for platform features',
    icon: Video,
    resources: [
      { name: 'Data Room Setup Walkthrough', type: 'video', duration: '5 min' },
      { name: 'Creating Deal Listings', type: 'video', duration: '3 min' },
      { name: 'Investor Communication Tips', type: 'video', duration: '8 min' },
    ],
  },
];

const quickLinks = [
  { name: 'Company Wiki', url: '#', icon: Bookmark },
  { name: 'HR Portal', url: '#', icon: LinkIcon },
  { name: 'Expense Reports', url: '#', icon: FileText },
  { name: 'Team Calendar', url: '#', icon: Bookmark },
];

export const ResourcesTab = () => {
  return (
    <div className="space-y-8">
      {/* Quick Links */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">Quick Links</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickLinks.map((link, idx) => (
            <Card 
              key={idx}
              className="cursor-pointer hover:shadow-md transition-shadow border-border bg-card group"
            >
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#D4AF37]/10 flex items-center justify-center group-hover:bg-[#D4AF37]/20 transition-colors">
                  <link.icon className="w-5 h-5 text-[#D4AF37]" />
                </div>
                <div className="flex-1">
                  <span className="font-medium text-foreground text-sm group-hover:text-[#D4AF37] transition-colors">
                    {link.name}
                  </span>
                </div>
                <ExternalLink className="w-4 h-4 text-muted-foreground" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Resource Categories */}
      <div className="space-y-6">
        {resourceCategories.map((category) => (
          <Card key={category.id} className="border-border bg-card">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#D4AF37]/10 flex items-center justify-center">
                  <category.icon className="w-5 h-5 text-[#D4AF37]" />
                </div>
                <div>
                  <CardTitle className="text-base">{category.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">{category.description}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="divide-y divide-border">
                {category.resources.map((resource, idx) => (
                  <div 
                    key={idx}
                    className="py-3 flex items-center justify-between hover:bg-muted/50 -mx-4 px-4 transition-colors cursor-pointer first:pt-0 last:pb-0"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium text-foreground">
                        {resource.name}
                      </span>
                      <Badge variant="secondary" className="text-xs uppercase">
                        {resource.type}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground">
                        {'size' in resource ? resource.size : resource.duration}
                      </span>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        {'size' in resource ? (
                          <Download className="w-4 h-4" />
                        ) : (
                          <ExternalLink className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty placeholder for additional resources */}
      <Card className="border-dashed border-2 border-muted-foreground/30 bg-muted/20">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
            <BookOpen className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            More Resources Coming Soon
          </h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            We're continuously adding new templates, guides, and reference materials to help you succeed.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
