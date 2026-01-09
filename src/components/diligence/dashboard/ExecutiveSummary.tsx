import React from 'react';
import { 
  BarChart3, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  TrendingUp,
  Target
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface ExecutiveSummaryProps {
  stats: {
    activeTrackers: number;
    openRequests: number;
    completedRequests: number;
    overdueRequests: number;
    totalRequests: number;
    completionRate: number;
    weeklyProgress: number;
  };
}

const ExecutiveSummary: React.FC<ExecutiveSummaryProps> = ({ stats }) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Diligence Overview</h2>
          <p className="text-sm text-gray-500">Executive summary across all deals</p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-500">This Week:</span>
          <span className={`font-semibold ${stats.weeklyProgress >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {stats.weeklyProgress >= 0 ? '+' : ''}{stats.weeklyProgress}%
          </span>
          <TrendingUp className={`w-4 h-4 ${stats.weeklyProgress >= 0 ? 'text-green-600' : 'text-red-600 rotate-180'}`} />
        </div>
      </div>
      
      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BarChart3 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.activeTrackers}</div>
              <div className="text-xs text-gray-500">Active Trackers</div>
            </div>
          </div>
        </div>
        
        <div className="bg-amber-50 rounded-lg p-4 border border-amber-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.openRequests}</div>
              <div className="text-xs text-gray-500">Open Requests</div>
            </div>
          </div>
        </div>
        
        <div className="bg-green-50 rounded-lg p-4 border border-green-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.completedRequests}</div>
              <div className="text-xs text-gray-500">Completed</div>
            </div>
          </div>
        </div>
        
        <div className="bg-red-50 rounded-lg p-4 border border-red-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.overdueRequests}</div>
              <div className="text-xs text-gray-500">Overdue</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Overall Progress */}
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-gray-700">Overall Completion</span>
          </div>
          <span className="text-sm font-bold text-blue-600">{stats.completionRate}%</span>
        </div>
        <Progress value={stats.completionRate} className="h-2 bg-gray-200" />
        <p className="text-xs text-gray-500 mt-2">
          {stats.completedRequests} of {stats.totalRequests} requests completed across all trackers
        </p>
      </div>
    </div>
  );
};

export default ExecutiveSummary;
