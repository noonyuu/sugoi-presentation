import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";

import "./style.css";
import { getQrStatus } from "../utils/qr-status";
import { getSessionId } from "../utils/sessionId";
import { useWsConnection } from "../hook/useWsConnection";

type Message = {
  comment: string;
  css: number;
};

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isAccordion, setIsAccordion] = useState<boolean>(true);
  const [wsConnected, setWsConnected] = useState<boolean>(false);

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

  const enterFullscreen = () => {
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen();
    }
  };

  const message = useWsConnection("http://localhost:8080/ws");

  useEffect(() => {
    if (message) {
      setMessages((prevMessages) => [...prevMessages, { comment: message, css: Math.floor(Math.random() * 100) }]);
    }
  }, [message]);

  console.log(message);

  const [isHidden, setIsHidden] = useState<boolean>(false);

  useEffect(() => {
    const fetchStatus = async () => {
      const status = await getQrStatus();
      setIsHidden(status);
    };

    // 初期状態の取得
    fetchStatus();

    // chrome.storageの変更を監視して反映
    const handleStorageChange = (changes: { hideContents?: { newValue: boolean } }) => {
      if (changes.hideContents) {
        setIsHidden(changes.hideContents.newValue);
      }
    };

    // chrome.storage.localの変更をリスン
    chrome.storage.onChanged.addListener(handleStorageChange);

    return () => {
      // クリーンアップ
      chrome.storage.onChanged.removeListener(handleStorageChange);
    };
  }, []);

  return (
    <div className="absolute w-full h-screen">
      {messages.length > 0 ? (
        messages.map((message, index) => (
          <div key={index} className="slide-comment text-black text-3xl p-2 rounded break-words absolute z-50" style={{ top: `${message.css}px` }}>
            {message.comment}
          </div>
        ))
      ) : (
        <div className="text-gray-500 text-sm">コメントはまだありません</div>
      )}
      {isHidden &&
        (isAccordion ? (
          <div className="w-64 h-80 bg-white rounded-md absolute z-50">
            <button className="size-5 text-black flex items-center justify-center p-3" onClick={() => setIsAccordion((event) => !event)}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-left">
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>
            <div className="flex items-center flex-col gap-y-2">
              <div className="text-black">コメント用QRコード</div>
              {/* <QRCodeSVG value={`https://localhost:8787/chat-screen/${getSessionId}}`} size={48 * 4} level="H" /> */}
              {wsConnected ? <span className="text-xs text-green-500 ml-1">●</span> : <span className="text-xs text-red-500 ml-1">●</span>}
            </div>
            {/* {messages.length > 0 ? (
              messages.map((message, index) => (
                <div key={index} className="slide-comment text-black p-2 w-full rounded break-words" style={{ top: `${message.css}px` }}>
                  {message.comment}
                </div>
              ))
            ) : (
              <div className="text-gray-500 text-sm">コメントはまだありません</div>
            )} */}
          </div>
        ) : (
          <div>
            <button className="size-5 bg-black/50 flex items-center justify-center p-3 z-50" onClick={() => setIsAccordion((event) => !event)}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-right">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
          </div>
        ))}
      {/* {message.map((m, i) => (
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
      ))} */}
    </div>
  );
}

export default App;
