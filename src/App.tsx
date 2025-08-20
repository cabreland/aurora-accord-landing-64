
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
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

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-[#1C2526] flex items-center justify-center">
        <div className="text-[#FAFAFA]">Loading...</div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  return <>{children}</>;
};

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
              <Route 
                path="/investor-portal" 
                element={
                  <ProtectedRoute>
                    <InvestorDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/deals" 
                element={
                  <ProtectedRoute>
                    <DealManagement />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/deal/:id" 
                element={
                  <ProtectedRoute>
                    <DealDetail />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/documents" 
                element={
                  <ProtectedRoute>
                    <Documents />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/users" 
                element={
                  <ProtectedRoute>
                    <UserManagement />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/settings" 
                element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/activity" 
                element={
                  <ProtectedRoute>
                    <Activity />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/onboarding" 
                element={
                  <ProtectedRoute>
                    <Onboarding />
                  </ProtectedRoute>
                } 
              />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

