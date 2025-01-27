from pydantic import BaseModel

class SessionCreate(BaseModel):
    pass

class SessionResponse(BaseModel):
    session_id: str 