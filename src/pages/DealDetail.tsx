import React from 'react';
import { useParams } from 'react-router-dom';
import DealDetailPage from '@/components/investor/DealDetailPage';

const DealDetail = () => {
  const { id } = useParams<{ id: string }>();
  
  return <DealDetailPage dealId={id} />;
};

export default DealDetail;