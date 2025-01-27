from playwright.async_api import async_playwright
from PIL import Image
import io

class BrowserController:
    def __init__(self):
        self.browser = None
        self.page = None
        self.context = None
        self.mouse_x = 0  # Add mouse position tracking
        self.mouse_y = 0
        
    async def initialize(self):
        """Initialize browser instance"""
        playwright = await async_playwright().start()
        self.browser = await playwright.chromium.launch(
            headless=True,  # Run in headless mode
            args=['--no-sandbox']  # Additional arguments if needed
        )
        self.context = await self.browser.new_context()
        self.page = await self.context.new_page()
        await self.page.set_viewport_size({"width": 1280, "height": 720})
        
    async def cleanup(self):
        """Clean up browser resources"""
        if self.browser:
            await self.browser.close()
            
    async def move_mouse(self, x: int, y: int):
        """Move mouse to specified coordinates"""
        self.mouse_x = x  # Store mouse position
        self.mouse_y = y
        await self.page.mouse.move(x, y)
        
    async def click(self, button: str, count: int = 1):
        """Perform mouse click"""
        await self.page.mouse.click(
            self.mouse_x,  # Use stored position
            self.mouse_y,
            button=button,
            click_count=count
        )
        
    async def type(self, text: str):
        """Type text"""
        await self.page.keyboard.type(text)
        
    async def get_screenshot(self) -> bytes:
        """Capture and compress screenshot"""
        screenshot = await self.page.screenshot()
        image = Image.open(io.BytesIO(screenshot))
        image = image.convert('RGB')  # Convert to RGB mode
        compressed = io.BytesIO()
        image.save(compressed, format='JPEG', quality=70)
        return compressed.getvalue() 