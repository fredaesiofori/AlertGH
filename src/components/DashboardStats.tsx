import React, { useMemo } from 'react';
import { Incident, IncidentCategory, SeverityLevel } from '../types';
import { Activity, ShieldCheck, Flame, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import { motion } from 'motion/react';

interface DashboardStatsProps {
  incidents: Incident[];
  onSelectIncident: (incident: Incident) => void;
}

export default function DashboardStats({ incidents, onSelectIncident }: DashboardStatsProps) {
  // Analytical aggregates
  const stats = useMemo(() => {
    const total = incidents.length;
    const active = incidents.filter(i => i.status !== 'resolved').length;
    const resolved = incidents.filter(i => i.status === 'resolved').length;
    
    // Severity breakdown
    const criticalCount = incidents.filter(i => i.severity === 'critical' && i.status !== 'resolved').length;
    const highCount = incidents.filter(i => i.severity === 'high' && i.status !== 'resolved').length;
    
    // Community verify score (average)
    const totalVotes = incidents.reduce((acc, curr) => acc + curr.upvotes + curr.downvotes, 0);
    const avgScore = total > 0 ? Math.round((incidents.reduce((acc, curr) => acc + curr.verificationScore, 0) / total) * 10) / 10 : 0;
    
    // Calculate a safety rating index for Ghana
    const safetyIndex = Math.max(10, Math.min(100, 100 - (active * 6 + criticalCount * 12)));

    // Category distribution counts
    const categories: { [key in IncidentCategory]: number } = {
      flooding: 0,
      fire: 0,
      accident: 0,
      'road-closure': 0,
      'power-outage': 0,
      medical: 0,
      other: 0
    };
    incidents.forEach(inc => {
      categories[inc.category] = (categories[inc.category] || 0) + 1;
    });

    return {
      total,
      active,
      resolved,
      criticalCount,
      highCount,
      totalVotes,
      avgScore,
      safetyIndex,
      categories
    };
  }, [incidents]);

  const getCategoryTheme = (category: IncidentCategory) => {
    switch (category) {
      case 'flooding': return { label: 'Flooding', color: '#007AFF' };
      case 'fire': return { label: 'Fires / Blazes', color: '#FF3B30' };
      case 'accident': return { label: 'Accidents', color: '#FF9500' };
      case 'road-closure': return { label: 'Road Closures', color: '#8E8E93' };
      case 'power-outage': return { label: 'Power Grid', color: '#FFCC00' };
      case 'medical': return { label: 'Medical Issues', color: '#34C759' };
      default: return { label: 'Others', color: '#AF52DE' };
    }
  };

  const criticalFeed = useMemo(() => {
    return incidents
      .filter(i => i.status !== 'resolved' && (i.severity === 'critical' || i.severity === 'high'))
      .sort((a, b) => new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime())
      .slice(0, 3);
  }, [incidents]);

  return (
    <div className="space-y-6" id="dashboard-analytics-panel">
      
      {/* iOS Banner: Critical Feed Alert */}
      {criticalFeed.length > 0 && (
        <div className="bg-white border-[0.5px] border-[#FF3B30]/30 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 overflow-hidden relative shadow-sm">
          <div className="absolute inset-y-0 left-0 w-1 bg-[#FF3B30]" />
          <div className="flex items-center gap-3">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF3B30] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#FF3B30]"></span>
            </span>
            <div>
              <div className="text-[11px] font-bold text-[#FF3B30] uppercase tracking-wider">Critical Incident Alert</div>
              <div className="text-[15px] font-semibold text-[#1C1C1E] mt-0.5 leading-snug">
                {criticalFeed[0].title} — <span className="text-[#8E8E93] font-normal">{criticalFeed[0].city} ({criticalFeed[0].region})</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => onSelectIncident(criticalFeed[0])}
            className="text-[13px] font-semibold bg-[#FF3B30]/10 text-[#FF3B30] hover:bg-[#FF3B30]/20 px-4 py-2 rounded-lg transition-all cursor-pointer whitespace-nowrap active:scale-95 border-[0.5px] border-[#FF3B30]/30"
          >
            Inspect Alert
          </button>
        </div>
      )}

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1 */}
        <div className="bg-white dark:bg-zinc-900/60 border border-slate-200/80 dark:border-zinc-850/80 rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between shadow-sm transition-colors duration-300">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[12px] text-slate-500 dark:text-zinc-400 font-semibold uppercase tracking-wider">Active Incidents</span>
              <span className="p-1.5 bg-[#FF3B30]/10 text-red-500 rounded-full">
                <Flame className="w-4 h-4 fill-red-500/15" />
              </span>
            </div>
            <div className="text-[34px] font-bold text-slate-900 dark:text-zinc-50 tracking-tight transition-colors">{stats.active}</div>
          </div>
          <div className="text-[13px] text-slate-500 dark:text-zinc-400 mt-2 border-t border-slate-200/40 dark:border-zinc-800/40 pt-2 transition-colors">
            <span className="text-[#FF3B30] font-semibold">{stats.criticalCount} Critical</span> cases active.
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white dark:bg-zinc-900/60 border border-slate-200/80 dark:border-zinc-850/80 rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between shadow-sm transition-colors duration-300">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[12px] text-slate-500 dark:text-zinc-400 font-semibold uppercase tracking-wider">Verification Score</span>
              <span className="p-1.5 bg-emerald-500/10 text-emerald-500 rounded-full">
                <ShieldCheck className="w-4 h-4 fill-emerald-500/15" />
              </span>
            </div>
            <div className="text-[34px] font-bold text-slate-900 dark:text-zinc-50 tracking-tight transition-colors">
              {stats.avgScore}<span className="text-[15px] text-slate-500 dark:text-zinc-400 font-normal"> / 10</span>
            </div>
          </div>
          <div className="text-[13px] text-slate-500 dark:text-zinc-400 mt-2 border-t border-slate-200/40 dark:border-zinc-800/40 pt-2 transition-colors">
            Verified by <span className="text-emerald-500 font-semibold">{stats.totalVotes} votes</span>.
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white dark:bg-zinc-900/60 border border-slate-200/80 dark:border-zinc-850/80 rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between shadow-sm transition-colors duration-300">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[12px] text-slate-500 dark:text-zinc-400 font-semibold uppercase tracking-wider">Resolved Reports</span>
              <span className="p-1.5 bg-blue-500/10 text-blue-500 rounded-full">
                <CheckCircle className="w-4 h-4 fill-blue-500/15" />
              </span>
            </div>
            <div className="text-[34px] font-bold text-slate-900 dark:text-zinc-50 tracking-tight transition-colors">{stats.resolved}</div>
          </div>
          <div className="text-[13px] text-slate-500 dark:text-zinc-400 mt-2 border-t border-slate-200/40 dark:border-zinc-800/40 pt-2 transition-colors">
            <span className="text-blue-500 font-semibold">
              {stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0}%
            </span> total resolution rate.
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white dark:bg-zinc-900/60 border border-slate-200/80 dark:border-zinc-850/80 rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between shadow-sm transition-colors duration-300">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[12px] text-slate-500 dark:text-zinc-400 font-semibold uppercase tracking-wider">Safety Rating</span>
              <span className="p-1.5 bg-amber-500/10 text-amber-500 rounded-full">
                <Activity className="w-4 h-4 fill-amber-500/15" />
              </span>
            </div>
            <div className="text-[34px] font-bold text-slate-900 dark:text-zinc-50 tracking-tight transition-colors">{stats.safetyIndex}%</div>
          </div>
          <div className="text-[13px] text-emerald-500 font-semibold mt-2 border-t border-slate-200/40 dark:border-zinc-800/40 pt-2 transition-colors">
            Operational Stability Secure.
          </div>
        </div>

      </div>

      {/* Split Grid: Categories & Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Category breakdown */}
        <div className="bg-white dark:bg-zinc-900/60 border border-slate-200/80 dark:border-zinc-850/80 rounded-2xl p-5 shadow-sm transition-colors duration-300">
          <h3 className="text-[17px] font-semibold text-slate-900 dark:text-zinc-50 mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            Report Categorization
          </h3>
          <div className="space-y-4">
            {(Object.keys(stats.categories) as IncidentCategory[]).map((cat) => {
              const count = stats.categories[cat];
              const theme = getCategoryTheme(cat);
              const percentage = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;

              return (
                <div key={cat} className="space-y-1">
                  <div className="flex items-center justify-between text-[13px]">
                    <span className="font-semibold text-slate-800 dark:text-zinc-200 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: theme.color }} />
                      {theme.label}
                    </span>
                    <span className="text-slate-500 dark:text-zinc-400 font-medium">
                      {count} {count === 1 ? 'case' : 'cases'} ({percentage}%)
                    </span>
                  </div>
                  {/* Thin Progress Track */}
                  <div className="h-2 w-full bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: theme.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Timeline Chart */}
        <div className="bg-white dark:bg-zinc-900/60 border border-slate-200/80 dark:border-zinc-850/80 rounded-2xl p-5 shadow-sm transition-colors duration-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[17px] font-semibold text-slate-900 dark:text-zinc-50 flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-500" />
              Incident Cycles (24h)
            </h3>
            <span className="text-[11px] bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 px-2 py-0.5 rounded-md font-bold">LIVE FEED</span>
          </div>

          <div className="relative w-full h-[180px] flex flex-col justify-end">
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
              <div className="border-b border-dashed border-slate-300 dark:border-zinc-700 w-full h-px" />
              <div className="border-b border-dashed border-slate-300 dark:border-zinc-700 w-full h-px" />
              <div className="border-b border-dashed border-slate-300 dark:border-zinc-700 w-full h-px" />
            </div>

            <svg viewBox="0 0 500 180" className="w-full h-[150px] overflow-visible">
              <defs>
                <linearGradient id="resolvedGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="activeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              <path
                d="M 0 150 Q 80 140 160 80 T 320 60 T 500 20 L 500 180 L 0 180 Z"
                fill="url(#resolvedGrad)"
              />
              <path
                d="M 0 120 Q 80 90 160 110 T 320 40 T 500 90 L 500 180 L 0 180 Z"
                fill="url(#activeGrad)"
              />

              <path
                d="M 0 150 Q 80 140 160 80 T 320 60 T 500 20"
                fill="none"
                stroke="#10b981"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <path
                d="M 0 120 Q 80 90 160 110 T 320 40 T 500 90"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              <circle cx="160" cy="80" r="4" className="fill-white dark:fill-zinc-900 stroke-[#10b981] stroke-2" />
              <circle cx="320" cy="40" r="4" className="fill-white dark:fill-zinc-900 stroke-[#3b82f6] stroke-2" />

              <g fill="#94a3b8" fontSize="8" fontWeight="bold">
                <text x="160" y="145" textAnchor="middle">12:00</text>
                <text x="320" y="145" textAnchor="middle">15:00</text>
                <text x="480" y="145" textAnchor="middle">18:00</text>
              </g>
            </svg>

            {/* Legends */}
            <div className="flex items-center gap-4 justify-center text-[11px] text-slate-500 dark:text-zinc-400 border-t border-slate-100 dark:border-zinc-800 pt-2 transition-colors">
              <span className="flex items-center gap-1.5 font-medium">
                <span className="w-3 h-3 rounded-full bg-blue-500" />
                Reported
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <span className="w-3 h-3 rounded-full bg-emerald-500" />
                Resolved
              </span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
