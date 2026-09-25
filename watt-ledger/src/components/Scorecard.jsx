import React, { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";
import { ShieldCheck, Leaf, Wind, Award, Zap, Factory, AlertCircle } from "lucide-react";

export default function Scorecard({ facility }) {
  const [scoreData, setScoreData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);

  useEffect(() => {
    async function fetchScorecard() {
      setIsLoading(true);
      setFetchError(false);
      
      try {
        const { data, error } = await supabase
          .from("esg_scorecards")
          .select("*")
          .eq("facility_id", facility)
          .single();
          
        if (error) throw error;
        if (data) setScoreData(data);
      } catch (error) {
        console.error("Scorecard Fetch Error:", error);
        setFetchError(true);
      } finally {
        setIsLoading(false);
      }
    }

    fetchScorecard();
  }, [facility]);

  // We ALWAYS render the outer shell so you never get a blank screen
  return (
    <section className="p-6 space-y-6 max-w-7xl w-full mx-auto font-sans">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-extrabold text-white">
          <ShieldCheck className="w-6 h-6 text-emerald-400" />
          ESG & Compliance Scorecard
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Live environmental, social, and governance reporting metrics for corporate sustainability goals.
        </p>
      </div>

      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center border border-dashed border-slate-700 rounded-xl bg-slate-900/50">
          <div className="h-8 w-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <span className="text-slate-300 font-medium">Syncing ESG Metrics from Cloud...</span>
        </div>
      ) : fetchError || !scoreData ? (
        <div className="py-20 flex flex-col items-center justify-center border border-dashed border-rose-900/50 rounded-xl bg-rose-500/5">
          <AlertCircle className="w-10 h-10 text-rose-500 mb-4" />
          <span className="text-rose-400 font-medium text-lg">No ESG Data Found</span>
          <p className="text-slate-500 text-sm mt-2 max-w-md text-center">
            The Supabase database does not have a scorecard entry for this facility. 
            Ensure your SQL seed script ran successfully.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Energy Star Rating */}
          <div className="bg-[#111827] rounded-xl border border-slate-800 p-6 flex flex-col items-center text-center relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-12 bg-blue-500/5 rounded-bl-full transition-transform group-hover:scale-110"></div>
            <Award className="w-10 h-10 text-blue-400 mb-4 relative z-10" />
            <h3 className="text-slate-400 font-semibold text-sm uppercase tracking-wider mb-2 relative z-10">Energy Star Score</h3>
            <div className="text-5xl font-black text-slate-100 relative z-10">{scoreData.energy_star || 0}</div>
            <p className="text-xs text-slate-500 mt-4 relative z-10">Out of 100 benchmarked percentile</p>
          </div>

          {/* LEED Certification */}
          <div className="bg-[#111827] rounded-xl border border-slate-800 p-6 flex flex-col items-center text-center relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-12 bg-emerald-500/5 rounded-bl-full transition-transform group-hover:scale-110"></div>
            <Leaf className="w-10 h-10 text-emerald-400 mb-4 relative z-10" />
            <h3 className="text-slate-400 font-semibold text-sm uppercase tracking-wider mb-2 relative z-10">Green Building Status</h3>
            <div className="text-3xl font-black text-emerald-400 relative z-10 py-2">{scoreData.leed_level || "Pending"}</div>
            <p className="text-xs text-slate-500 mt-2 relative z-10">USGBC verified certification level</p>
          </div>

          {/* Indoor Air Quality */}
          <div className="bg-[#111827] rounded-xl border border-slate-800 p-6 flex flex-col items-center text-center relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-12 bg-teal-500/5 rounded-bl-full transition-transform group-hover:scale-110"></div>
            <Wind className="w-10 h-10 text-teal-400 mb-4 relative z-10" />
            <h3 className="text-slate-400 font-semibold text-sm uppercase tracking-wider mb-2 relative z-10">Indoor Air Quality</h3>
            <div className="text-5xl font-black text-slate-100 relative z-10">{scoreData.indoor_air_quality || 0}</div>
            <p className="text-xs text-slate-500 mt-4 relative z-10">Health index (CO₂, VOCs, Particulates)</p>
          </div>

          {/* Carbon Emissions */}
          <div className="bg-[#111827] rounded-xl border border-slate-800 p-6 flex flex-col items-center text-center relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-12 bg-rose-500/5 rounded-bl-full transition-transform group-hover:scale-110"></div>
            <Factory className="w-10 h-10 text-rose-400 mb-4 relative z-10" />
            <h3 className="text-slate-400 font-semibold text-sm uppercase tracking-wider mb-2 relative z-10">YTD Carbon Emissions</h3>
            <div className="text-5xl font-black text-slate-100 relative z-10">{scoreData.carbon_emissions ? scoreData.carbon_emissions.toLocaleString() : 0}</div>
            <p className="text-xs text-slate-500 mt-4 relative z-10">Metric tons of CO₂ equivalent (tCO₂e)</p>
          </div>

          {/* Renewable Offset */}
          <div className="bg-[#111827] rounded-xl border border-slate-800 p-6 flex flex-col items-center text-center relative overflow-hidden group lg:col-span-2">
            <div className="absolute top-0 right-0 p-16 bg-amber-500/5 rounded-bl-full transition-transform group-hover:scale-110"></div>
            <Zap className="w-10 h-10 text-amber-400 mb-4 relative z-10" />
            <h3 className="text-slate-400 font-semibold text-sm uppercase tracking-wider mb-2 relative z-10">Renewable Energy Offset</h3>
            <div className="w-full bg-slate-800 h-6 rounded-full mt-4 mb-2 overflow-hidden relative z-10">
              <div 
                className="bg-amber-500 h-full rounded-full flex items-center justify-center text-[10px] font-bold text-amber-950 transition-all duration-1000 ease-out"
                style={{ width: `${scoreData.renewable_pct || 0}%` }}
              >
                {scoreData.renewable_pct || 0}%
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-2 relative z-10">Percentage of total load offset by onsite solar and green grid purchasing</p>
          </div>
        </div>
      )}
    </section>
  );
}