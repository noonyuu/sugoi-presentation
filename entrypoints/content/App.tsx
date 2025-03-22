import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";

import "./style.css";
import slime1 from "../assets/characters/slime-1-1.png";
import fire from "../assets/gif/fire.gif";
import { getQrStatus } from "../utils/qr-status";
import { getSessionId } from "../utils/sessionId";
import { useWsConnection } from "../hook/useWsConnection";

type Message = {
  comment: string;
  css: number;
  type: "side" | "top"
};

type SpecialAnimation = {
  text: string;
  active: boolean;
  timestamp: number;
  position: {
    x: number;
    y: number;
  };
};

type WsMessage = {
  word: string;
  timestamp: string;
};

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isAccordion, setIsAccordion] = useState<boolean>(true);
  const [commentOpacity, setCommentOpacity] = useState<number>(100);
  const [showSettings, setShowSettings] = useState<boolean>(true);
  const [specialAnimations, setSpecialAnimations] = useState<SpecialAnimation[]>([]);

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

  const message = useWsConnection(`https://presentation.noonyuu.com/app/ws?sessionId=${getSessionId()}`) as WsMessage | null;

useEffect(() => {

  if (message) {
    // `message` が文字列なら JSON に変換する
    const parsedMessage = typeof message === "string" ? JSON.parse(message) : message;

    if (/^8+$/.test(parsedMessage.word) || parsedMessage.word === "花火") {
      const timestamp = Date.now();

      // ランダムな位置を生成
      const randomX = Math.floor(Math.random() * (window.innerWidth - 200));
      const randomY = Math.floor(Math.random() * (window.innerHeight - 200));

      setSpecialAnimations((prev) => [
        ...prev,
        {
          text: parsedMessage.word,
          active: true,
          timestamp: timestamp,
          position: {
            x: randomX,
            y: randomY,
          },
        },
      ]);

      // 3秒後にアニメーションを非アクティブにする
      setTimeout(() => {
        setSpecialAnimations((prev) =>
          prev.map((anim) =>
            anim.timestamp === timestamp ? { ...anim, active: false } : anim
          )
        );
      }, 3000);
    } else {
      const type = Math.random() > 0.5 ? "side" : "top";
      const cssValue = Math.floor(Math.random() * window.innerHeight * 0.8);

      setMessages((prevMessages) => [
        ...prevMessages,
        { comment: parsedMessage.word, css: cssValue, type: type },
      ]);
    }
  }
}, [message]);


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

  useEffect(() => {
    // background.js にデータを送信
    chrome.runtime.sendMessage({
      action: "saveData",
      data: localStorage.getItem("sessionId"),
    });
  }, [isHidden]);

  // 設定ボックスの表示/非表示を切り替え
  const toggleSettings = () => {
    setShowSettings(!showSettings);
  };

  return (
    <div className="absolute w-full h-screen">
      {/* 特別なアニメーション */}
      {specialAnimations.map((animation, index) => (
        console.log(animation),
        <div
          key={`special-${index}-${animation.timestamp}`}
          className={`fixed pointer-events-none z-50 ${
            animation.active ? "" : "opacity-0"
          }`}
          style={{
            left: `${animation.position.x}px`,
            top: `${animation.position.y}px`
          }}
        >
         <div
  className={`text-6xl font-bold ${
    animation.text === "888" ? "text-yellow-500" : "text-red-500"
  } transform scale-150 ${animation.active ? "animate-pulse" : ""}`}
>
  {/^8+$/.test(animation.text) ? (
    <div className="flex flex-col items-center">
      {/* animation.text の長さ分だけ "8" を表示 */}
      <span className="text-8xl mb-2">
        {Array.from({ length: animation.text.length }).map((_, i) => (
          <span key={i}>8</span>
        ))}
      </span>
    </div>
  ) : (
    <div className="flex flex-col items-center">
      <span className="text-8xl mb-2">
        <img src={fire} alt="" />
      </span>
    </div>
  )}
</div>
        </div>
      ))}

      {/* 通常のメッセージ */}
      {messages.length > 0 && (
        messages.map((message, index) => (
          <div
            key={index}
            className={`text-black text-3xl p-2 rounded break-words absolute z-40 ${
              message.type === "top" ? "bottom-comment" : "slide-comment"
            }`}
            style={{
              left: message.type === "top" ? `${message.css}px` : "auto",
              top: message.type !== "top" ? `${message.css}px` : "auto",
              opacity: commentOpacity / 100,
            }}
          >
            {message.comment}
            <img src={slime1} alt="" width={24} height={24}/>
          </div>
        ))
      )}
      {isHidden && (
        <div className="">
          {/* 設定ボタン 常に表示 */}
          <button 
            className="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-2 absolute z-50 right-4 top-4 shadow-lg transition-all"
            onClick={toggleSettings}
            title={showSettings ? "設定を閉じる" : "設定を開く"}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-settings">
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          </button>

          {/* 右上の設定パネル */}
          {showSettings && (
            <div className="w-[280px] bg-white/95 rounded-md absolute z-50 right-4 top-16 shadow-lg p-4 border border-gray-200 transition-all flex-col gap-y-2 flex items-center justify-center">
              <div className="flex justify-between items-center mb-3 w-[248px]">
                <h3 className="text-black font-bold text-lg">コメント表示設定</h3>
                <button 
                  onClick={toggleSettings}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x">
                    <path d="M18 6 6 18"/>
                    <path d="m6 6 12 12"/>
                  </svg>
                </button>
              </div>
              
              {/* 透明度設定 */}
              <div className="mb-4 w-[248px]">
                <label className="block text-black mb-1 font-medium">透明度: {commentOpacity}%</label>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={commentOpacity} 
                  onChange={(e) => setCommentOpacity(parseInt(e.target.value))}
                  className="w-full accent-blue-500"
                />
              </div>
            </div>
          )}

          {/* QRコードパネル */}
          {isAccordion ? (
            <div className="w-[256px] h-[256px] bg-white rounded-md absolute z-50 left-0 top-4 shadow-lg border border-gray-200">
              <button 
                className="size-8 text-gray-600 hover:text-gray-800 flex items-center justify-center absolute top-2 left-2 transition-colors" 
                onClick={() => setIsAccordion(false)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-left">
                  <path d="m15 18-6-6 6-6" />
                </svg>
              </button>
              <div className="flex-col gap-y-2 flex items-center justify-center h-full">
                <div className="text-black font-medium mb-2">コメント用QRコード</div>
                <QRCodeSVG value={`https://presentation.noonyuu.com/app/comment/form/${getSessionId()}`} size={192} level="H" />
              </div>
            </div>
          ) : (
            <div>
              <button 
                className="bg-white hover:bg-gray-100 text-gray-700 flex items-center justify-center p-2 absolute z-50 left-0 top-4 rounded-r-md shadow-md border border-gray-200 transition-colors" 
                onClick={() => setIsAccordion(true)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-right">
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
