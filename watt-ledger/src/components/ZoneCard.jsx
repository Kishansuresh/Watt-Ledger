import { AlertTriangle } from "lucide-react";

export default function ZoneCard({ zone }) {
  const healthStyle =
    zone.healthScore > 80
      ? "bg-emerald-900/50 text-emerald-400 border-emerald-800"
      : zone.healthScore > 50
      ? "bg-amber-900/50 text-amber-400 border-amber-800"
      : "bg-rose-900/50 text-rose-400 border-rose-800";

  return (
    <div className="bg-[#101725] border border-slate-800 p-5 rounded-xl flex flex-col gap-4 hover:border-slate-600 transition">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-sm font-bold text-white">
            {zone.name}
          </h3>

          <div className="text-xs text-slate-400 mt-1">
            {zone.category} • {zone.floor}
          </div>
        </div>

        <div
          className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${healthStyle}`}
        >
          Health: {zone.healthScore}/100
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 bg-slate-900/50 p-3 rounded-lg border border-slate-800">
        <div className="flex flex-col">
          <span className="text-[10px] text-slate-500 uppercase">
            Current Draw
          </span>

          <span className="text-sm font-bold text-white">
            {zone.currentKw} kW
          </span>
        </div>

        <div className="flex flex-col">
          <span className="text-[10px] text-slate-500 uppercase">
            Expected
          </span>

          <span className="text-sm font-bold text-slate-400">
            {zone.baselineKw} kW
          </span>
        </div>

        <div className="flex flex-col">
          <span className="text-[10px] text-slate-500 uppercase">
            Delta Waste
          </span>

          <span
            className={`text-sm font-bold ${
              zone.wasteKw > 10
                ? "text-rose-400"
                : "text-emerald-400"
            }`}
          >
            +{zone.wasteKw} kW
          </span>
        </div>
      </div>

      {zone.issue && (
        <div className="flex items-center gap-2 text-xs text-amber-300/90 bg-amber-950/30 p-2 rounded border border-amber-900/50">
          <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{zone.issue}</span>
        </div>
      )}
    </div>
  );
}