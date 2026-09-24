import {
  Bot,
  XCircle,
  Sparkles,
  Send,
} from "lucide-react";

export default function AIChat({
  messages,
  input,
  setInput,
  send,
  thinking,
  close,
  chatEndRef,
}) {

  return (

    <aside className="
      fixed
      bottom-4
      right-4
      z-40
      w-96
      h-[500px]
      bg-[#0d131f]
      border
      border-slate-700
      rounded-2xl
      shadow-2xl
      flex
      flex-col
    ">


      {/* HEADER */}

      <div className="
        p-3
        border-b
        border-slate-800
        flex
        items-center
        justify-between
      ">

        <h3 className="
          font-bold
          text-xs
          text-white
          flex
          items-center
          gap-2
        ">

          <Bot className="
            w-4
            h-4
            text-emerald-400
          "/>

          Watt AI Facility Analyst

        </h3>


        <button
          onClick={close}
          className="
            text-slate-400
            hover:text-white
          "
        >

          <XCircle className="
            w-4
            h-4
          "/>

        </button>

      </div>


      {/* MESSAGES */}

      <div className="
        flex-1
        p-4
        overflow-y-auto
        space-y-4
        bg-[#0d131f]
      ">

        {messages.map((message) => (

          <div
            key={message.id}
            className={`
              flex
              ${
                message.sender === "user"
                  ? "justify-end"
                  : "justify-start"
              }
            `}
          >

            <div className={`
              text-xs
              p-3
              rounded-lg
              max-w-[85%]
              leading-relaxed
              ${
                message.sender === "user"
                  ? "bg-emerald-600 text-white rounded-br-none"
                  : "bg-slate-800 text-slate-200 rounded-bl-none"
              }
            `}>

              {message.text}

            </div>

          </div>

        ))}


        {thinking && (

          <div className="
            flex
            items-center
            gap-2
            text-xs
            text-emerald-400
            animate-pulse
            bg-slate-800/50
            w-fit
            p-2
            rounded-lg
          ">

            <Sparkles className="
              w-3
              h-3
            "/>

            Watt AI is analyzing telemetry...

          </div>

        )}


        <div ref={chatEndRef} />

      </div>


      {/* INPUT */}

      <div className="
        p-3
        bg-slate-900
        border-t
        border-slate-800
        rounded-b-2xl
      ">


        {/* QUICK ACTIONS */}

        <div className="
          flex
          gap-2
          overflow-x-auto
          pb-2
        ">

          <button
            onClick={() =>
              send(
                "Calculate payback for VFD retrofit on AHU-2."
              )
            }
            className="
              whitespace-nowrap
              text-[10px]
              bg-slate-800
              border
              border-slate-700
              px-2
              py-1
              rounded
              text-slate-300
              hover:bg-slate-700
            "
          >

            VFD Payback?

          </button>


          <button
            onClick={() =>
              send(
                "Draft an email to Floor 4 about off-hours usage."
              )
            }
            className="
              whitespace-nowrap
              text-[10px]
              bg-slate-800
              border
              border-slate-700
              px-2
              py-1
              rounded
              text-slate-300
              hover:bg-slate-700
            "
          >

            Tenant Email

          </button>

        </div>


        <div className="
          flex
          gap-2
        ">

          <input
            value={input}
            onChange={(event) =>
              setInput(
                event.target.value
              )
            }
            onKeyDown={(event) => {

              if (
                event.key === "Enter"
              ) {

                send();

              }

            }}
            className="
              flex-1
              bg-slate-950
              border
              border-slate-700
              rounded-lg
              p-2.5
              text-xs
              text-white
              focus:outline-none
              focus:border-emerald-500
            "
            placeholder="Ask about energy anomalies..."
          />


          <button
            onClick={() => send()}
            className="
              bg-emerald-500
              hover:bg-emerald-400
              text-slate-950
              p-2.5
              rounded-lg
              transition
            "
          >

            <Send className="
              w-4
              h-4
            "/>

          </button>

        </div>

      </div>

    </aside>

  );

}