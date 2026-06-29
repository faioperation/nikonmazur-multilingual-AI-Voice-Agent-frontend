import { Phone, Clock, Target, CheckCircle, Car, Loader2 } from "lucide-react";
import MetricCard from "../components/MetricCard";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import StatusBadge from "../components/StatusBadge";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import api from "../lib/api";

const formatDuration = (seconds) => {
  if (!seconds) return "0s";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
};

const CustomTooltip = ({ active = false, payload = [], label = "" }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass rounded-lg px-3 py-2 border border-border text-xs">
      <p className="text-muted-foreground mb-1">{label}</p>
      {payload.map((p, i) => <p key={i} className="text-foreground font-medium">{p.name}: {p.value}</p>)}
    </div>
  );
};

export default function Dashboard() {
  const { data: stats, isLoading, isError, error } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: async () => {
      const res = await api.get('/api/v1/stats/overview/');
      return res.data?.data || res.data;
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError) {
    console.error("Dashboard fetch error:", error);
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-destructive gap-2">
        <p>Failed to load dashboard data.</p>
        <p className="text-sm opacity-80">{error?.response?.data?.message || error?.message || "Unknown error"}</p>
      </div>
    );
  }

  const cards = stats?.cards || {};
  const activity = stats?.call_activity || [];
  
  const COLORS = ['#4ade80', '#60a5fa', '#f472b6', '#a78bfa', '#fbbf24', '#f87171'];
  const outcomes = (stats?.call_outcomes || []).map((o, i) => ({
    ...o,
    fill: COLORS[i % COLORS.length]
  }));

  const recentCalls = stats?.recent_calls || [];

  return (
    <div className="space-y-6 w-full">
      <div>
        <h2 className="font-heading text-3xl font-semibold tracking-wide">Dashboard Overview</h2>
        <p className="text-sm text-muted-foreground mt-1">Monitor every AI conversation in one place.</p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
        <MetricCard title="Calls Today" value={cards.calls_today || 0} icon={Phone} />
        <MetricCard title="Calls This Week" value={cards.calls_this_week || 0} icon={Phone} />
        <MetricCard title="Minutes Today" value={cards.minutes_today || 0} icon={Clock} />
        <MetricCard title="Minutes This Week" value={cards.minutes_this_week || 0} icon={Clock} />
        <MetricCard title="Avg Duration" value={cards.average_duration || "0s"} icon={Clock} />
        <MetricCard title="Test Drives" value={cards.test_drive_count || 0} icon={Car} />
        {/* <MetricCard title="Conversion Rate" value="0%" icon={Target} /> */}
        {/* <MetricCard title="Success Rate" value="0%" icon={CheckCircle} /> */}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 glow-border rounded-xl bg-card p-5">
          <h3 className="text-sm font-semibold mb-4">Call Activity — This Week</h3>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={activity}>
              <defs>
                <linearGradient id="callGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(0,0%,70%)" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="hsl(0,0%,70%)" stopOpacity={0} />
                  </linearGradient>
                  </defs>
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "hsl(0,0%,40%)", fontSize: 11 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "hsl(0,0%,40%)", fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="count" stroke="hsl(0,0%,75%)" fill="url(#callGrad)" strokeWidth={1.5} name="Calls" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="glow-border rounded-xl bg-card p-5">
          <h3 className="text-sm font-semibold mb-4">Call Outcomes</h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={outcomes} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="count" nameKey="name">
                {outcomes.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2">
            {outcomes.map(o => (
              <div key={o.name} className="flex items-center gap-1.5 text-[11px]">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: o.fill }} />
                <span className="text-muted-foreground truncate">{o.name}</span>
                <span className="font-medium ml-auto">{o.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Calls */}
      <div className="glow-border rounded-xl bg-card">
        <div className="flex items-center justify-between p-5 pb-3">
          <h3 className="text-sm font-semibold">Recent Calls</h3>
          <Link to="/recordings" className="text-xs text-primary hover:underline">View all →</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-t border-border text-xs text-muted-foreground">
                <th className="text-left px-5 py-3 font-medium">Contact</th>
                <th className="text-left px-5 py-3 font-medium hidden md:table-cell">Agent</th>
                <th className="text-left px-5 py-3 font-medium">Duration</th>
                <th className="text-left px-5 py-3 font-medium">Outcome</th>
                <th className="text-left px-5 py-3 font-medium hidden lg:table-cell">Sentiment</th>
              </tr>
            </thead>
            <tbody>
              {recentCalls.map((r, index) => (
                <tr key={index} className="border-t border-border hover:bg-secondary/30 transition-colors">
                  <td className="px-5 py-3">
                    <p className="font-medium">{r.caller_name || "Unknown Caller"}</p>
                    <p className="text-xs text-muted-foreground">{r.caller_number || "No Number"}</p>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground hidden md:table-cell">{r.assistant_name}</td>
                  <td className="px-5 py-3 text-muted-foreground">{formatDuration(r.duration_seconds)}</td>
                  <td className="px-5 py-3">
                    {r.outcome ? (
                      <span className="text-xs uppercase tracking-wider font-medium text-muted-foreground border border-border px-2 py-1 rounded-md">{r.outcome}</span>
                    ) : (
                      <span className="text-xs text-muted-foreground italic">None</span>
                    )}
                  </td>
                  <td className="px-5 py-3 hidden lg:table-cell">
                    {r.sentiment && <StatusBadge status={r.sentiment} />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}