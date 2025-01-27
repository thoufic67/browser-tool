import uuid
from typing import Dict, Optional
from .browser_controller import BrowserController

class SessionManager:
    def __init__(self):
        self.sessions: Dict[str, BrowserController] = {}
        
    async def create_session(self) -> str:
        """Create a new browser session"""
        session_id = str(uuid.uuid4())
        browser = BrowserController()
        await browser.initialize()
        self.sessions[session_id] = browser
        return session_id
        
    async def get_session(self, session_id: str) -> Optional[BrowserController]:
        """Get browser controller for a session"""
        return self.sessions.get(session_id)
        
    async def terminate_session(self, session_id: str) -> bool:
        """Terminate a browser session"""
        if session_id in self.sessions:
            browser = self.sessions[session_id]
            await browser.cleanup()
            del self.sessions[session_id]
            return True
        return False 