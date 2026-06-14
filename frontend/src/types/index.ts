export interface MemoryNode {
  id: string;
  name: string;
  domain: string;
  weight: number;
  activation_score: number;
  description: string;
  keywords: string[];
  match_score?: number;
}

export interface MemoryEdge {
  source: string;
  target: string;
  connection_strength: number;
  edge_type: string;
}

export interface FutureNode {
  id: string;
  title: string;
  description: string;
  probability: number;
  impact_score: number;
  confidence: number;
  timeline: string;
  explanation: string;
  activated_concepts: string[];
  decision?: string;
  parent_id?: string;
}

export interface SimulationRequest {
  current_situation: string;
  decision_options: string[];
  context?: string;
}

export interface SimulationResponse {
  most_likely: FutureNode;
  top_futures: FutureNode[];
  rare_futures: FutureNode[];
  total_simulated: number;
  activated_nodes: MemoryNode[];
  strengthened_connections: ConnectionStrength[];
  timeline_tree: TimelineTree;
  learning_progress: LearningProgress;
}

export interface TimelineTree {
  id: string;
  title: string;
  children: TimelineTreeNode[];
}

export interface TimelineTreeNode {
  id: string;
  title: string;
  probability?: number;
  impact_score?: number;
  children?: TimelineTreeNode[];
}

export interface ConnectionStrength {
  source: string;
  target: string;
  source_name: string;
  target_name: string;
  old_strength: number;
  new_strength: number;
  delta: number;
}

export interface LearningProgress {
  total_learned_weight: number;
  total_connections_modified: number;
  strongest_learned_connections: { edge: string; weight: number }[];
  learning_events: number;
}

export interface ComparisonAxis {
  axis: string;
  score_a: number;
  score_b: number;
}

export interface ComparisonDecision {
  name: string;
  label: string;
  icon: string;
  summary: string;
  scores: Record<string, number>;
  total_score: number;
}

export interface ComparisonResponse {
  decision_a: ComparisonDecision;
  decision_b: ComparisonDecision;
  radar_data: ComparisonAxis[];
  recommendation: string;
  explanation: string;
}

export interface ActivationResponse {
  activated_nodes: MemoryNode[];
  activation_spread: {
    id: string;
    name: string;
    activation_score: number;
    depth: number;
    source_node: string;
  }[];
  total_activated: number;
}

export interface MemoryGraphResponse {
  graph: {
    nodes: MemoryNode[];
    edges: MemoryEdge[];
  };
  stats: {
    total_nodes: number;
    total_edges: number;
    domains: string[];
  };
  learning_progress: LearningProgress;
}
