import React from 'react';
import { 
  TrendingUp, 
  Users, 
  AlertTriangle,
  Calendar,
  BarChart3
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface TeamMemberStats {
  name: string;
  initials: string;
  completed: number;
  assigned: number;
}

interface BottleneckItem {
  category: string;
  pending: number;
  status: 'critical' | 'warning' | 'good';
}

interface DeadlineItem {
  label: string;
  count: number;
  status: 'overdue' | 'today' | 'week' | 'next';
}

interface AnalyticsWidgetsProps {
  completionTrend: number[];
  teamStats: TeamMemberStats[];
  bottlenecks: BottleneckItem[];
  deadlines: DeadlineItem[];
  avgCompletionDays: number;
}

const AnalyticsWidgets: React.FC<AnalyticsWidgetsProps> = ({
  completionTrend,
  teamStats,
  bottlenecks,
  deadlines,
  avgCompletionDays
}) => {
  // Simple sparkline renderer
  const renderSparkline = (data: number[]) => {
    if (data.length === 0) return null;
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    const width = 120;
    const height = 40;
    const points = data.map((v, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((v - min) / range) * height;
      return `${x},${y}`;
    }).join(' ');

    return (
      <svg width={width} height={height} className="overflow-visible">
        <polyline
          points={points}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-blue-500"
        />
      </svg>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Completion Trends */}
      <Card className="bg-white border-gray-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-500" />
            Completion Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {completionTrend[completionTrend.length - 1] || 0}%
              </div>
              <div className="text-xs text-gray-500">Last 30 days</div>
            </div>
            <div className="opacity-80">
              {renderSparkline(completionTrend)}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Team Performance */}
      <Card className="bg-white border-gray-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
            <Users className="w-4 h-4 text-green-500" />
            Team Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {teamStats.slice(0, 3).map((member) => (
              <div key={member.name} className="flex items-center gap-2">
                <Avatar className="w-6 h-6">
                  <AvatarFallback className="text-xs bg-blue-100 text-blue-700">
                    {member.initials}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm text-gray-700 flex-1 truncate">{member.name}</span>
                <span className="text-sm font-medium text-gray-900">{member.completed}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-2 border-t border-gray-100">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Avg completion</span>
              <span className="font-medium text-gray-700">{avgCompletionDays} days</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bottlenecks */}
      <Card className="bg-white border-gray-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            Bottlenecks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {bottlenecks.map((item) => (
              <div key={item.category} className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  item.status === 'critical' ? 'bg-red-500' :
                  item.status === 'warning' ? 'bg-amber-500' : 'bg-green-500'
                }`} />
                <span className="text-sm text-gray-700 flex-1">{item.category}</span>
                <span className={`text-sm font-medium ${
                  item.status === 'critical' ? 'text-red-600' :
                  item.status === 'warning' ? 'text-amber-600' : 'text-green-600'
                }`}>{item.pending}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Deadlines */}
      <Card className="bg-white border-gray-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-purple-500" />
            Deadlines
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {deadlines.map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <span className={`text-sm ${
                  item.status === 'overdue' ? 'text-red-600 font-medium' :
                  item.status === 'today' ? 'text-amber-600 font-medium' : 'text-gray-700'
                }`}>{item.label}</span>
                <span className={`text-sm font-medium px-2 py-0.5 rounded ${
                  item.status === 'overdue' ? 'bg-red-100 text-red-700' :
                  item.status === 'today' ? 'bg-amber-100 text-amber-700' :
                  'bg-gray-100 text-gray-700'
                }`}>{item.count}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsWidgets;
