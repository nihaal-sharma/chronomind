import networkx as nx
from .memory_engine import MemoryEngine


class ActivationEngine:

    def __init__(self, memory: MemoryEngine):
        self.memory = memory
        self.decay_factor = 0.6
        self.activation_threshold = 0.1
        self.max_depth = 4

    def activate(self, text: str) -> dict:
        """
        Activate memory nodes from input text and spread activation.

        1. Extract matching concepts from text
        2. Set initial activation scores
        3. Spread activation through graph edges
        4. Return activated subgraph
        """

        for node_id in self.memory.graph.nodes:
            self.memory.graph.nodes[node_id]["activation_score"] = 0.0


        matches = self.memory.find_nodes_by_keywords(text)

        if not matches:
            return {
                "activated_nodes": [],
                "activation_spread": [],
                "total_activated": 0,
            }


        initially_activated = []
        for match in matches:
            node_id = match["id"]
            activation = match["match_score"] * match.get("weight", 1.0)
            self.memory.graph.nodes[node_id]["activation_score"] = activation
            initially_activated.append({
                "id": node_id,
                "name": match["name"],
                "activation_score": activation,
                "source": "direct_match",
            })


        spread_log = []
        visited = set(m["id"] for m in matches)
        frontier = [(m["id"], m["match_score"]) for m in matches]

        for depth in range(1, self.max_depth + 1):
            next_frontier = []
            for node_id, parent_activation in frontier:

                neighbors = set()
                neighbors.update(self.memory.graph.successors(node_id))
                neighbors.update(self.memory.graph.predecessors(node_id))

                for neighbor_id in neighbors:
                    if neighbor_id in visited:
                        continue


                    edge_strength = 1.0
                    if self.memory.graph.has_edge(node_id, neighbor_id):
                        edge_strength = self.memory.graph[node_id][neighbor_id].get("connection_strength", 1.0)
                    elif self.memory.graph.has_edge(neighbor_id, node_id):
                        edge_strength = self.memory.graph[neighbor_id][node_id].get("connection_strength", 1.0)

                    spread_activation = parent_activation * self.decay_factor * edge_strength
                    node_weight = self.memory.graph.nodes[neighbor_id].get("weight", 1.0)
                    spread_activation *= node_weight

                    if spread_activation >= self.activation_threshold:
                        current = self.memory.graph.nodes[neighbor_id]["activation_score"]
                        new_activation = max(current, spread_activation)
                        self.memory.graph.nodes[neighbor_id]["activation_score"] = new_activation

                        visited.add(neighbor_id)
                        next_frontier.append((neighbor_id, new_activation))

                        neighbor_data = self.memory.graph.nodes[neighbor_id]
                        spread_log.append({
                            "id": neighbor_id,
                            "name": neighbor_data.get("name", neighbor_id),
                            "activation_score": round(new_activation, 4),
                            "depth": depth,
                            "source_node": node_id,
                            "edge_strength": round(edge_strength, 4),
                        })

            frontier = next_frontier


        all_activated = []
        for node_id in self.memory.graph.nodes:
            score = self.memory.graph.nodes[node_id]["activation_score"]
            if score > 0:
                data = dict(self.memory.graph.nodes[node_id])
                data["id"] = node_id
                all_activated.append(data)

        all_activated.sort(key=lambda x: x["activation_score"], reverse=True)

        return {
            "activated_nodes": all_activated,
            "activation_spread": spread_log,
            "total_activated": len(all_activated),
            "initially_activated": initially_activated,
        }

    def get_activated_node_ids(self) -> list[str]:
        """Get list of currently activated node IDs sorted by activation."""
        activated = []
        for node_id in self.memory.graph.nodes:
            score = self.memory.graph.nodes[node_id].get("activation_score", 0)
            if score > 0:
                activated.append((node_id, score))
        activated.sort(key=lambda x: x[1], reverse=True)
        return [a[0] for a in activated]
