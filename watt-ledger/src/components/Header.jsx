import {
  Bot,
  Clock,
  Printer,
  Sparkles,
} from "lucide-react";

export default function Header({
  facilityName,
  chatOpen,
  onToggleChat,
  onGenerateReport,
  isGeneratingAudit,
}) {
  return (
    <header className="h-16 border-b border-slate-800 px-6 flex items-center justify-between bg-[#0d131f]/80 backdrop-blur-md sticky top-0 z-30 print:hidden">
      <div className="flex items-center gap-4">
        <span className="font-semibold text-sm text-slate-200 bg-slate-800/80 px-2.5 py-1 rounded-md border border-slate-700/60">
          {facilityName}
        </span>

        <span className="text-xs text-slate-400 flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          Live Sync Active
        </span>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onToggleChat}
          className="flex items-center gap-2 bg-slate-800 text-emerald-400 border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer hover:bg-slate-700 transition shadow-lg"
        >
          <Bot className="w-4 h-4" />
          Ask Watt AI
        </button>

        <button
          onClick={onGenerateReport}
          disabled={isGeneratingAudit}
          className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-xs px-4 py-2 rounded-lg cursor-pointer hover:brightness-110 transition shadow-lg shadow-emerald-500/20 disabled:opacity-50"
        >
          {isGeneratingAudit ? (
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
          ) : (
            <Printer className="w-3.5 h-3.5" />
          )}

          {isGeneratingAudit
            ? "Analyzing..."
            : "Generate PDF Report"}
        </button>
      </div>
    </header>
  );
}