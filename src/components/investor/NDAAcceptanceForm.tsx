import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { InvitationDetails } from '@/hooks/useInvitationValidation';
import { ESignature, SignatureData } from './ESignature';
import { useRegistrationSettings } from '@/hooks/useRegistrationSettings';

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
  const { getSetting } = useRegistrationSettings('nda');

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

    setIsLoading(true);
    console.log('🚀 Starting account creation process...');

    try {
      // 0. Check if user already exists first
      console.log('🔍 Checking if user already exists...');
      const { data: existingUser } = await supabase.auth.getUser();
      if (existingUser?.user?.email === registrationData.email) {
        throw new Error('You are already signed in with this email. Please sign out first or use a different email.');
      }

      // 1. Create Supabase auth account
      console.log('📧 Creating account for:', registrationData.email);
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

      console.log('🔐 Auth result:', { authData, authError });

      if (authError) {
        console.error('❌ Auth error:', authError);
        
        // Handle specific error cases
        if (authError.message?.includes('already registered') || authError.message?.includes('already been registered')) {
          throw new Error('An account with this email already exists. Please use the sign in page instead.');
        }
        
        throw new Error(authError.message);
      }

      if (!authData.user) {
        console.error('❌ No user data returned');
        throw new Error('Failed to create user account');
      }

      console.log('✅ User created:', authData.user.id);

      // 2. Wait a moment for the trigger to create the profile
      console.log('⏳ Waiting for profile trigger...');
      await new Promise(resolve => setTimeout(resolve, 2000));

      // 3. Update the profile with additional investor information
      console.log('👤 Updating profile for user:', authData.user.id);
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .update({
          first_name: registrationData.firstName,
          last_name: registrationData.lastName,
          role: 'viewer', // Investors are viewers by default
        })
        .eq('user_id', authData.user.id)
        .select();

      console.log('👤 Profile update result:', { profileData, profileError });

      if (profileError) {
        console.error('❌ Profile update error:', profileError);
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
      console.log('✍️ Storing NDA signature...');
      const { data: signatureInsertData, error: signatureError } = await supabase
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
        })
        .select();

      console.log('✍️ Signature storage result:', { signatureInsertData, signatureError });

      if (signatureError) {
        console.error('❌ Signature storage error:', signatureError);
        // Don't throw here as the account is created
      }

      // 5. Accept NDA for the company/deal
      if (companyId) {
        await supabase.rpc('accept_company_nda', {
          p_company_id: companyId
        });
      }

      // 6. Mark invitation as accepted
      console.log('📧 Updating invitation status for ID:', invitation.id);
      const { data: invitationUpdateData, error: invitationError } = await supabase
        .from('investor_invitations')
        .update({
          status: 'accepted',
          accepted_at: new Date().toISOString(),
        })
        .eq('id', invitation.id)
        .select();

      console.log('📧 Invitation update result:', { invitationUpdateData, invitationError });

      if (invitationError) {
        console.error('❌ Invitation update error:', invitationError);
        // This is critical - throw the error
        throw new Error(`Failed to update invitation status: ${invitationError.message}`);
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
    const masterTitle = getSetting('nda_master_title', 'Master Non-Disclosure Agreement');
    const masterContent = getSetting('nda_master_content', 'Default Master NDA content...');
    const singleTitle = getSetting('nda_single_title', 'Non-Disclosure Agreement');
    const singleContent = getSetting('nda_single_content', 'Default Single NDA content...');

    if (invitation.access_type === 'portfolio' || invitation.master_nda_signed) {
      return {
        title: masterTitle,
        content: masterContent,
      };
    } else {
      return {
        title: singleTitle,
        content: singleContent,
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
              Creating Your Account...
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              Complete Registration
            </>
          )}
        </Button>
        
        <p className="text-xs text-muted-foreground text-center">
          By creating your account, you agree to our terms of service and privacy policy. You will receive email confirmation once your account is ready.
        </p>
      </div>
    </div>
  );
};