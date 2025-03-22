import { getQrStatus, setQrStatus } from "@/entrypoints/utils/qr-status";
import { useState, useEffect } from "react";

export const CheckBox = () => {
  const [isHidden, setIsHidden] = useState<boolean>(false);
  const [isQuestion, setIsQuestion] = useState<boolean>(false);

  useEffect(() => {
    const fetchStatus = async () => {
      const status = await getQrStatus();
      setIsHidden(status);
    };
    fetchStatus();
  }, []);

  const handleToggle = () => {
    const newState = !isHidden;
    setQrStatus(newState); // chrome.storage に保存
    setIsHidden(newState); // チェックボックスの状態を更新
  };

  return (
    <div className="flex" style={{ padding: "10px", fontFamily: "Arial" }}>
      <label className="flex items-center">
        <input type="checkbox" checked={isHidden} onChange={handleToggle} /> 
        <span className="px-2">プレゼンテーションモード </span>
      </label>
      <span onClick={() => setIsQuestion((event) => !event)} style={{ cursor: "pointer" }} className="relative">   
        <svg width="16px" height="16x" viewBox="-2 0 10 10" id="meteor-icon-kit__regular-questionmark-s" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M2 3C2 3.5523 1.5523 4 1 4C0.44772 4 0 3.5523 0 3C0 1.44772 1.4477 0 3 0C4.5523 0 6 1.44772 6 3C6 4.285 5.5004 4.8678 4.4472 5.3944C4.0004 5.6178 4 5.6183 4 6C4 6.5523 3.5523 7 3 7C2.4477 7 2 6.5523 2 6C2 4.715 2.4996 4.1322 3.5528 3.6056C3.9996 3.3822 4 3.3817 4 3C4 2.55228 3.4477 2 3 2C2.5523 2 2 2.55228 2 3zM3 10C2.4477 10 2 9.5523 2 9C2 8.4477 2.4477 8 3 8C3.5523 8 4 8.4477 4 9C4 9.5523 3.5523 10 3 10z" fill="#758CA3"/></svg>
        {isQuestion && (
        <div className="absolute bg-white p-4 border rounded-lg shadow-lg w-64 -left-20 top-6">
          <p>「ON」でできること</p>
          <ul>
            <li>・左上にQRコードを表示にできます。</li>
            <li>・右上からコメントのフォント調整ができます。</li>
          </ul>
        </div>
      )}
      </span>
    </div>
  );
};
