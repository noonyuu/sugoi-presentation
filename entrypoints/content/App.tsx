import { useState } from "react";
import "./style.css";

function App() {
  const [message, setMessage] = useState<string[]>([]);

  useEffect(() => {
    const handleFullScreenChange = () => {
      if (document.fullscreenElement) {
        console.log("Full screen mode is activated");
      } else {
        console.log("Full screen mode is deactivated");
      }
    };
    document.addEventListener("fullscreenchange", handleFullScreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullScreenChange);
    };
  }, []);

  const addMessage = () => {
    setMessage((prev) => [...prev, "Hello, World!"]);
  };

  const enterFullscreen = () => {
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen();
    }
  };

  return (
    <div className="container">
      {message.map((m, i) => (
        <div key={i} className="slide-comment">
          {m}
        </div>
      ))}
      <button onClick={enterFullscreen} className="origin-button">
        フルスクリーンにする
      </button>
      <button onClick={addMessage} className="origin-button">
        文字を追加
      </button>
      {message.map((m, i) => (
        <div key={i} className="slide-comment" style={{ top: `${i * 30}px` }}>
          {m}
        </div>
      ))}
    </div>
  );
}

export default App;
