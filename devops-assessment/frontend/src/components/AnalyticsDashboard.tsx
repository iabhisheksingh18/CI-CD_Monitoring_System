import { useState, useEffect } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { aiService } from '../services/aiService';
import { PieChart as PieIcon, BarChart3, BarChart2 } from 'lucide-react';
import './AnalyticsDashboard.css';

interface Stats {
  totalRuns: number;
  successCount: number;
  failureCount: number;
  failureRate: number;
}

export default function AnalyticsDashboard({
  projectId,
}: {
  projectId: string;
}) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (projectId) {
      setLoading(true);
      aiService
        .getStats(projectId)
        .then(setStats)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [projectId]);

  if (!projectId)
    return (
      <div className="analytics-empty">
        <div className="empty-icon">
          <BarChart2 size={32} color="var(--text-dim)" />
        </div>
        Select a project to view analytics.
      </div>
    );

  if (loading)
    return (
      <div className="analytics-skeleton">
        <div className="skeleton-card">
          <div className="skeleton-bar short" />
          <div className="skeleton-bar tall" />
        </div>
        <div className="skeleton-card">
          <div className="skeleton-bar short" />
          <div className="skeleton-bar tall" />
        </div>
        <div className="skeleton-card">
          <div className="skeleton-bar short" />
          <div className="skeleton-bar tall" />
        </div>
      </div>
    );

  if (!stats || stats.totalRuns === 0)
    return (
      <div className="analytics-empty">
        <div className="empty-icon">
          <BarChart2 size={32} color="var(--text-dim)" />
        </div>
        No pipeline history recorded for this project yet.
      </div>
    );

  const stabilityScore = 100 - stats.failureRate;
  const circumference = 2 * Math.PI * 48;
  const offset = circumference - (stabilityScore / 100) * circumference;
  const ringClass =
    stabilityScore >= 80 ? 'good' : stabilityScore >= 50 ? 'warn' : 'bad';
  const ringColor =
    stabilityScore >= 80
      ? 'var(--success)'
      : stabilityScore >= 50
      ? 'var(--warning)'
      : 'var(--error)';

  const pieData = [
    { name: 'Success', value: stats.successCount },
    { name: 'Failure', value: stats.failureCount },
  ];

  const COLORS = ['#3fb950', '#f85149'];

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--glass-border)',
          borderRadius: 'var(--radius-md)',
          padding: '0.5rem 0.75rem',
          fontSize: '0.8rem',
          color: 'var(--text-main)',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        <div style={{ fontWeight: 600 }}>{payload[0].name}</div>
        <div style={{ color: payload[0].color || 'var(--text-muted)' }}>
          {payload[0].value} runs
        </div>
      </div>
    );
  };

  return (
    <div className="analytics-grid stagger-in">
      {/* Stability Ring */}
      <div className="stability-card">
        <div className="stability-ring">
          <svg width="120" height="120" viewBox="0 0 120 120">
            <circle className="stability-ring-bg" cx="60" cy="60" r="48" />
            <circle
              className={`stability-ring-fill ${ringClass}`}
              cx="60"
              cy="60"
              r="48"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
            />
          </svg>
          <div className="stability-value">
            <span className="stability-percent" style={{ color: ringColor }}>
              {stabilityScore}%
            </span>
            <span className="stability-label">Stability</span>
          </div>
        </div>
        <p className="stability-subtitle">
          Over {stats.totalRuns} total pipeline scans
        </p>
      </div>

      {/* Distribution Chart */}
      <div className="chart-card" style={{ height: '320px' }}>
        <h4>
          <PieIcon className="chart-icon" />
          Success Distribution
        </h4>
        <ResponsiveContainer width="100%" height="85%">
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={75}
              paddingAngle={5}
              dataKey="value"
              animationBegin={200}
              animationDuration={800}
            >
              {pieData.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Volume Chart */}
      <div className="chart-card" style={{ height: '320px' }}>
        <h4>
          <BarChart3 className="chart-icon" />
          Run Summary
        </h4>
        <ResponsiveContainer width="100%" height="85%">
          <BarChart
            data={[
              {
                name: 'Total Runs',
                success: stats.successCount,
                failure: stats.failureCount,
              },
            ]}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.04)"
            />
            <XAxis dataKey="name" stroke="var(--text-dim)" fontSize={12} />
            <YAxis stroke="var(--text-dim)" fontSize={12} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
            <Bar
              dataKey="success"
              fill="#3fb950"
              radius={[6, 6, 0, 0]}
              animationBegin={300}
              animationDuration={800}
            />
            <Bar
              dataKey="failure"
              fill="#f85149"
              radius={[6, 6, 0, 0]}
              animationBegin={500}
              animationDuration={800}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
