"""Hebbian Learning — Connection strengthening through co-activation."""
from .memory_engine import MemoryEngine


class HebbianLearning:
    """Implements Hebbian learning: 'Neurons that fire together wire together.'"""

    def __init__(self, memory: MemoryEngine, learning_rate: float = 0.05):
        self.memory = memory
        self.learning_rate = learning_rate
        self.co_activation_log: list[dict] = []

    def learn(self, activated_node_ids: list[str]) -> dict:
        """
        Strengthen connections between co-activated nodes.

        For every pair of activated nodes that share an edge,
        increase the connection_strength by learning_rate.
        """
        strengthened = []

        for i, node_a in enumerate(activated_node_ids):
            for node_b in activated_node_ids[i + 1:]:
                # Check both directions
                strengthened_edge = None

                if self.memory.graph.has_edge(node_a, node_b):
                    old_strength = self.memory.graph[node_a][node_b]["connection_strength"]
                    new_strength = min(1.0, old_strength + self.learning_rate)
                    self.memory.graph[node_a][node_b]["connection_strength"] = new_strength

                    # Track in Hebbian weights
                    key = f"{node_a}->{node_b}"
                    current = self.memory.hebbian_weights.get(key, 0)
                    self.memory.hebbian_weights[key] = current + self.learning_rate

                    strengthened_edge = {
                        "source": node_a,
                        "target": node_b,
                        "source_name": self.memory.graph.nodes[node_a].get("name", node_a),
                        "target_name": self.memory.graph.nodes[node_b].get("name", node_b),
                        "old_strength": round(old_strength, 4),
                        "new_strength": round(new_strength, 4),
                        "delta": round(self.learning_rate, 4),
                    }

                elif self.memory.graph.has_edge(node_b, node_a):
                    old_strength = self.memory.graph[node_b][node_a]["connection_strength"]
                    new_strength = min(1.0, old_strength + self.learning_rate)
                    self.memory.graph[node_b][node_a]["connection_strength"] = new_strength

                    key = f"{node_b}->{node_a}"
                    current = self.memory.hebbian_weights.get(key, 0)
                    self.memory.hebbian_weights[key] = current + self.learning_rate

                    strengthened_edge = {
                        "source": node_b,
                        "target": node_a,
                        "source_name": self.memory.graph.nodes[node_b].get("name", node_b),
                        "target_name": self.memory.graph.nodes[node_a].get("name", node_a),
                        "old_strength": round(old_strength, 4),
                        "new_strength": round(new_strength, 4),
                        "delta": round(self.learning_rate, 4),
                    }

                if strengthened_edge:
                    strengthened.append(strengthened_edge)

        # Save updated weights
        if strengthened:
            self.memory.save_graph()
            self.co_activation_log.append({
                "nodes": activated_node_ids,
                "strengthened_count": len(strengthened),
            })

        return {
            "strengthened_connections": strengthened,
            "total_strengthened": len(strengthened),
            "learning_rate": self.learning_rate,
            "total_learning_events": len(self.co_activation_log),
        }

    def get_learning_progress(self) -> dict:
        """Return learning progress metrics."""
        total_hebbian = sum(self.memory.hebbian_weights.values())
        strongest = sorted(
            self.memory.hebbian_weights.items(),
            key=lambda x: x[1],
            reverse=True,
        )[:10]

        return {
            "total_learned_weight": round(total_hebbian, 4),
            "total_connections_modified": len(self.memory.hebbian_weights),
            "strongest_learned_connections": [
                {"edge": k, "weight": round(v, 4)} for k, v in strongest
            ],
            "learning_events": len(self.co_activation_log),
        }
