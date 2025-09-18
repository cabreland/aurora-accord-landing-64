import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useUserProfile } from '@/hooks/useUserProfile';
import { supabase } from '@/integrations/supabase/client';
import { InvitationDetails } from '@/hooks/useInvitationValidation';
import { ESignature, SignatureData } from './ESignature';

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
  const [signatureData, setSignatureData] = useState<SignatureData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const { profile } = useUserProfile();
  
  // Check if this is admin dev mode
  const isDevMode = profile?.role === 'admin' && invitation.id === 'dev-mode';

  const handleSign = (signature: SignatureData) => {
    setSignatureData(signature);
  };

  const handleCreateAccount = async () => {
    if (!signatureData) {
      toast({
        title: 'Signature Required',
        description: 'You must sign the NDA to continue.',
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

      // 4. Store NDA signature
      let companyId = null;
      if (invitation.access_type === 'single' && invitation.deal_id) {
        // For single deal access, get company_id from the deal
        const { data: dealData } = await supabase
          .from('deals')
          .select('company_id')
          .eq('id', invitation.deal_id)
          .single();
        
        companyId = dealData?.company_id;
      }

      // Store the e-signature
      const { error: signatureError } = await supabase
        .from('nda_signatures')
        .insert({
          user_id: authData.user.id,
          company_id: companyId,
          invitation_id: invitation.id,
          signature_data: signatureData as any,
          ip_address: signatureData.ipAddress,
          user_agent: signatureData.userAgent,
          full_name: signatureData.fullName,
          email: registrationData.email,
        });

      if (signatureError) {
        console.error('Signature storage error:', signatureError);
        // Don't throw here as the account is created
      }

      // 5. Accept NDA for the company/deal
      if (companyId) {
        await supabase.rpc('accept_company_nda', {
          p_company_id: companyId
        });
      }

      // 6. Mark invitation as accepted
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

      // 7. Log the successful registration
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
        content: `EXCLUSIVE BUSINESS BROKERS, INC.
MASTER NON-DISCLOSURE AGREEMENT

This Master Non-Disclosure Agreement ("Agreement") is entered into between Exclusive Business Brokers, Inc. ("Disclosing Party") and the undersigned ("Receiving Party") to facilitate the evaluation of confidential business information across multiple investment opportunities.

1. CONFIDENTIAL INFORMATION
"Confidential Information" includes all financial statements, business plans, customer lists, supplier information, operational data, proprietary processes, marketing strategies, and any other business information disclosed by the Disclosing Party or its clients.

2. OBLIGATIONS OF RECEIVING PARTY
The Receiving Party agrees to:
• Hold all Confidential Information in strict confidence
• Use Confidential Information solely for the purpose of evaluating potential investment opportunities
• Not disclose Confidential Information to any third party without prior written consent
• Limit access to Confidential Information to authorized personnel with a legitimate need to know
• Return or destroy all Confidential Information upon request

3. PERMITTED DISCLOSURES
Confidential Information may be disclosed if required by law, court order, or government regulation, provided the Receiving Party gives prompt written notice to allow the Disclosing Party to seek protective measures.

4. TERM AND SURVIVAL
This Agreement remains in effect indefinitely. The obligations of confidentiality shall survive termination of this Agreement and continue in perpetuity.

5. REMEDIES
The Receiving Party acknowledges that breach of this Agreement would cause irreparable harm and agrees that the Disclosing Party shall be entitled to injunctive relief and monetary damages.

6. GOVERNING LAW
This Agreement shall be governed by the laws of the jurisdiction where Exclusive Business Brokers, Inc. is domiciled.

By signing below, the Receiving Party acknowledges reading, understanding, and agreeing to be bound by all terms of this Agreement.`,
      };
    } else {
      return {
        title: 'Non-Disclosure Agreement',
        content: `EXCLUSIVE BUSINESS BROKERS, INC.
NON-DISCLOSURE AGREEMENT

This Non-Disclosure Agreement ("Agreement") is entered into between Exclusive Business Brokers, Inc. ("Disclosing Party") and the undersigned ("Receiving Party") regarding confidential information related to a specific business opportunity.

1. PURPOSE
The Disclosing Party wishes to disclose certain confidential information to the Receiving Party for the sole purpose of evaluating a potential business acquisition or investment opportunity.

2. CONFIDENTIAL INFORMATION
"Confidential Information" includes, but is not limited to:
• Financial statements, tax returns, and accounting records
• Business plans, forecasts, and projections
• Customer and supplier lists and contracts
• Employee information and compensation data
• Proprietary processes, systems, and trade secrets
• Marketing strategies and competitive information
• Any other information marked or identified as confidential

3. RECEIVING PARTY OBLIGATIONS
The Receiving Party covenants and agrees to:
• Maintain the confidentiality of all Confidential Information
• Use Confidential Information solely for evaluation purposes
• Not disclose Confidential Information to any unauthorized person
• Limit access to Confidential Information to authorized representatives
• Exercise the same degree of care as with their own confidential information
• Not make copies of any materials without written permission
• Return or destroy all Confidential Information upon request

4. EXCEPTIONS
The obligations of confidentiality shall not apply to information that:
• Is or becomes publicly available through no breach of this Agreement
• Was known to the Receiving Party prior to disclosure
• Is independently developed without use of Confidential Information
• Is required to be disclosed by law or court order

5. TERM
This Agreement shall remain in effect indefinitely unless terminated by mutual written consent.

6. REMEDIES
The Receiving Party acknowledges that any breach of this Agreement would cause irreparable harm to the Disclosing Party and agrees that the Disclosing Party shall be entitled to seek injunctive relief and monetary damages.

7. GOVERNING LAW
This Agreement shall be governed by and construed in accordance with applicable state and federal laws.

The Receiving Party acknowledges that they have read, understood, and agree to be bound by all terms and conditions of this Agreement.`,
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

            <ESignature
              fullName={`${registrationData.firstName} ${registrationData.lastName}`}
              email={registrationData.email}
              onSign={handleSign}
              className="mt-4"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-4">
        <Button
          onClick={handleCreateAccount}
          disabled={!signatureData || isLoading}
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
              {isDevMode ? 'Complete Registration (Dev Mode)' : 'Complete Registration'}
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