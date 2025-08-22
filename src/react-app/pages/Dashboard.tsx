import { useEffect } from 'react';
import { Users, UserCheck, Wallet, Calendar, TrendingUp, Plus, FileText } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useLanguage } from '@/react-app/contexts/LanguageContext';
import { useApi, api } from '@/react-app/hooks/useApi';
import { DashboardStatsType } from '@/shared/types';
import StatsCard from '@/react-app/components/StatsCard';

export default function Dashboard() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { data: stats, loading, execute } = useApi<DashboardStatsType>();

  useEffect(() => {
    execute(() => api.get<DashboardStatsType>('/api/dashboard'));
  }, [execute]);

  if (loading) {
    return (
      <div className="p-4 pb-20">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded-lg w-48 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-2xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="p-4 pb-20">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {t('dashboard.title')}
        </h1>
        <p className="text-gray-600 text-sm">
          {today}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <StatsCard
          title={t('dashboard.totalWorkers')}
          value={stats?.totalWorkers || 0}
          icon={Users}
          color="blue"
        />
        
        <StatsCard
          title={t('dashboard.todayAttendance')}
          value={stats?.todayAttendance || 0}
          icon={UserCheck}
          color="green"
        />
        
        <StatsCard
          title={t('dashboard.pendingPayments')}
          value={stats?.pendingPayments || 0}
          icon={Wallet}
          color="red"
        />
        
        <div className="md:col-span-2 lg:col-span-1">
          <StatsCard
            title={t('dashboard.thisMonthWages')}
            value={stats?.thisMonthWages || 0}
            icon={TrendingUp}
            color="orange"
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button 
            onClick={() => navigate('/attendance')}
            className="flex flex-col items-center p-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl shadow-lg hover:shadow-xl transition-shadow touch-target"
          >
            <Calendar className="w-6 h-6 mb-2" />
            <span className="text-xs font-medium text-center">Mark Attendance</span>
          </button>
          
          <button 
            onClick={() => navigate('/workers')}
            className="flex flex-col items-center p-4 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl shadow-lg hover:shadow-xl transition-shadow touch-target"
          >
            <Plus className="w-6 h-6 mb-2" />
            <span className="text-xs font-medium text-center">Add Worker</span>
          </button>
          
          <button 
            onClick={() => navigate('/payments')}
            className="flex flex-col items-center p-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl shadow-lg hover:shadow-xl transition-shadow touch-target"
          >
            <Wallet className="w-6 h-6 mb-2" />
            <span className="text-xs font-medium text-center">Add Payment</span>
          </button>
          
          <button 
            onClick={() => navigate('/reports')}
            className="flex flex-col items-center p-4 bg-gradient-to-r from-purple-500 to-violet-500 text-white rounded-xl shadow-lg hover:shadow-xl transition-shadow touch-target"
          >
            <FileText className="w-6 h-6 mb-2" />
            <span className="text-xs font-medium text-center">View Reports</span>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-6 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Recent Activity
        </h2>
        <div className="space-y-3">
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-3 flex-shrink-0"></div>
            <span>Today's attendance marked for {stats?.todayAttendance || 0} workers</span>
          </div>
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <div className="w-2 h-2 bg-orange-500 rounded-full mr-3 flex-shrink-0"></div>
            <span>{stats?.pendingPayments || 0} payments pending approval</span>
          </div>
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 flex-shrink-0"></div>
            <span>{stats?.totalWorkers || 0} active workers on site</span>
          </div>
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <div className="w-2 h-2 bg-purple-500 rounded-full mr-3 flex-shrink-0"></div>
            <span>Total wages this month: ₹{stats?.thisMonthWages || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
