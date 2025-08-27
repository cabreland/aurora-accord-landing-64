import React from 'react';
import { withAuth } from '@/utils/withAuth';
import DashboardMain from '@/components/dashboard/DashboardMain';

const DashboardPage = () => {
  return <DashboardMain />;
};

export default withAuth('investor')(DashboardPage);