import React from 'react';
import { Eye, Star, FileCheck, TrendingUp, ExternalLink, Download, Shield, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { InvestorProfileStats, InvestorActivity } from '@/hooks/useInvestorProfileStats';
import { InvestorProfileData } from '@/hooks/useInvestorProfileData';
import { format, formatDistanceToNow } from 'date-fns';

interface OverviewTabProps {
  stats: InvestorProfileStats;
  activities: InvestorActivity[];
  profileData: InvestorProfileData;
  completionPercentage: number;
  onEditClick: () => void;
}

const activityIcons: Record<string, React.ReactNode> = {
  view: <Eye className="w-4 h-4 text-blue-500" />,
  nda: <FileCheck className="w-4 h-4 text-green-500" />,
  watchlist: <Star className="w-4 h-4 text-yellow-500" />,
  interest: <TrendingUp className="w-4 h-4 text-purple-500" />,
};

export const OverviewTab: React.FC<OverviewTabProps> = ({
  stats,
  activities,
  profileData,
  completionPercentage,
  onEditClick,
}) => {
  const statCards = [
    { label: 'Deals Viewed', value: stats.dealsViewed, icon: Eye, color: 'text-blue-500' },
    { label: 'Watchlisted', value: stats.dealsWatchlisted, icon: Star, color: 'text-yellow-500' },
    { label: 'NDAs Signed', value: stats.ndasSigned, icon: FileCheck, color: 'text-green-500' },
    { label: 'Active Deals', value: stats.interestsExpressed, icon: TrendingUp, color: 'text-purple-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <Card key={index} className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <stat.icon className={`w-8 h-8 ${stat.color}`} />
                <span className="text-3xl font-bold text-foreground">{stat.value}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Profile Summary */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg text-foreground">Profile Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {/* Left Column */}
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground">Full Name</p>
                  <p className="text-sm font-medium text-foreground">{profileData.fullName || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="text-sm font-medium text-foreground">{profileData.email || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <p className="text-sm font-medium text-foreground">{profileData.phone || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Company/Fund</p>
                  <p className="text-sm font-medium text-foreground">{profileData.companyName || 'Individual'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">LinkedIn</p>
                  {profileData.linkedinUrl ? (
                    <a 
                      href={profileData.linkedinUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-[hsl(var(--primary))] hover:underline flex items-center gap-1"
                    >
                      View Profile <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <p className="text-sm font-medium text-muted-foreground">Not provided</p>
                  )}
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Profile Completion</p>
                  <div className="flex items-center gap-2">
                    <Progress value={completionPercentage} className="flex-1 h-2" />
                    <span className="text-sm font-medium text-foreground">{completionPercentage}%</span>
                  </div>
                </div>
                
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Verification Status</p>
                  <Badge variant="outline" className="border-yellow-500 text-yellow-500">
                    <Shield className="w-3 h-3 mr-1" />
                    Pending
                  </Badge>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground mb-1">Onboarding Status</p>
                  <Badge 
                    variant="outline" 
                    className={profileData.onboardingCompletedAt 
                      ? 'border-green-500 text-green-500' 
                      : 'border-gray-500 text-gray-500'
                    }
                  >
                    {profileData.onboardingCompletedAt ? 'Complete' : 'Incomplete'}
                  </Badge>
                </div>

                <div className="pt-2 space-y-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={onEditClick}
                    className="w-full border-[hsl(var(--primary))]/30 text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/10"
                  >
                    Edit Profile
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="w-full"
                    disabled
                  >
                    <Download className="w-3 h-3 mr-2" />
                    Download PDF
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg text-foreground">Recent Activity</CardTitle>
            <Button variant="link" size="sm" className="text-[hsl(var(--primary))]">
              View All →
            </Button>
          </CardHeader>
          <CardContent>
            {activities.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No recent activity</p>
              </div>
            ) : (
              <div className="space-y-3">
                {activities.slice(0, 5).map((activity) => (
                  <div 
                    key={activity.id}
                    className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="mt-0.5">
                      {activityIcons[activity.type] || <Eye className="w-4 h-4 text-gray-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground">
                        {activity.description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
