import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useUserProfile } from '@/hooks/useUserProfile';
import { supabase } from '@/integrations/supabase/client';
import { InvitationDetails } from '@/hooks/useInvitationValidation';

interface NDAAcceptanceFormProps {
  invitation: InvitationDetails;
  registrationData: any;
  onComplete: () => void;
}

export const NDAAcceptanceForm: React.FC<NDAAcceptanceFormProps> = ({
  invitation,
  registrationData,
  onComplete,
}) => {
  const [ndaAccepted, setNDAAccepted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const { profile } = useUserProfile();
  
  // Check if this is admin dev mode
  const isDevMode = profile?.role === 'admin' && invitation.id === 'dev-mode';

  const handleCreateAccount = async () => {
    if (!ndaAccepted) {
      toast({
        title: 'NDA Required',
        description: 'You must accept the NDA to continue.',
        variant: 'destructive',
      });
      return;
    }

    // Handle dev mode differently
    if (isDevMode) {
      toast({
        title: 'Development Mode',
        description: 'NDA accepted in development mode. No account creation performed.',
      });
      onComplete();
      return;
    }

    setIsLoading(true);

    try {
      // 1. Create Supabase auth account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: registrationData.email,
        password: registrationData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/investor-portal`,
          data: {
            first_name: registrationData.firstName,
            last_name: registrationData.lastName,
            company_name: registrationData.companyName,
            phone_number: registrationData.phoneNumber,
            investor_type: registrationData.investorType,
          },
        },
      });

      if (authError) {
        throw new Error(authError.message);
      }

      if (!authData.user) {
        throw new Error('Failed to create user account');
      }

      // 2. Wait a moment for the trigger to create the profile
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 3. Update the profile with additional investor information
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          first_name: registrationData.firstName,
          last_name: registrationData.lastName,
          role: 'viewer', // Investors are viewers by default
        })
        .eq('user_id', authData.user.id);

      if (profileError) {
        console.error('Profile update error:', profileError);
        // Don't throw here as it's not critical for the flow
      }

      // 4. Accept NDA for the company/deal
      if (invitation.access_type === 'single' && invitation.deal_id) {
        // For single deal access, accept NDA for that deal's company
        // We'll need to get the company_id from the deal
        const { data: dealData } = await supabase
          .from('deals')
          .select('company_id')
          .eq('id', invitation.deal_id)
          .single();

        if (dealData?.company_id) {
          await supabase.rpc('accept_company_nda', {
            p_company_id: dealData.company_id
          });
        }
      }

      // 5. Mark invitation as accepted
      const { error: invitationError } = await supabase
        .from('investor_invitations')
        .update({
          status: 'accepted',
          accepted_at: new Date().toISOString(),
        })
        .eq('id', invitation.id);

      if (invitationError) {
        console.error('Invitation update error:', invitationError);
        // Don't throw here as the account is created
      }

      // 6. Log the successful registration
      await supabase.rpc('log_security_event', {
        p_event_type: 'investor_registration_completed',
        p_event_data: {
          invitation_id: invitation.id,
          access_type: invitation.access_type,
          email: registrationData.email,
        },
        p_user_id: authData.user.id,
      });

      toast({
        title: 'Account Created Successfully',
        description: 'Welcome to the investor portal! Redirecting you now...',
      });

      onComplete();
    } catch (error: any) {
      console.error('Account creation error:', error);
      toast({
        title: 'Account Creation Failed',
        description: error.message || 'Please try again or contact support.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getNDAContent = () => {
    if (invitation.access_type === 'portfolio' || invitation.master_nda_signed) {
      return {
        title: 'Master Non-Disclosure Agreement',
        content: `This Master Non-Disclosure Agreement ("Agreement") governs your access to confidential information across our entire portfolio of investment opportunities...

CONFIDENTIALITY OBLIGATIONS:
• All information shared is strictly confidential
• Information may not be disclosed to third parties
• Use of information is limited to investment evaluation purposes
• Confidentiality obligations survive termination of this agreement

PERMITTED USES:
• Evaluation of investment opportunities
• Internal discussion with authorized team members
• Due diligence activities as approved

PROHIBITED ACTIVITIES:
• Sharing information with competitors or unauthorized parties
• Using information for purposes other than investment evaluation
• Reverse engineering or attempting to replicate business models

This agreement provides access to multiple investment opportunities and confidential materials across our portfolio.`,
      };
    } else {
      return {
        title: 'Deal-Specific Non-Disclosure Agreement',
        content: `This Non-Disclosure Agreement ("Agreement") governs your access to confidential information regarding the specific investment opportunity you have been invited to review...

SCOPE OF CONFIDENTIAL INFORMATION:
• Financial statements and projections
• Business plans and strategic information
• Customer and supplier information
• Proprietary technology and processes
• Management presentations and materials

CONFIDENTIALITY OBLIGATIONS:
• Maintain strict confidentiality of all materials
• Limit access to authorized personnel only
• Return or destroy materials upon request
• No reproduction without written consent

INVESTMENT EVALUATION PURPOSE:
This information is provided solely for your evaluation of potential investment opportunities and may not be used for any other purpose.

Duration: This agreement remains in effect indefinitely unless terminated by mutual consent.`,
      };
    }
  };

  const ndaContent = getNDAContent();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Non-Disclosure Agreement
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Before accessing confidential investment materials, you must accept our Non-Disclosure Agreement. 
              This ensures the protection of sensitive business information.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <FileText className="w-4 h-4" />
              {ndaContent.title}
            </h3>
            
            <Card className="bg-muted/30">
              <ScrollArea className="h-[300px] p-4">
                <div className="whitespace-pre-line text-sm leading-6">
                  {ndaContent.content}
                </div>
              </ScrollArea>
            </Card>

            <div className="flex items-start space-x-3 p-4 border rounded-lg">
              <Checkbox
                id="nda-acceptance"
                checked={ndaAccepted}
                onCheckedChange={(checked) => setNDAAccepted(checked === true)}
                className="mt-1"
              />
              <div className="space-y-1">
                <label
                  htmlFor="nda-acceptance"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  I accept the Non-Disclosure Agreement
                </label>
                <p className="text-xs text-muted-foreground">
                  By checking this box, I acknowledge that I have read, understood, and agree to be bound by 
                  the terms of this Non-Disclosure Agreement. I understand that violation of this agreement 
                  may result in legal action and immediate revocation of access.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-4">
        <Button
          onClick={handleCreateAccount}
          disabled={!ndaAccepted || isLoading}
          size="lg"
          className="w-full"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
              {isDevMode ? 'Processing...' : 'Creating Your Account...'}
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              {isDevMode ? 'Accept NDA (Dev Mode)' : 'Accept NDA & Create Account'}
            </>
          )}
        </Button>
        
        <p className="text-xs text-muted-foreground text-center">
          {isDevMode ? (
            'Development mode: No account will be created. This is for testing the registration flow only.'
          ) : (
            'By creating your account, you agree to our terms of service and privacy policy. You will receive email confirmation once your account is ready.'
          )}
        </p>
      </div>
    </div>
  );
};