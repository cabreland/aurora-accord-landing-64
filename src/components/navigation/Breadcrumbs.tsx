import React from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
  dealName?: string;
  currentTab?: string;
}

// Route to label mapping
const routeLabels: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/investor-portal': 'Dashboard',
  '/deals': 'Active Deals',
  '/documents': 'Documents',
  '/analytics': 'Analytics',
  '/compliance': 'Compliance',
  '/settings': 'Settings',
  '/users': 'User Management',
  '/activity': 'Activity',
  '/investor-invitations': 'Investor Relations',
  '/dashboard/access-requests': 'Access Requests',
  '/dashboard/ndas': 'Signed NDAs',
  '/dashboard/nda-settings': 'NDA Settings',
  '/investor-portal/profile': 'Profile',
  '/investor-portal/watchlist': 'Watchlist',
  '/investor-portal/requests': 'My Requests',
  '/investor-portal/ndas': 'My NDAs',
  '/investor-portal/messages': 'Messages',
  '/dashboard/conversations': 'Conversations',
};

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, dealName, currentTab }) => {
  const location = useLocation();
  const params = useParams();
  
  // Build breadcrumbs from provided items or auto-generate
  const breadcrumbItems: BreadcrumbItem[] = items || (() => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const result: BreadcrumbItem[] = [];
    
    // Determine the home/root based on the route
    const isInvestorRoute = location.pathname.startsWith('/investor-portal');
    const rootPath = isInvestorRoute ? '/investor-portal' : '/dashboard';
    
    // Always start with Dashboard
    result.push({ label: 'Dashboard', path: rootPath });
    
    // Handle specific routes
    if (pathSegments[0] === 'deals') {
      // Deals listing or detail
      if (pathSegments.length === 1) {
        // Just /deals - current page
        result.push({ label: 'Active Deals' });
      } else if (pathSegments.length >= 2) {
        // /deals/:id - deal detail
        result.push({ label: 'Active Deals', path: '/deals' });
        result.push({ label: dealName || 'Deal Details' });
        
        // Add tab if provided
        if (currentTab && currentTab !== 'overview') {
          result[result.length - 1].path = `/deals/${pathSegments[1]}`;
          const tabLabels: Record<string, string> = {
            'dataroom': 'Data Room',
            'financials': 'Financials',
            'documents': 'Documents',
          };
          result.push({ label: tabLabels[currentTab] || currentTab });
        }
      }
    } else if (pathSegments[0] === 'documents') {
      result.push({ label: 'Documents' });
    } else if (pathSegments[0] === 'analytics') {
      result.push({ label: 'Analytics' });
    } else if (pathSegments[0] === 'settings') {
      result.push({ label: 'Settings' });
    } else if (pathSegments[0] === 'investor-portal') {
      if (pathSegments.length === 1) {
        // Just /investor-portal - remove dashboard since we ARE the dashboard
        return [{ label: 'Dashboard' }];
      }
      // Handle sub-routes
      const subRoute = `/${pathSegments.join('/')}`;
      const label = routeLabels[subRoute] || pathSegments[pathSegments.length - 1].replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      result.push({ label });
    } else {
      // Default: use route labels or format segment
      const fullPath = `/${pathSegments.join('/')}`;
      const label = routeLabels[fullPath] || pathSegments[pathSegments.length - 1].replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      if (fullPath !== rootPath) {
        result.push({ label });
      }
    }
    
    return result;
  })();

  // Don't show if only one item (just Dashboard)
  if (breadcrumbItems.length <= 1) {
    return null;
  }

  return (
    <nav aria-label="Breadcrumb" className="flex items-center space-x-2 text-sm">
      <Home className="w-4 h-4 text-[#D4AF37]" />
      {breadcrumbItems.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && (
            <span className="text-gray-600 mx-1">&gt;</span>
          )}
          {item.path ? (
            <Link 
              to={item.path}
              className="text-gray-400 hover:text-[#D4AF37] transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-white font-medium">
              {item.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumbs;
