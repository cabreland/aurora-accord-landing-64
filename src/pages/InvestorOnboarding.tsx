import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { CheckCircle } from 'lucide-react';

const InvestorOnboarding = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formCompleted, setFormCompleted] = useState(false);

  useEffect(() => {
    if (user) {
      console.log('[InvestorOnboarding] Page loaded for user:', user.id);
    }

    // Load GHL form embed script
    const script = document.createElement('script');
    script.src = 'https://link.msgsndr.com/js/form_embed.js';
    script.async = true;
    script.onload = () => console.log('[InvestorOnboarding] GHL form script loaded');
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [user]);

  useEffect(() => {
    // Listen for form submission via postMessage
    const handleMessage = (event: MessageEvent) => {
      console.log('[InvestorOnboarding] Received postMessage:', event.data);
      // Check if message is from GoHighLevel form
      if (event.data?.type === 'ghl-form-submit' || event.data?.formSubmitted) {
        console.log('[InvestorOnboarding] GHL form submitted via postMessage');
        handleFormCompletion();
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleFormCompletion = async () => {
    if (!user) return;
    
    setLoading(true);
    setFormCompleted(true);

    try {
      console.log('[InvestorOnboarding] Form submitted, marking complete for user:', user.id);

      const { error } = await supabase
        .from('profiles')
        .update({ 
          onboarding_completed: true,
          onboarding_skipped: false
        })
        .eq('user_id', user.id);

      if (error) throw error;

      console.log('[InvestorOnboarding] Profile updated successfully, redirecting to portal');

      toast({
        title: "Profile complete! Redirecting to deals...",
        description: "You can now browse investment opportunities.",
      });

      // Redirect after 2 seconds
      setTimeout(() => {
        console.log('[InvestorOnboarding] Redirecting to investor portal');
        navigate('/investor-portal');
      }, 2000);
    } catch (error) {
      console.error('[InvestorOnboarding] Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update your profile. Please try again.",
        variant: "destructive",
      });
      setFormCompleted(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    if (!user) return;
    
    setLoading(true);

    try {
      console.log('[InvestorOnboarding] Skipping onboarding:', user.id);

      const { error } = await supabase
        .from('profiles')
        .update({ 
          onboarding_completed: false, // Not completed
          onboarding_skipped: true // But skipped
        })
        .eq('user_id', user.id);

      if (error) throw error;

      console.log('[InvestorOnboarding] Profile marked as skipped, redirecting to portal');

      toast({
        title: "Skipped for now",
        description: "You can complete your profile later for better recommendations.",
      });

      navigate('/investor-portal');
    } catch (error) {
      console.error('[InvestorOnboarding] Error skipping onboarding:', error);
      toast({
        title: "Error",
        description: "Failed to skip onboarding. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1A1F2E] via-[#0F1419] to-[#1A1F2E]">
      {/* Header */}
      <div className="border-b border-[#D4AF37]/20 bg-[#0A0F0F]/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#D4AF37] to-[#F4E4BC] rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-[#0A0F0F] font-bold text-lg">E</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-[#D4AF37]">EBB Data Room</h1>
                <p className="text-xs text-[#F4E4BC]/70">Investment Platform</p>
              </div>
            </div>
            <div className="text-sm text-[#F4E4BC]/70">
              Step 1 of 1: <span className="text-[#D4AF37] font-semibold">Complete Your Profile</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Welcome Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#D4AF37]/20 to-[#F4E4BC]/10 rounded-full mb-6">
            <CheckCircle className="w-10 h-10 text-[#D4AF37]" />
          </div>
          <h2 className="text-4xl font-bold text-[#F4E4BC] mb-4">
            Welcome to EBB Data Room
          </h2>
          <p className="text-lg text-[#F4E4BC]/70 max-w-2xl mx-auto">
            Help us understand your investment criteria so we can show you the best opportunities
          </p>
        </div>

        {/* Success Message */}
        {formCompleted && (
          <div className="mb-8 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-lg p-6 text-center">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <h3 className="text-xl font-semibold text-green-500 mb-2">Profile Complete!</h3>
            <p className="text-[#F4E4BC]/70">Redirecting you to investment opportunities...</p>
          </div>
        )}

        {/* Embedded GHL Form */}
        {!formCompleted && (
          <div className="bg-white rounded-lg shadow-2xl overflow-hidden min-h-[2430px]">
            <iframe
              src="https://api.leadconnectorhq.com/widget/form/lkG4itWbml8RpnxnupNB"
              style={{ 
                width: '100%', 
                height: '2430px', 
                border: 'none',
                display: 'block'
              }}
              id="inline-lkG4itWbml8RpnxnupNB"
              data-layout='{"id":"INLINE"}'
              data-trigger-type="alwaysShow"
              data-trigger-value=""
              data-activation-type="alwaysActivated"
              data-activation-value=""
              data-deactivation-type="neverDeactivate"
              data-deactivation-value=""
              data-form-name="Buyer Interest Form"
              data-height="2430"
              data-layout-iframe-id="inline-lkG4itWbml8RpnxnupNB"
              data-form-id="lkG4itWbml8RpnxnupNB"
              title="Buyer Interest Form"
              className="rounded-lg"
              sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-top-navigation allow-modals"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              loading="eager"
              onLoad={() => console.log('[InvestorOnboarding] GHL form iframe loaded')}
              onError={(e) => console.error('[InvestorOnboarding] GHL form iframe error:', e)}
            />
          </div>
        )}

        {/* Skip Button */}
        {!formCompleted && (
          <div className="text-center mt-8">
            <Button
              variant="ghost"
              onClick={handleSkip}
              disabled={loading}
              className="text-[#F4E4BC]/60 hover:text-[#F4E4BC] hover:bg-[#D4AF37]/10"
            >
              {loading ? 'Processing...' : 'Skip for now →'}
            </Button>
            <p className="text-xs text-[#F4E4BC]/50 mt-2">
              You can complete this later from your profile settings
            </p>
          </div>
        )}
      </div>

      {/* Footer Note */}
      <div className="text-center py-8 text-sm text-[#F4E4BC]/50">
        <p>Your information is secure and will only be used to match you with relevant deals</p>
      </div>
    </div>
  );
};

export default InvestorOnboarding;
