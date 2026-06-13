"""Probability Engine — Scores and ranks future outcomes."""
import random
from .memory_engine import MemoryEngine


class ProbabilityEngine:
    """Assigns probabilities and rankings to generated futures."""

    def __init__(self, memory: MemoryEngine):
        self.memory = memory

    def score_futures(self, futures: list[dict]) -> list[dict]:
        """
        Score and rank a list of futures using:
        - Node weights
        - Activation strength
        - Connection strengths along path
        - Domain relevance
        """
        for future in futures:
            score = self._calculate_score(future)
            future["probability"] = round(score["probability"], 2)
            future["impact_score"] = round(score["impact"], 1)
            future["confidence"] = round(score["confidence"], 2)

        # Normalize probabilities to sum to 100
        total = sum(f["probability"] for f in futures) or 1.0
        for f in futures:
            f["probability"] = round((f["probability"] / total) * 100, 2)

        # Sort by probability
        futures.sort(key=lambda x: x["probability"], reverse=True)
        return futures

    def _calculate_score(self, future: dict) -> dict:
        """Calculate probability, impact, and confidence for a single future."""
        base_prob = future.get("probability", 50.0)

        # Factor in activated concepts
        activated = future.get("activated_concepts", [])
        activation_bonus = 0
        for concept_name in activated:
            for node_id, data in self.memory.graph.nodes(data=True):
                if data.get("name") == concept_name:
                    activation_bonus += data.get("activation_score", 0) * 5
                    break

        # Factor in node weight
        weight_factor = 1.0
        for node_id, data in self.memory.graph.nodes(data=True):
            if data.get("name") in future.get("title", ""):
                weight_factor = data.get("weight", 1.0)
                break

        probability = base_prob * weight_factor + activation_bonus
        probability = max(1.0, min(99.0, probability))

        impact = future.get("impact_score", random.uniform(5.0, 10.0))
        confidence = min(0.95, probability / 120 + random.uniform(-0.05, 0.1))

        return {
            "probability": probability,
            "impact": impact,
            "confidence": max(0.1, confidence),
        }

    def get_top_futures(self, futures: list[dict], n: int = 10) -> dict:
        """Get categorized futures: most likely, top N, and rare."""
        scored = self.score_futures(futures)

        most_likely = scored[0] if scored else None
        top_futures = scored[:n]
        rare_futures = [f for f in scored if f["probability"] < 5.0][:3]

        # If no rare futures, take the last few
        if not rare_futures and len(scored) > n:
            rare_futures = scored[-3:]

        return {
            "most_likely": most_likely,
            "top_futures": top_futures,
            "rare_futures": rare_futures,
            "total_scored": len(scored),
        }
