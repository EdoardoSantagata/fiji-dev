import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white">
      <div className="max-w-5xl mx-auto px-6 py-20">
        <h1 className="text-4xl font-bold mb-4">
          Fiji Infrastructure Planning Tool
        </h1>
        <p className="text-lg text-slate-300 mb-12 max-w-2xl">
          Interactive map and logistics pricing tool for planning infrastructure
          upgrades across Fiji&apos;s communities — energy, water, telecom — overlaid
          with poverty and vulnerability data to prioritize investments.
        </p>

        <Link
          href="/map"
          className="inline-block px-6 py-3 bg-fiji-cyan text-slate-900 font-semibold rounded-lg hover:bg-fiji-cyan/90 transition-colors"
        >
          Open Planning Tool
        </Link>

        <div className="mt-12 grid md:grid-cols-2 gap-6">
          <div className="p-5 bg-slate-700/50 rounded-xl border border-slate-600">
            <h2 className="text-lg font-semibold mb-2">Infrastructure Map</h2>
            <p className="text-slate-400 text-sm">
              Toggle data layers — boundaries, settlements, energy grid,
              schools, health facilities, roads, telecom coverage, and poverty
              data at tikina level.
            </p>
          </div>
          <div className="p-5 bg-slate-700/50 rounded-xl border border-slate-600">
            <h2 className="text-lg font-semibold mb-2">
              Logistics &amp; Pricing
            </h2>
            <p className="text-slate-400 text-sm">
              Select a community, choose an intervention (SHS, mini-grid, grid
              extension), and get a cost estimate with road distance and
              transport costs.
            </p>
          </div>
        </div>

        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          {[
            { n: "15", label: "Provinces" },
            { n: "86", label: "Tikinas" },
            { n: "800+", label: "Settlements" },
            { n: "5,700+", label: "SHS Installed" },
          ].map((stat) => (
            <div key={stat.label} className="p-4">
              <div className="text-2xl font-bold text-fiji-cyan">{stat.n}</div>
              <div className="text-xs text-slate-400 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
