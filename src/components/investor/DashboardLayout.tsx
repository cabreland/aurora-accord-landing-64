import React from 'react';
import { useLocation } from 'react-router-dom';
import AdminDashboardLayout from '@/layouts/AdminDashboardLayout';
import InvestorPortalLayout from '@/layouts/InvestorPortalLayout';
import { BreadcrumbItem } from '@/components/navigation/Breadcrumbs';

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  breadcrumbs?: BreadcrumbItem[];
}

/**
 * DashboardLayout - Route-based layout selector
 * 
 * This component determines which layout to use based on the current route:
 * - /investor-portal/* routes → InvestorPortalLayout
 * - All other routes → AdminDashboardLayout
 * 
 * This ensures navigation context is NEVER mixed between admin and investor views.
 */
const DashboardLayout = ({ children, activeTab, breadcrumbs }: DashboardLayoutProps) => {
  const location = useLocation();
  
  // Determine layout based on route - NOT user role
  // This prevents context switching when navigating
  const isInvestorRoute = location.pathname.startsWith('/investor-portal') || 
                          location.pathname.startsWith('/investor/');
  
  if (isInvestorRoute) {
    return (
      <InvestorPortalLayout activeTab={activeTab} breadcrumbs={breadcrumbs}>
        {children}
      </InvestorPortalLayout>
    );
  }
  
  // Default to admin layout for all admin routes
  return (
    <AdminDashboardLayout activeTab={activeTab} breadcrumbs={breadcrumbs}>
      {children}
    </AdminDashboardLayout>
  );
};

export default DashboardLayout;