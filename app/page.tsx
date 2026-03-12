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

        <div className="grid md:grid-cols-2 gap-6">
          <Link
            href="/map"
            className="block p-6 bg-slate-700/50 rounded-xl border border-slate-600 hover:border-fiji-cyan transition-colors"
          >
            <h2 className="text-xl font-semibold mb-2">Interactive Map</h2>
            <p className="text-slate-400 text-sm">
              Explore infrastructure layers — boundaries, settlements, energy
              grid, schools, health facilities, roads, telecom coverage, and
              poverty data at tikina level.
            </p>
          </Link>

          <Link
            href="/pricing"
            className="block p-6 bg-slate-700/50 rounded-xl border border-slate-600 hover:border-fiji-cyan transition-colors"
          >
            <h2 className="text-xl font-semibold mb-2">
              Logistics &amp; Pricing
            </h2>
            <p className="text-slate-400 text-sm">
              Estimate delivery and installation costs for SHS, mini-grids, and
              grid extensions. Calculate road/sea distances and transport costs
              to remote communities.
            </p>
          </Link>
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
