
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { withAuth } from "@/utils/withAuth";
import React, { Suspense, lazy } from "react";

// Lazy-load pages to reduce initial bundle size
const Index = lazy(() => import("./pages/Index"));
const InvestorDashboard = lazy(() => import("./pages/InvestorDashboard"));
const Auth = lazy(() => import("./pages/Auth"));
const Demo = lazy(() => import("./pages/Demo"));
const NotFound = lazy(() => import("./pages/NotFound"));
const UserManagement = lazy(() => import("./pages/UserManagement"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const DealManagement = lazy(() => import("./pages/DealManagement"));
const DealDetail = lazy(() => import("./pages/DealDetail"));
const Documents = lazy(() => import("./pages/Documents"));
const Settings = lazy(() => import("./pages/Settings"));
const Activity = lazy(() => import("./pages/Activity"));

// Wrap protected components with authentication
const ProtectedInvestorDashboard = withAuth('investor')(InvestorDashboard);
const ProtectedDealManagement = withAuth('investor')(DealManagement);
const ProtectedDealDetail = withAuth('investor')(DealDetail);
const ProtectedDocuments = withAuth('admin')(Documents);
const ProtectedUserManagement = withAuth('admin')(UserManagement);
const ProtectedSettings = withAuth('admin')(Settings);
const ProtectedActivity = withAuth('admin')(Activity);
const ProtectedOnboarding = withAuth('investor')(Onboarding);

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
          <Suspense
            fallback={
              <div className="min-h-screen bg-[#1C2526] flex items-center justify-center">
                <div className="text-[#FAFAFA]">Loading…</div>
              </div>
            }
          >
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/demo" element={<Demo />} />
              <Route path="/investor-portal" element={<ProtectedInvestorDashboard />} />
              <Route path="/deals" element={<ProtectedDealManagement />} />
              <Route path="/deal/:id" element={<ProtectedDealDetail />} />
              <Route path="/documents" element={<ProtectedDocuments />} />
              <Route path="/users" element={<ProtectedUserManagement />} />
              <Route path="/settings" element={<ProtectedSettings />} />
              <Route path="/activity" element={<ProtectedActivity />} />
              <Route path="/onboarding" element={<ProtectedOnboarding />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
