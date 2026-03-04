import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Flame, 
  Target, 
  Calendar,
  ChevronRight,
  TrendingUp,
  Award,
  BookOpen
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { formatDuration, cn } from '../lib/utils';
import { motion } from 'motion/react';

interface DashboardProps {
  stats: any[];
  sessions: any[];
  userName: string;
}

export default function Dashboard({ stats, sessions, userName }: DashboardProps) {
  const totalSeconds = sessions.reduce((acc, s) => acc + s.duration_seconds, 0);
  const todaySeconds = stats.find(s => s.date === new Date().toISOString().split('T')[0])?.total_seconds || 0;
  
  const streak = stats.length > 0 ? stats.length : 0; // Simplified streak

  const chartData = stats.map(s => ({
    date: s.date.split('-').slice(1).join('/'),
    hours: Number((s.total_seconds / 3600).toFixed(1))
  })).reverse();

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-1">
        <h2 className="text-3xl font-display font-bold tracking-tight">Welcome back, {userName}</h2>
        <p className="text-gray-500">Here's your study progress for today.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={Clock} 
          label="Total Study Time" 
          value={formatDuration(totalSeconds)} 
          subValue="All time"
          color="indigo"
        />
        <StatCard 
          icon={Flame} 
          label="Current Streak" 
          value={`${streak} Days`} 
          subValue="Keep it up!"
          color="orange"
        />
        <StatCard 
          icon={Target} 
          label="Today's Goal" 
          value={formatDuration(todaySeconds)} 
          subValue="Goal: 4h 00m"
          color="emerald"
        />
        <StatCard 
          icon={Award} 
          label="Badges Earned" 
          value={totalSeconds > 36000 ? "Gold" : totalSeconds > 18000 ? "Silver" : "Bronze"} 
          subValue="Master Student"
          color="amber"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass-card rounded-3xl p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <TrendingUp size={20} className="text-indigo-600" />
              Study Activity
            </h3>
            <select className="bg-gray-50 border-none text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-lg">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="hours" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorHours)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card rounded-3xl p-8">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <Calendar size={20} className="text-indigo-600" />
            Recent Sessions
          </h3>
          <div className="space-y-4">
            {sessions.slice(0, 5).map((session, i) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-2xl hover:bg-gray-50 transition-colors group cursor-pointer">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <BookOpen size={18} />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold">{session.subject_name}</h4>
                  <p className="text-xs text-gray-400">{new Date(session.created_at).toLocaleDateString()}</p>
                </div>
                <span className="text-sm font-mono font-bold text-gray-600">
                  {Math.round(session.duration_seconds / 60)}m
                </span>
              </div>
            ))}
            {sessions.length === 0 && (
              <div className="text-center py-8">
                <p className="text-sm text-gray-400 italic">No sessions yet. Start studying!</p>
              </div>
            )}
          </div>
          <button className="w-full mt-6 py-3 rounded-xl border border-gray-100 text-sm font-bold text-gray-500 hover:bg-gray-50 transition-all flex items-center justify-center gap-2">
            View All History <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, subValue, color }: any) {
  const colors: any = {
    indigo: "bg-indigo-50 text-indigo-600",
    orange: "bg-orange-50 text-orange-600",
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
  };

  return (
    <motion.div 
      whileHover={{ y: -4 }}
      className="glass-card rounded-3xl p-6 flex flex-col"
    >
      <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-4", colors[color])}>
        <Icon size={24} />
      </div>
      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{label}</span>
      <span className="text-2xl font-display font-bold text-gray-900">{value}</span>
      <span className="text-xs text-gray-400 mt-1">{subValue}</span>
    </motion.div>
  );
}
