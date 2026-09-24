export default function AuditReport({ content }) {
  if (!content) return null;

  return (
    <div className="p-8 text-sm text-slate-300 font-sans leading-relaxed report-markdown">
      {content.split("\n").map((line, i) => {
        if (line.startsWith("# ")) {
          return (
            <h1
              key={i}
              className="text-2xl font-black text-white mb-4 mt-2"
            >
              {line.replace("# ", "")}
            </h1>
          );
        }

        if (line.startsWith("### ")) {
          return (
            <h3
              key={i}
              className="text-lg font-bold text-emerald-400 mt-6 mb-3 border-b border-slate-800 pb-2"
            >
              {line.replace("### ", "")}
            </h3>
          );
        }

        if (line.startsWith("**")) {
          return (
            <p
              key={i}
              className="mb-2 font-medium text-slate-200"
              dangerouslySetInnerHTML={{
                __html: line.replace(
                  /\*\*(.*?)\*\*/g,
                  '<span class="text-emerald-300 font-bold">$1</span>'
                ),
              }}
            />
          );
        }

        if (line.startsWith("|")) {
          return (
            <div
              key={i}
              className="font-mono text-xs my-1 bg-slate-900 p-2 rounded"
            >
              {line}
            </div>
          );
        }

        if (line.trim() === "") {
          return <br key={i} />;
        }

        return (
          <p key={i} className="mb-3">
            {line}
          </p>
        );
      })}
    </div>
  );
}