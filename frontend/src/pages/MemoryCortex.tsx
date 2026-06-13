import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
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
import type { MemoryNode, MemoryEdge } from '../types';

const DOMAIN_COLORS: Record<string, string> = {
  technology: '#39ff14',
  cybersecurity: '#50c878',
  career: '#e9c349',
  economy: '#66dd8b',
  general: '#baccb0',
};

function buildGraphNodes(
  nodes: MemoryNode[],
  edges: MemoryEdge[]
): { flowNodes: Node[]; flowEdges: Edge[] } {
  const flowNodes: Node[] = nodes.map((n, i) => {
    const angle = (i / nodes.length) * 2 * Math.PI;
    const radius = 350 + (i % 3) * 100;
    const x = 600 + Math.cos(angle) * radius;
    const y = 400 + Math.sin(angle) * radius;
    const color = DOMAIN_COLORS[n.domain] || '#baccb0';
    const isActive = n.activation_score > 0;
    const size = 30 + n.weight * 20;

    return {
      id: n.id,
      position: { x, y },
      data: {
        label: (
          <div className="text-center" style={{ minWidth: 60 }}>
            <div
              style={{
                width: size,
                height: size,
                borderRadius: '50%',
                background: isActive ? `${color}30` : `${color}10`,
                border: `1px solid ${color}`,
                margin: '0 auto 4px',
                boxShadow: isActive ? `0 0 15px ${color}60` : 'none',
                transition: 'all 0.5s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div
                style={{
                  width: size * 0.4,
                  height: size * 0.4,
                  borderRadius: '50%',
                  background: color,
                  animation: isActive ? 'pulse 2s infinite' : 'none',
                }}
              />
            </div>
            <span className="font-data text-[10px] text-on-surface-variant">{n.name}</span>
          </div>
        ),
      },
      style: { background: 'transparent', border: 'none', padding: 0 },
    };
  });

  const flowEdges: Edge[] = edges.map((e, i) => ({
    id: `e-${i}`,
    source: e.source,
    target: e.target,
    animated: e.connection_strength > 0.7,
    style: {
      stroke: `rgba(57, 255, 20, ${Math.max(0.1, e.connection_strength * 0.5)})`,
      strokeWidth: Math.max(1, e.connection_strength * 2),
    },
  }));

  return { flowNodes, flowEdges };
}

export default function MemoryCortex() {
  const { isMinimized } = useSidebar();
  const [loading, setLoading] = useState(true);
  const [isImmersive, setIsImmersive] = useState(false);

  const [flowNodes, setFlowNodes, onNodesChange] = useNodesState<Node>([]);
  const [flowEdges, setFlowEdges, onEdgesChange] = useEdgesState<Edge>([]);

  useEffect(() => {
    loadGraph();
  }, []);

  const loadGraph = async () => {
    setLoading(true);
    try {
      const res = await api.getMemoryGraph();
      const { flowNodes: fn, flowEdges: fe } = buildGraphNodes(res.graph.nodes, res.graph.edges);
      setFlowNodes(fn);
      setFlowEdges(fe);
    } catch (err) {
      console.error('Failed to load memory graph:', err);
      // Generate placeholder data for demo
      const demoNodes: MemoryNode[] = [
        { id: 'ai', name: 'AI', domain: 'technology', weight: 1.0, activation_score: 0.8, description: '', keywords: [] },
        { id: 'ml', name: 'Machine Learning', domain: 'technology', weight: 0.9, activation_score: 0.6, description: '', keywords: [] },
        { id: 'dl', name: 'Deep Learning', domain: 'technology', weight: 0.85, activation_score: 0.5, description: '', keywords: [] },
        { id: 'cybersec', name: 'Cybersecurity', domain: 'cybersecurity', weight: 1.0, activation_score: 0.3, description: '', keywords: [] },
        { id: 'webdev', name: 'Web Dev', domain: 'technology', weight: 0.9, activation_score: 0.2, description: '', keywords: [] },
        { id: 'jobs', name: 'Job Market', domain: 'economy', weight: 0.8, activation_score: 0.4, description: '', keywords: [] },
        { id: 'career', name: 'AI Engineer', domain: 'career', weight: 0.95, activation_score: 0.7, description: '', keywords: [] },
      ];
      const demoEdges: MemoryEdge[] = [
        { source: 'ai', target: 'ml', connection_strength: 0.95, edge_type: 'contains' },
        { source: 'ml', target: 'dl', connection_strength: 0.9, edge_type: 'contains' },
        { source: 'ai', target: 'career', connection_strength: 0.85, edge_type: 'leads_to' },
        { source: 'ai', target: 'jobs', connection_strength: 0.8, edge_type: 'affects' },
        { source: 'cybersec', target: 'jobs', connection_strength: 0.7, edge_type: 'affects' },
        { source: 'webdev', target: 'jobs', connection_strength: 0.65, edge_type: 'affects' },
      ];
      const { flowNodes: fn, flowEdges: fe } = buildGraphNodes(demoNodes, demoEdges);
      setFlowNodes(fn);
      setFlowEdges(fe);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-surface">
      <ShaderBackground />

      {!isImmersive && (
        <>
          <Navbar />
          <Sidebar />
          <Footer />
        </>
      )}

      <main className={`relative h-screen w-screen overflow-hidden flex items-center justify-center transition-all duration-300 ${isImmersive ? '' : isMinimized ? 'pt-16 md:pl-20' : 'pt-16 md:pl-64'} z-10`}>
        {/* Neural Graph */}
        <div className="absolute inset-0 z-0">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}>
                <span className="material-symbols-outlined text-primary text-6xl">psychology</span>
              </motion.div>
            </div>
          ) : (
            <ReactFlow
              nodes={flowNodes}
              edges={flowEdges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              fitView
              className="w-full h-full"
            >
              <Background color="#39ff14" gap={60} size={0.5} />
              <Controls />
              <MiniMap
                nodeColor={() => '#39ff14'}
                maskColor="rgba(0,0,0,0.8)"
              />
            </ReactFlow>
          )}
        </div>

        {/* HUD: Strengthened Connections */}
        {!isImmersive && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="fixed top-24 left-72 z-20 w-72 hidden lg:block"
          >
            <div className="neural-card glass-panel rounded-xl p-4 overflow-hidden relative group">
              <div className="absolute -top-10 -right-10 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/20 transition-all" />
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-label text-primary flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">electric_bolt</span>
                  STRENGTHENED
                </h3>
                <span className="font-data text-[10px] text-on-surface-variant opacity-50">HEBBIAN SYNC</span>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-end border-b border-white/5 pb-1">
                  <div>
                    <p className="font-data text-xs text-on-surface">AI → JOBS</p>
                    <p className="text-[10px] text-on-surface-variant">+84% Strength</p>
                  </div>
                  <div className="w-12 h-1 bg-surface-variant overflow-hidden">
                    <div className="h-full bg-primary animate-pulse w-[84%]" />
                  </div>
                </div>
                <div className="flex justify-between items-end border-b border-white/5 pb-1">
                  <div>
                    <p className="font-data text-xs text-on-surface">SYNTH → ART</p>
                    <p className="text-[10px] text-on-surface-variant">+32% Strength</p>
                  </div>
                  <div className="w-12 h-1 bg-surface-variant overflow-hidden">
                    <div className="h-full bg-secondary w-[32%]" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* HUD: Active Memories */}
        {!isImmersive && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="fixed bottom-16 right-12 z-20 w-80 hidden lg:block"
          >
            <div className="neural-card glass-panel rounded-xl p-5">
              <h3 className="text-label text-tertiary-dim mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">temp_preferences_custom</span>
                Active Memory Clusters
              </h3>
              <div className="flex flex-wrap gap-2">
                {['Quantum Decay', 'Neural Plasticity', 'Chronos Drift', 'Entropy Spike'].map((tag, i) => (
                  <span
                    key={tag}
                    className={`px-3 py-1 rounded-full border font-data text-[10px] flex items-center gap-1 ${
                      i === 0
                        ? 'border-primary/20 bg-primary/5 text-primary'
                        : i === 3
                        ? 'border-error/20 bg-error/5 text-error'
                        : i === 1
                        ? 'border-secondary/20 bg-secondary/5 text-secondary'
                        : 'border-white/10 bg-white/5 text-on-surface-variant'
                    }`}
                  >
                    {tag}
                    {i === 0 && <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Neural Universe Toggle */}
        <div className={`fixed ${isImmersive ? 'bottom-12 left-1/2 -translate-x-1/2' : 'bottom-16 left-6 md:left-72'} z-30`}>
          <button
            onClick={() => setIsImmersive(!isImmersive)}
            className="group relative flex items-center gap-4 bg-surface-lowest/80 backdrop-blur-xl border border-primary-container/20 px-6 py-3 rounded-full hover:border-primary transition-all cursor-pointer"
          >
            <div className="relative w-8 h-8 flex items-center justify-center">
              <div className="energy-ring absolute inset-0 border border-dashed border-primary-container/40 rounded-full" />
              <span className="material-symbols-outlined text-primary text-[20px] group-hover:scale-110 transition-transform">
                {isImmersive ? 'visibility' : 'auto_fix_high'}
              </span>
            </div>
            <span className="text-label text-primary tracking-widest">
              {isImmersive ? 'EXIT UNIVERSE VIEW' : 'NEURAL UNIVERSE VIEW'}
            </span>
          </button>
        </div>
      </main>
    </div>
  );
}
