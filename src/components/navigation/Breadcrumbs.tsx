import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
}

// Route to label mapping
const routeLabels: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/investor-portal': 'Investor Portal',
  '/deals': 'Deals',
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

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items }) => {
  const location = useLocation();
  
  // Auto-generate breadcrumbs from current path if not provided
  const breadcrumbItems: BreadcrumbItem[] = items || (() => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const result: BreadcrumbItem[] = [];
    
    // Determine the home/root based on the route
    const isInvestorRoute = location.pathname.startsWith('/investor-portal');
    const rootPath = isInvestorRoute ? '/investor-portal' : '/dashboard';
    const rootLabel = isInvestorRoute ? 'Investor Portal' : 'Dashboard';
    
    // Always add root
    if (location.pathname !== rootPath) {
      result.push({ label: rootLabel, path: rootPath });
    }
    
    // Build path progressively and add segments
    let currentPath = '';
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      
      // Skip if this is the root we already added
      if (currentPath === rootPath && result.length > 0) return;
      
      const label = routeLabels[currentPath] || segment.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      
      // Last segment is current page (no link)
      if (index === pathSegments.length - 1) {
        result.push({ label });
      } else if (currentPath !== rootPath) {
        result.push({ label, path: currentPath });
      }
    });
    
    // If we're exactly at root, just show that
    if (result.length === 0) {
      result.push({ label: rootLabel });
    }
    
    return result;
  })();

  return (
    <nav aria-label="Breadcrumb" className="flex items-center space-x-2 text-sm mb-6">
      <Home className="w-4 h-4 text-[#D4AF37]" />
      {breadcrumbItems.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && (
            <ChevronRight className="w-4 h-4 text-[#F4E4BC]/40" />
          )}
          {item.path ? (
            <Link 
              to={item.path}
              className="text-[#F4E4BC]/60 hover:text-[#D4AF37] transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-[#D4AF37] font-medium">
              {item.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumbs;
