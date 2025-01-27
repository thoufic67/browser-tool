import { useCallback, useEffect, useRef, useState } from "react";
import { debounce } from "lodash";

interface BrowserControlProps {
  sessionId: string;
}

const BrowserControl = ({ sessionId }: BrowserControlProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [url, setUrl] = useState("https://duckduckgo.com");
  const [disconnected, setDisconnected] = useState(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ws = new WebSocket(`ws://localhost:8000/stream/${sessionId}`);
    wsRef.current = ws;

    ws.binaryType = "arraybuffer";

    ws.onopen = () => {
      setConnected(true);
      console.log("WebSocket connected");
    };

    ws.onmessage = async (event) => {
      try {
        if (event.data instanceof ArrayBuffer) {
          const blob = new Blob([event.data], { type: "image/jpeg" });
          const imageUrl = URL.createObjectURL(blob);
          const img = new Image();

          img.onload = () => {
            const ctx = canvas.getContext("2d");
            if (ctx) {
              canvas.width = img.width;
              canvas.height = img.height;
              ctx.drawImage(img, 0, 0);
            }
            URL.revokeObjectURL(imageUrl);
          };

          img.onerror = (error) => {
            console.error("Error loading image:", error);
            setError("Error loading image");
          };

          img.src = imageUrl;
        }
      } catch (error) {
        console.error("Error processing WebSocket message:", error);
      }
    };

    ws.onclose = (message) => {
      setConnected(false);
      setDisconnected(true);
      setError(message.reason);
      console.log("WebSocket disconnected", message);
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      setError("Error connecting to the server");
    };

    return () => {
      ws.close();
    };
  }, [sessionId]);

  const handleMouseMove = useCallback(
    debounce((e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!wsRef.current || !canvasRef.current) return;

      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const x = Math.round(
        (e.clientX - rect.left) * (canvas.width / rect.width)
      );
      const y = Math.round(
        (e.clientY - rect.top) * (canvas.height / rect.height)
      );

      wsRef.current.send(
        JSON.stringify({
          action: "move",
          x,
          y,
        })
      );
    }, 500),
    []
  ); // 500ms = 2 times per second

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!wsRef.current) return;

    wsRef.current.send(
      JSON.stringify({
        action: "click",
        button: "left",
        count: 1,
      })
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!wsRef.current) return;

    wsRef.current.send(
      JSON.stringify({
        action: "type",
        text: e.key,
      })
    );
  };

  const handleNavigate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    wsRef.current?.send(JSON.stringify({ action: "navigate", url: url }));
  };

  const handleScroll = (e: React.UIEvent<HTMLCanvasElement>) => {
    if (!wsRef.current) return;

    wsRef.current.send(
      JSON.stringify({
        action: "scroll",
        direction: e.deltaY > 0 ? "down" : "up",
        amount: e.deltaY,
      })
    );
  };

  return (
    <div className="relative">
      {!connected &&
        (disconnected ? (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-10">
            <div className="text-black bg-white px-4 py-2 rounded-lg shadow-2xl border border-gray-200">
              Browser got disconnected due to{" "}
              <span className="font-bold text-red-500">{error}</span> , Please
              "End Session" and try again
            </div>
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-10">
            <div className="text-black bg-white px-4 py-2 rounded-lg shadow-2xl border border-gray-200">
              Connecting...
            </div>
          </div>
        ))}
      <form className="w-full flex items-center justify-center gap-2 m-4">
        <input
          type="text"
          placeholder="Enter URL to visit"
          value={url}
          className="border border-gray-300 rounded-lg px-4 py-2"
          onChange={(e) => setUrl(e.target.value)}
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded-lg cursor-pointer"
          onClick={handleNavigate}
          onSubmit={() => {
            wsRef.current?.send(
              JSON.stringify({ action: "navigate", url: url })
            );
          }}
        >
          Visit the page
        </button>
      </form>
      <canvas
        ref={canvasRef}
        className="w-full border border-gray-300 rounded-lg"
        onMouseMove={handleMouseMove}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onScroll={handleScroll}
        tabIndex={0}
      />
    </div>
  );
};

export default BrowserControl;
