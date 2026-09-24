import React from "react";

export default function ActionableROI({ onReview, onExport, facility }) {
  // Dynamically swap projects based on the active facility
  const dataSets = {
    tower_a: [
      { id: "ROI-01", name: "Chiller Plant Delta-T Optimization", type: "HVAC Control", capex: 680000, annualSavings: 1136000, payback: 7.1, status: "Ready for Approval" },
      { id: "ROI-02", name: "Floor 4 AHU-2 VFD Retrofit", type: "Mechanical", capex: 256000, annualSavings: 492000, payback: 6.2, status: "Ready for Approval" },
      { id: "ROI-03", name: "North Wing Lighting DR Module", type: "Lighting", capex: 148000, annualSavings: 192000, payback: 9.2, status: "In Review" },
      { id: "ROI-04", name: "Boiler O2 Trim Controls", type: "Heating", capex: 960000, annualSavings: 464000, payback: 24.8, status: "Deferred" }
    ],
    default: [
      { id: "ROI-05", name: "Cooling Tower Variable Speed Fans", type: "HVAC", capex: 420000, annualSavings: 850000, payback: 5.9, status: "Ready for Approval" },
      { id: "ROI-06", name: "Perimeter Heating Zone Valves", type: "Mechanical", capex: 115000, annualSavings: 180000, payback: 7.6, status: "In Review" },
      { id: "ROI-07", name: "Smart Parking Garage Lighting", type: "Lighting", capex: 320000, annualSavings: 410000, payback: 9.3, status: "Ready for Approval" },
      { id: "ROI-08", name: "Air Compressor Leak Repair", type: "Pneumatics", capex: 45000, annualSavings: 110000, payback: 4.9, status: "Deferred" }
    ]
  };

  // Fallback to 'default' if the specific facility ID isn't mapped
  const roiProjects = dataSets[facility] || dataSets.default;

  return (
    <div className="p-6 space-y-6 max-w-7xl w-full mx-auto font-sans">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-100">Actionable ROI Projects</h2>
          <p className="text-sm text-slate-400 mt-1">Automated CapEx pipeline based on telemetry anomalies.</p>
        </div>
        <button 
          onClick={onExport}
          className="bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold py-2 px-4 rounded transition-colors text-sm active:scale-95"
        >
          Export Business Case
        </button>
      </div>

      <div className="bg-[#111827] rounded-xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="text-xs uppercase bg-[#172033] text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-6 py-4 font-semibold">Project / Asset</th>
                <th className="px-6 py-4 font-semibold">Est. CapEx</th>
                <th className="px-6 py-4 font-semibold">Annual Savings</th>
                <th className="px-6 py-4 font-semibold">Payback (Months)</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {roiProjects.map((project) => (
                <tr key={project.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-200">{project.name}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{project.type} • {project.id}</div>
                  </td>
                  <td className="px-6 py-4 font-mono">₹{project.capex.toLocaleString("en-IN")}</td>
                  <td className="px-6 py-4 font-mono text-emerald-400">₹{project.annualSavings.toLocaleString("en-IN")}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <span className={`font-mono font-medium ${project.payback < 12 ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {project.payback}
                      </span>
                      <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${project.payback < 12 ? 'bg-emerald-500' : 'bg-amber-500'}`} 
                          style={{ width: `${Math.min(100, (12 / project.payback) * 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                      project.status === 'Ready for Approval' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                      project.status === 'In Review' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 
                      'bg-slate-800 text-slate-400 border-slate-700'
                    }`}>
                      {project.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => onReview && onReview(project)}
                      className="inline-flex items-center justify-end space-x-1 text-emerald-500 hover:text-emerald-400 text-sm font-medium transition-transform active:scale-95 whitespace-nowrap"
                    >
                      <span>Review</span>
                      <span>&gt;</span>
                    </button>
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