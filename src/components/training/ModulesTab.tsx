import React from 'react';
import { PlayCircle, Clock, Users, Lock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

// Mock training modules - coming soon placeholder
const upcomingModules = [
  {
    id: '1',
    title: 'M&A Fundamentals',
    description: 'Learn the basics of mergers and acquisitions',
    duration: '2 hours',
    lessons: 8,
    thumbnail: '📚',
  },
  {
    id: '2',
    title: 'Financial Analysis for Brokers',
    description: 'Understanding financial statements and valuations',
    duration: '3 hours',
    lessons: 12,
    thumbnail: '📊',
  },
  {
    id: '3',
    title: 'Deal Negotiation Masterclass',
    description: 'Advanced techniques for successful deal closings',
    duration: '1.5 hours',
    lessons: 6,
    thumbnail: '🤝',
  },
  {
    id: '4',
    title: 'Using the Platform',
    description: 'Complete guide to our M&A software platform',
    duration: '1 hour',
    lessons: 5,
    thumbnail: '💻',
  },
];

export const ModulesTab = () => {
  return (
    <div className="space-y-6">
      {/* Coming Soon Banner */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
            <PlayCircle className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-blue-900">
              Interactive Training Modules Coming Soon
            </h3>
            <p className="text-blue-700 mt-1">
              We're building comprehensive video training modules to help onboard new team members faster.
              Stay tuned for interactive lessons, quizzes, and progress tracking.
            </p>
          </div>
        </div>
      </div>

      {/* Preview of Upcoming Modules */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">Planned Modules</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {upcomingModules.map((module) => (
            <Card 
              key={module.id}
              className="border-border bg-card opacity-75 relative overflow-hidden"
            >
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className="text-4xl">{module.thumbnail}</div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <h3 className="font-semibold text-foreground">
                        {module.title}
                      </h3>
                      <Badge variant="secondary" className="text-xs flex items-center gap-1">
                        <Lock className="w-3 h-3" />
                        Coming Soon
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {module.description}
                    </p>
                    <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {module.duration}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {module.lessons} lessons
                      </span>
                    </div>
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                        <span>Progress</span>
                        <span>Not started</span>
                      </div>
                      <Progress value={0} className="h-2" />
                    </div>
                  </div>
                </div>
              </CardContent>
              {/* Overlay for coming soon */}
              <div className="absolute inset-0 bg-background/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-not-allowed">
                <Badge className="bg-blue-600 text-white">
                  In Development
                </Badge>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Request Module Form Placeholder */}
      <Card className="border-dashed border-2 border-muted-foreground/30 bg-muted/20">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
            <PlayCircle className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Have a Training Topic in Mind?
          </h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Let us know what training modules would be most helpful for your workflow.
            We're actively building our training library based on team feedback.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
