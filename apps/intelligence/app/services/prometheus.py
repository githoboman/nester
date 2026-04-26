import re
import json
from typing import List, Dict, Any

SYSTEM_PROMPT = """You are Prometheus, the Nester AI financial assistant. 
Your goal is to provide actionable financial guidance strictly within the Nester ecosystem.
You can analyze user portfolios, explain vault strategies, and suggest savings optimizations.

RULES:
1. Stay within the scope of Nester (vaults, savings, Stellar/Soroban ecosystem).
2. Refuse to answer unrelated questions (e.g., politics, general news, jokes).
3. Be professional, transparent, and data-driven.
4. Never ask for or output sensitive information like private keys or passwords.
5. If you provide financial advice, always include a disclaimer that you are an AI assistant.
6. Use the provided context (portfolio, vaults, risk profile) to personalize your responses.
"""

UUID_REGEX = re.compile(r"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$")
BLOCKED_PATTERNS = [
    r"https?://[^\s]+",
    r"seed phrase",
    r"private key",
    r"mnemonic",
    r"secret key",
]

def validate_id(id_str: str) -> str:
    if not UUID_REGEX.match(id_str):
        raise ValueError(f"Invalid ID format: {id_str}")
    return id_str

def construct_system_message(context: Dict[str, Any]) -> str:
    """Injects user context into the system prompt."""
    context_str = json.dumps({
        "portfolio_value": context.get("portfolio_value", 0),
        "vaults": context.get("vaults", []),
        "risk_profile": context.get("risk_profile", "unknown"),
        "savings_goal": context.get("savings_goal", "unspecified")
    })
    return f"{SYSTEM_PROMPT}\n\nUSER CONTEXT:\n{context_str}"

def filter_ai_output(text: str) -> str:
    filtered_text = text
    for pattern in BLOCKED_PATTERNS:
        filtered_text = re.sub(pattern, "[REDACTED]", filtered_text, flags=re.IGNORECASE)
    if "click here" in filtered_text.lower() or "verify your account" in filtered_text.lower():
        filtered_text = "The AI response was blocked due to safety concerns."
    return filtered_text
