import { useEffect, useState } from "react";

export default function PuzzleGame() {
  const [input, setInput] = useState("");
  const [status, setStatus] = useState("start");
  const [hashMatrix, setHashMatrix] = useState([]);
  const [fullScreen, setFullScreen] = useState(false);

  const correctAnswer = "18.5204,73.8567";
  const chars = "01▓▒░#@$%^&*";

  // Generate random hash-like strings
  const generateMatrix = () => {
    const salt = "🌍 Pune Puzzle";
    const matrix = Array.from({ length: 5 }, () =>
      Array.from({ length: 5 }, () =>
        window.crypto.subtle.digest(
          "SHA-256",
          new TextEncoder().encode(Math.random() + ":" + salt)
        )
      )
    );
    Promise.all(matrix.flat()).then((hashes) => {
      const hexes = hashes.map((buf) =>
        Array.from(new Uint8Array(buf))
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("")
      );
      const structured = [];
      while (hexes.length) structured.push(hexes.splice(0, 5));
      setHashMatrix(structured);
    });
  };

  useEffect(() => {
    // Force Fullscreen on game start
    document.documentElement.requestFullscreen().catch(() => {});

    generateMatrix();
    document.addEventListener("contextmenu", (e) => e.preventDefault());
    document.addEventListener("keydown", (e) => {
      if ((e.ctrlKey && e.key === "u") || e.key === "F12") e.preventDefault();
      if (status === "lose") {
        // Prevent browser exit attempts for 10 seconds after losing
        e.preventDefault();
      }
    });

    return () => {
      document.removeEventListener("keydown", () => {});
    };
  }, [status]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() === correctAnswer) {
      setStatus("win");
    } else {
      setStatus("lose");
      setFullScreen(true);
      document.documentElement.requestFullscreen().catch(() => {});
      // Prevent exit for 10 seconds if they lose
      setTimeout(() => {
        window.onbeforeunload = null; // Allow exit after 10 seconds
      }, 10000);
      window.onbeforeunload = () => "Are you sure you want to leave?";
    }
  };

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono p-4 flex flex-col items-center justify-center">
      {status === "start" && (
        <div className="space-y-6 text-center">
          <h1 className="text-xl">🔐 Terminal Puzzle Challenge</h1>
          <p>You have only ONE try to decode the coordinates.</p>
          <div className="grid grid-cols-5 gap-2 text-xs mt-4">
            {hashMatrix.map((row, i) =>
              row.map((hash, j) => (
                <div
                  key={i + "-" + j}
                  className="bg-green-900 p-1 rounded"
                >
                  {hash.slice(0, 16)}...
                </div>
              ))
            )}
          </div>
          <form onSubmit={handleSubmit} className="mt-4">
            <input
              type="text"
              placeholder="lat,long"
              className="bg-black border border-green-500 px-3 py-1 mr-2"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              required
            />
            <button className="bg-green-600 px-4 py-1">Submit</button>
          </form>
        </div>
      )}

      {status === "win" && (
        <div className="text-center">
          <h1 className="text-2xl text-green-300">✅ Correct! You Win!</h1>
        </div>
      )}

      {status === "lose" && (
        <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center animate-pulse">
          <div className="text-green-400 text-sm whitespace-pre-wrap text-center">
            {[...Array(20)].map((_, i) => (
              <div key={i}>
                {Array.from({ length: 80 })
                  .map(() => chars[Math.floor(Math.random() * chars.length)])
                  .join("")}
              </div>
            ))}
          </div>
          <p className="mt-10 text-lg">💀 SYSTEM BREACHED - GAME OVER</p>
        </div>
      )}
    </div>
  );
}
