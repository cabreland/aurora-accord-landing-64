import React from 'react';
import { FileText, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const NDAWidget: React.FC = () => {
  const ndaStats = [
    { label: 'Pending Review', count: 4, color: 'bg-yellow-500/20 text-yellow-400' },
    { label: 'Approved', count: 12, color: 'bg-green-500/20 text-green-400' },
    { label: 'Expired', count: 2, color: 'bg-red-500/20 text-red-400' }
  ];

  const recentNDAs = [
    { company: 'TechCorp Inc.', status: 'pending', date: '2 hours ago' },
    { company: 'Innovation Labs', status: 'approved', date: '1 day ago' },
    { company: 'Growth Ventures', status: 'pending', date: '3 days ago' }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-3 h-3" />;
      case 'approved': return <CheckCircle className="w-3 h-3" />;
      case 'expired': return <AlertCircle className="w-3 h-3" />;
      default: return <FileText className="w-3 h-3" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'approved': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'expired': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <Card className="bg-gradient-to-b from-[#2A2F3A] to-[#1A1F2E] border-[#D4AF37]/30 h-full">
      <CardHeader>
        <CardTitle className="text-[#FAFAFA] flex items-center gap-3">
          <FileText className="w-5 h-5 text-[#D4AF37]" />
          NDA Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          {ndaStats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl font-bold text-[#FAFAFA] mb-1">
                {stat.count}
              </div>
              <Badge variant="outline" className={`text-xs ${stat.color} border-current`}>
                {stat.label}
              </Badge>
            </div>
          ))}
        </div>

        {/* Recent NDAs */}
        <div className="space-y-2">
          <div className="text-sm font-medium text-[#F4E4BC]">Recent Activity</div>
          {recentNDAs.map((nda, index) => (
            <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-[#1A1F2E]/50">
              <div className="flex items-center gap-2">
                {getStatusIcon(nda.status)}
                <span className="text-sm text-[#F4E4BC] truncate">{nda.company}</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge 
                  variant="outline" 
                  className={`text-xs ${getStatusColor(nda.status)}`}
                >
                  {nda.status}
                </Badge>
                <span className="text-xs text-[#F4E4BC]/60">{nda.date}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};