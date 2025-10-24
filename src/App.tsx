
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

import Index from "./pages/Index";
import Demo from "./pages/Demo";
import InvestorPortal from "./pages/InvestorPortal";

// Lazy-load remaining pages to reduce initial bundle size
const IndexV2 = lazy(() => import("./pages/IndexV2"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Auth = lazy(() => import("./pages/Auth"));
const AuthAccept = lazy(() => import("./pages/AuthAccept"));
const NotFound = lazy(() => import("./pages/NotFound"));
const UserManagement = lazy(() => import("./pages/UserManagement"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
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
const Messages = lazy(() => import("./pages/Messages"));
const InvestorMessages = lazy(() => import("./pages/InvestorMessages"));
const TeamConversations = lazy(() => import("./pages/TeamConversations"));
const BrokerInbox = lazy(() => import("./pages/BrokerInbox"));

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
const ProtectedInvestorInvitations = withAuth('admin')(InvestorInvitations);
const ProtectedAnalytics = withAuth('investor')(Analytics);
const ProtectedCompliance = withAuth('investor')(Compliance);
const ProtectedMessages = withAuth('investor')(Messages);
const ProtectedInvestorMessages = withAuth('investor')(InvestorMessages);
const ProtectedTeamConversations = withAuth('staff')(TeamConversations);
const ProtectedBrokerInbox = withAuth('staff')(BrokerInbox);

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

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ChatWidgetProvider>
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
              <Route path="/investor-invitations" element={<ProtectedInvestorInvitations />} />
              <Route path="/investor-registration" element={<InvestorRegistration />} />
              <Route path="/test-registration" element={<TestRegistration />} />
              <Route path="/analytics" element={<ProtectedAnalytics />} />
              <Route path="/compliance" element={<ProtectedCompliance />} />
              <Route path="/messages" element={<ProtectedMessages />} />
              <Route path="/investor-portal/messages" element={<ProtectedInvestorMessages />} />
              <Route path="/investor-portal/messages/:conversationId" element={<ProtectedInvestorMessages />} />
              <Route path="/dashboard/conversations" element={<ProtectedTeamConversations />} />
              <Route path="/dashboard/conversations/:conversationId" element={<ProtectedTeamConversations />} />
              <Route path="/dashboard/chat-inbox" element={<ProtectedBrokerInbox />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
          </ChatWidgetProvider>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
