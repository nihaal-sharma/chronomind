// ChronoMind API
import type {
  SimulationRequest,
  SimulationResponse,
  ActivationResponse,
  ComparisonResponse,
  MemoryGraphResponse,
} from '../types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(error.detail || `API error: ${res.status}`);
  }

  return res.json();
}

export const api = {
  simulate: (data: SimulationRequest): Promise<SimulationResponse> =>
    fetchAPI('/simulate', {
      method: 'POST',
      body: JSON.stringify(data),
    }),


  activate: (text: string): Promise<ActivationResponse> =>
    fetchAPI('/activate', {
      method: 'POST',
      body: JSON.stringify({ text }),
    }),


  generateTimelines: (data: SimulationRequest) =>
    fetchAPI('/generate-timelines', {
      method: 'POST',
      body: JSON.stringify(data),
    }),


  compare: (
    decision_a: string,
    decision_b: string,
    context?: string
  ): Promise<ComparisonResponse> =>
    fetchAPI('/compare', {
      method: 'POST',
      body: JSON.stringify({ decision_a, decision_b, context }),
    }),


  getMemoryGraph: (): Promise<MemoryGraphResponse> =>
    fetchAPI('/memory-graph'),


  getTopFutures: () => fetchAPI('/top-futures'),
};
