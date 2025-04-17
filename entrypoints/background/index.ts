export default defineBackground(() => {
    console.log("Background script initialized");
    // 拡張機能起動時の初期化ロジック
    chrome.runtime.onInstalled.addListener(() => {
        console.log("Extension installed/updated");
    });
});

let storedData = ""; // データを保存する変数

// content.js からのデータ受信
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "saveData") {
    storedData = message.data;
  }
});

// popup.js からデータ要求が来たら返す
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "getData") {
    sendResponse({ data: storedData });
  }
  return true;
});

