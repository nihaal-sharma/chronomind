import { useState, useCallback, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import * as d3 from 'd3';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import Footer from '../components/layout/Footer';
import ShaderBackground from '../components/shared/ShaderBackground';
import { useSidebar } from '../hooks/useSidebar';
import { api } from '../services/api';
import type { ComparisonResponse, ComparisonAxis } from '../types';

function RadarChart({ data, size = 400 }: { data: ComparisonAxis[]; size?: number }) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !data.length) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const center = size / 2;
    const maxRadius = size / 2 - 40;
    const levels = 4;
    const angleSlice = (2 * Math.PI) / data.length;

    const g = svg.append('g').attr('transform', `translate(${center},${center})`);

    // Grid circles
    for (let i = 1; i <= levels; i++) {
      g.append('circle')
        .attr('r', (maxRadius / levels) * i)
        .style('fill', 'none')
        .style('stroke', 'rgba(239, 255, 227, 0.1)')
        .style('stroke-width', 1);
    }

    // Axis lines + labels
    data.forEach((d, i) => {
      const angle = angleSlice * i - Math.PI / 2;
      const x = Math.cos(angle) * maxRadius;
      const y = Math.sin(angle) * maxRadius;

      g.append('line')
        .attr('x1', 0).attr('y1', 0)
        .attr('x2', x).attr('y2', y)
        .style('stroke', 'rgba(239, 255, 227, 0.1)')
        .style('stroke-width', 1);

      const labelX = Math.cos(angle) * (maxRadius + 25);
      const labelY = Math.sin(angle) * (maxRadius + 25);

      g.append('text')
        .attr('x', labelX).attr('y', labelY)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .style('fill', '#efffe3')
        .style('font-size', '10px')
        .style('font-family', 'Space Grotesk')
        .text(d.axis.toUpperCase());
    });

    // Path A (Emerald)
    const pathA = data.map((d, i) => {
      const angle = angleSlice * i - Math.PI / 2;
      const r = (d.score_a / 100) * maxRadius;
      return [Math.cos(angle) * r, Math.sin(angle) * r];
    });
    pathA.push(pathA[0]);

    g.append('polygon')
      .attr('points', pathA.map((p) => p.join(',')).join(' '))
      .style('fill', 'rgba(37, 165, 90, 0.15)')
      .style('stroke', '#25a55a')
      .style('stroke-width', 2);

    // Path B (Gold)
    const pathB = data.map((d, i) => {
      const angle = angleSlice * i - Math.PI / 2;
      const r = (d.score_b / 100) * maxRadius;
      return [Math.cos(angle) * r, Math.sin(angle) * r];
    });
    pathB.push(pathB[0]);

    g.append('polygon')
      .attr('points', pathB.map((p) => p.join(',')).join(' '))
      .style('fill', 'rgba(255, 224, 136, 0.15)')
      .style('stroke', '#ffe088')
      .style('stroke-width', 2);

  }, [data, size]);

  return <svg ref={svgRef} width={size} height={size} className="drop-shadow-[0_0_20px_rgba(57,255,20,0.1)]" />;
}

export default function FutureComparison() {
  const { isMinimized } = useSidebar();
  const [decisionA, setDecisionA] = useState('AI');
  const [decisionB, setDecisionB] = useState('Cybersecurity');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ComparisonResponse | null>(null);

  const handleCompare = useCallback(async () => {
    if (!decisionA || !decisionB) return;
    setLoading(true);
    try {
      const res = await api.compare(decisionA, decisionB);
      setResult(res);
    } catch (err) {
      console.error('Comparison error:', err);
      // Demo fallback
      setResult({
        decision_a: {
          name: decisionA, label: 'AI Engineering', icon: 'neurology',
          summary: 'High neural convergence required. Risk level: Sub-optimal due to rapid automation cycles.',
          scores: { opportunity: 94, demand: 92, growth: 95, risk: 35, stability: 65, income: 92 },
          total_score: 309,
        },
        decision_b: {
          name: decisionB, label: 'Cybersecurity', icon: 'security',
          summary: 'High stability corridor. Sustained relevance across 20-year projection cycle.',
          scores: { opportunity: 88, demand: 90, growth: 78, risk: 15, stability: 95, income: 85 },
          total_score: 321,
        },
        radar_data: [
          { axis: 'Opportunity', score_a: 94, score_b: 88 },
          { axis: 'Demand', score_a: 92, score_b: 90 },
          { axis: 'Growth', score_a: 95, score_b: 78 },
          { axis: 'Risk', score_a: 35, score_b: 15 },
          { axis: 'Stability', score_a: 65, score_b: 95 },
          { axis: 'Income', score_a: 92, score_b: 85 },
        ],
        recommendation: 'AI Engineering shows higher growth potential, while Cybersecurity offers superior stability.',
        explanation: 'Analysis compares AI Engineering (Vector A) against Cybersecurity (Vector B) across 6 neural evaluation axes.',
      });
    } finally {
      setLoading(false);
    }
  }, [decisionA, decisionB]);

  useEffect(() => {
    handleCompare();
  }, []);

  return (
    <div className="h-screen w-screen overflow-hidden bg-surface">
      <ShaderBackground />
      <Navbar />
      <Sidebar />
      <Footer />

      <main className={`fixed top-16 right-0 bottom-0 overflow-y-auto pb-20 px-6 md:px-16 transition-all duration-300 ${isMinimized ? 'left-0 md:left-20' : 'left-0 md:left-64'}`}>
        {/* Header */}
        <section className="py-12 flex flex-col items-center text-center">
          <h1 className="font-display text-5xl text-primary mb-2">Future Comparison Engine</h1>
          <p className="font-data text-sm text-on-surface-variant max-w-2xl">
            Visualizing divergent probability streams for neural path allocation.
          </p>
        </section>

        {/* Input */}
        <div className="glass-panel max-w-4xl mx-auto p-4 rounded-xl flex items-center justify-between gap-4 mb-16 border border-primary/20 shadow-[0_0_30px_rgba(57,255,20,0.05)]">
          <div className="flex-1 flex items-center gap-3 pl-2">
            <span className="material-symbols-outlined text-secondary">alt_route</span>
            <input
              value={decisionA}
              onChange={(e) => setDecisionA(e.target.value)}
              className="bg-transparent border-b border-secondary/30 focus:border-secondary py-2 font-tech text-lg outline-none text-primary w-full transition-colors placeholder:text-secondary/30"
              placeholder="Enter Path Alpha"
            />
          </div>
          <div className="flex items-center gap-2 px-4">
            <div className="h-px w-4 md:w-8 bg-gradient-to-r from-transparent to-primary/50" />
            <span className="text-label text-primary/60 tracking-widest">VS</span>
            <div className="h-px w-4 md:w-8 bg-gradient-to-l from-transparent to-primary/50" />
          </div>
          <div className="flex-1 flex items-center gap-3 pr-2">
            <input
              value={decisionB}
              onChange={(e) => setDecisionB(e.target.value)}
              className="bg-transparent border-b border-tertiary-dim/30 focus:border-tertiary-dim py-2 font-tech text-lg outline-none text-tertiary-dim w-full text-right transition-colors placeholder:text-tertiary-dim/30"
              placeholder="Enter Path Beta"
            />
            <span className="material-symbols-outlined text-tertiary-dim">alt_route</span>
          </div>
          <button
            onClick={handleCompare}
            disabled={loading}
            className="ml-4 bg-primary/10 border border-primary/40 hover:bg-primary/20 text-primary px-8 py-3 font-tech text-sm rounded-lg transition-all disabled:opacity-50 cursor-pointer flex items-center gap-2 shadow-[0_0_15px_rgba(57,255,20,0.2)]"
          >
            {loading ? <span className="material-symbols-outlined animate-spin text-sm">sync</span> : <span className="material-symbols-outlined text-sm">compare_arrows</span>}
            <span className="hidden md:inline">{loading ? 'ANALYZING' : 'INITIATE'}</span>
          </button>
        </div>

        {result && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {/* Comparison Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
              {/* Path A */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="lg:col-span-4 glass-panel glow-border-emerald p-8 rounded-xl flex flex-col gap-6 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 rounded-full blur-3xl pointer-events-none" />
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-label text-secondary block mb-1">VECTOR A</span>
                    <h2 className="font-tech text-2xl text-primary font-bold">{result.decision_a.label}</h2>
                  </div>
                  <span className="material-symbols-outlined text-secondary text-3xl">{result.decision_a.icon}</span>
                </div>
                <div className="space-y-4">
                  {Object.entries(result.decision_a.scores).map(([key, value]) => (
                    <div key={key}>
                      <div className="flex justify-between items-center group">
                        <span className="text-label text-on-surface-variant group-hover:text-primary transition-colors">{key}</span>
                        <span className="font-data text-primary">{key === 'risk' ? `${value}` : `${value}%`}</span>
                      </div>
                      {key !== 'risk' && (
                        <div className="h-[2px] bg-surface-variant w-full overflow-hidden mt-1">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${value}%` }}
                            transition={{ duration: 1, ease: 'easeOut' }}
                            className="h-full bg-secondary"
                            style={{ boxShadow: '0 0 10px #25a55a' }}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div className="pt-4 border-t border-primary/10">
                  <p className="text-sm text-on-surface-variant italic">&ldquo;{result.decision_a.summary}&rdquo;</p>
                </div>
              </motion.div>

            {/* Radar Chart */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="lg:col-span-4 glass-panel border border-primary-container/20 rounded-xl flex flex-col items-center justify-center p-8 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(57,255,20,0.05)_0%,transparent_70%)] pointer-events-none" />
              <h3 className="text-label text-primary tracking-widest mb-6 uppercase">Multi-Dimensional Analysis</h3>
              <RadarChart data={result.radar_data} size={320} />
              <div className="mt-8 flex gap-8 w-full justify-center border-t border-primary/10 pt-6">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-secondary rounded-full shadow-[0_0_8px_#25a55a]" />
                  <span className="text-label text-on-surface-variant text-xs">Path Alpha</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-tertiary-fixed rounded-full shadow-[0_0_8px_#ffe088]" />
                  <span className="text-label text-on-surface-variant text-xs">Path Beta</span>
                </div>
              </div>
            </motion.div>

            {/* Path B */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
              className="lg:col-span-4 glass-panel glow-border-gold p-8 rounded-xl flex flex-col gap-6 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-32 h-32 bg-tertiary-dim/5 rounded-full blur-3xl pointer-events-none" />
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-label text-tertiary-dim block mb-1">VECTOR B</span>
                  <h2 className="font-tech text-2xl text-primary font-bold">{result.decision_b.label}</h2>
                </div>
                <span className="material-symbols-outlined text-tertiary-dim text-3xl">{result.decision_b.icon}</span>
              </div>
              <div className="space-y-4">
                {Object.entries(result.decision_b.scores).map(([key, value]) => (
                  <div key={key}>
                    <div className="flex justify-between items-center group">
                      <span className="text-label text-on-surface-variant group-hover:text-primary transition-colors">{key}</span>
                      <span className="font-data text-primary">{key === 'risk' ? `${value}` : `${value}%`}</span>
                    </div>
                    {key !== 'risk' && (
                      <div className="h-[2px] bg-surface-variant w-full overflow-hidden mt-1">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${value}%` }}
                          transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
                          className="h-full bg-tertiary-dim"
                          style={{ boxShadow: '0 0 10px #ffe088' }}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="pt-4 border-t border-primary/10">
                <p className="text-sm text-on-surface-variant italic">&ldquo;{result.decision_b.summary}&rdquo;</p>
              </div>
            </motion.div>
          </div>

            {/* Explainability Engine */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-16 glass-panel p-8 rounded-xl overflow-hidden"
        >
          <div className="flex items-center gap-4 mb-8">
            <span className="material-symbols-outlined text-primary text-4xl animate-pulse">query_stats</span>
            <div>
              <h3 className="font-tech text-2xl text-primary font-bold uppercase">Explainability Engine</h3>
              <p className="text-label text-on-surface-variant">Trace: Activated Neural Nodes → Outcome Manifestation</p>
            </div>
          </div>

          <div className="relative h-48 w-full bg-surface-lowest/50 rounded-lg flex items-center justify-between px-12 overflow-hidden border border-primary/10">
            {/* Data Flow Visualization */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              <path id="path1" d="M110,96 C200,96 200,48 400,48" fill="none" stroke="rgba(37,165,90,0.2)" strokeWidth="2" />
              <path id="path2" d="M110,96 C200,96 200,150 400,150" fill="none" stroke="rgba(255,249,243,0.1)" strokeWidth="2" />
              <path d="M110,96 C200,96 200,48 400,48" fill="none" stroke="#39ff14" strokeWidth="2" className="data-pulse-line" />

              {/* Animated Data Packets */}
              <circle r="4" fill="#39ff14" filter="drop-shadow(0 0 4px #39ff14)">
                <animateMotion dur="3s" repeatCount="indefinite" path="M110,96 C200,96 200,48 400,48" />
              </circle>
              <circle r="4" fill="#ffe088" filter="drop-shadow(0 0 4px #ffe088)">
                <animateMotion dur="4s" repeatCount="indefinite" path="M110,96 C200,96 200,150 400,150" />
              </circle>
            </svg>

            <div className="relative z-10 flex flex-col items-center gap-2">
              <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary flex items-center justify-center glow-emerald">
                <span className="material-symbols-outlined text-primary">memory</span>
              </div>
              <span className="text-label text-primary">INPUT</span>
            </div>

            <div className="flex flex-col gap-8 relative z-10">
              <div className="glass-panel px-4 py-2 rounded border border-primary/20 bg-surface/80">
                <p className="font-data text-[10px] text-primary">PROCESSING_VECTOR_ALPHA</p>
              </div>
              <div className="glass-panel px-4 py-2 rounded border border-on-surface-variant/20 bg-surface/80">
                <p className="font-data text-[10px] text-on-surface-variant">ANALYZING_STABILITY_VECTORS</p>
              </div>
            </div>

            <div className="flex flex-col gap-12 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full border border-secondary flex items-center justify-center bg-secondary/10">
                  <span className="material-symbols-outlined text-secondary text-sm">trending_up</span>
                </div>
                <div>
                  <p className="text-label text-[10px] text-secondary">PROJECTED</p>
                  <p className="font-tech text-lg text-primary font-bold">$210K+</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full border border-on-surface-variant flex items-center justify-center bg-surface-variant/20">
                  <span className="material-symbols-outlined text-on-surface-variant text-sm">lock</span>
                </div>
                <div>
                  <p className="text-label text-[10px] text-on-surface-variant">SECURITY</p>
                  <p className="font-tech text-lg text-primary font-bold">ULTRA-STABLE</p>
                </div>
              </div>
            </div>
          </div>

          <p className="mt-6 text-sm text-on-surface-variant">{result.explanation}</p>
          <p className="mt-2 text-sm text-primary font-data">{result.recommendation}</p>
        </motion.section>
      </motion.div>
        )}
    </main>
    </div >
  );
}
