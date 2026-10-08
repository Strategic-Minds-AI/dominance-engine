import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Shield, Loader2, AlertCircle, Check, RefreshCw, ChevronDown } from "lucide-react";

export default function GuardianPanel() {
  const [scanning, setScanning] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState(null);

  const runScan = async () => {
    setScanning(true);
    setError("");
    try {
      const res = await base44.functions.invoke("guardianScan", {});
      setResults(res.data);
    } catch (e) {
      setError(e.message || "Scan failed");
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="border border-border p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 flex-wrap">
          <Shield className="w-4 h-4 text-crimson" />
          <h4 className="font-heading text-sm font-bold uppercase">Guardian Agent</h4>
          {results && (
            <span className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground">
              {results.total_fixes} fixed · {results.total_issues} remaining
            </span>
          )}
        </div>
        <button onClick={runScan} disabled={scanning} className="inline-flex items-center gap-1.5 text-[10px] tracking-[0.15em] uppercase px-3 py-1.5 border border-crimson text-crimson hover:bg-crimson hover:text-paper disabled:opacity-40">
          {scanning ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
          {scanning ? "Scanning..." : "Run Scan"}
        </button>
      </div>

      {error && <div className="flex items-center gap-2 text-xs text-destructive mb-3"><AlertCircle className="w-3.5 h-3.5" />{error}</div>}

      {!results && !scanning && (
        <p className="text-xs text-muted-foreground">The guardian scans all sites for missing sitemaps, unpublished pages, stuck statuses, and unconnected Google consoles. It auto-fixes what it can and creates approval tasks for the rest. Runs automatically every 30 minutes.</p>
      )}

      {results && (
        <>
          <div className="flex items-center gap-4 mb-3 text-[10px] tracking-[0.15em] uppercase">
            <span className={results.gsc_connected ? "text-emerald-600" : "text-muted-foreground"}>
              GSC {results.gsc_connected ? "✓ Connected" : "Not connected"}
            </span>
            <span className={results.analytics_connected ? "text-emerald-600" : "text-muted-foreground"}>
              Analytics {results.analytics_connected ? "✓ Connected" : "Not connected"}
            </span>
          </div>
          <div className="space-y-2">
            {results.results.map((r) => (
              <div key={r.site_id} className="border border-border">
                <button onClick={() => setExpanded(expanded === r.site_id ? null : r.site_id)} className="w-full flex items-center justify-between p-3 text-left hover:bg-secondary/30">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${r.issues_found === 0 ? "bg-emerald-500" : "bg-crimson"}`} />
                    <span className="text-sm truncate">{r.site_name}</span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {r.fixes_applied > 0 && <span className="text-[10px] text-emerald-600">{r.fixes_applied} fixed</span>}
                    {r.issues_found > 0 && <span className="text-[10px] text-crimson">{r.issues_found} issues</span>}
                    {r.fixes_applied === 0 && r.issues_found === 0 && <span className="text-[10px] text-emerald-600">Healthy</span>}
                    <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${expanded === r.site_id ? "rotate-180" : ""}`} />
                  </div>
                </button>
                {expanded === r.site_id && (
                  <div className="border-t border-border p-3 space-y-1.5">
                    {r.fixes.map((f, i) => (
                      <div key={`f${i}`} className="flex items-start gap-2 text-xs">
                        <Check className="w-3 h-3 text-emerald-600 shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">{f}</span>
                      </div>
                    ))}
                    {r.issues.map((iss, i) => (
                      <div key={`i${i}`} className="flex items-start gap-2 text-xs">
                        <AlertCircle className={`w-3 h-3 shrink-0 mt-0.5 ${iss.severity === "high" ? "text-crimson" : "text-amber-500"}`} />
                        <span className="text-muted-foreground">{iss.message}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}