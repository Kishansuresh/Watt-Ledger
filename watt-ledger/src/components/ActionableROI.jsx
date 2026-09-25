import React, { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";

export default function ActionableROI({ onReview, onExport, utilityRate, facility }) {
  const [roiMeasures, setRoiMeasures] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchROI() {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('roi_measures')
        .select('*')
        .eq('facility_id', facility);

      if (!error && data) {
        setRoiMeasures(data);
      }
      setIsLoading(false);
    }
    fetchROI();
  }, [facility]);

  const roiProjects = roiMeasures.map(measure => {
    const annualSavings = measure.kw * measure.hours * utilityRate;
    const paybackMonths = annualSavings > 0 ? (measure.cost / annualSavings) * 12 : 0;
    
    return {
      id: measure.id,
      name: measure.name,
      type: measure.zone,
      capex: measure.cost,
      annualSavings: Math.round(annualSavings),
      payback: parseFloat(paybackMonths.toFixed(1)),
      status: paybackMonths < 12 ? "Ready for Approval" : "In Review"
    };
  });

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
                <th className="px-6 py-4 font-semibold whitespace-nowrap">Project / Asset</th>
                <th className="px-6 py-4 font-semibold whitespace-nowrap">Est. CapEx</th>
                <th className="px-6 py-4 font-semibold whitespace-nowrap">Annual Savings</th>
                <th className="px-6 py-4 font-semibold whitespace-nowrap">Payback (Months)</th>
                <th className="px-6 py-4 font-semibold whitespace-nowrap">Status</th>
                <th className="px-6 py-4 font-semibold text-right whitespace-nowrap">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-slate-500">Loading live data from Supabase...</td>
                </tr>
              ) : roiProjects.map((project) => (
                <tr key={project.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-200">{project.name}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{project.type}</div>
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
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border whitespace-nowrap ${
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