"""Pydantic models for ChronoMind API."""
from pydantic import BaseModel, Field
from typing import Optional


class SimulationRequest(BaseModel):
    """Request to simulate futures from a scenario."""
    current_situation: str = Field(..., description="User's current situation")
    decision_options: list[str] = Field(..., description="List of possible decisions")
    context: Optional[str] = Field(None, description="Additional context")


class ActivationRequest(BaseModel):
    """Request to activate memory nodes."""
    text: str = Field(..., description="Text to extract concepts from")


class CompareRequest(BaseModel):
    """Request to compare two decision paths."""
    decision_a: str = Field(..., description="First decision")
    decision_b: str = Field(..., description="Second decision")
    context: Optional[str] = Field(None, description="Additional context")


class MemoryNode(BaseModel):
    """A node in the memory graph."""
    id: str
    name: str
    domain: str
    weight: float = 1.0
    activation_score: float = 0.0
    description: str = ""
    keywords: list[str] = []


class MemoryEdge(BaseModel):
    """An edge in the memory graph."""
    source: str
    target: str
    connection_strength: float = 1.0
    edge_type: str = "related"  # related, leads_to, requires


class FutureNode(BaseModel):
    """A single future outcome."""
    id: str
    title: str
    description: str
    probability: float
    impact_score: float
    confidence: float
    timeline: str
    explanation: str
    activated_concepts: list[str] = []
    parent_id: Optional[str] = None


class SimulationResponse(BaseModel):
    """Full simulation response."""
    most_likely: FutureNode
    top_futures: list[FutureNode]
    rare_futures: list[FutureNode]
    total_simulated: int
    activated_nodes: list[dict]
    strengthened_connections: list[dict]
    timeline_tree: dict


class ComparisonAxis(BaseModel):
    """Single axis comparison."""
    axis: str
    score_a: float
    score_b: float


class ComparisonResponse(BaseModel):
    """Comparison between two futures."""
    decision_a: dict
    decision_b: dict
    radar_data: list[ComparisonAxis]
    recommendation: str
    explanation: str


class ActivationResponse(BaseModel):
    """Response from neural activation."""
    activated_nodes: list[dict]
    activation_spread: list[dict]
    total_activated: int
