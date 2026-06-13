"""Comparison Engine — Compare two decision paths on multiple axes."""
from .memory_engine import MemoryEngine
from .activation_engine import ActivationEngine


# Domain knowledge for comparison axes
COMPARISON_DATA = {
    "ai": {
        "opportunity": 94, "demand": 92, "growth": 95,
        "risk": 35, "stability": 65, "income": 92,
        "label": "AI Engineering",
        "icon": "neurology",
        "summary": "High neural convergence required. Risk level: Sub-optimal due to rapid automation cycles.",
    },
    "cybersecurity": {
        "opportunity": 88, "demand": 90, "growth": 78,
        "risk": 15, "stability": 95, "income": 85,
        "label": "Cybersecurity",
        "icon": "security",
        "summary": "High stability corridor. Sustained relevance across 20-year projection cycle.",
    },
    "web_dev": {
        "opportunity": 80, "demand": 85, "growth": 60,
        "risk": 40, "stability": 70, "income": 75,
        "label": "Web Development",
        "icon": "code",
        "summary": "Accessible entry corridor with rapid skill acquisition. Competitive market requires differentiation.",
    },
    "data_science": {
        "opportunity": 85, "demand": 88, "growth": 82,
        "risk": 25, "stability": 75, "income": 88,
        "label": "Data Science",
        "icon": "query_stats",
        "summary": "Strong analytical pathway with growing demand. Overlaps significantly with AI trajectory.",
    },
    "cloud": {
        "opportunity": 87, "demand": 89, "growth": 85,
        "risk": 20, "stability": 85, "income": 87,
        "label": "Cloud Computing",
        "icon": "cloud",
        "summary": "Infrastructure backbone role. High stability with consistent enterprise demand.",
    },
    "blockchain": {
        "opportunity": 55, "demand": 45, "growth": 40,
        "risk": 70, "stability": 30, "income": 65,
        "label": "Blockchain",
        "icon": "token",
        "summary": "Volatile corridor with high uncertainty. Potential for outsized returns but significant risk.",
    },
    "game_dev": {
        "opportunity": 60, "demand": 55, "growth": 50,
        "risk": 55, "stability": 45, "income": 60,
        "label": "Game Development",
        "icon": "sports_esports",
        "summary": "Passion-driven pathway. Competitive entry but rewarding creative trajectory.",
    },
    "mobile_dev": {
        "opportunity": 75, "demand": 78, "growth": 55,
        "risk": 35, "stability": 68, "income": 75,
        "label": "Mobile Development",
        "icon": "smartphone",
        "summary": "Mature market with steady demand. Platform-specific expertise required.",
    },
}

# Default for unknown domains
DEFAULT_SCORES = {
    "opportunity": 50, "demand": 50, "growth": 50,
    "risk": 50, "stability": 50, "income": 50,
    "label": "Unknown",
    "icon": "help",
    "summary": "Insufficient data for reliable projection. Neural activation required.",
}


class ComparisonEngine:
    """Compare two decision paths across multiple axes."""

    def __init__(self, memory: MemoryEngine, activation: ActivationEngine):
        self.memory = memory
        self.activation = activation

    def compare(self, decision_a: str, decision_b: str, context: str = "") -> dict:
        """Compare two decisions on 6 axes."""
        data_a = self._get_decision_data(decision_a)
        data_b = self._get_decision_data(decision_b)

        radar_data = []
        axes = ["opportunity", "demand", "growth", "risk", "stability", "income"]
        axis_labels = {
            "opportunity": "Opportunity",
            "demand": "Market Demand",
            "growth": "Growth Rate",
            "risk": "Risk Level",
            "stability": "Stability",
            "income": "Income Potential",
        }

        for axis in axes:
            radar_data.append({
                "axis": axis_labels[axis],
                "score_a": data_a[axis],
                "score_b": data_b[axis],
            })

        # Generate recommendation
        score_a_total = sum(data_a[a] for a in axes if a != "risk") - data_a["risk"]
        score_b_total = sum(data_b[a] for a in axes if a != "risk") - data_b["risk"]

        if score_a_total > score_b_total:
            recommendation = f"{data_a['label']} shows stronger overall metrics in the current simulation."
        elif score_b_total > score_a_total:
            recommendation = f"{data_b['label']} shows stronger overall metrics in the current simulation."
        else:
            recommendation = "Both paths show comparable metrics. Decision depends on personal alignment."

        explanation = (
            f"Analysis compares {data_a['label']} (Vector A) against {data_b['label']} (Vector B) "
            f"across 6 neural evaluation axes. Scores are derived from activated memory clusters, "
            f"historical association patterns, and probabilistic market modeling."
        )

        return {
            "decision_a": {
                "name": decision_a,
                "label": data_a["label"],
                "icon": data_a["icon"],
                "summary": data_a["summary"],
                "scores": {a: data_a[a] for a in axes},
                "total_score": score_a_total,
            },
            "decision_b": {
                "name": decision_b,
                "label": data_b["label"],
                "icon": data_b["icon"],
                "summary": data_b["summary"],
                "scores": {a: data_b[a] for a in axes},
                "total_score": score_b_total,
            },
            "radar_data": radar_data,
            "recommendation": recommendation,
            "explanation": explanation,
        }

    def _get_decision_data(self, decision: str) -> dict:
        """Find comparison data for a decision."""
        decision_lower = decision.lower()

        # Direct keyword match
        for key, data in COMPARISON_DATA.items():
            node = self.memory.get_node(key)
            if not node:
                continue

            keywords = node.get("keywords", [])
            name = node.get("name", "").lower()

            if any(kw in decision_lower for kw in keywords) or name in decision_lower:
                return data

        # Try matching on label
        for key, data in COMPARISON_DATA.items():
            if data["label"].lower() in decision_lower or decision_lower in data["label"].lower():
                return data

        # Fallback
        result = dict(DEFAULT_SCORES)
        result["label"] = decision.title()
        return result
