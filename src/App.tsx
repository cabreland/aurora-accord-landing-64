
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useParams } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { withAuth } from "@/utils/withAuth";
import React, { Suspense, lazy } from "react";
import { FeedbackWidget } from "@/components/feedback/FeedbackWidget";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { useOnboardingCheck } from "@/hooks/useOnboardingCheck";

import InvestorPortal from "./pages/InvestorPortal";
import Homepage from "./pages/Homepage";

// Lazy-load remaining pages to reduce initial bundle size
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Auth = lazy(() => import("./pages/Auth"));
const AuthAccept = lazy(() => import("./pages/AuthAccept"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Forbidden = lazy(() => import("./pages/Forbidden"));
const UserManagement = lazy(() => import("./pages/UserManagement"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const InvestorOnboarding = lazy(() => import("./pages/InvestorOnboardingNew"));
const DealManagement = lazy(() => import("./pages/DealManagement"));
const DealDetail = lazy(() => import("./pages/DealDetail"));
const Documents = lazy(() => import("./pages/Documents"));
const Settings = lazy(() => import("./pages/Settings"));
const InvestorInvitations = lazy(() => import("./pages/InvestorInvitations"));
const InvestorRegistration = lazy(() => import("./pages/InvestorRegistration"));
const InvestorMessages = lazy(() => import("./pages/InvestorMessages"));
const TeamConversations = lazy(() => import("./pages/TeamConversations"));
const NDAManagement = lazy(() => import("./pages/NDAManagement"));
const AccessRequests = lazy(() => import("./pages/AccessRequests"));
const NDASettings = lazy(() => import("./pages/NDASettings"));
const InvestorProfile = lazy(() => import("./pages/InvestorProfilePage"));
const DiligenceTracker = lazy(() => import("./pages/DiligenceTracker"));
const DataRoom = lazy(() => import("./pages/DataRoom"));
const DealWorkspace = lazy(() => import("./pages/DealWorkspace"));
const TrainingCenter = lazy(() => import("./pages/TrainingCenter"));
const CreateDeal = lazy(() => import("./pages/CreateDeal"));
const FinancingTracker = lazy(() => import("./pages/FinancingTracker"));
const DealShareView = lazy(() => import("./pages/DealShareView"));
const Tasks = lazy(() => import("./pages/Tasks"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const FeedbackReview = lazy(() => import("./pages/FeedbackReview"));

// Wrap protected components with authentication
const ProtectedDashboard = withAuth('investor')(Dashboard);
const ProtectedInvestorPortal = withAuth('investor')(InvestorPortal);
const ProtectedDealManagement = withAuth('admin')(DealManagement);
const ProtectedDealDetail = withAuth('investor')(DealDetail);
const ProtectedDocuments = withAuth('staff')(Documents);
const ProtectedUserManagement = withAuth('admin')(UserManagement);
const ProtectedSettings = withAuth('staff')(Settings);
const ProtectedOnboarding = withAuth('investor')(Onboarding);
const ProtectedInvestorOnboarding = withAuth('investor', { skipOnboardingCheck: true })(InvestorOnboarding);
const ProtectedInvestorInvitations = withAuth('admin')(InvestorInvitations);
const ProtectedInvestorMessages = withAuth('investor')(InvestorMessages);
const ProtectedTeamConversations = withAuth('staff')(TeamConversations);
const ProtectedNDAManagement = withAuth('admin')(NDAManagement);
const ProtectedAccessRequests = withAuth('admin')(AccessRequests);
const ProtectedNDASettings = withAuth('admin')(NDASettings);
const ProtectedInvestorProfile = withAuth('investor')(InvestorProfile);
const ProtectedDiligenceTracker = withAuth('admin')(DiligenceTracker);
const ProtectedDataRoom = withAuth('staff')(DataRoom);
const ProtectedDealWorkspace = withAuth('staff')(DealWorkspace);
const ProtectedTrainingCenter = withAuth('staff')(TrainingCenter);
const ProtectedCreateDeal = withAuth('staff')(CreateDeal);
const ProtectedFinancingTracker = withAuth('staff')(FinancingTracker);
const ProtectedTasks = withAuth('staff')(Tasks);
const ProtectedFeedbackReview = withAuth('admin')(FeedbackReview);

/** Redirect legacy /deal/:id URLs to the canonical /deals/:id workspace */
const LegacyDealRedirect = () => {
  const { id } = useParams();
  return <Navigate to={`/deals/${id}`} replace />;
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      gcTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const AppContent = () => {
  useOnboardingCheck();
  
  return (
    <>
      <FeedbackWidget />
            <Suspense
            fallback={
              <div className="min-h-screen bg-[#1C2526] flex items-center justify-center">
                <div className="text-[#FAFAFA]">Loading…</div>
              </div>
            }
          >
            <Routes>
              <Route path="/" element={<Homepage />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/auth/accept" element={<AuthAccept />} />
              <Route path="/dashboard" element={<ProtectedDashboard />} />
              <Route path="/investor-portal" element={<ProtectedInvestorPortal />} />
              <Route path="/deals" element={<ProtectedDealManagement />} />
              <Route path="/deals/new" element={<ProtectedCreateDeal />} />
              <Route path="/deals/:dealId" element={<ProtectedDealWorkspace />} />
              {/* Legacy deal detail route — redirect to workspace */}
              {/* Legacy /deal/:id routes now redirect to correct /deals/:id workspace */}
              <Route path="/deal/:id" element={<LegacyDealRedirect />} />
              <Route path="/documents" element={<ProtectedDocuments />} />
              <Route path="/users" element={<ProtectedUserManagement />} />
              <Route path="/settings" element={<ProtectedSettings />} />
              <Route path="/onboarding" element={<ProtectedOnboarding />} />
              <Route path="/investor/onboarding" element={<ProtectedInvestorOnboarding />} />
              <Route path="/investor-invitations" element={<ProtectedInvestorInvitations />} />
              <Route path="/investor-registration" element={<InvestorRegistration />} />
              <Route path="/investor-portal/messages" element={<ProtectedInvestorMessages />} />
              <Route path="/investor-portal/messages/:conversationId" element={<ProtectedInvestorMessages />} />
              <Route path="/dashboard/conversations" element={<ProtectedTeamConversations />} />
              <Route path="/dashboard/conversations/:conversationId" element={<ProtectedTeamConversations />} />
              <Route path="/dashboard/ndas" element={<ProtectedNDAManagement />} />
              <Route path="/dashboard/access-requests" element={<ProtectedAccessRequests />} />
              <Route path="/dashboard/nda-settings" element={<ProtectedNDASettings />} />
              <Route path="/dashboard/diligence-tracker" element={<ProtectedDiligenceTracker />} />
              <Route path="/dashboard/diligence-tracker/:dealId" element={<ProtectedDiligenceTracker />} />
              <Route path="/data-room" element={<ProtectedDataRoom />} />
              <Route path="/tasks" element={<ProtectedTasks />} />
              <Route path="/training" element={<ProtectedTrainingCenter />} />
              <Route path="/financing" element={<ProtectedFinancingTracker />} />
              <Route path="/financing/:applicationId" element={<ProtectedFinancingTracker />} />
              <Route path="/investor-portal/profile" element={<ProtectedInvestorProfile />} />
              <Route path="/investor/profile" element={<Navigate to="/investor-portal/profile" replace />} />
              <Route path="/share/:token" element={<DealShareView />} />
              <Route path="/feedback-review" element={<ProtectedFeedbackReview />} />
              <Route path="/403" element={<Forbidden />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
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
            <AppContent />
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
