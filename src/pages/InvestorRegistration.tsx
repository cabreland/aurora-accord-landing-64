import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, Building, Calendar, User, Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useInvitationValidation } from '@/hooks/useInvitationValidation';
import { InvestorRegistrationForm } from '@/components/investor/InvestorRegistrationForm';
import { NDAAcceptanceForm } from '@/components/investor/NDAAcceptanceForm';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export type RegistrationStep = 'validating' | 'invalid' | 'registration' | 'nda' | 'success';

const InvestorRegistration = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState<RegistrationStep>('validating');
  const [registrationData, setRegistrationData] = useState<any>(null);
  
  const invitationCode = searchParams.get('code');
  const { invitation, loading, error, validateInvitation } = useInvitationValidation();

  useEffect(() => {
    if (invitationCode) {
      validateInvitation(invitationCode);
    } else {
      setCurrentStep('invalid');
    }
  }, [invitationCode, validateInvitation]);

  useEffect(() => {
    if (!loading) {
      if (error || !invitation) {
        setCurrentStep('invalid');
      } else if (invitation.status === 'accepted') {
        toast({
          title: 'Already Registered',
          description: 'This invitation has already been accepted. Redirecting to your portal.',
        });
        navigate('/investor-portal');
      } else {
        setCurrentStep('registration');
      }
    }
  }, [loading, error, invitation, navigate, toast]);

  const handleRegistrationComplete = (data: any) => {
    setRegistrationData(data);
    setCurrentStep('nda');
  };

  const handleNDAComplete = () => {
    setCurrentStep('success');
    // Redirect to investor portal after a brief success message
    setTimeout(() => {
      navigate('/investor-portal');
    }, 3000);
  };

  const getAccessTypeDisplay = (accessType: string) => {
    switch (accessType) {
      case 'single':
        return 'Single Deal Access';
      case 'multiple':
        return 'Multiple Deals Access';
      case 'portfolio':
        return 'Full Portfolio Access';
      case 'custom':
        return 'Custom Package Access';
      default:
        return 'Investment Access';
    }
  };

  const getExpiryStatus = (expiresAt: string) => {
    const expiry = new Date(expiresAt);
    const now = new Date();
    const daysLeft = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 3600 * 24));
    
    if (daysLeft < 0) {
      return { label: 'Expired', variant: 'destructive' as const };
    } else if (daysLeft <= 7) {
      return { label: `${daysLeft} days left`, variant: 'secondary' as const };
    } else {
      return { label: `${daysLeft} days left`, variant: 'default' as const };
    }
  };

  if (currentStep === 'validating' || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-4">
              <LoadingSpinner size="lg" />
              <h2 className="text-xl font-semibold text-foreground">Validating Invitation</h2>
              <p className="text-sm text-muted-foreground text-center">
                Please wait while we verify your invitation code...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (currentStep === 'invalid') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="w-5 h-5" />
              Invalid Invitation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error || 'This invitation link is invalid or has expired. Please contact the person who invited you for a new link.'}
              </AlertDescription>
            </Alert>
            <div className="flex flex-col gap-2">
              <Button onClick={() => window.history.back()} variant="outline">
                Go Back
              </Button>
              <Button onClick={() => navigate('/auth')} variant="default">
                Sign In Instead
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (currentStep === 'success') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle className="w-5 h-5" />
              Welcome Aboard!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center space-y-2">
              <p className="text-foreground">
                Your account has been created successfully and you now have access to the investor portal.
              </p>
              <p className="text-sm text-muted-foreground">
                Redirecting you to your dashboard...
              </p>
            </div>
            <div className="flex justify-center">
              <LoadingSpinner />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Invitation Details */}
        {invitation && (
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  Investment Invitation
                </CardTitle>
                <Badge variant={getExpiryStatus(invitation.expires_at).variant}>
                  <Calendar className="w-3 h-3 mr-1" />
                  {getExpiryStatus(invitation.expires_at).label}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Invited by</p>
                    <p className="font-medium">{invitation.invited_by_name || 'Investment Team'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Access Type</p>
                    <p className="font-medium">{getAccessTypeDisplay(invitation.access_type)}</p>
                  </div>
                </div>
              </div>
              
              {invitation.notes && (
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Message from your contact:</p>
                  <p className="text-sm">{invitation.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Registration Steps */}
        {currentStep === 'registration' && invitation && (
          <InvestorRegistrationForm
            invitation={invitation}
            onComplete={handleRegistrationComplete}
          />
        )}

        {currentStep === 'nda' && invitation && registrationData && (
          <NDAAcceptanceForm
            invitation={invitation}
            registrationData={registrationData}
            onComplete={handleNDAComplete}
          />
        )}
      </div>
    </div>
  );
};

export default InvestorRegistration;