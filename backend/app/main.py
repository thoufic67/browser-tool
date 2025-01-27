from fastapi import FastAPI, WebSocket, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from core.session_manager import SessionManager
from core.browser_controller import BrowserController
from api.models import SessionCreate, SessionResponse
import uvicorn
from PIL import Image
import io
import asyncio

app = FastAPI(title="Browser Control Backend")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize session manager
session_manager = SessionManager()

@app.post("/sessions", response_model=SessionResponse)
async def create_session():
    """Create a new browser session"""
    session_id = await session_manager.create_session()
    return SessionResponse(session_id=session_id)

@app.delete("/sessions/{session_id}")
async def terminate_session(session_id: str):
    """Terminate a browser session"""
    if await session_manager.terminate_session(session_id):
        return {"message": "Session terminated successfully"}
    raise HTTPException(status_code=404, detail="Session not found")

@app.websocket("/stream/{session_id}")
async def websocket_endpoint(websocket: WebSocket, session_id: str):
    """Handle WebSocket connection for browser control"""
    await websocket.accept()
    
    try:
        browser = await session_manager.get_session(session_id)
        if not browser:
            await websocket.close(code=1000, reason="Session not found")
            return

        FRAME_INTERVAL = 1/5  # 5 FPS

        async def stream_screenshots():
            while True:
                try:
                    screenshot = await browser.get_screenshot()
                    img = Image.open(io.BytesIO(screenshot))
                    img = img.convert('RGB')
                    img_byte_arr = io.BytesIO()
                    img.save(img_byte_arr, format='JPEG', quality=85, optimize=True)
                    img_byte_arr = img_byte_arr.getvalue()
                    
                    await websocket.send_bytes(img_byte_arr)
                    await asyncio.sleep(FRAME_INTERVAL)
                except Exception as e:
                    print(f"Screenshot streaming error: {str(e)}")
                    break

        # Start screenshot streaming task
        screenshot_task = asyncio.create_task(stream_screenshots())

        try:
            while True:
                # Receive message from client
                data = await websocket.receive_json()
                
                # Process different actions
                if data["action"] == "move":
                    await browser.move_mouse(data["x"], data["y"])
                elif data["action"] == "click":
                    await browser.click(data["button"], data.get("count", 1))
                elif data["action"] == "type":
                    await browser.type(data["text"])
                elif data["action"] == "scroll":
                    await browser.scroll(data["direction"], data["amount"])
                elif data["action"] == "navigate":
                    await browser.page.goto(data["url"])
                elif data["action"] == "refresh":
                    await browser.page.reload()
                elif data["action"] == "back":
                    await browser.back()
                elif data["action"] == "forward":
                    await browser.forward()
                elif data["action"] == "close_tab":
                    await browser.close_tab()
                
        except RuntimeError as e:
            if "websocket.send" in str(e) or "websocket.receive" in str(e):
                screenshot_task.cancel()
            raise e
                
    except Exception as e:
        print(f"WebSocket error: {str(e)}")
        await websocket.close(code=1000, reason=str(e))
    finally:
        try:
            screenshot_task.cancel()
            await websocket.close()
        except:
            pass

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000) 