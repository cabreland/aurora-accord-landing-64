
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { withAuth } from "@/utils/withAuth";
import React, { Suspense, lazy } from "react";
import { FloatingChatWidget } from "@/components/chat/FloatingChatWidget";
import { ChatWidgetProvider } from "@/contexts/ChatWidgetContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { DevTools } from "@/components/dev/DevTools";
import { useOnboardingCheck } from "@/hooks/useOnboardingCheck";

import Index from "./pages/Index";
import Demo from "./pages/Demo";
import InvestorPortal from "./pages/InvestorPortal";

// Lazy-load remaining pages to reduce initial bundle size
const IndexV2 = lazy(() => import("./pages/IndexV2"));
const HomePageA = lazy(() => import("./pages/HomePageA"));
const HomePageB = lazy(() => import("./pages/HomePageB"));
const HomePageC = lazy(() => import("./pages/HomePageC"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Auth = lazy(() => import("./pages/Auth"));
const AuthAccept = lazy(() => import("./pages/AuthAccept"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Forbidden = lazy(() => import("./pages/Forbidden"));
const UserManagement = lazy(() => import("./pages/UserManagement"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const InvestorOnboarding = lazy(() => import("./pages/InvestorOnboardingNew"));
const InvestorOnboardingV2 = lazy(() => import("./pages/InvestorOnboardingV2"));
const DealManagement = lazy(() => import("./pages/DealManagement"));
const DealDetail = lazy(() => import("./pages/DealDetail"));
const Documents = lazy(() => import("./pages/Documents"));
const Settings = lazy(() => import("./pages/Settings"));
const Activity = lazy(() => import("./pages/Activity"));
const InvestorInvitations = lazy(() => import("./pages/InvestorInvitations"));
const InvestorRegistration = lazy(() => import("./pages/InvestorRegistration"));
const TestRegistration = lazy(() => import("./pages/TestRegistration"));
const Analytics = lazy(() => import("./pages/Analytics"));
const Compliance = lazy(() => import("./pages/Compliance"));
const InvestorMessages = lazy(() => import("./pages/InvestorMessages"));
const TeamConversations = lazy(() => import("./pages/TeamConversations"));
const NDAManagement = lazy(() => import("./pages/NDAManagement"));
const AccessRequests = lazy(() => import("./pages/AccessRequests"));
const NDASettings = lazy(() => import("./pages/NDASettings"));
const InvestorProfile = lazy(() => import("./pages/InvestorProfilePage"));

// Wrap protected components with authentication
const ProtectedDashboard = withAuth('investor')(Dashboard);
const ProtectedInvestorPortal = withAuth('investor')(InvestorPortal);
const ProtectedDealManagement = withAuth('admin')(DealManagement);
const ProtectedDealDetail = withAuth('investor')(DealDetail);
const ProtectedDocuments = withAuth('staff')(Documents);
const ProtectedUserManagement = withAuth('admin')(UserManagement);
const ProtectedSettings = withAuth('staff')(Settings);
const ProtectedActivity = withAuth('staff')(Activity);
const ProtectedOnboarding = withAuth('investor')(Onboarding);
const ProtectedInvestorOnboarding = withAuth('investor', { skipOnboardingCheck: true })(InvestorOnboarding);
const ProtectedInvestorOnboardingV2 = withAuth('investor', { skipOnboardingCheck: true })(InvestorOnboardingV2);
const ProtectedInvestorInvitations = withAuth('admin')(InvestorInvitations);
const ProtectedAnalytics = withAuth('investor')(Analytics);
const ProtectedCompliance = withAuth('investor')(Compliance);
const ProtectedInvestorMessages = withAuth('investor')(InvestorMessages);
const ProtectedTeamConversations = withAuth('staff')(TeamConversations);
const ProtectedNDAManagement = withAuth('admin')(NDAManagement);
const ProtectedAccessRequests = withAuth('admin')(AccessRequests);
const ProtectedNDASettings = withAuth('admin')(NDASettings);
const ProtectedInvestorProfile = withAuth('investor')(InvestorProfile);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      gcTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const AppContent = () => {
  // Check onboarding status on every page load
  useOnboardingCheck();
  
  return (
    <>
      <FloatingChatWidget />
            <Suspense
            fallback={
              <div className="min-h-screen bg-[#1C2526] flex items-center justify-center">
                <div className="text-[#FAFAFA]">Loading…</div>
              </div>
            }
          >
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/v2" element={<IndexV2 />} />
              <Route path="/home-page-a" element={<HomePageA />} />
              <Route path="/home-page-b" element={<HomePageB />} />
              <Route path="/home-page-c" element={<HomePageC />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/auth/accept" element={<AuthAccept />} />
              <Route path="/demo" element={<Demo />} />
              <Route path="/dashboard" element={<ProtectedDashboard />} />
              <Route path="/investor-portal" element={<ProtectedInvestorPortal />} />
              <Route path="/deals" element={<ProtectedDealManagement />} />
              <Route path="/deal/:id" element={<ProtectedDealDetail />} />
              <Route path="/documents" element={<ProtectedDocuments />} />
              <Route path="/users" element={<ProtectedUserManagement />} />
        <Route path="/settings" element={<ProtectedSettings />} />
              <Route path="/activity" element={<ProtectedActivity />} />
              <Route path="/onboarding" element={<ProtectedOnboarding />} />
              <Route path="/investor/onboarding" element={<ProtectedInvestorOnboarding />} />
              <Route path="/investor/onboarding-v2" element={<ProtectedInvestorOnboardingV2 />} />
              <Route path="/investor-invitations" element={<ProtectedInvestorInvitations />} />
              <Route path="/investor-registration" element={<InvestorRegistration />} />
              <Route path="/test-registration" element={<TestRegistration />} />
              <Route path="/analytics" element={<ProtectedAnalytics />} />
              <Route path="/compliance" element={<ProtectedCompliance />} />
              <Route path="/investor-portal/messages" element={<ProtectedInvestorMessages />} />
              <Route path="/investor-portal/messages/:conversationId" element={<ProtectedInvestorMessages />} />
              <Route path="/dashboard/conversations" element={<ProtectedTeamConversations />} />
              <Route path="/dashboard/conversations/:conversationId" element={<ProtectedTeamConversations />} />
              <Route path="/dashboard/ndas" element={<ProtectedNDAManagement />} />
              <Route path="/dashboard/access-requests" element={<ProtectedAccessRequests />} />
              <Route path="/dashboard/nda-settings" element={<ProtectedNDASettings />} />
              <Route path="/investor-portal/profile" element={<ProtectedInvestorProfile />} />
              <Route path="/investor/profile" element={<Navigate to="/investor-portal/profile" replace />} />
              <Route path="/403" element={<Forbidden />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
          <DevTools />
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ChatWidgetProvider>
              <AppContent />
            </ChatWidgetProvider>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
