import React from 'react';
import { 
  TrendingUp, 
  Users, 
  AlertTriangle,
  Calendar,
  ChevronRight,
  Clock
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import {
  Area,
  AreaChart,
  XAxis,
  YAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from 'recharts';

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
  onBottleneckClick?: (category: string) => void;
  onViewAllDeadlines?: () => void;
}

const AnalyticsWidgets: React.FC<AnalyticsWidgetsProps> = ({
  completionTrend,
  teamStats,
  bottlenecks,
  deadlines,
  avgCompletionDays,
  onBottleneckClick,
  onViewAllDeadlines
}) => {
  // Transform completion trend data for Recharts
  const trendChartData = completionTrend.map((value, index) => ({
    day: index + 1,
    completion: value,
  }));

  // Calculate max for team performance bars
  const maxCompleted = Math.max(...teamStats.map(s => s.completed), 1);
  const totalCompleted = teamStats.reduce((sum, s) => sum + s.completed, 0);

  // Chart config for completion trends
  const chartConfig = {
    completion: {
      label: "Completion %",
      color: "hsl(217, 91%, 60%)",
    },
  };

  // Get severity badge for bottlenecks
  const getSeverityBadge = (pending: number) => {
    if (pending >= 8) {
      return <Badge variant="destructive" className="text-xs px-1.5 py-0">Critical</Badge>;
    } else if (pending >= 4) {
      return <Badge className="text-xs px-1.5 py-0 bg-amber-100 text-amber-700 hover:bg-amber-100">Warning</Badge>;
    }
    return <Badge className="text-xs px-1.5 py-0 bg-green-100 text-green-700 hover:bg-green-100">Normal</Badge>;
  };

  // Get deadline icon color
  const getDeadlineColor = (status: string) => {
    switch (status) {
      case 'overdue': return 'text-red-500 bg-red-50';
      case 'today': return 'text-orange-500 bg-orange-50';
      case 'week': return 'text-amber-500 bg-amber-50';
      default: return 'text-blue-500 bg-blue-50';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Completion Trends with Area Chart */}
      <Card className="bg-white border-gray-200 overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-500" />
            Completion Trends
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-2">
          <div className="flex items-center justify-between mb-2">
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {completionTrend[completionTrend.length - 1] || 0}%
              </div>
              <div className="text-xs text-gray-500 flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-green-500" />
                <span className="text-green-600 font-medium">+12%</span>
                <span>vs last week</span>
              </div>
            </div>
          </div>
          <div className="h-[80px] -mx-2">
            <ChartContainer config={chartConfig} className="h-full w-full">
              <AreaChart data={trendChartData} margin={{ top: 5, right: 5, bottom: 0, left: 5 }}>
                <defs>
                  <linearGradient id="completionGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" hide />
                <YAxis hide domain={[0, 100]} />
                <ChartTooltip
                  content={<ChartTooltipContent />}
                  cursor={{ stroke: 'hsl(217, 91%, 60%)', strokeWidth: 1, strokeDasharray: '4 4' }}
                />
                <Area
                  type="monotone"
                  dataKey="completion"
                  stroke="hsl(217, 91%, 60%)"
                  strokeWidth={2}
                  fill="url(#completionGradient)"
                  dot={false}
                  activeDot={{ r: 4, fill: 'hsl(217, 91%, 60%)', stroke: 'white', strokeWidth: 2 }}
                />
              </AreaChart>
            </ChartContainer>
          </div>
          <div className="text-xs text-gray-400 text-center mt-1">Last 30 days</div>
        </CardContent>
      </Card>

      {/* Team Performance with Bar Charts */}
      <Card className="bg-white border-gray-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
            <Users className="w-4 h-4 text-green-500" />
            Team Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {teamStats.slice(0, 3).map((member, index) => {
              const percentage = Math.round((member.completed / maxCompleted) * 100);
              const totalPercentage = totalCompleted > 0 
                ? Math.round((member.completed / totalCompleted) * 100) 
                : 0;
              
              return (
                <div key={member.name} className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Avatar className="w-6 h-6 ring-2 ring-white shadow-sm">
                      <AvatarFallback 
                        className={`text-xs font-medium ${
                          index === 0 ? 'bg-blue-100 text-blue-700' :
                          index === 1 ? 'bg-green-100 text-green-700' :
                          'bg-purple-100 text-purple-700'
                        }`}
                      >
                        {member.initials}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-gray-700 flex-1 truncate">{member.name}</span>
                    <span className="text-xs text-gray-500">{member.completed} items</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          index === 0 ? 'bg-gradient-to-r from-blue-400 to-blue-600' :
                          index === 1 ? 'bg-gradient-to-r from-green-400 to-green-600' :
                          'bg-gradient-to-r from-purple-400 to-purple-600'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-gray-600 w-8">{totalPercentage}%</span>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Avg completion
              </span>
              <span className="font-semibold text-gray-700">{avgCompletionDays} days</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bottlenecks with Severity Indicators */}
      <Card className="bg-white border-gray-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            Bottlenecks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {bottlenecks.map((item) => {
              const maxPending = Math.max(...bottlenecks.map(b => b.pending), 1);
              const barWidth = (item.pending / maxPending) * 100;
              
              return (
                <button
                  key={item.category}
                  onClick={() => onBottleneckClick?.(item.category)}
                  className="w-full group"
                >
                  <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className={`w-1.5 h-8 rounded-full ${
                      item.status === 'critical' ? 'bg-red-500' :
                      item.status === 'warning' ? 'bg-amber-500' : 'bg-green-500'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-700 truncate">{item.category}</span>
                        {getSeverityBadge(item.pending)}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-300 ${
                              item.status === 'critical' ? 'bg-red-400' :
                              item.status === 'warning' ? 'bg-amber-400' : 'bg-green-400'
                            }`}
                            style={{ width: `${barWidth}%` }}
                          />
                        </div>
                        <span className={`text-xs font-semibold min-w-[20px] text-right ${
                          item.status === 'critical' ? 'text-red-600' :
                          item.status === 'warning' ? 'text-amber-600' : 'text-green-600'
                        }`}>{item.pending}</span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Deadlines Timeline */}
      <Card className="bg-white border-gray-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-purple-500" />
            Deadlines
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {deadlines.map((item, index) => {
              const maxCount = Math.max(...deadlines.map(d => d.count), 1);
              const progressWidth = (item.count / maxCount) * 100;
              
              return (
                <div 
                  key={item.label} 
                  className="relative flex items-center gap-3 py-2"
                >
                  {/* Timeline connector */}
                  {index < deadlines.length - 1 && (
                    <div className="absolute left-[11px] top-[28px] w-0.5 h-[calc(100%-8px)] bg-gray-200" />
                  )}
                  
                  {/* Timeline dot */}
                  <div className={`relative z-10 w-6 h-6 rounded-full flex items-center justify-center ${getDeadlineColor(item.status)}`}>
                    <div className={`w-2 h-2 rounded-full ${
                      item.status === 'overdue' ? 'bg-red-500 animate-pulse' :
                      item.status === 'today' ? 'bg-orange-500' :
                      item.status === 'week' ? 'bg-amber-500' : 'bg-blue-500'
                    }`} />
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-sm font-medium ${
                        item.status === 'overdue' ? 'text-red-600' :
                        item.status === 'today' ? 'text-orange-600' : 'text-gray-700'
                      }`}>{item.label}</span>
                      <span className={`text-sm font-bold ${
                        item.status === 'overdue' ? 'text-red-600' :
                        item.status === 'today' ? 'text-orange-600' :
                        item.status === 'week' ? 'text-amber-600' : 'text-blue-600'
                      }`}>{item.count}</span>
                    </div>
                    <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-300 ${
                          item.status === 'overdue' ? 'bg-red-400' :
                          item.status === 'today' ? 'bg-orange-400' :
                          item.status === 'week' ? 'bg-amber-400' : 'bg-blue-400'
                        }`}
                        style={{ width: `${progressWidth}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full mt-3 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            onClick={onViewAllDeadlines}
          >
            View All Deadlines
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsWidgets;
