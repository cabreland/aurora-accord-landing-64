import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle2 } from 'lucide-react';
const InvestorOnboardingV2 = () => {
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const {
    user
  } = useAuth();
  const [formCompleted, setFormCompleted] = useState(false);
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://link.msgsndr.com/js/form_embed.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data === 'ghl-form-submit' || event.data?.type === 'formSubmitted' || event.data?.type === 'submitted' || Array.isArray(event.data) && event.data.includes('form-submitted') || typeof event.data === 'string' && (event.data.includes('thank') || event.data.includes('success'))) {
        handleFormCompletion();
      }
    };
    const handleHashChange = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash.includes('thank') || hash.includes('success') || hash.includes('complete')) {
        handleFormCompletion();
      }
    };
    window.addEventListener('message', handleMessage);
    window.addEventListener('hashchange', handleHashChange);
    return () => {
      window.removeEventListener('message', handleMessage);
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);
  const handleFormCompletion = async () => {
    if (!user || formCompleted) return;
    setFormCompleted(true);
    try {
      const {
        error
      } = await supabase.from('profiles').update({
        onboarding_completed: true,
        onboarding_skipped: false
      }).eq('user_id', user.id);
      if (error) throw error;
      toast({
        title: "Profile Complete!",
        description: "Redirecting to your dashboard..."
      });
      setTimeout(() => {
        navigate('/investor-portal');
      }, 2000);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to save profile. Please try again.",
        variant: "destructive"
      });
    }
  };
  const handleSkip = async () => {
    if (!user) return;
    try {
      const {
        error
      } = await supabase.from('profiles').update({
        onboarding_skipped: true,
        onboarding_completed: false
      }).eq('user_id', user.id);
      if (error) throw error;
      toast({
        title: "Skipped",
        description: "You can complete your profile later."
      });
      navigate('/investor-portal');
    } catch (error) {
      console.error('Error skipping onboarding:', error);
      toast({
        title: "Error",
        description: "Failed to skip onboarding. Please try again.",
        variant: "destructive"
      });
    }
  };
  return <div className="min-h-screen bg-[hsl(var(--portal-bg))]">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-[hsl(var(--text-primary))] mb-2">
            Ebb Data Room Onboarding               
          </h1>
          <p className="text-[hsl(var(--text-secondary))]">
            Alternative Onboarding (GHL Form)
          </p>
        </header>

        {formCompleted ? <div className="max-w-2xl mx-auto bg-[hsl(var(--portal-card))] rounded-lg p-8 text-center">
            <CheckCircle2 className="w-16 h-16 text-[hsl(var(--success))] mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-[hsl(var(--text-primary))] mb-2">
              Thank you for submitting your buyer profile!
            </h2>
            <p className="text-[hsl(var(--text-secondary))] mb-4">
              We're processing your information and will redirect you shortly...
            </p>
          </div> : <>
            <div className="max-w-4xl mx-auto">
              <iframe src="https://api.leadconnectorhq.com/widget/form/oQ4i4FTGKhLr6hX9Azse" className="w-full h-[800px] border-0" id="inline-oQ4i4FTGKhLr6hX9Azse" data-layout="{'id':'INLINE'}" data-trigger-type="alwaysShow" data-trigger-value="" data-activation-type="alwaysActivated" data-activation-value="" data-deactivation-type="neverDeactivate" data-deactivation-value="" data-form-name="EBB Buyer Questionnaire" data-height="706" data-layout-iframe-id="inline-oQ4i4FTGKhLr6hX9Azse" data-form-id="oQ4i4FTGKhLr6hX9Azse" title="EBB Buyer Questionnaire" onLoad={e => {
            const iframe = e.currentTarget;
            const checkInterval = setInterval(() => {
              try {
                const iframeUrl = iframe.contentWindow?.location.href || '';
                if (iframeUrl.includes('thank') || iframeUrl.includes('success')) {
                  clearInterval(checkInterval);
                  handleFormCompletion();
                }
              } catch (err) {
                // CORS prevents access
              }
            }, 1000);
            setTimeout(() => clearInterval(checkInterval), 60000);
          }} />
            </div>

            <div className="mt-8 text-center">
              <Button variant="ghost" onClick={handleSkip} className="text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))]">
                Skip for now
              </Button>
            </div>

            <div className="mt-4 text-center text-sm text-[hsl(var(--text-secondary))]">
              <p>Your information is secure and will only be used to match you with relevant opportunities.</p>
            </div>
          </>}
      </div>
    </div>;
};
export default InvestorOnboardingV2;