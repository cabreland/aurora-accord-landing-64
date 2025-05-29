
import React from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  Target, 
  Users,
  Clock,
  CheckCircle
} from 'lucide-react';

interface Deal {
  revenue: string;
  stage: string;
  priority: string;
}

interface DealMetricsProps {
  deals: Deal[];
}

const DealMetrics = ({ deals }: DealMetricsProps) => {
  const totalRevenue = deals.reduce((sum, deal) => {
    const revenue = parseFloat(deal.revenue.replace('$', '').replace('M', ''));
    return sum + revenue;
  }, 0);

  const highPriorityDeals = deals.filter(deal => deal.priority === 'High').length;
  const ndaSignedDeals = deals.filter(deal => deal.stage === 'NDA Signed').length;
  const dueDiligenceDeals = deals.filter(deal => deal.stage === 'Due Diligence').length;

  const metrics = [
    {
      title: "Total Deal Value",
      value: `$${totalRevenue.toFixed(1)}M`,
      subtitle: "Combined revenue",
      icon: DollarSign,
      color: "text-[#22C55E]",
      bgColor: "bg-[#22C55E]/10",
      borderColor: "border-[#22C55E]/30"
    },
    {
      title: "Active Deals",
      value: deals.length.toString(),
      subtitle: "In pipeline",
      icon: Target,
      color: "text-[#D4AF37]",
      bgColor: "bg-[#D4AF37]/10",
      borderColor: "border-[#D4AF37]/30"
    },
    {
      title: "High Priority",
      value: highPriorityDeals.toString(),
      subtitle: "Urgent deals",
      icon: TrendingUp,
      color: "text-[#F28C38]",
      bgColor: "bg-[#F28C38]/10",
      borderColor: "border-[#F28C38]/30"
    },
    {
      title: "NDAs Signed",
      value: ndaSignedDeals.toString(),
      subtitle: "Ready for review",
      icon: CheckCircle,
      color: "text-[#06B6D4]",
      bgColor: "bg-[#06B6D4]/10",
      borderColor: "border-[#06B6D4]/30"
    },
    {
      title: "Due Diligence",
      value: dueDiligenceDeals.toString(),
      subtitle: "Advanced stage",
      icon: Users,
      color: "text-[#8B5CF6]",
      bgColor: "bg-[#8B5CF6]/10",
      borderColor: "border-[#8B5CF6]/30"
    },
    {
      title: "Avg. Timeline",
      value: "14 days",
      subtitle: "To NDA signing",
      icon: Clock,
      color: "text-[#F4E4BC]",
      bgColor: "bg-[#F4E4BC]/10",
      borderColor: "border-[#F4E4BC]/30"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6 gap-6">
      {metrics.map((metric, index) => {
        const Icon = metric.icon;
        
        return (
          <div
            key={index}
            className={`${metric.bgColor} backdrop-blur-sm rounded-2xl p-6 border ${metric.borderColor} hover:shadow-xl transition-all duration-300 group cursor-pointer`}
          >
            <div className="flex items-center justify-between mb-4">
              <Icon className={`w-8 h-8 ${metric.color} group-hover:scale-110 transition-transform duration-300`} />
              <div className={`w-3 h-3 ${metric.bgColor.replace('/10', '')} rounded-full opacity-60 group-hover:opacity-100 transition-opacity`}></div>
            </div>
            
            <div className="space-y-1">
              <div className={`text-3xl font-bold ${metric.color} group-hover:text-[#FAFAFA] transition-colors`}>
                {metric.value}
              </div>
              <div className="text-[#FAFAFA] font-medium text-sm">
                {metric.title}
              </div>
              <div className="text-[#F4E4BC]/60 text-xs">
                {metric.subtitle}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DealMetrics;
