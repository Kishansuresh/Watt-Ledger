export default function Simulator({ trigger }) {
  return (
    <div className="p-6 space-y-6 max-w-7xl w-full mx-auto">

      <h1 className="text-2xl font-extrabold text-white">
        Interactive Simulator
      </h1>

      <p className="text-sm text-slate-400">
        Trigger simulated IoT events and observe Watt Ledger's
        anomaly detection response.
      </p>

      <div className="
        bg-[#101725]
        border
        border-slate-800
        rounded-xl
        p-6
      ">

        <button
          onClick={trigger}
          className="
            w-full
            bg-rose-600
            hover:bg-rose-500
            text-white
            font-bold
            py-4
            rounded-xl
            transition
          "
        >

          ⚡ Trigger Live 280 kW HVAC Excursion

        </button>

      </div>

    </div>
  );
}