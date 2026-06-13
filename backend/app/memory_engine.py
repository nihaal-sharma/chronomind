"""Memory Engine — NetworkX-based knowledge graph for ChronoMind."""
import json
import os
import networkx as nx
from typing import Optional

DATA_PATH = os.path.join(os.path.dirname(__file__), "data", "memory_graph.json")


class MemoryEngine:
    """Manages the neuromorphic memory graph using NetworkX."""

    def __init__(self):
        self.graph = nx.DiGraph()
        self._load_graph()

    def _load_graph(self):
        """Load graph from JSON file."""
        with open(DATA_PATH, "r") as f:
            data = json.load(f)

        for node in data["nodes"]:
            self.graph.add_node(
                node["id"],
                name=node["name"],
                domain=node.get("domain", "general"),
                weight=node.get("weight", 1.0),
                activation_score=0.0,
                description=node.get("description", ""),
                keywords=node.get("keywords", []),
            )

        for edge in data["edges"]:
            self.graph.add_edge(
                edge["source"],
                edge["target"],
                connection_strength=edge.get("connection_strength", 1.0),
                edge_type=edge.get("edge_type", "related"),
            )

        # Load Hebbian weights
        self.hebbian_weights = data.get("hebbian_weights", {})
        for key, weight in self.hebbian_weights.items():
            src, tgt = key.split("->")
            if self.graph.has_edge(src, tgt):
                self.graph[src][tgt]["connection_strength"] = min(
                    1.0, self.graph[src][tgt]["connection_strength"] + weight
                )

    def save_graph(self):
        """Save current graph state to JSON."""
        nodes = []
        for node_id, data in self.graph.nodes(data=True):
            nodes.append({
                "id": node_id,
                "name": data.get("name", node_id),
                "domain": data.get("domain", "general"),
                "weight": data.get("weight", 1.0),
                "description": data.get("description", ""),
                "keywords": data.get("keywords", []),
            })

        edges = []
        for src, tgt, data in self.graph.edges(data=True):
            edges.append({
                "source": src,
                "target": tgt,
                "connection_strength": data.get("connection_strength", 1.0),
                "edge_type": data.get("edge_type", "related"),
            })

        with open(DATA_PATH, "w") as f:
            json.dump({
                "nodes": nodes,
                "edges": edges,
                "hebbian_weights": self.hebbian_weights,
            }, f, indent=2)

    def get_node(self, node_id: str) -> Optional[dict]:
        """Get a single node by ID."""
        if node_id in self.graph:
            data = dict(self.graph.nodes[node_id])
            data["id"] = node_id
            return data
        return None

    def get_all_nodes(self) -> list[dict]:
        """Return all nodes with their data."""
        nodes = []
        for node_id, data in self.graph.nodes(data=True):
            node = dict(data)
            node["id"] = node_id
            nodes.append(node)
        return nodes

    def get_all_edges(self) -> list[dict]:
        """Return all edges with their data."""
        edges = []
        for src, tgt, data in self.graph.edges(data=True):
            edge = dict(data)
            edge["source"] = src
            edge["target"] = tgt
            edges.append(edge)
        return edges

    def get_neighbors(self, node_id: str) -> list[dict]:
        """Get neighboring nodes (both directions)."""
        neighbors = []
        if node_id not in self.graph:
            return neighbors

        for neighbor in nx.all_neighbors(self.graph, node_id):
            data = dict(self.graph.nodes[neighbor])
            data["id"] = neighbor

            # Get edge strength
            if self.graph.has_edge(node_id, neighbor):
                data["connection_strength"] = self.graph[node_id][neighbor].get("connection_strength", 1.0)
            elif self.graph.has_edge(neighbor, node_id):
                data["connection_strength"] = self.graph[neighbor][node_id].get("connection_strength", 1.0)

            neighbors.append(data)
        return neighbors

    def get_subgraph(self, node_ids: list[str]) -> dict:
        """Get a subgraph containing only the specified nodes and edges between them."""
        sub = self.graph.subgraph(node_ids)
        nodes = []
        for nid, data in sub.nodes(data=True):
            node = dict(data)
            node["id"] = nid
            nodes.append(node)

        edges = []
        for src, tgt, data in sub.edges(data=True):
            edge = dict(data)
            edge["source"] = src
            edge["target"] = tgt
            edges.append(edge)

        return {"nodes": nodes, "edges": edges}

    def find_nodes_by_keywords(self, text: str) -> list[dict]:
        """Find nodes whose keywords match the input text."""
        text_lower = text.lower()
        matches = []

        for node_id, data in self.graph.nodes(data=True):
            score = 0.0
            keywords = data.get("keywords", [])
            name = data.get("name", "").lower()

            # Check name match
            if name in text_lower or any(word in text_lower for word in name.split()):
                score += 0.8

            # Check keyword matches
            for keyword in keywords:
                if keyword.lower() in text_lower:
                    score += 0.5

            if score > 0:
                node = dict(data)
                node["id"] = node_id
                node["match_score"] = min(1.0, score)
                matches.append(node)

        matches.sort(key=lambda x: x["match_score"], reverse=True)
        return matches

    def get_full_graph_data(self) -> dict:
        """Return the complete graph as JSON-serializable dict."""
        return {
            "nodes": self.get_all_nodes(),
            "edges": self.get_all_edges(),
        }
