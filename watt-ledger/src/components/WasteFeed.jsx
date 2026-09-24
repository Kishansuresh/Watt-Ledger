import { AlertTriangle, Bot, Activity } from "lucide-react";

export default function WasteFeed({ anomalies = [], openChat }) {
  return (
    <div className="p-6 space-y-6 max-w-7xl w-full mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
          <Activity className="w-6 h-6 text-rose-400" />
          Live Waste Feed
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Real-time energy anomalies detected from facility telemetry.
        </p>
      </div>

      <div className="bg-[#101725] border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-900/70 border-b border-slate-800">
              <tr>
                <th className="px-4 py-3 text-[10px] uppercase text-slate-500">Severity</th>
                <th className="px-4 py-3 text-[10px] uppercase text-slate-500">Time</th>
                <th className="px-4 py-3 text-[10px] uppercase text-slate-500">Description</th>
                <th className="px-4 py-3 text-[10px] uppercase text-slate-500">Impact</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {anomalies.length > 0 ? (
                anomalies.map((anomaly) => (
                  <tr key={anomaly.id} className="border-b border-slate-800/70 hover:bg-slate-800/30">
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded border ${
                        anomaly.severity === "Critical"
                          ? "bg-rose-950/50 text-rose-400 border-rose-900/50"
                          : "bg-amber-950/50 text-amber-400 border-amber-900/50"
                      }`}>
                        {anomaly.severity === "Critical" && <AlertTriangle className="w-3 h-3" />}
                        {anomaly.severity}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-400">{anomaly.timestamp}</td>
                    <td className="px-4 py-3 text-sm text-slate-200">
                      <div className="font-medium">{anomaly.description}</div>
                      <div className="text-[10px] text-slate-500 mt-1">{anomaly.location}</div>
                    </td>
                    <td className="px-4 py-3 font-mono text-rose-400 text-xs">{anomaly.impactHr}</td>
                    <td className="px-4 py-3 text-right">
                      {/* FIX: Wraps openChat in an arrow function to pass the targeted anomaly data */}
                      <button
                        onClick={() => openChat(anomaly)}
                        className="inline-flex items-center gap-1.5 text-xs bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 px-3 py-1.5 rounded transition"
                      >
                        <Bot className="w-3.5 h-3.5" />
                        Investigate AI
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-4 py-10 text-center text-slate-500 text-sm">
                    No active anomalies detected in the current telemetry window.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}