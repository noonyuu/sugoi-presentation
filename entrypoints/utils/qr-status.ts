var qrStatus: boolean = false;

export const setQrStatus = (status: boolean): void => {
  qrStatus = status;
  // chrome.storage.localに保存
  if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
    chrome.storage.local.set({ hideContents: qrStatus });
  }
  console.log("qrStatus updated:", qrStatus);
};

export const getQrStatus = (): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get("hideContents", (data) => {
        // デフォルト値を設定
        qrStatus = data.hideContents ?? false;
        resolve(qrStatus);
      });
    } else {
      reject(new Error("chrome.storage is not available"));
    }
  });
};
