import React, { useState, useEffect } from 'react';
import { Users, Mail } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

interface TeamMember {
  id: string;
  user_id: string;
  role: string;
  profile?: {
    first_name: string | null;
    last_name: string | null;
    email: string | null;
    profile_picture_url: string | null;
  };
}

interface InvestorDealTeamSectionProps {
  dealId: string;
}

const getRoleBadgeVariant = (role: string) => {
  switch (role) {
    case 'owner':
      return 'default';
    case 'admin':
      return 'secondary';
    case 'member':
      return 'outline';
    default:
      return 'outline';
  }
};

const getRoleLabel = (role: string) => {
  switch (role) {
    case 'owner':
      return 'Deal Owner';
    case 'admin':
      return 'Admin';
    case 'member':
      return 'Team Member';
    case 'viewer':
      return 'Viewer';
    case 'external_advisor':
      return 'External Advisor';
    default:
      return role;
  }
};

export const InvestorDealTeamSection: React.FC<InvestorDealTeamSectionProps> = ({ dealId }) => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (dealId) {
      fetchTeamMembers();
    }
  }, [dealId]);

  const fetchTeamMembers = async () => {
    try {
      setLoading(true);
      
      // Fetch team members for this deal
      const { data, error } = await supabase
        .from('deal_team_members')
        .select(`
          id,
          user_id,
          role
        `)
        .eq('deal_id', dealId);

      if (error) throw error;

      // Fetch profiles for each team member
      const membersWithProfiles = await Promise.all(
        (data || []).map(async (member) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('first_name, last_name, email, profile_picture_url')
            .eq('user_id', member.user_id)
            .single();

          return {
            ...member,
            profile: profile || undefined
          };
        })
      );

      setTeamMembers(membersWithProfiles);
    } catch (error) {
      console.error('Error fetching team members:', error);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (member: TeamMember) => {
    if (member.profile?.first_name && member.profile?.last_name) {
      return `${member.profile.first_name[0]}${member.profile.last_name[0]}`.toUpperCase();
    }
    if (member.profile?.email) {
      return member.profile.email[0].toUpperCase();
    }
    return 'U';
  };

  const getDisplayName = (member: TeamMember) => {
    if (member.profile?.first_name && member.profile?.last_name) {
      return `${member.profile.first_name} ${member.profile.last_name}`;
    }
    return member.profile?.email || 'Unknown User';
  };

  if (loading) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="py-16 text-center text-muted-foreground">
          Loading team information...
        </CardContent>
      </Card>
    );
  }

  if (teamMembers.length === 0) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-foreground">
            <Users className="w-6 h-6 text-primary" />
            Deal Team
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-12">
          <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            No Team Members Listed
          </h3>
          <p className="text-muted-foreground">
            Contact information will appear here once the deal team is set up.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-foreground">
            <Users className="w-6 h-6 text-primary" />
            Deal Team ({teamMembers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {teamMembers.map((member) => (
              <Card key={member.id} className="bg-muted/30 border-border">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={member.profile?.profile_picture_url || undefined} />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {getInitials(member)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-foreground truncate">
                          {getDisplayName(member)}
                        </h4>
                        <Badge variant={getRoleBadgeVariant(member.role)} className="shrink-0">
                          {getRoleLabel(member.role)}
                        </Badge>
                      </div>
                      
                      <div className="flex flex-wrap gap-3 mt-3">
                        {member.profile?.email && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-2"
                            onClick={() => window.location.href = `mailto:${member.profile?.email}`}
                          >
                            <Mail className="w-3 h-3" />
                            Email
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Contact CTA */}
      <Card className="bg-card border-border">
        <CardContent className="py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold text-foreground mb-1">Have Questions?</h3>
              <p className="text-sm text-muted-foreground">
                Reach out to the deal team for more information about this opportunity.
              </p>
            </div>
            <Button className="gap-2">
              <Mail className="w-4 h-4" />
              Contact Team
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
