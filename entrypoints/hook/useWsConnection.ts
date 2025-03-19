import { useEffect, useRef, useState } from "react";
import ReconnectingWebSocket from "reconnecting-websocket";

export const useWsConnection = (url: string) => {
  const [message, setMessage] = useState<string | null>(null);
  const socketRef = useRef<ReconnectingWebSocket | null>(null);

  useEffect(() => {
    const websocket = new ReconnectingWebSocket(url);
    socketRef.current = websocket;

    // メッセージ受信時のイベントハンドラを設定
    const onMessage = (event: MessageEvent<string>) => {
      setMessage(event.data);
    };

    websocket.addEventListener("message", onMessage);

    // WebSocketのクローズ処理
    return () => {
      websocket.close();
      websocket.removeEventListener("message", onMessage);
    };
  }, [url]);

  return message;
};
