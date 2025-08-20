
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, MapPin, TrendingUp, DollarSign, Shield, Star } from 'lucide-react';
import { CompanyFormData } from '../CompanyWizard';

interface ReviewStepProps {
  data: CompanyFormData;
  onChange: (data: Partial<CompanyFormData>) => void;
  isValid: boolean;
}

const ReviewStep: React.FC<ReviewStepProps> = ({ data, onChange, isValid }) => {
  const formatCurrency = (value: string) => {
    if (!value) return 'Not specified';
    const num = parseFloat(value);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-foreground mb-2">Review & Create</h3>
        <p className="text-muted-foreground">
          Review all information before creating the company profile
        </p>
      </div>

      <div className="grid gap-4">
        {/* Company Basics */}
        <Card className="bg-background border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Company Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium text-foreground">{data.name || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Industry</p>
                <p className="font-medium text-foreground">{data.industry || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Location</p>
                <p className="font-medium text-foreground flex items-center gap-1">
                  {data.location && <MapPin className="w-3 h-3" />}
                  {data.location || 'Not specified'}
                </p>
              </div>
            </div>
            {data.summary && (
              <div>
                <p className="text-sm text-muted-foreground">Summary</p>
                <p className="text-sm text-foreground">{data.summary}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Deal Information */}
        <Card className="bg-background border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Deal Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Stage</p>
                <Badge variant="outline" className="capitalize">
                  {data.stage?.replace('_', ' ') || 'Not set'}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Priority</p>
                <Badge 
                  variant={data.priority === 'high' ? 'destructive' : 'secondary'}
                  className="capitalize"
                >
                  {data.priority || 'Not set'}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Fit Score</p>
                <div className="flex items-center gap-2">
                  <Star className="w-3 h-3 text-yellow-500" />
                  <span className="font-medium text-foreground">{data.fit_score}%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Financial Information */}
        {(data.revenue || data.ebitda || data.asking_price) && (
          <Card className="bg-background border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Financial Metrics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Revenue</p>
                  <p className="font-medium text-foreground">{formatCurrency(data.revenue)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">EBITDA</p>
                  <p className="font-medium text-foreground">{formatCurrency(data.ebitda)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Asking Price</p>
                  <p className="font-medium text-foreground">{formatCurrency(data.asking_price)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Highlights & Risks */}
        {(data.highlights.length > 0 || data.risks.length > 0) && (
          <Card className="bg-background border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Highlights & Risks</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.highlights.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Highlights</p>
                  <div className="space-y-1">
                    {data.highlights.map((highlight, index) => (
                      <p key={index} className="text-sm text-foreground">• {highlight}</p>
                    ))}
                  </div>
                </div>
              )}
              {data.risks.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Risks</p>
                  <div className="space-y-1">
                    {data.risks.map((risk, index) => (
                      <p key={index} className="text-sm text-foreground">• {risk}</p>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Access Settings */}
        <Card className="bg-background border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Access Configuration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Access Passcode</span>
              <Badge variant={data.passcode ? 'secondary' : 'outline'}>
                {data.passcode ? 'Configured' : 'Standard Access'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {!isValid && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
          <p className="text-sm text-destructive">
            Please ensure all required fields are completed before creating the company.
          </p>
        </div>
      )}
    </div>
  );
};

export default ReviewStep;
