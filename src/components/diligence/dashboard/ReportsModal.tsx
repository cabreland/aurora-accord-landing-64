import React from 'react';
import { BarChart3, TrendingUp, Users, Clock, Target, Award } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
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
  Bar,
  BarChart,
  ResponsiveContainer,
} from 'recharts';

interface TeamMemberStat {
  name: string;
  initials: string;
  completed: number;
  assigned: number;
}

interface ReportsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  completionTrend: number[];
  teamStats: TeamMemberStat[];
  avgCompletionDays: number;
  completionRate: number;
  totalCompleted: number;
  totalOpen: number;
}

const ReportsModal: React.FC<ReportsModalProps> = ({ 
  open, 
  onOpenChange,
  completionTrend,
  teamStats,
  avgCompletionDays,
  completionRate,
  totalCompleted,
  totalOpen
}) => {
  // Transform trend data for chart
  const trendChartData = completionTrend.map((value, index) => ({
    day: `Day ${index + 1}`,
    completion: value,
  }));

  // Calculate week-over-week change
  const currentWeek = completionTrend[completionTrend.length - 1] || 0;
  const lastWeek = completionTrend[Math.max(0, completionTrend.length - 8)] || 0;
  const weekChange = currentWeek - lastWeek;

  // Chart config
  const chartConfig = {
    completion: {
      label: "Completion %",
      color: "hsl(217, 91%, 60%)",
    },
  };

  // Team performance chart data
  const teamChartData = teamStats.map(member => ({
    name: member.initials,
    completed: member.completed,
    pending: member.assigned - member.completed,
  }));

  const totalTeamCompleted = teamStats.reduce((sum, m) => sum + m.completed, 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            Performance & Analytics
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[75vh]">
          <div className="space-y-6 p-1">
            {/* Overview Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Target className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900">{completionRate}%</div>
                      <div className="text-xs text-gray-600">Completion Rate</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-green-100/50 border-green-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Award className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900">{totalCompleted}</div>
                      <div className="text-xs text-gray-600">Completed</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-amber-50 to-amber-100/50 border-amber-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-100 rounded-lg">
                      <Clock className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900">{avgCompletionDays}d</div>
                      <div className="text-xs text-gray-600">Avg Resolution</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-purple-100/50 border-purple-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Users className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900">{teamStats.length}</div>
                      <div className="text-xs text-gray-600">Team Members</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Completion Trends Chart */}
            <Card className="border-gray-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-500" />
                  Completion Trends (Last 30 Days)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-4">
                  <div>
                    <div className="text-3xl font-bold text-gray-900">{currentWeek}%</div>
                    <div className="text-xs text-gray-500 flex items-center gap-1">
                      {weekChange >= 0 ? (
                        <>
                          <TrendingUp className="w-3 h-3 text-green-500" />
                          <span className="text-green-600 font-medium">+{weekChange}%</span>
                        </>
                      ) : (
                        <>
                          <TrendingUp className="w-3 h-3 text-red-500 rotate-180" />
                          <span className="text-red-600 font-medium">{weekChange}%</span>
                        </>
                      )}
                      <span>vs last week</span>
                    </div>
                  </div>
                </div>
                <div className="h-[200px]">
                  <ChartContainer config={chartConfig} className="h-full w-full">
                    <AreaChart data={trendChartData} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
                      <defs>
                        <linearGradient id="completionGradientModal" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.3} />
                          <stop offset="100%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.05} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="day" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                      <YAxis hide domain={[0, 100]} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Area
                        type="monotone"
                        dataKey="completion"
                        stroke="hsl(217, 91%, 60%)"
                        strokeWidth={2}
                        fill="url(#completionGradientModal)"
                        dot={false}
                        activeDot={{ r: 5, fill: 'hsl(217, 91%, 60%)', stroke: 'white', strokeWidth: 2 }}
                      />
                    </AreaChart>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>

            {/* Team Performance */}
            <Card className="border-gray-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Users className="w-4 h-4 text-green-500" />
                  Team Performance (Last 30 Days)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {teamStats.map((member, index) => {
                    const completionRate = member.assigned > 0 
                      ? Math.round((member.completed / member.assigned) * 100) 
                      : 0;
                    const contribution = totalTeamCompleted > 0
                      ? Math.round((member.completed / totalTeamCompleted) * 100)
                      : 0;
                    
                    return (
                      <div key={member.name} className="flex items-center gap-4">
                        <Avatar className="w-10 h-10 ring-2 ring-white shadow">
                          <AvatarFallback 
                            className={`font-medium ${
                              index === 0 ? 'bg-blue-100 text-blue-700' :
                              index === 1 ? 'bg-green-100 text-green-700' :
                              index === 2 ? 'bg-purple-100 text-purple-700' :
                              'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {member.initials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-gray-900">{member.name}</span>
                            <div className="flex items-center gap-3 text-sm">
                              <span className="text-gray-500">
                                {member.completed}/{member.assigned} completed
                              </span>
                              <span className="font-semibold text-gray-700">{completionRate}%</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Progress 
                              value={completionRate} 
                              className="h-2 flex-1"
                            />
                            <span className="text-xs text-gray-500 w-16">
                              {contribution}% of total
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Performance Insights */}
            <Card className="bg-blue-50/50 border-blue-200">
              <CardContent className="p-4">
                <h4 className="font-medium text-blue-900 mb-2">📊 Performance Insights</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Overall completion rate is {completionRate >= 80 ? 'excellent' : completionRate >= 60 ? 'good' : 'needs improvement'} at {completionRate}%</li>
                  <li>• Average resolution time of {avgCompletionDays} days is {avgCompletionDays <= 3 ? 'ahead of target' : avgCompletionDays <= 5 ? 'on target' : 'above target'}</li>
                  <li>• {totalOpen} requests currently pending completion</li>
                  {weekChange >= 0 && <li>• Week-over-week improvement of {weekChange}% shows positive momentum</li>}
                </ul>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default ReportsModal;
