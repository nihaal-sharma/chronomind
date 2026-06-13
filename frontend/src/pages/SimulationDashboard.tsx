import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ReactFlow,
  Background,
  Controls,
  type Node,
  type Edge,
  useNodesState,
  useEdgesState,
} from '@xyflow/react';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import Footer from '../components/layout/Footer';
import ShaderBackground from '../components/shared/ShaderBackground';
import { useSidebar } from '../hooks/useSidebar';
import { api } from '../services/api';
import type { SimulationResponse, FutureNode } from '../types';

const nodeStyle = (color: string, glow: string) => ({
  background: 'rgba(19,19,19,0.8)',
  backdropFilter: 'blur(20px)',
  border: `1px solid ${color}`,
  borderRadius: '12px',
  padding: '16px',
  boxShadow: `0 0 20px ${glow}`,
  color: '#efffe3',
  minWidth: 200,
});

function buildFlowNodes(result: SimulationResponse): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  // Root node
  nodes.push({
    id: 'root',
    position: { x: 100, y: 300 },
    data: {
      label: (
        <div style={nodeStyle('#39ff14', 'rgba(57,255,20,0.3)')}>
          <div className="flex justify-between items-start mb-2">
            <span className="text-label text-[10px] text-primary px-2 py-0.5 border border-primary/30 rounded">ROOT NODE</span>
            <span className="material-symbols-outlined text-primary text-sm">emergency</span>
          </div>
          <h4 className="font-tech text-primary text-lg font-bold">Current State</h4>
          <p className="text-xs text-on-surface-variant mt-1">Temporal Coordinates: 2024</p>
          <div className="mt-3 h-1 bg-surface-highest rounded-full overflow-hidden">
            <div className="w-full h-full bg-primary animate-pulse" />
          </div>
        </div>
      ),
    },
    type: 'default',
  });

  // Decision branches
  const tree = result.timeline_tree;
  tree.children?.forEach((branch, bi) => {
    const branchX = 400;
    const branchY = 100 + bi * 250;

    nodes.push({
      id: branch.id,
      position: { x: branchX, y: branchY },
      data: {
        label: (
          <div style={nodeStyle('#25a55a', 'rgba(37,165,90,0.2)')}>
            <div className="text-label text-[10px] text-secondary mb-1">DECISION</div>
            <h5 className="font-tech text-primary font-bold">{branch.title}</h5>
          </div>
        ),
      },
    });

    edges.push({
      id: `root-${branch.id}`,
      source: 'root',
      target: branch.id,
      animated: true,
      style: { stroke: '#39ff14', strokeWidth: 2 },
    });

    // Future nodes for each branch
    branch.children?.forEach((child, ci) => {
      const futureX = 700;
      const futureY = branchY - 80 + ci * 120;
      const prob = child.probability ?? 0;

      nodes.push({
        id: child.id,
        position: { x: futureX, y: futureY },
        data: {
          label: (
            <div style={nodeStyle('rgba(57,255,20,0.3)', 'rgba(57,255,20,0.1)')}>
              <div className="flex justify-between items-center mb-2">
                <span className="font-data text-[10px] text-secondary">PROB: {prob.toFixed(1)}%</span>
                <span className="material-symbols-outlined text-secondary text-sm">memory</span>
              </div>
              <h5 className="text-label text-white text-sm">{child.title}</h5>
              <div className="mt-2 flex justify-between items-center">
                <span className="text-[10px] text-on-surface-variant">IMPACT</span>
                <span className="text-primary font-bold">{(child.impact_score ?? 0).toFixed(1)}</span>
              </div>
            </div>
          ),
        },
      });

      edges.push({
        id: `${branch.id}-${child.id}`,
        source: branch.id,
        target: child.id,
        animated: true,
        style: { stroke: '#25a55a', strokeWidth: 1.5, opacity: 0.6 },
      });
    });
  });

  return { nodes, edges };
}

export default function SimulationDashboard() {
  const { isMinimized } = useSidebar();
  const [situation, setSituation] = useState('');
  const [decisions, setDecisions] = useState('');
  const [context, setContext] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SimulationResponse | null>(null);
  const [timeStoneActive, setTimeStoneActive] = useState(false);
  const [timeStoneResult, setTimeStoneResult] = useState<SimulationResponse | null>(null);

  const [flowNodes, setFlowNodes, onNodesChange] = useNodesState<Node>([]);
  const [flowEdges, setFlowEdges, onEdgesChange] = useEdgesState<Edge>([]);

  const handleSimulate = useCallback(async () => {
    if (!situation || !decisions) return;
    setLoading(true);
    try {
      const res = await api.simulate({
        current_situation: situation,
        decision_options: decisions.split(',').map((d) => d.trim()).filter(Boolean),
        context: context || undefined,
      });
      setResult(res);
      const { nodes, edges } = buildFlowNodes(res);
      setFlowNodes(nodes);
      setFlowEdges(edges);
    } catch (err) {
      console.error('Simulation error:', err);
    } finally {
      setLoading(false);
    }
  }, [situation, decisions, context]);

  const handleTimeStone = useCallback(async () => {
    if (!result) return;
    setTimeStoneActive(true);

    // Dramatic delay
    await new Promise((r) => setTimeout(r, 4000));
    setTimeStoneResult(result);

    setTimeout(() => {
      setTimeStoneActive(false);
    }, 500);
  }, [result]);

  return (
    <div className="h-screen w-screen overflow-hidden bg-surface">
      <ShaderBackground />
      <Navbar />
      <Sidebar />
      <Footer />

      {/* Main Content */}
      <main className={`fixed inset-0 top-16 right-0 bottom-8 flex overflow-hidden transition-all duration-300 ${isMinimized ? 'left-0 md:left-20' : 'left-0 md:left-64'}`}>
        {/* Left Panel: Scenario Input */}
        <section className="w-80 h-full glass-panel-solid border-r border-primary-container/10 flex flex-col p-6 gap-5 z-10 overflow-y-auto shrink-0">
          <div className="flex items-center gap-2 border-b border-primary-container/20 pb-4">
            <span className="material-symbols-outlined text-primary">edit_note</span>
            <h2 className="text-label text-primary tracking-widest">SCENARIO INPUT</h2>
          </div>

          <div className="space-y-2">
            <label className="text-label text-[10px] text-on-surface-variant">Current Situation</label>
            <textarea
              value={situation}
              onChange={(e) => setSituation(e.target.value)}
              className="w-full bg-surface-lowest border-b border-outline/30 focus:border-primary p-3 font-body text-sm outline-none resize-none h-24 transition-colors text-on-surface rounded"
              placeholder="I am a first-year computer science student..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-label text-[10px] text-on-surface-variant">Decision Options (comma-separated)</label>
            <input
              value={decisions}
              onChange={(e) => setDecisions(e.target.value)}
              className="w-full bg-surface-lowest border-b border-outline/30 focus:border-primary p-3 font-body text-sm outline-none transition-colors text-on-surface rounded"
              placeholder="Learn AI, Learn Cybersecurity, Learn Web Dev"
            />
          </div>

          <div className="space-y-2">
            <label className="text-label text-[10px] text-on-surface-variant">Context</label>
            <div className="grid grid-cols-2 gap-2">
              {['Economic', 'Cognitive', 'Social', 'Tactical'].map((tag) => (
                <button
                  key={tag}
                  onClick={() => setContext((prev) => prev ? `${prev}, ${tag}` : tag)}
                  className="bg-surface-variant/20 p-2 rounded border border-outline/20 text-[10px] text-label hover:bg-primary/10 transition-colors text-on-surface-variant"
                >
                  {tag}
                </button>
              ))}
            </div>
            {context && <p className="text-[10px] text-primary font-data mt-1">{context}</p>}
          </div>

          <button
            onClick={handleSimulate}
            disabled={loading || !situation || !decisions}
            className="w-full py-4 bg-secondary-container text-on-secondary rounded-lg font-tech text-sm flex items-center justify-center gap-3 group relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all active:scale-95"
          >
            <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            <span className="material-symbols-outlined">{loading ? 'hourglass_top' : 'auto_awesome'}</span>
            <span className="relative z-10">{loading ? 'Generating...' : 'Generate Futures'}</span>
          </button>
        </section>

        {/* Center: Timeline Visualization */}
        <section className="flex-1 relative overflow-hidden bg-void/20">
          {/* Dot grid background */}
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{ backgroundImage: 'radial-gradient(circle, #39ff14 1px, transparent 1px)', backgroundSize: '40px 40px' }}
          />

          {flowNodes.length > 0 ? (
            <ReactFlow
              nodes={flowNodes}
              edges={flowEdges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              fitView
              className="w-full h-full"
            >
              <Background color="#39ff14" gap={40} size={1} />
              <Controls />
            </ReactFlow>
          ) : (
            <div className="flex items-center justify-center h-full">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center"
              >
                <span className="material-symbols-outlined text-primary/20 text-8xl mb-4 block">timeline</span>
                <p className="text-label text-primary/30 tracking-widest">ENTER A SCENARIO TO BEGIN SIMULATION</p>
              </motion.div>
            </div>
          )}

          {/* Time Stone Button */}
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute bottom-12 left-1/2 -translate-x-1/2 z-30"
            >
              <button
                onClick={handleTimeStone}
                className="relative px-8 py-4 bg-void/60 backdrop-blur-xl border border-tertiary-container/50 rounded-full group transition-all duration-700 hover:border-tertiary-container overflow-hidden cursor-pointer"
              >
                <div className="absolute inset-0 bg-tertiary-container/10 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500" />
                <div className="relative flex items-center gap-4">
                  <span className="material-symbols-outlined text-tertiary-container text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>diamond</span>
                  <div className="text-left">
                    <p className="text-label text-[10px] text-tertiary-container/80 tracking-[0.2em]">SINGULARITY POINT</p>
                    <h2 className="font-tech text-primary text-xl font-bold">View 14,000,605 Futures</h2>
                  </div>
                </div>
              </button>
            </motion.div>
          )}
        </section>

        {/* Right Panel: Probability Engine */}
        <section className="w-80 lg:w-96 h-full glass-panel-solid border-l border-primary-container/10 flex flex-col p-6 z-10 overflow-y-auto shrink-0">
          <div className="flex items-center justify-between border-b border-primary-container/20 pb-4 mb-6">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">data_thresholding</span>
              <h2 className="text-label text-primary tracking-widest">PROBABILITY ENGINE</h2>
            </div>
            {result && (
              <div className="animate-pulse flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-secondary" />
                <span className="font-data text-[10px] text-secondary">LIVE</span>
              </div>
            )}
          </div>

          {result ? (
            <div className="flex-1 space-y-4 overflow-y-auto pr-1">
              <h3 className="text-label text-[10px] text-on-surface-variant tracking-widest mb-2">TOP FUTURE DIVERGENCES</h3>

              {result.top_futures.slice(0, 5).map((future: FutureNode, i: number) => (
                <div key={future.id} className={`bg-surface-container/40 p-3 rounded border-l-2 ${i === 0 ? 'border-primary' : 'border-primary/40'}`}>
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-data text-xs text-primary">{String(i + 1).padStart(2, '0')}</span>
                    {i === 0 && <span className="text-[10px] font-data text-secondary">ACTIVATION: 0.998</span>}
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-label text-sm text-on-surface">{future.title.split('—')[0].trim()}</p>
                    <span className="font-data text-xs text-primary">{future.probability.toFixed(1)}%</span>
                  </div>
                  <div className="h-1 bg-surface-highest rounded-full overflow-hidden">
                    <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${Math.min(100, future.probability)}%` }} />
                  </div>
                </div>
              ))}

              {/* Hebbian Learning */}
              {result.learning_progress && (
                <div className="mt-6 pt-6 border-t border-primary-container/20 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-label text-[10px] text-on-surface-variant tracking-widest">HEBBIAN LEARNING</h3>
                    <span className="material-symbols-outlined text-primary text-sm">psychology</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-data text-on-surface-variant">
                      <span>SYNAPTIC WEIGHT</span>
                      <span className="text-primary">{((result.learning_progress.total_learned_weight || 0) * 100).toFixed(0)}%</span>
                    </div>
                    <div className="h-1 bg-surface-highest rounded-full overflow-hidden">
                      <div className="h-full bg-primary/40 animate-pulse" style={{ width: `${Math.min(100, (result.learning_progress.total_learned_weight || 0) * 100)}%` }} />
                    </div>
                  </div>
                  <div className="flex justify-between text-[10px] font-data text-on-surface-variant">
                    <span>CONNECTIONS MODIFIED</span>
                    <span className="text-primary">{result.learning_progress.total_connections_modified}</span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <span className="material-symbols-outlined text-primary/15 text-6xl block mb-3">query_stats</span>
                <p className="text-label text-[10px] text-primary/20 tracking-widest">AWAITING SIMULATION</p>
              </div>
            </div>
          )}
        </section>
      </main>

      {/* Time Stone Mode Overlay */}
      <AnimatePresence>
        {timeStoneActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-void flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.5, 0.8, 1.2, 1] }}
              transition={{ duration: 3, ease: 'easeInOut' }}
              className="text-center"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="w-40 h-40 mx-auto mb-8 border-2 border-dashed border-tertiary-container/60 rounded-full flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-tertiary-container text-7xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                  diamond
                </span>
              </motion.div>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0, 1] }}
                transition={{ delay: 1, duration: 2 }}
                className="font-display text-4xl text-primary italic mb-4"
              >
                Scanning 14,000,605 futures...
              </motion.p>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 3, ease: 'easeInOut' }}
                className="h-0.5 bg-gradient-to-r from-transparent via-primary-container to-transparent max-w-md mx-auto"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Time Stone Results Modal */}
      <AnimatePresence>
        {timeStoneResult && !timeStoneActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] bg-void/90 backdrop-blur-xl flex items-center justify-center p-8"
            onClick={() => setTimeStoneResult(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="glass-panel-solid max-w-2xl w-full rounded-2xl p-8 max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-8">
                <p className="text-label text-tertiary-dim tracking-widest mb-2">OUT OF 14,000,605 SIMULATED FUTURES</p>
                <h2 className="font-display text-4xl text-primary italic neural-glow">The Singularity Reveals...</h2>
              </div>

              {/* Most Likely */}
              <div className="neural-card p-6 rounded-xl mb-6 glow-emerald">
                <div className="text-label text-[10px] text-secondary mb-2">MOST LIKELY FUTURE — {timeStoneResult.most_likely.probability.toFixed(1)}%</div>
                <h3 className="font-tech text-2xl text-primary font-bold mb-2">{timeStoneResult.most_likely.title}</h3>
                <p className="text-on-surface-variant text-sm">{timeStoneResult.most_likely.description}</p>
                <p className="text-[10px] text-primary/60 mt-3 font-data">{timeStoneResult.most_likely.timeline}</p>
              </div>

              {/* Top 5 */}
              <h3 className="text-label text-primary/60 tracking-widest mb-3">TOP FUTURES</h3>
              <div className="space-y-3 mb-6">
                {timeStoneResult.top_futures.slice(1, 6).map((f: FutureNode) => (
                  <div key={f.id} className="bg-surface-container/40 p-4 rounded border-l-2 border-primary/30">
                    <div className="flex justify-between items-center">
                      <span className="text-label text-sm text-on-surface">{f.title.split('—')[0].trim()}</span>
                      <span className="font-data text-primary text-sm">{f.probability.toFixed(1)}%</span>
                    </div>
                    <p className="text-[10px] text-on-surface-variant mt-1">{f.description}</p>
                  </div>
                ))}
              </div>

              {/* Rare */}
              {timeStoneResult.rare_futures.length > 0 && (
                <>
                  <h3 className="text-label text-tertiary-dim/60 tracking-widest mb-3">RARE FUTURES</h3>
                  <div className="space-y-2">
                    {timeStoneResult.rare_futures.map((f: FutureNode) => (
                      <div key={f.id} className="bg-surface-container/20 p-3 rounded border-l-2 border-tertiary-dim/30">
                        <div className="flex justify-between items-center">
                          <span className="font-data text-sm text-on-surface-variant">{f.title.split('—')[0].trim()}</span>
                          <span className="font-data text-tertiary-dim text-sm">{f.probability.toFixed(1)}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              <div className="text-center mt-8">
                <button onClick={() => setTimeStoneResult(null)} className="text-label text-primary/60 hover:text-primary transition-colors cursor-pointer">
                  CLOSE SINGULARITY VIEW
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
