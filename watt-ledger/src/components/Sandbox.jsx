import React, { useState } from "react";

export default function Sandbox({ utilityRate, facility }) {
  const [coolingSetpoint, setCoolingSetpoint] = useState(72);
  const [chwSupply, setChwSupply] = useState(44);
  const [occupancy, setOccupancy] = useState(85);

  // Switch the base scale of the building based on the dropdown
  const baseLoad = facility === "tower_a" ? 850 : 1420;

  const simulatedLoad = Math.round(
    baseLoad 
    - ((coolingSetpoint - 72) * 15) 
    + ((44 - chwSupply) * 12)       
    + ((occupancy - 85) * 2)        
  );
  
  const kwDifference = simulatedLoad - baseLoad;
  const isSaving = kwDifference < 0;
  
  const hourlyImpact = Math.abs(kwDifference * utilityRate).toFixed(2);
  const annualImpact = Math.abs(kwDifference * utilityRate * 8760);

  return (
    <div className="p-6 space-y-6 max-w-7xl w-full mx-auto font-sans">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-100">What-If Sandbox</h2>
          <p className="text-sm text-slate-400 mt-1">Predictive load modeler for hypothetical setpoint adjustments.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#111827] rounded-xl border border-slate-800 p-6 space-y-8">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <label className="text-slate-300 font-medium">Global Cooling Setpoint</label>
              <span className="text-emerald-400 font-mono font-bold">{coolingSetpoint}°F</span>
            </div>
            <input 
              type="range" min="68" max="78" step="1" 
              value={coolingSetpoint} onChange={(e) => setCoolingSetpoint(Number(e.target.value))}
              className="w-full accent-emerald-500 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-slate-500 mt-2">
              <span>Aggressive Cooling (68°F)</span>
              <span>Energy Saving (78°F)</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-2">
              <label className="text-slate-300 font-medium">Chilled Water Supply Temp</label>
              <span className="text-emerald-400 font-mono font-bold">{chwSupply}°F</span>
            </div>
            <input 
              type="range" min="40" max="50" step="1" 
              value={chwSupply} onChange={(e) => setChwSupply(Number(e.target.value))}
              className="w-full accent-emerald-500 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-sm mb-2">
              <label className="text-slate-300 font-medium">Simulated Occupancy</label>
              <span className="text-emerald-400 font-mono font-bold">{occupancy}%</span>
            </div>
            <input 
              type="range" min="10" max="100" step="5" 
              value={occupancy} onChange={(e) => setOccupancy(Number(e.target.value))}
              className="w-full accent-emerald-500 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer"
            />
          </div>
          
          <button onClick={() => { setCoolingSetpoint(72); setChwSupply(44); setOccupancy(85); }} className="w-full bg-[#172033] border border-slate-700 hover:border-emerald-500 text-slate-200 py-3 rounded-lg text-sm font-medium transition-colors">
            Reset to Baseline Values
          </button>
        </div>

        <div className="bg-[#111827] rounded-xl border border-slate-800 p-6 flex flex-col justify-center">
          <h3 className="text-sm font-medium text-slate-400 mb-8 text-center uppercase tracking-widest">Simulated Plant Impact</h3>
          
          <div className="flex items-end justify-center space-x-8 mb-8">
            <div className="text-center">
              <div className="text-5xl font-bold font-mono text-slate-100">{simulatedLoad}</div>
              <div className="text-sm text-slate-500 mt-2">Simulated (kW)</div>
            </div>
            <div className="pb-2">
              <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold font-mono text-slate-500">{baseLoad}</div>
              <div className="text-sm text-slate-600 mt-2">Baseline (kW)</div>
            </div>
          </div>

          <div className="space-y-3">
            <div className={`p-4 rounded-lg border flex items-center justify-between ${isSaving ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-rose-500/10 border-rose-500/20'}`}>
              <span className={`font-medium ${isSaving ? 'text-emerald-400' : 'text-rose-400'}`}>
                {isSaving ? 'Projected Load Reduction' : 'Projected Load Penalty'}
              </span>
              <span className={`text-xl font-bold font-mono ${isSaving ? 'text-emerald-400' : 'text-rose-400'}`}>
                {kwDifference > 0 ? '+' : ''}{kwDifference} kW
              </span>
            </div>

            <div className={`p-4 rounded-lg border flex items-center justify-between ${isSaving ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-rose-500/10 border-rose-500/20'}`}>
              <div>
                <span className={`block font-medium ${isSaving ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {isSaving ? 'Estimated Financial Savings' : 'Estimated Financial Penalty'}
                </span>
                <span className="text-xs text-slate-500">Based on tariff: ₹{utilityRate.toFixed(2)}/kWh</span>
              </div>
              <div className="text-right">
                <span className={`block text-xl font-bold font-mono ${isSaving ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {isSaving ? '-' : '+'}₹{hourlyImpact} <span className="text-sm font-sans font-normal opacity-80">/hr</span>
                </span>
                <span className={`block text-xs font-mono mt-1 ${isSaving ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {isSaving ? '-' : '+'}₹{annualImpact.toLocaleString("en-IN", { maximumFractionDigits: 0 })} /yr
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}