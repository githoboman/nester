import time
from typing import List, Dict, Optional

class ConversationStore:
    def __init__(self, ttl_seconds: int = 3600):
        self.store: Dict[str, Dict] = {}
        self.ttl = ttl_seconds

    def _cleanup(self):
        now = time.time()
        expired = [sid for sid, data in self.store.items() if now - data["last_accessed"] > self.ttl]
        for sid in expired:
            del self.store[sid]

    def get_history(self, session_id: str) -> List[Dict[str, str]]:
        self._cleanup()
        if session_id not in self.store:
            return []
        self.store[session_id]["last_accessed"] = time.time()
        return self.store[session_id]["history"]

    def add_message(self, session_id: str, role: str, content: str):
        self._cleanup()
        if session_id not in self.store:
            self.store[session_id] = {"history": [], "last_accessed": time.time()}
        
        self.store[session_id]["history"].append({"role": role, "content": content})
        self.store[session_id]["last_accessed"] = time.time()
        
        # Keep history manageable (last 10 messages)
        if len(self.store[session_id]["history"]) > 20:
            self.store[session_id]["history"] = self.store[session_id]["history"][-20:]

conversation_store = ConversationStore()
