"""ChronoMind API — FastAPI application with all endpoints."""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from .models import (
    SimulationRequest,
    ActivationRequest,
    CompareRequest,
)
from .memory_engine import MemoryEngine
from .activation_engine import ActivationEngine
from .timeline_generator import TimelineGenerator
from .probability_engine import ProbabilityEngine
from .hebbian_learning import HebbianLearning
from .comparison_engine import ComparisonEngine

# Initialize engines
memory = MemoryEngine()
activation = ActivationEngine(memory)
timeline_gen = TimelineGenerator(memory, activation)
probability = ProbabilityEngine(memory)
hebbian = HebbianLearning(memory)
comparison = ComparisonEngine(memory, activation)

# Cached results
last_simulation_result = None

app = FastAPI(
    title="ChronoMind API",
    description="The Neuromorphic Future Simulation Engine",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    """Health check."""
    return {
        "status": "online",
        "engine": "ChronoMind Neural Nexus",
        "version": "1.0.0",
        "neural_activation": "84%",
        "temporal_sync": "STABLE",
    }


@app.post("/simulate")
async def simulate(request: SimulationRequest):
    """
    Full simulation pipeline:
    1. Activate memory nodes from input
    2. Generate branching timelines
    3. Score with probability engine
    4. Apply Hebbian learning
    5. Return ranked futures
    """
    global last_simulation_result

    # Combine all text for activation
    full_text = f"{request.current_situation} {' '.join(request.decision_options)}"
    if request.context:
        full_text += f" {request.context}"

    # Step 1: Neural activation
    activation_result = activation.activate(full_text)

    if activation_result["total_activated"] == 0:
        raise HTTPException(
            status_code=400,
            detail="No memory nodes could be activated from the input. Try different keywords.",
        )

    # Step 2: Generate timelines
    timeline_result = timeline_gen.generate(
        request.decision_options, num_futures=100
    )

    # Step 3: Score futures
    scored = probability.get_top_futures(timeline_result["all_futures"], n=10)

    # Step 4: Hebbian learning
    activated_ids = activation.get_activated_node_ids()[:10]
    learning_result = hebbian.learn(activated_ids)

    # Build response
    result = {
        "most_likely": scored["most_likely"],
        "top_futures": scored["top_futures"],
        "rare_futures": scored["rare_futures"],
        "total_simulated": timeline_result["total_generated"],
        "activated_nodes": activation_result["activated_nodes"][:15],
        "strengthened_connections": learning_result["strengthened_connections"][:10],
        "timeline_tree": timeline_result["tree"],
        "learning_progress": hebbian.get_learning_progress(),
    }

    last_simulation_result = result
    return result


@app.post("/activate")
async def activate_nodes(request: ActivationRequest):
    """Activate memory nodes from text input."""
    result = activation.activate(request.text)
    return result


@app.post("/generate-timelines")
async def generate_timelines(request: SimulationRequest):
    """Generate branching timelines without full simulation."""
    full_text = f"{request.current_situation} {' '.join(request.decision_options)}"
    if request.context:
        full_text += f" {request.context}"

    activation.activate(full_text)
    result = timeline_gen.generate(request.decision_options, num_futures=100)
    scored = probability.get_top_futures(result["all_futures"], n=10)

    return {
        "tree": result["tree"],
        "top_futures": scored["top_futures"],
        "total_generated": result["total_generated"],
    }


@app.post("/compare")
async def compare_decisions(request: CompareRequest):
    """Compare two decision paths."""
    # Activate based on both decisions
    full_text = f"{request.decision_a} {request.decision_b}"
    if request.context:
        full_text += f" {request.context}"

    activation.activate(full_text)
    result = comparison.compare(request.decision_a, request.decision_b, request.context or "")
    return result


@app.get("/memory-graph")
async def get_memory_graph():
    """Return the full memory graph for visualization."""
    graph_data = memory.get_full_graph_data()
    return {
        "graph": graph_data,
        "stats": {
            "total_nodes": len(graph_data["nodes"]),
            "total_edges": len(graph_data["edges"]),
            "domains": list(set(n.get("domain", "unknown") for n in graph_data["nodes"])),
        },
        "learning_progress": hebbian.get_learning_progress(),
    }


@app.get("/top-futures")
async def get_top_futures():
    """Return cached top futures from last simulation."""
    if last_simulation_result is None:
        return {
            "message": "No simulation has been run yet. Use POST /simulate first.",
            "top_futures": [],
        }

    return {
        "most_likely": last_simulation_result.get("most_likely"),
        "top_futures": last_simulation_result.get("top_futures", []),
        "rare_futures": last_simulation_result.get("rare_futures", []),
        "total_simulated": last_simulation_result.get("total_simulated", 0),
    }
