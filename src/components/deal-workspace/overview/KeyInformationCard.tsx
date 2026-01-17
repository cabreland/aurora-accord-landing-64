import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Building2, 
  DollarSign, 
  TrendingUp, 
  MapPin, 
  Users, 
  Calendar,
  Pencil
} from 'lucide-react';

interface KeyInformationCardProps {
  deal: {
    revenue?: string | null;
    ebitda?: string | null;
    asking_price?: string | null;
    location?: string | null;
    team_size?: string | null;
    founded_year?: number | null;
    industry?: string | null;
    growth_rate?: string | null;
  };
  onEditDetails?: () => void;
}

export const KeyInformationCard: React.FC<KeyInformationCardProps> = ({ 
  deal, 
  onEditDetails 
}) => {
  const infoItems = [
    { label: 'Revenue', value: deal.revenue, icon: DollarSign },
    { label: 'EBITDA', value: deal.ebitda, icon: TrendingUp },
    { label: 'Asking Price', value: deal.asking_price, icon: DollarSign },
    { label: 'Location', value: deal.location, icon: MapPin },
    { label: 'Team Size', value: deal.team_size, icon: Users },
    { label: 'Founded', value: deal.founded_year?.toString(), icon: Calendar },
  ];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Key Information
        </CardTitle>
        {onEditDetails && (
          <Button variant="ghost" size="sm" onClick={onEditDetails}>
            <Pencil className="h-4 w-4 mr-1" />
            Edit
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {infoItems.map(item => (
            <div key={item.label} className="p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <item.icon className="h-4 w-4" />
                <span className="text-sm">{item.label}</span>
              </div>
              <p className="font-semibold">{item.value || 'N/A'}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
