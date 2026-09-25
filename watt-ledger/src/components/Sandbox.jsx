import React, { useState } from "react";
import { Calculator, Sliders, Zap, Leaf, ArrowRight } from "lucide-react";

export default function Sandbox({ facility, utilityRate }) {
  // Interactive Simulation States
  const [hvacSetback, setHvacSetback] = useState(4); // Hours per day
  const [vfdOptimization, setVfdOptimization] = useState(15); // Percentage
  const [simulatedTariff, setSimulatedTariff] = useState(utilityRate);

  // Facility baselines for the mathematical model
  const facilityStats = {
    tower_a: { name: "Metro Tower A", baseKw: 450, hvacPct: 0.55 },
    retail_mall: { name: "Retail Mall Zone 3", baseKw: 780, hvacPct: 0.65 },
    corporate_hq: { name: "Corporate HQ", baseKw: 620, hvacPct: 0.50 }
  };

  const stats = facilityStats[facility] || facilityStats.tower_a;
  
  // Current Run-Rates
  const baselineAnnualKwh = stats.baseKw * 8760;
  const baselineAnnualCost = baselineAnnualKwh * utilityRate;

  // Mathematical Simulation Math
  const setbackKwhSaved = (stats.baseKw * stats.hvacPct * 0.30) * (hvacSetback * 365);
  const vfdKwhSaved = (stats.baseKw * stats.hvacPct) * (vfdOptimization / 100) * 8760;
  
  const totalKwhSaved = setbackKwhSaved + vfdKwhSaved;
  const newAnnualKwh = baselineAnnualKwh - totalKwhSaved;
  const newAnnualCost = newAnnualKwh * simulatedTariff;
  
  const annualFinancialSavings = baselineAnnualCost - newAnnualCost;
  const co2Avoided = ((totalKwhSaved * 0.85) / 2204.62).toFixed(1);

  return (
    <section className="p-6 space-y-6 max-w-7xl w-full mx-auto font-sans">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-extrabold text-white">
          <Calculator className="w-6 h-6 text-emerald-400" />
          What-If Sandbox
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Simulate the financial and environmental impact of operational changes at <strong className="text-slate-200">{stats.name}</strong>.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* CONTROLS PANEL */}
        <div className="lg:col-span-1 bg-[#111827] rounded-xl border border-slate-800 p-6 space-y-8">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-4">
            <Sliders className="w-5 h-5 text-emerald-500" />
            <h2 className="text-lg font-bold text-white">Simulation Variables</h2>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <label className="text-slate-300 font-medium">Night Setback Schedule</label>
              <span className="text-emerald-400 font-mono">{hvacSetback} hrs/day</span>
            </div>
            <input 
              type="range" 
              min="0" max="12" step="1"
              value={hvacSetback}
              onChange={(e) => setHvacSetback(Number(e.target.value))}
              className="w-full accent-emerald-500"
            />
            <p className="text-xs text-slate-500">Power down non-critical HVAC zones.</p>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <label className="text-slate-300 font-medium">VFD Retrofit Efficiency</label>
              <span className="text-emerald-400 font-mono">{vfdOptimization}%</span>
            </div>
            <input 
              type="range" 
              min="0" max="40" step="1"
              value={vfdOptimization}
              onChange={(e) => setVfdOptimization(Number(e.target.value))}
              className="w-full accent-emerald-500"
            />
            <p className="text-xs text-slate-500">Optimize fan and pump motor loads.</p>
          </div>

          <div className="space-y-3 pt-4 border-t border-slate-800">
            <div className="flex justify-between text-sm">
              <label className="text-slate-300 font-medium">Simulated Grid Tariff</label>
              <span className="text-amber-400 font-mono">₹{simulatedTariff.toFixed(2)} /kWh</span>
            </div>
            <input 
              type="range" 
              min="2.00" max="15.00" step="0.25"
              value={simulatedTariff}
              onChange={(e) => setSimulatedTariff(Number(e.target.value))}
              className="w-full accent-amber-500"
            />
            <p className="text-xs text-slate-500">Stress-test ROI against rising utility rates.</p>
          </div>
        </div>

        {/* RESULTS PANEL */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#111827] rounded-xl border border-slate-800 p-6 flex flex-col justify-center min-h-[200px] relative overflow-hidden">
            <div className="absolute top-0 right-0 p-16 bg-emerald-500/5 rounded-bl-full -z-0"></div>
            <div className="relative z-10 text-center space-y-2">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Projected Annual Savings</h3>
              <div className={`text-6xl font-black ${annualFinancialSavings >= 0 ? 'text-emerald-400' : 'text-rose-500'}`}>
                {annualFinancialSavings >= 0 ? '+' : '-'}₹{Math.abs(Math.round(annualFinancialSavings)).toLocaleString('en-IN')}
              </div>
              <p className="text-sm text-slate-500 font-medium mt-2">
                Based on modeled consumption vs baseline variables
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-[#172033] rounded-xl border border-slate-700/50 p-5 flex items-start gap-4">
              <div className="p-3 bg-blue-500/10 rounded-lg text-blue-400">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium uppercase mb-1">New Load Profile</p>
                <div className="text-xl font-bold text-slate-200">{Math.round(newAnnualKwh).toLocaleString('en-IN')} kWh</div>
                <div className="text-xs text-emerald-400 mt-1">Reduced by {Math.round(totalKwhSaved).toLocaleString('en-IN')} kWh</div>
              </div>
            </div>

            <div className="bg-[#172033] rounded-xl border border-slate-700/50 p-5 flex items-start gap-4">
              <div className="p-3 bg-emerald-500/10 rounded-lg text-emerald-400">
                <Leaf className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium uppercase mb-1">Carbon Impact</p>
                <div className="text-xl font-bold text-slate-200">{co2Avoided} Tons</div>
                <div className="text-xs text-emerald-400 mt-1">CO₂ emissions avoided annually</div>
              </div>
            </div>
          </div>
          
          <div className="bg-slate-800/40 border border-slate-700 rounded-lg p-4 flex items-center justify-between">
             <span className="text-sm text-slate-300">Ready to present this business case?</span>
             <button className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 px-4 py-2 rounded font-bold text-sm transition-colors active:scale-95">
                Generate PDF Proposal <ArrowRight className="w-4 h-4" />
             </button>
          </div>

        </div>
      </div>
    </section>
  );
}