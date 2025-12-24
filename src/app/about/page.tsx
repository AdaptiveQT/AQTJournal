import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'RetailBeastFX — Origin',
    description: 'From quantum dreams to mechanical discipline. The origin story of RetailBeastFX.',
};

export default function AboutPage() {
    return (
        <main className="min-h-screen bg-slate-950 text-white">
            <div className="max-w-[720px] mx-auto px-6 py-16 leading-relaxed">
                {/* Header */}
                <div className="mb-12 text-center">
                    <span className="text-4xl mb-4 block">🦁</span>
                    <h1 className="text-4xl font-bold tracking-tight mb-2">RetailBeastFX</h1>
                    <p className="text-slate-400 text-lg">From quantum dreams to mechanical discipline.</p>
                </div>

                {/* Origin Story - VERBATIM */}
                <article className="prose prose-invert prose-lg max-w-none">
                    <p className="text-xl leading-relaxed">
                        <strong className="text-white">RetailBeastFX</strong> began as a thought experiment about the impossible—then became a machine that enforces the possible.
                    </p>

                    <p>
                        The early fantasy (Quantum Oracle Arb) defined a North Star and was deliberately killed. What survived was a ruthless reduction to a single mechanical gate: <strong className="text-emerald-400">the Trinity</strong>, enforced only during <strong className="text-cyan-400">London (02:00–05:00 ET)</strong> and <strong className="text-orange-400">New York (08:00–11:00 ET)</strong>.
                    </p>

                    <p>In late 2025, flexibility was identified as the enemy. The system hardened:</p>

                    <ul className="space-y-2">
                        <li className="flex items-center gap-2">
                            <span className="text-red-400">•</span>
                            <span><strong>BB locked to 20 / 1.0</strong></span>
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="text-red-400">•</span>
                            <span>Indicators demoted to <strong>validators</strong></span>
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="text-red-400">•</span>
                            <span>Alerts reframed as <strong>compliance events</strong></span>
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="text-red-400">•</span>
                            <span>Outcomes ignored; <strong>violations punished</strong></span>
                        </li>
                    </ul>

                    <p className="text-slate-300 border-l-4 border-red-500/50 pl-4 italic">
                        The devil robot mascot emerged as the enforcer—ruthless, emotionless, watching every violation.
                    </p>

                    <p>This is not a strategy. It&apos;s a contract.</p>

                    <hr className="border-slate-700 my-8" />

                    <p className="text-2xl font-bold text-center text-white">
                        No setup. No shot. No cope.
                    </p>

                    {/* Scope & Boundaries */}
                    <div className="mt-12 p-6 bg-red-900/20 border border-red-500/30 rounded-lg">
                        <h3 className="text-red-400 font-bold text-sm uppercase tracking-wide mb-4">
                            ⚠️ Scope &amp; Boundaries
                        </h3>
                        <div className="space-y-3 text-sm text-slate-300">
                            <p>
                                <strong className="text-white">RetailBeastFX — The System</strong> is designed and tested only for <strong className="text-emerald-400">FX majors</strong> and <strong className="text-amber-400">Gold (XAUUSD)</strong>.
                            </p>
                            <p>
                                It relies on the dual-session liquidity collision between <strong className="text-cyan-400">London (02:00–05:00 ET)</strong> and <strong className="text-orange-400">New York (08:00–11:00 ET)</strong> killzones.
                            </p>
                            <p className="text-red-400 font-medium">
                                Indices, stocks, crypto, and all other assets are <strong>outside the system</strong>.
                            </p>
                            <p className="text-slate-500 text-xs mt-4">
                                No modes. No presets. No exceptions. No &quot;try it anyway&quot; guidance.
                            </p>
                        </div>
                    </div>
                </article>

                {/* Minimal Footer */}
                <footer className="mt-16 pt-8 border-t border-slate-800 text-center text-sm text-slate-500">
                    <p className="italic text-slate-400 mb-2">&quot;The System judges compliance, not profit.&quot;</p>
                    <p>© 2025 RetailBeastFX. The System.</p>
                </footer>
            </div>
        </main>
    );
}
