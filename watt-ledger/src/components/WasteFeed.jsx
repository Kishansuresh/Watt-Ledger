import React, { useState } from "react";
import { AlertTriangle, Bot, X } from "lucide-react";

export default function WasteFeed({ anomalies, openChat }) {
  // Track which anomalies the user has hidden
  const [dismissedIds, setDismissedIds] = useState(new Set());

  const handleDismiss = (id) => {
    setDismissedIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  };

  // Filter out any anomalies that exist in our dismissed Set
  const visibleAnomalies = anomalies.filter((a) => !dismissedIds.has(a.id));

  return (
    <section className="p-6 space-y-6 max-w-7xl w-full mx-auto font-sans">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-extrabold text-white">
          <AlertTriangle className="w-6 h-6 text-rose-500" />
          Live Waste Feed
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Real-time energy anomalies detected from facility telemetry.
        </p>
      </div>

      <div className="bg-[#111827] rounded-xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="text-xs uppercase bg-[#172033] text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-6 py-4 font-semibold">Severity</th>
                <th className="px-6 py-4 font-semibold">Time</th>
                <th className="px-6 py-4 font-semibold">Description</th>
                <th className="px-6 py-4 font-semibold">Impact</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {visibleAnomalies.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-slate-500">
                    No active anomalies detected. Inbox zero!
                  </td>
                </tr>
              ) : (
                visibleAnomalies.map((anomaly) => (
                  <tr key={anomaly.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${
                        anomaly.severity === "Critical" 
                          ? "bg-rose-500/10 text-rose-400 border-rose-500/20" 
                          : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                      }`}>
                        <AlertTriangle className="w-3.5 h-3.5" />
                        {anomaly.severity}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-400 whitespace-nowrap">
                      {anomaly.timestamp}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-200">{anomaly.description}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{anomaly.location}</div>
                    </td>
                    <td className="px-6 py-4 font-mono text-rose-400 whitespace-nowrap">
                      {anomaly.impactHr}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {/* New Dismiss Button */}
                        <button
                          onClick={() => handleDismiss(anomaly.id)}
                          className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-700 rounded transition-colors"
                          title="Dismiss Alert"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={() => openChat(anomaly)}
                          className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded text-xs font-medium transition-colors whitespace-nowrap"
                        >
                          <Bot className="w-3.5 h-3.5 text-emerald-400" />
                          Investigate AI
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}