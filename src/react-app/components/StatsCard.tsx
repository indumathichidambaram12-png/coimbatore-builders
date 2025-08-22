import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: 'orange' | 'blue' | 'green' | 'purple' | 'red';
}

const colorClasses = {
  orange: {
    bg: 'bg-gradient-to-r from-orange-500 to-amber-500',
    text: 'text-orange-600',
    bgLight: 'bg-orange-50',
  },
  blue: {
    bg: 'bg-gradient-to-r from-blue-500 to-indigo-500',
    text: 'text-blue-600',
    bgLight: 'bg-blue-50',
  },
  green: {
    bg: 'bg-gradient-to-r from-green-500 to-emerald-500',
    text: 'text-green-600',
    bgLight: 'bg-green-50',
  },
  purple: {
    bg: 'bg-gradient-to-r from-purple-500 to-pink-500',
    text: 'text-purple-600',
    bgLight: 'bg-purple-50',
  },
  red: {
    bg: 'bg-gradient-to-r from-red-500 to-pink-500',
    text: 'text-red-600',
    bgLight: 'bg-red-50',
  },
};

export default function StatsCard({ title, value, icon: Icon, color }: StatsCardProps) {
  const colors = colorClasses[color];
  
  return (
    <div className={`${colors.bgLight} rounded-2xl p-4 border border-white/20 shadow-sm`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className={`text-2xl font-bold ${colors.text}`}>
            {typeof value === 'number' && title.toLowerCase().includes('wage') ? '₹' : ''}
            {value}
          </p>
        </div>
        <div className={`${colors.bg} p-3 rounded-xl shadow-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
}
