import React, { useEffect, useState } from "react";
import { Trophy, Crown, Award, AlertTriangle, TrendingUp } from "lucide-react";
import { supabase } from "../utils/supabaseClient";

export default function Leaderboard({ facility }) {
  const [tenants, setTenants] = useState([]);

  useEffect(() => {
    async function fetchTenants() {
      const { data, error } = await supabase
        .from('tenants')
        .select('*')
        .eq('facility_id', facility);
      
      if (!error && data) {
        setTenants(data);
      }
    }
    fetchTenants();
  }, [facility]);

  const sortedTenants = [...tenants].sort((a, b) => b.score - a.score);

  return (
    <section className="p-6 space-y-6 max-w-7xl w-full mx-auto">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-extrabold text-white">
          <Trophy className="w-6 h-6 text-amber-400" />
          Tenant Leaderboard
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Compare tenant energy-efficiency performance and recognize the strongest conservation improvements.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-[#101725] p-5">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white">Energy Efficiency Rankings</h2>
            <p className="mt-1 text-xs text-slate-500">Higher scores indicate stronger modeled efficiency.</p>
          </div>
          <Trophy className="h-6 w-6 text-amber-400" />
        </div>

        <div className="space-y-3">
          {sortedTenants.map((tenant, index) => {
            const rank = index + 1;
            const RankIcon = rank === 1 ? Crown : rank === 2 ? Award : rank === 3 ? TrendingUp : Trophy;
            const scoreColor = tenant.score >= 85 ? "text-emerald-400" : tenant.score >= 60 ? "text-amber-400" : "text-rose-400";
            
            const badgeIcon = tenant.score >= 85 ? <Crown className="h-3.5 w-3.5" /> : tenant.score >= 60 ? <Award className="h-3.5 w-3.5" /> : <AlertTriangle className="h-3.5 w-3.5" />;

            return (
              <div key={tenant.id || tenant.name} className="flex flex-col gap-4 rounded-xl border border-slate-800 bg-slate-900/60 p-4 md:flex-row md:items-center">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800">
                    <RankIcon className="h-5 w-5 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">Rank #{rank}</p>
                    <h3 className="font-bold text-white">{tenant.name}</h3>
                    <p className="text-xs text-slate-500">{tenant.category || tenant.type || "Facility tenant"}</p>
                  </div>
                </div>

                <div className="flex-1">
                  <div className="mb-2 flex justify-between text-xs">
                    <span className="text-slate-400">Efficiency score</span>
                    <span className={`font-bold ${scoreColor}`}>{tenant.score}/100</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                    <div
                      className={`h-full rounded-full ${tenant.score >= 85 ? "bg-emerald-500" : tenant.score >= 60 ? "bg-amber-500" : "bg-rose-500"}`}
                      style={{ width: `${tenant.score}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 md:min-w-[150px] md:justify-end">
                  <span className="inline-flex items-center gap-1 rounded-full border border-slate-700 bg-slate-800 px-3 py-1 text-xs text-slate-300">
                    {badgeIcon}
                    {tenant.status || "Participant"}
                  </span>
                  <span className={`text-sm font-bold ${String(tenant.reduction || "").startsWith("-") ? "text-rose-400" : "text-emerald-400"}`}>
                    {tenant.reduction || ""}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}