import { useState } from "react";
import { Play, Download, Search, Loader2 } from "lucide-react";
import StatusBadge from "../components/StatusBadge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import api from "../lib/api";

const formatDuration = (seconds) => {
  if (!seconds) return "0s";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
};

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const d = new Date(dateString);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
};

export default function CallRecordings() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);

  const { data: recordings = [], isLoading, isError, error } = useQuery({
    queryKey: ['callRecordings'],
    queryFn: async () => {
      const res = await api.get('/api/v1/call-recordings');
      return res.data?.data || res.data;
    }
  });

  const filtered = recordings.filter(r =>
    (r.caller_name || "").toLowerCase().includes(search.toLowerCase()) ||
    (r.caller_number || "").toLowerCase().includes(search.toLowerCase()) ||
    (r.outcome || "").toLowerCase().includes(search.toLowerCase()) ||
    (r.assistant_name || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Call Recordings</h2>
          <p className="text-sm text-muted-foreground mt-1">Review recordings, measure performance, and improve outcomes.</p>
        </div>
        <div className="flex items-center gap-2 bg-secondary rounded-lg px-3 py-2">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search calls…" className="bg-transparent text-sm outline-none w-48" />
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-destructive gap-2">
          <p>Failed to load call recordings.</p>
          <p className="text-sm opacity-80">{error?.response?.data?.message || error?.message || "Unknown error"}</p>
        </div>
      ) : (
        <div className="glow-border rounded-xl bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-xs text-muted-foreground">
                <th className="text-left px-5 py-3 font-medium">Contact</th>
                <th className="text-left px-5 py-3 font-medium hidden md:table-cell">Agent</th>
                <th className="text-left px-5 py-3 font-medium hidden sm:table-cell">Date</th>
                <th className="text-left px-5 py-3 font-medium">Duration</th>
                <th className="text-left px-5 py-3 font-medium">Outcome</th>
                <th className="text-left px-5 py-3 font-medium hidden lg:table-cell">Sentiment</th>
                <th className="text-right px-5 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r.id} className="border-b border-border hover:bg-secondary/30 transition-colors cursor-pointer" onClick={() => setSelected(r)}>
                  <td className="px-5 py-3">
                    <p className="font-medium">{r.caller_name || "Unknown Caller"}</p>
                    <p className="text-xs text-muted-foreground">{r.caller_number || "No number"}</p>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground text-xs hidden md:table-cell">{r.assistant_name || "N/A"}</td>
                  <td className="px-5 py-3 text-muted-foreground text-xs hidden sm:table-cell">{formatDate(r.call_date)}</td>
                  <td className="px-5 py-3 text-muted-foreground">{formatDuration(r.duration_seconds)}</td>
                  <td className="px-5 py-3">
                    <span className="text-xs uppercase tracking-wider font-medium text-muted-foreground border border-border px-2 py-1 rounded-md">{r.outcome || "None"}</span>
                  </td>
                  <td className="px-5 py-3 hidden lg:table-cell"><StatusBadge status={r.sentiment} /></td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={(e) => { e.stopPropagation(); setSelected(r); }} className="p-1.5 rounded-lg hover:bg-primary/10 text-primary transition-colors"><Play className="w-3.5 h-3.5" /></button>
                      {r.audio_url && (
                        <a href={r.audio_url} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="p-1.5 rounded-lg hover:bg-secondary transition-colors text-muted-foreground inline-flex">
                          <Download className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      )}

      {/* Call Detail Modal */}
      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-3xl bg-card border-border max-h-[85vh] overflow-y-auto">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="text-lg">{selected.caller_name || "Unknown Caller"} — {selected.caller_number || "No number"}</DialogTitle>
                <p className="text-xs text-muted-foreground">{formatDate(selected.call_date)} · {formatDuration(selected.duration_seconds)} · {selected.assistant_name}</p>
              </DialogHeader>

              {/* Audio Player */}
              <div className="glow-border rounded-xl bg-secondary/30 p-4">
                {selected.audio_url ? (
                  <audio controls src={selected.audio_url} className="w-full custom-audio-player h-10 outline-none" />
                ) : (
                  <p className="text-sm text-muted-foreground">Audio recording not available for this call.</p>
                )}
                {selected.audio_url && (
                  <div className="flex justify-end mt-2">
                    <a href={selected.audio_url} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1">
                      <Download className="w-3 h-3" /> Download Audio
                    </a>
                  </div>
                )}
              </div>

              {/* Tabs */}
              <Tabs defaultValue="summary" className="mt-2">
                <TabsList className="bg-secondary border border-border">
                  <TabsTrigger value="summary" className="text-xs">AI Summary</TabsTrigger>
                  <TabsTrigger value="transcript" className="text-xs">Transcript</TabsTrigger>
                  <TabsTrigger value="details" className="text-xs">Details</TabsTrigger>
                </TabsList>
                <TabsContent value="summary" className="space-y-3 mt-3">
                  <div className="glow-border rounded-lg bg-secondary/30 p-4">
                    <p className="text-sm leading-relaxed">{selected.ai_summary || "No summary available for this call."}</p>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="rounded-lg bg-secondary/30 p-3">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Sentiment</p>
                      <StatusBadge status={selected.sentiment} />
                    </div>
                    <div className="rounded-lg bg-secondary/30 p-3">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Outcome</p>
                      <p className="text-sm font-medium uppercase">{selected.outcome || "None"}</p>
                    </div>
                    <div className="rounded-lg bg-secondary/30 p-3">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Lead Score</p>
                      <p className="text-sm font-medium">{selected.lead_score || "N/A"}</p>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="transcript" className="mt-3">
                  <div className="glow-border rounded-lg bg-secondary/30 p-4 max-h-96 overflow-y-auto">
                    <pre className="text-sm whitespace-pre-wrap text-muted-foreground leading-relaxed font-sans">{selected.transcript || "Transcript not available."}</pre>
                  </div>
                </TabsContent>
                <TabsContent value="details" className="mt-3 space-y-2">
                  {[["Phone", selected.caller_number], ["Agent", selected.assistant_name], ["Date", formatDate(selected.call_date)], ["Duration", formatDuration(selected.duration_seconds)], ["ID", selected.id]].map(([k, v]) => (
                    <div key={k} className="flex justify-between py-2 border-b border-border text-sm">
                      <span className="text-muted-foreground">{k}</span><span className="font-medium text-right max-w-xs">{v || "N/A"}</span>
                    </div>
                  ))}
                </TabsContent>
              </Tabs>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}