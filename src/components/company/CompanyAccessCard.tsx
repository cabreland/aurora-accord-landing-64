
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lock, FileText, Eye, CheckCircle } from 'lucide-react';
import { useCompanyAccess } from '@/hooks/useCompanyAccess';
import { type InvestorCompanySummary, type AccessLevel } from '@/lib/rpc/companyAccess';

interface CompanyAccessCardProps {
  company: InvestorCompanySummary;
}

const getAccessLevelColor = (level: AccessLevel) => {
  switch (level) {
    case 'public': return 'bg-gray-500';
    case 'teaser': return 'bg-blue-500';
    case 'cim': return 'bg-yellow-500';
    case 'financials': return 'bg-orange-500';
    case 'full': return 'bg-green-500';
    default: return 'bg-gray-500';
  }
};

const getAccessLevelLabel = (level: AccessLevel) => {
  switch (level) {
    case 'public': return 'Public';
    case 'teaser': return 'Teaser';
    case 'cim': return 'CIM';
    case 'financials': return 'Financials';
    case 'full': return 'Full Access';
    default: return 'Unknown';
  }
};

const CompanyAccessCard: React.FC<CompanyAccessCardProps> = ({ company }) => {
  const {
    acceptNDA,
    submitRequest,
    isAcceptingNDA,
    isSubmittingRequest
  } = useCompanyAccess();

  const handleAcceptNDA = () => {
    acceptNDA(company.company_id);
  };

  const handleRequestAccess = (level: AccessLevel) => {
    submitRequest({
      companyId: company.company_id,
      requestedLevel: level,
      reason: `Requesting ${level} access for investment evaluation`
    });
  };

  const canRequestHigherAccess = company.effective_access_level !== 'full';
  const hasAcceptedNDA = !!company.nda_accepted_at;

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg text-foreground">
              {company.company_name}
            </CardTitle>
            {company.industry && (
              <p className="text-sm text-muted-foreground mt-1">
                {company.industry}
              </p>
            )}
          </div>
          {company.logo_url && (
            <img 
              src={company.logo_url} 
              alt={`${company.company_name} logo`}
              className="w-12 h-12 rounded-lg object-cover"
            />
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Current Access Level */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Current Access:</span>
          <Badge className={`${getAccessLevelColor(company.effective_access_level)} text-white`}>
            {getAccessLevelLabel(company.effective_access_level)}
          </Badge>
        </div>

        {/* NDA Status */}
        {hasAcceptedNDA ? (
          <div className="flex items-center gap-2 text-sm text-green-600">
            <CheckCircle className="w-4 h-4" />
            <span>NDA Accepted {company.nda_accepted_at && `on ${new Date(company.nda_accepted_at).toLocaleDateString()}`}</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <FileText className="w-4 h-4" />
            <span>NDA Required for higher access</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-2">
          {!hasAcceptedNDA && (
            <Button
              onClick={handleAcceptNDA}
              disabled={isAcceptingNDA}
              variant="outline"
              size="sm"
            >
              <FileText className="w-4 h-4 mr-2" />
              {isAcceptingNDA ? 'Accepting...' : 'Accept NDA'}
            </Button>
          )}

          {canRequestHigherAccess && (
            <div className="grid grid-cols-2 gap-2">
              {company.effective_access_level === 'public' && (
                <Button
                  onClick={() => handleRequestAccess('teaser')}
                  disabled={isSubmittingRequest}
                  size="sm"
                  variant="secondary"
                >
                  <Eye className="w-4 h-4 mr-1" />
                  Teaser
                </Button>
              )}
              
              {hasAcceptedNDA && ['public', 'teaser'].includes(company.effective_access_level) && (
                <Button
                  onClick={() => handleRequestAccess('cim')}
                  disabled={isSubmittingRequest}
                  size="sm"
                  variant="secondary"
                >
                  <FileText className="w-4 h-4 mr-1" />
                  CIM
                </Button>
              )}

              {hasAcceptedNDA && ['public', 'teaser', 'cim'].includes(company.effective_access_level) && (
                <Button
                  onClick={() => handleRequestAccess('financials')}
                  disabled={isSubmittingRequest}
                  size="sm"
                  variant="secondary"
                >
                  <Lock className="w-4 h-4 mr-1" />
                  Financials
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Website Link */}
        {company.website && (
          <a
            href={company.website}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary hover:underline"
          >
            Visit Website →
          </a>
        )}
      </CardContent>
    </Card>
  );
};

export default CompanyAccessCard;
