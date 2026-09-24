import React from "react";

export default function Scorecard({ facility }) {
  // Dynamically swap scorecard metrics based on the active facility
  const dataMap = {
    tower_a: {
      grade: "B+", eui: 68.4, target: 75.0, avg: 92.0, ringColor: "stroke-emerald-500", 
      checklist: [
        { metric: "Lighting Power Density", value: "0.78 W/sq ft", status: "Pass", limit: "< 0.90 W/sq ft" },
        { metric: "HVAC Fan Efficiency", value: "0.85 W/CFM", status: "Pass", limit: "< 1.20 W/CFM" },
        { metric: "Economizer Operation", value: "Fault Detected", status: "Fail", limit: "Fully Functional" },
        { metric: "Night Setback Controls", value: "Active (w/ Overrides)", status: "Warning", limit: "Enforced" }
      ]
    },
    default: {
      grade: "C-", eui: 94.2, target: 85.0, avg: 92.0, ringColor: "stroke-rose-500",
      checklist: [
        { metric: "Lighting Power Density", value: "0.95 W/sq ft", status: "Fail", limit: "< 0.85 W/sq ft" },
        { metric: "HVAC Fan Efficiency", value: "1.15 W/CFM", status: "Warning", limit: "< 1.10 W/CFM" },
        { metric: "Economizer Operation", value: "Optimized", status: "Pass", limit: "Fully Functional" },
        { metric: "Night Setback Controls", value: "Complete Override", status: "Fail", limit: "Enforced" }
      ]
    }
  };

  const currentData = dataMap[facility] || dataMap.default;

  return (
    <div className="p-6 space-y-6 max-w-7xl w-full mx-auto font-sans">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-100">ASHRAE 90.1 Scorecard</h2>
          <p className="text-sm text-slate-400 mt-1">Live compliance tracking and Energy Use Intensity (EUI) metrics.</p>
        </div>
        <div className="bg-emerald-500/10 text-emerald-400 px-4 py-2 rounded-lg border border-emerald-500/20 flex items-center space-x-2">
          <span className="font-bold text-xl">{currentData.grade}</span>
          <span className="text-xs uppercase tracking-wide">Overall Rating</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-[#111827] rounded-xl border border-slate-800 p-6 flex flex-col items-center justify-center">
          <h3 className="text-sm font-medium text-slate-400 mb-6">Site EUI (kBTU / sq ft / yr)</h3>
          <div className="relative w-40 h-40 flex items-center justify-center rounded-full border-8 border-slate-800">
            <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="46" fill="transparent" strokeWidth="8" strokeDasharray="289" strokeDashoffset="60" className={`opacity-80 ${currentData.ringColor}`} />
            </svg>
            <div className="text-center">
              <div className="text-4xl font-bold text-slate-100 font-mono">{currentData.eui}</div>
            </div>
          </div>
          <div className="mt-6 w-full flex justify-between text-xs text-slate-500">
            <span>Target: {currentData.target}</span>
            <span>National Avg: {currentData.avg}</span>
          </div>
        </div>

        <div className="lg:col-span-2 bg-[#111827] rounded-xl border border-slate-800 p-6">
          <h3 className="text-sm font-medium text-slate-300 mb-4">Sub-System Compliance</h3>
          <div className="space-y-4">
            {currentData.checklist.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-[#172033] border border-slate-700/50">
                <div className="flex items-center space-x-4">
                  <div className={`w-2 h-2 rounded-full ${
                    item.status === 'Pass' ? 'bg-emerald-500' : 
                    item.status === 'Warning' ? 'bg-amber-500' : 'bg-rose-500'
                  }`}></div>
                  <div>
                    <div className="text-sm font-medium text-slate-200">{item.metric}</div>
                    <div className="text-xs text-slate-500">Requirement: {item.limit}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-mono text-slate-300">{item.value}</div>
                  <div className={`text-xs font-medium ${
                    item.status === 'Pass' ? 'text-emerald-400' : 
                    item.status === 'Warning' ? 'text-amber-400' : 'text-rose-400'
                  }`}>{item.status}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}