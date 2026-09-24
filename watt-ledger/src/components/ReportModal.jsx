import { FileText, Printer, XCircle } from "lucide-react";
import AuditReport from "./AuditReport";

export default function ReportModal({
  content,
  close: onClose,
}) {
  if (!content) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm print:hidden animate-in fade-in">
      <div className="bg-[#0f172a] border border-slate-700 w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl flex flex-col">
        <div className="p-4 border-b border-slate-800 flex justify-between items-center sticky top-0 bg-[#0f172a] z-10">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-400" />
            Generated Audit Report
          </h2>

          <button
            onClick={onClose}
            className="cursor-pointer"
          >
            <XCircle className="w-5 h-5 text-slate-400 hover:text-white transition-colors" />
          </button>
        </div>

        <AuditReport content={content} />

        <div className="p-4 border-t border-slate-800 bg-slate-900 flex justify-end sticky bottom-0 z-10">
          <button
            onClick={() => window.print()}
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-5 py-2.5 font-bold rounded-lg text-xs flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/20 transition-all"
          >
            <Printer className="w-4 h-4" />
            Print / Save PDF
          </button>
        </div>
      </div>
    </div>
  );
}