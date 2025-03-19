import { getQrStatus, setQrStatus } from "@/entrypoints/utils/qr-status";
import { useState, useEffect } from "react";

export const CheckBox = () => {
  const [isHidden, setIsHidden] = useState<boolean>(false);

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
    <div style={{ padding: "10px", fontFamily: "Arial" }}>
      <label>
        <input type="checkbox" checked={isHidden} onChange={handleToggle} />
        コンテンツを非表示
      </label>
    </div>
  );
};
