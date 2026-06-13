"""Timeline Generator — Generates branching future timelines from activated memories."""
import random
import uuid
from .memory_engine import MemoryEngine
from .activation_engine import ActivationEngine


# Templates for future generation
CAREER_TEMPLATES = {
    "ai_engineer": {
        "title": "AI Engineer",
        "timelines": [
            "Year 1: Master ML fundamentals → Year 2: Build portfolio projects → Year 3: Land AI role → Year 5: Senior AI Engineer",
            "Year 1: Deep learning specialization → Year 2: Research internship → Year 3: ML Engineer → Year 5: Lead AI Architect",
            "Year 1: Learn Python & ML → Year 2: Kaggle competitions → Year 3: Junior ML role → Year 5: AI Product Lead",
        ],
        "descriptions": [
            "Pioneer neural architectures at a leading tech company, driving breakthrough AI systems.",
            "Build and deploy production ML systems that serve millions of users globally.",
            "Lead AI research initiatives, publishing papers and building cutting-edge models.",
        ],
    },
    "research_scientist": {
        "title": "Research Scientist",
        "timelines": [
            "Year 1-2: MS/PhD program → Year 3: Research assistant → Year 5: Published researcher → Year 7: Research Scientist",
            "Year 1: Academic foundations → Year 3: Lab research → Year 5: PhD defense → Year 7: Industry research lab",
        ],
        "descriptions": [
            "Advance the frontiers of AI at a prestigious research lab, contributing to foundational breakthroughs.",
            "Bridge academia and industry, translating research into real-world applications.",
        ],
    },
    "startup_founder": {
        "title": "Startup Founder",
        "timelines": [
            "Year 1: Build skills → Year 2: Identify problem → Year 3: MVP launch → Year 5: Funded startup",
            "Year 1-2: Industry experience → Year 3: Side project takes off → Year 5: Full-time founder → Year 7: Series A",
        ],
        "descriptions": [
            "Launch a transformative AI startup that disrupts an established industry.",
            "Build a venture-backed company solving critical problems with technology.",
        ],
    },
    "security_analyst": {
        "title": "Security Analyst",
        "timelines": [
            "Year 1: CompTIA Security+ → Year 2: SOC analyst → Year 3: Incident responder → Year 5: Senior Security Analyst",
            "Year 1: Networking fundamentals → Year 2: Security certifications → Year 3: SOC role → Year 5: Threat Hunter",
        ],
        "descriptions": [
            "Defend organizations against advanced cyber threats in a high-impact security role.",
            "Monitor, detect, and respond to security incidents across enterprise environments.",
        ],
    },
    "red_team": {
        "title": "Red Team Engineer",
        "timelines": [
            "Year 1: OSCP prep → Year 2: Junior pentester → Year 3: OSCP certified → Year 5: Red Team Lead",
            "Year 1-2: CTF competitions → Year 3: Bug bounty success → Year 4: Pentesting role → Year 6: Red Team Specialist",
        ],
        "descriptions": [
            "Simulate advanced adversary attacks to test and strengthen organizational defenses.",
            "Lead offensive security operations, uncovering critical vulnerabilities before attackers do.",
        ],
    },
    "consultant": {
        "title": "Security Consultant",
        "timelines": [
            "Year 1-2: Build expertise → Year 3: CISSP → Year 4: Advisory role → Year 6: Senior Consultant",
            "Year 1: Technical foundations → Year 3: Industry reputation → Year 5: Independent consultant",
        ],
        "descriptions": [
            "Advise Fortune 500 companies on cybersecurity strategy and risk management.",
            "Build a consulting practice helping organizations navigate the threat landscape.",
        ],
    },
    "full_stack": {
        "title": "Full Stack Developer",
        "timelines": [
            "Year 1: Learn React & Node.js → Year 2: Build projects → Year 3: Junior dev role → Year 5: Senior Full Stack",
            "Year 1: Bootcamp/self-learn → Year 2: Freelance projects → Year 3: Full-time role → Year 5: Tech Lead",
        ],
        "descriptions": [
            "Build complete web applications from frontend to backend at a growing tech company.",
            "Lead full-stack development for products used by millions of users.",
        ],
    },
    "data_engineer": {
        "title": "Data Engineer",
        "timelines": [
            "Year 1: SQL & Python → Year 2: ETL pipelines → Year 3: Cloud data platforms → Year 5: Senior Data Engineer",
        ],
        "descriptions": [
            "Design and build robust data infrastructure powering analytics and ML at scale.",
        ],
    },
    "cloud_architect": {
        "title": "Cloud Architect",
        "timelines": [
            "Year 1: AWS/Azure certifications → Year 2: Cloud engineer → Year 4: Solutions architect → Year 6: Chief Architect",
        ],
        "descriptions": [
            "Design cloud-native architectures for enterprise-scale distributed systems.",
        ],
    },
    "product_mgmt": {
        "title": "Product Manager",
        "timelines": [
            "Year 1-2: Technical experience → Year 3: Associate PM → Year 5: Senior PM → Year 7: Director of Product",
        ],
        "descriptions": [
            "Define product vision and strategy, bridging technical teams and business goals.",
        ],
    },
}


class TimelineGenerator:
    """Generates branching future timelines from activated memory nodes."""

    def __init__(self, memory: MemoryEngine, activation: ActivationEngine):
        self.memory = memory
        self.activation = activation

    def generate(self, decision_options: list[str], num_futures: int = 100) -> dict:
        """
        Generate future branches for each decision option.

        Returns tree structure with probabilities and metadata.
        """
        activated_ids = self.activation.get_activated_node_ids()
        all_futures = []
        tree = {"id": "root", "title": "Current State", "children": []}

        for decision in decision_options:
            # Find career paths relevant to this decision
            decision_futures = self._generate_decision_futures(
                decision, activated_ids, num_futures // max(len(decision_options), 1)
            )
            all_futures.extend(decision_futures)

            # Build tree branch
            branch = {
                "id": f"decision_{decision.lower().replace(' ', '_')}",
                "title": decision,
                "children": [
                    {
                        "id": f["id"],
                        "title": f["title"],
                        "probability": f["probability"],
                        "impact_score": f["impact_score"],
                    }
                    for f in decision_futures[:5]
                ],
            }
            tree["children"].append(branch)

        # Sort all futures by probability
        all_futures.sort(key=lambda x: x["probability"], reverse=True)

        # Normalize probabilities
        total_prob = sum(f["probability"] for f in all_futures) or 1.0
        for f in all_futures:
            f["probability"] = round((f["probability"] / total_prob) * 100, 2)

        return {
            "all_futures": all_futures,
            "tree": tree,
            "total_generated": len(all_futures),
        }

    def _generate_decision_futures(
        self, decision: str, activated_ids: list[str], count: int
    ) -> list[dict]:
        """Generate futures for a single decision."""
        futures = []
        decision_lower = decision.lower()

        # Find matching career templates
        matched_templates = []
        for key, template in CAREER_TEMPLATES.items():
            node = self.memory.get_node(key)
            if node:
                # Check if this career is relevant to the decision
                keywords = node.get("keywords", [])
                name = node.get("name", "").lower()
                relevance = 0.0

                if any(kw in decision_lower for kw in keywords):
                    relevance = 0.9
                elif any(word in decision_lower for word in name.split()):
                    relevance = 0.7
                elif key in activated_ids:
                    activation = self.memory.graph.nodes[key].get("activation_score", 0)
                    relevance = activation * 0.5

                if relevance > 0.1:
                    matched_templates.append((key, template, relevance))

        # If no direct matches, use activated career nodes
        if not matched_templates:
            for node_id in activated_ids:
                node = self.memory.graph.nodes.get(node_id, {})
                if node.get("domain") == "career" and node_id in CAREER_TEMPLATES:
                    activation = node.get("activation_score", 0.3)
                    matched_templates.append(
                        (node_id, CAREER_TEMPLATES[node_id], activation * 0.4)
                    )

        # Generate futures from templates with variations
        for key, template, relevance in matched_templates:
            node = self.memory.get_node(key)
            node_weight = node.get("weight", 1.0) if node else 1.0
            activation = (
                self.memory.graph.nodes[key].get("activation_score", 0.5)
                if key in self.memory.graph
                else 0.5
            )

            for i, (timeline, description) in enumerate(
                zip(template["timelines"], template["descriptions"])
            ):
                base_prob = relevance * node_weight * (1 - i * 0.15)
                impact = round(random.uniform(6.0, 10.0), 1)
                confidence = round(min(0.95, base_prob * 0.9 + random.uniform(-0.1, 0.1)), 2)

                # Find explanation path
                explanation = self._build_explanation(key, decision, activated_ids)

                future = {
                    "id": str(uuid.uuid4())[:8],
                    "title": f"{template['title']} — Path {chr(65 + i)}",
                    "description": description,
                    "probability": round(base_prob * 100, 2),
                    "impact_score": impact,
                    "confidence": confidence,
                    "timeline": timeline,
                    "explanation": explanation,
                    "activated_concepts": [
                        self.memory.graph.nodes[nid].get("name", nid)
                        for nid in activated_ids[:5]
                        if nid in self.memory.graph
                    ],
                    "decision": decision,
                    "parent_id": f"decision_{decision.lower().replace(' ', '_')}",
                }
                futures.append(future)

        # Generate additional random variations to reach target count
        while len(futures) < count and matched_templates:
            key, template, relevance = random.choice(matched_templates)
            variation_idx = len(futures) % len(template["timelines"])
            base = futures[variation_idx % len(futures)] if futures else None

            if base:
                variation = dict(base)
                variation["id"] = str(uuid.uuid4())[:8]
                variation["probability"] *= random.uniform(0.3, 0.8)
                variation["impact_score"] = round(random.uniform(4.0, 9.0), 1)
                variation["confidence"] = round(random.uniform(0.2, 0.7), 2)
                variation["title"] = f"{template['title']} — Variant {len(futures)}"
                futures.append(variation)

        return futures

    def _build_explanation(
        self, career_id: str, decision: str, activated_ids: list[str]
    ) -> str:
        """Build an explanation for why this future was generated."""
        career_node = self.memory.get_node(career_id)
        career_name = career_node["name"] if career_node else career_id

        activated_names = []
        for nid in activated_ids[:4]:
            if nid in self.memory.graph:
                activated_names.append(self.memory.graph.nodes[nid].get("name", nid))

        parts = [
            f"Based on the decision to '{decision}', the neural activation engine identified "
            f"strong connections to {career_name}."
        ]

        if activated_names:
            parts.append(
                f"Activated memory concepts: {', '.join(activated_names)}."
            )

        parts.append(
            f"Connection strength and historical patterns suggest this as a viable "
            f"future trajectory with measurable probability."
        )

        return " ".join(parts)
