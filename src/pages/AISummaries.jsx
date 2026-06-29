import { AlertTriangle, Target, Trophy, Info, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import api from "../lib/api";

export default function AISummaries() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['aiSummaries'],
    queryFn: async () => {
      const res = await api.get('/api/v1/stats/ai-summaries/');
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
    console.error("AI Summaries fetch error:", error);
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-destructive gap-2">
        <p>Failed to load AI summaries.</p>
        <p className="text-sm opacity-80">{error?.response?.data?.message || error?.message || "Unknown error"}</p>
      </div>
    );
  }

  const summaries = [
    data?.today_summary,
    data?.this_week_summary,
    data?.this_month_summary
  ].filter(Boolean);

  const getOutcomeCount = (outcomes, name) => {
    return outcomes?.find(o => o.name === name)?.count || 0;
  };

  const formatTextWithUserName = (text, name) => {
    if (!text || !name) return text;
    return text.replace(/the user/ig, name);
  };

  const topOpps = data?.top_opportunities?.length > 0 
    ? data.top_opportunities.map(o => {
        const name = o.caller_name || "Unknown";
        const formattedHighlight = formatTextWithUserName(o.highlight, o.caller_name);
        return `${name} — ${o.outcome}: ${formattedHighlight}`;
      })
    : ["No top opportunities found yet."];

  const needsAttention = data?.calls_needing_attention?.length > 0
    ? data.calls_needing_attention.map(c => {
        const name = c.caller_name || "Unknown";
        const formattedIssue = formatTextWithUserName(c.issue, c.caller_name) || "Needs attention";
        return `${name} — ${formattedIssue}`;
      })
    : ["No calls require immediate attention."];

  const agent = data?.best_performing_agent;
  const bestAgentStats = agent ? [
    `Agent: ${agent.assistant_name || 'N/A'}`,
    `${agent.total_calls || 0} calls handled`,
    `Average duration: ${agent.average_duration || '0s'}`
  ] : ["No agent data available yet."];

  const insights = [
    { icon: Target, title: "Top Opportunities", accent: "text-accent", items: topOpps },
    { icon: AlertTriangle, title: "Calls Needing Attention", accent: "text-yellow-400", items: needsAttention },
    { icon: Trophy, title: "Best Performing Agent", accent: "text-green-400", items: bestAgentStats },
  ];

  return (
    <div className="space-y-6 w-full">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">AI Summaries</h2>
        <p className="text-sm text-muted-foreground mt-1">Executive-level intelligence from your AI conversations.</p>
        <div className="flex items-start gap-2 mt-3 px-3 py-2.5 rounded-lg bg-yellow-500/8 border border-yellow-500/20 max-w-2xl">
          <Info className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-yellow-300/80 leading-relaxed">These summaries and recommendations are AI-generated and should be treated as guidance only. AI can make mistakes — always apply human judgment before acting on any insight.</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {summaries.map(s => {
          const testDrives = getOutcomeCount(s.outcomes, "Test Drive");
          const leasing = getOutcomeCount(s.outcomes, "Leasing Request");
          const buy = getOutcomeCount(s.outcomes, "Buy");
          
          return (
            <div key={s.title} className="glow-border rounded-xl bg-card p-5">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">{s.title} Summary</p>
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div><p className="text-2xl font-bold">{s.total_calls}</p><p className="text-[10px] text-muted-foreground">Calls</p></div>
                <div><p className="text-2xl font-bold text-green-400">{testDrives}</p><p className="text-[10px] text-muted-foreground">Test Drives</p></div>
                <div><p className="text-2xl font-bold text-accent">{leasing}</p><p className="text-[10px] text-muted-foreground">Leasing</p></div>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {buy > 0 ? `${buy} Buy intent detected.` : leasing > 0 ? `${leasing} Leasing requests processed.` : testDrives > 0 ? `${testDrives} Test drives scheduled.` : "No major outcomes yet."}
              </p>
            </div>
          )
        })}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {insights.map(ins => (
          <div key={ins.title} className="glow-border rounded-xl bg-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <ins.icon className={`w-4 h-4 ${ins.accent}`} />
              <h3 className="text-sm font-semibold">{ins.title}</h3>
            </div>
            <ul className="space-y-2">
              {ins.items.map((item, i) => (
                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="w-1 h-1 rounded-full bg-muted-foreground mt-2 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}