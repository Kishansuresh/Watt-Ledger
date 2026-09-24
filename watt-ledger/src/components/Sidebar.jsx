import { useRef } from "react";
import {
  Activity,
  Award,
  Bell,
  CloudSun,
  Map,
  Sliders,
  Upload,
  Zap,
} from "lucide-react";

export default function Sidebar({
  activeTab,
  setActiveTab,
  facility,
  setFacility,
  facilityOptions,
  soundEnabled,
  setSoundEnabled,
  utilityRate,
  setUtilityRate,
  onUploadCsv,
  csvSourceName,
  csvError,
}) {
  const fileInputRef = useRef(null);
  const navigation = [
    {
      id: "dashboard",
      icon: Activity,
      label: "Main Analytics",
    },
    {
      id: "heatmap",
      icon: Map,
      label: "Spatial Heatmap",
    },
    {
      id: "feed",
      icon: Bell,
      label: "Live Waste Feed",
    },
    {
      id: "leaderboard",
      icon: Award,
      label: "Performance Leaderboard",
    },
    {
      id: "weather",
      icon: CloudSun,
      label: "Weather Forecast",
    },
    {
      id: "simulator",
      icon: Sliders,
      label: "God Mode / Simulator",
    },
  ];

  return (
    <aside className="w-64 flex-shrink-0 bg-[#0d131f] border-r border-slate-800 flex flex-col justify-between print:hidden">
      <div>
        <div className="p-5 flex items-center gap-3 border-b border-slate-800/80">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-slate-950 font-bold">
            <Zap className="w-6 h-6 stroke-[2.5]" />
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg tracking-tight text-white">
                Watt Ledger
              </span>

              <span className="px-1.5 py-0.5 text-[10px] font-bold tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded">
                AI
              </span>
            </div>

            <p className="text-[11px] text-slate-400 font-medium">
              Commercial Energy Guardian
            </p>
          </div>
        </div>

        <nav className="p-3 space-y-1 text-xs">
          {navigation.map((nav) => (
            <button
              key={nav.id}
              onClick={() => setActiveTab(nav.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg font-medium transition-all cursor-pointer ${
                activeTab === nav.id
                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent"
              }`}
            >
              <nav.icon className="w-4 h-4" />
              <span>{nav.label}</span>
            </button>
          ))}
        </nav>

        <div className="px-4 py-3 mx-3 mt-2 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="text-[10px] font-semibold uppercase text-slate-400 mb-2">
            Facility Target
          </div>

          <select
            value={facility}
            onChange={(e) => setFacility(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 text-xs rounded-lg px-2.5 py-2 text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            {facilityOptions.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
        </div>

        <div className="px-4 py-3 mx-3 mt-2 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              onUploadCsv?.(file);
              e.target.value = "";
            }}
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center justify-center gap-2 bg-slate-950 border border-slate-700 hover:border-emerald-500 text-xs font-semibold text-slate-200 rounded-lg px-2.5 py-2 cursor-pointer transition"
          >
            <Upload className="w-3.5 h-3.5" />
            Upload Smart Meter CSV
          </button>

          {csvSourceName && (
            <p className="text-[10px] text-emerald-400 truncate">
              Loaded: {csvSourceName}
            </p>
          )}

          {csvError && (
            <p className="text-[10px] text-rose-400">
              {csvError}
            </p>
          )}

          <div className="flex items-center justify-between gap-2">
            <label className="text-[10px] font-semibold uppercase text-slate-400">
              Grid Tariff
            </label>

            <div className="flex items-center gap-1 text-xs text-slate-300">
              <span>₹</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={utilityRate}
                onChange={(e) =>
                  setUtilityRate(
                    Math.max(0, parseFloat(e.target.value) || 0)
                  )
                }
                className="w-16 bg-slate-950 border border-slate-700 rounded px-1.5 py-1 text-xs focus:outline-none focus:border-emerald-500"
              />
              <span>/kWh</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-slate-800 space-y-2.5">
        <div className="flex items-center justify-between px-1 text-xs text-slate-400">
          <span>Audio Alarms</span>

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`px-2 py-0.5 rounded text-[11px] font-mono cursor-pointer transition-colors ${
              soundEnabled
                ? "bg-emerald-950 text-emerald-300"
                : "bg-slate-800 text-slate-400"
            }`}
          >
            {soundEnabled ? "ENABLED" : "MUTED"}
          </button>
        </div>
      </div>
    </aside>
  );
}