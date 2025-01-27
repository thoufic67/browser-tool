import { useState } from "react";
import BrowserControl from "./components/BrowserControl";
import { ArrowPathIcon } from "@heroicons/react/24/solid";

function App() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const createSession = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:8000/sessions", {
        method: "POST",
      });
      const data = await response.json();
      setSessionId(data.session_id);
    } catch (error) {
      console.error("Failed to create session:", error);
    } finally {
      setLoading(false);
    }
  };

  const terminateSession = async () => {
    if (!sessionId) return;

    try {
      await fetch(`http://localhost:8000/sessions/${sessionId}`, {
        method: "DELETE",
      });
      setSessionId(null);
    } catch (error) {
      console.error("Failed to terminate session:", error);
    }
  };

  return (
    <div className="min-h-dvh min-w-dvw w-full h-full p-4">
      <header className="sticky top-0 left-0 w-full flex items-center justify-between px-16 py-4 z-10 shadow-lg bg-white rounded-lg">
        <h1 className="text-2xl font-bold">Browser Control</h1>
        {!sessionId ? (
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded-lg cursor-pointer"
            onClick={createSession}
            disabled={loading}
          >
            {loading ? (
              <p className="text-white text-sm flex items-center gap-2">
                <ArrowPathIcon className="w-5 h-5 animate-spin" />
                Starting...
              </p>
            ) : (
              <p className="text-white text-sm">Start Session</p>
            )}
          </button>
        ) : (
          <button
            className="bg-red-500 text-white px-4 py-2 rounded-lg"
            onClick={terminateSession}
          >
            End Session
          </button>
        )}
      </header>
      <div className="flex-1 w-full flex flex-col items-center justify-center mt-10">
        {sessionId ? (
          <div className="w-full h-full">
            <BrowserControl sessionId={sessionId} />
          </div>
        ) : (
          <div className="text-center text-gray-400 py-20">
            Start a session to control the browser
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
