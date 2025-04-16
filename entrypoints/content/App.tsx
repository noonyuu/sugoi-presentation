import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";

import "./style.css";
import fire from "../assets/gif/fire.gif";
import { getQrStatus } from "../utils/qr-status";
import { getSessionId } from "../utils/sessionId";
import { useWsConnection } from "../hook/useWsConnection";
import FontSelector from "./components/FontSelector";
import ColorSelector from "./components/FontColor";

type Message = {
  comment: string;
  css: number;
  type: "side" | "top";
  color?: string;
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

const COLOR_MAP: { [key: string]: string } = {
  red: "#FF0000",
  blue: "#0000FF",
  yellow: "#FFFF00",
  purple: "#800080",
  black: "#000000",
  white: "#FFFFFF",
};

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isAccordion, setIsAccordion] = useState<boolean>(true);
  const [commentOpacity, setCommentOpacity] = useState<number>(100);
  const [showSettings, setShowSettings] = useState<boolean>(true);
  const [specialAnimations, setSpecialAnimations] = useState<
    SpecialAnimation[]
  >([]);
  const [fonts, setFonts] = useState([]);
  const [selectedFont, setSelectedFont] = useState("Roboto");
  const [currentFont, setCurrentFont] = useState<string>(
    "'Noto Sans JP', sans-serif",
  );
  const [allowedColors, setAllowedColors] = useState<string[]>([
    "red",
    "blue",
    "yellow",
    "purple",
    "black",
    "white",
  ]);

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

  const message = useWsConnection(
    `https://presentation.noonyuu.com/app/ws?sessionId=${getSessionId()}`,
  ) as WsMessage | null;

  useEffect(() => {
    if (message) {
      const parsedMessage =
        typeof message === "string" ? JSON.parse(message) : message;

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
              anim.timestamp === timestamp ? { ...anim, active: false } : anim,
            ),
          );
        }, 3000);
      } else {
        const type = Math.random() > 0.5 ? "side" : "top";
        const cssValue = Math.floor(Math.random() * window.innerHeight * 0.8);

        const randomColorIndex = Math.floor(
          Math.random() * allowedColors.length,
        );
        const randomColor = allowedColors[randomColorIndex] || "black";

        const color = allowedColors.length > 0 ? randomColor : "black";

        setMessages((prevMessages) => [
          ...prevMessages,
          { comment: parsedMessage.word, css: cssValue, type: type, color },
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
    const handleStorageChange = (changes: {
      hideContents?: { newValue: boolean };
    }) => {
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
  // フォント変更のハンドラー
  const handleFontChange = (fontFamily: string) => {
    setCurrentFont(fontFamily);
  };
  const handleColorChange = (colors: string[]) => {
    setAllowedColors(colors);
  };

  return (
    <div className="absolute w-full">
      {/* 特別なアニメーション */}
      {specialAnimations.map(
        (animation, index) => (
          console.log(animation),
          (
            <div
              key={`special-${index}-${animation.timestamp}`}
              className={`pointer-events-none fixed z-50 ${
                animation.active ? "" : "opacity-0"
              }`}
              style={{
                left: `${animation.position.x}px`,
                top: `${animation.position.y}px`,
              }}
            >
              <div
                className={`text-6xl font-bold ${
                  animation.text === "888" ? "text-yellow-500" : "text-red-500"
                } scale-150 transform ${animation.active ? "animate-pulse" : ""}`}
              >
                {/^8+$/.test(animation.text) ? (
                  <div className="flex flex-col items-center">
                    {/* animation.text の長さ分だけ "8" を表示 */}
                    <span className="mb-2 text-8xl">
                      {Array.from({ length: animation.text.length }).map(
                        (_, i) => (
                          <span key={i}>8</span>
                        ),
                      )}
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <span className="mb-2 text-8xl">
                      <img src={fire} alt="" />
                    </span>
                  </div>
                )}
              </div>
            </div>
          )
        ),
      )}

      {/* 通常のメッセージ */}
      {messages.length > 0 &&
        messages.map((message, index) => (
          <div
            key={index}
            className={`absolute z-40 break-words rounded p-2 text-6xl text-black ${
              message.type === "top" ? "bottom-comment" : "slide-comment"
            }`}
            style={{
              left: message.type === "top" ? `${message.css}px` : "auto",
              top: message.type !== "top" ? `${message.css}px` : "auto",
              opacity: commentOpacity / 100,
              fontFamily: currentFont,
              color: COLOR_MAP[message.color || "black"] || "#000000",
            }}
          >
            {message.comment}
            {/* <img src={slime1} alt="" width={24} height={24}/> */}
          </div>
        ))}
      {isHidden && (
        <div>
          {/* 設定ボタン 常に表示 */}
          <button
            className="absolute right-4 top-4 z-[99999] rounded-full bg-blue-500 p-2 text-white shadow-lg transition-all hover:bg-blue-600"
            onClick={toggleSettings}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-settings"
            >
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </button>

          {/* 右上の設定パネル */}
          {showSettings && (
            <div className="absolute right-4 top-16 z-[99999] flex w-70 flex-col items-center justify-center gap-y-2 rounded-md border border-gray-200 bg-white/95 p-4 shadow-lg transition-all">
              <div className="mb-3 flex w-[248px] items-center justify-between">
                <h3 className="text-lg font-bold text-black">
                  コメント表示設定
                </h3>
              </div>

              {/* 透明度設定 */}
              <div className="mb-4 w-[248px]">
                <label className="mb-1 block font-medium text-black">
                  透明度: {commentOpacity}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={commentOpacity}
                  onChange={(e) => setCommentOpacity(parseInt(e.target.value))}
                  className="w-full accent-blue-500"
                />
              </div>
              {/* フォント選択 */}
              {/* セレクトボックス & 検索 */}
              <div className="w-62">
                <FontSelector
                  currentFont={currentFont}
                  onFontChange={handleFontChange}
                />
              </div>
              <div className="w-62">
                <ColorSelector
                  initialColors={allowedColors}
                  onColorChange={handleColorChange}
                />
              </div>
            </div>
          )}

          {/* QRコードパネル */}
          {isAccordion ? (
            <div className="absolute left-0 top-4 z-[99999] h-[256px] w-[256px] rounded-md border border-gray-200 bg-white shadow-lg">
              <button
                className="absolute left-2 top-2 flex size-8 items-center justify-center text-gray-600 transition-colors hover:text-gray-800"
                onClick={() => setIsAccordion(false)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-chevron-left"
                >
                  <path d="m15 18-6-6 6-6" />
                </svg>
              </button>
              <div className="flex h-full flex-col items-center justify-center gap-y-2">
                <div className="mb-2 font-medium text-black">
                  コメント用QRコード
                </div>
                <QRCodeSVG
                  value={`https://presentation.noonyuu.com/app/comment/form/${getSessionId()}`}
                  size={192}
                  level="H"
                />
              </div>
            </div>
          ) : (
            <div>
              <button
                className="absolute left-0 top-4 z-[99999] flex items-center justify-center rounded-r-md border border-gray-200 bg-white p-2 text-gray-700 shadow-md transition-colors hover:bg-gray-100"
                onClick={() => setIsAccordion(true)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-chevron-right"
                >
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
