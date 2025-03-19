import { useState } from "react";
import "./App.css";
import { CheckBox } from "./components/CheckBox";

function App() {
  const [fileName, setFileName] = useState("ファイルが選択されていません");
  const [isDisabled, setIsDisabled] = useState<boolean>(true);

  useEffect(() => {
    // 現在のurlを取得
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const currentUrl = tabs[0].url;
      console.log(currentUrl);
    });
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setFileName(file ? file.name : "ファイルが選択されていません");
    setIsDisabled(!file);
  };

  const handleUpload = () => {
    const fileInput = document.getElementById("pdf-upload-input") as HTMLInputElement;
    const file = fileInput.files?.[0];
    console.log(file);
    if (!file) {
      return;
    }
  };

  return (
    <>
      <CheckBox />
      <div className="upload-container">
        <div className="file-container">
          <label htmlFor="pdf-upload-input" className="upload-button">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="upload-icon">
              <path fill-rule="evenodd" d="M12 16.5a.75.75 0 01-.75-.75V7.88l-2.47 2.47a.75.75 0 01-1.06-1.06l3.75-3.75a.75.75 0 011.06 0l3.75 3.75a.75.75 0 11-1.06 1.06l-2.47-2.47v8.12a.75.75 0 01-.75.75zm-7.5 3a.75.75 0 01.75-.75h13.5a.75.75 0 010 1.5h-13.5a.75.75 0 01-.75-.75z" clip-rule="evenodd" />
            </svg>
            PDFファイルを選択
          </label>
          <input type="file" id="pdf-upload-input" accept=".pdf" className="hidden" onChange={handleFileChange} />
          <div id="file-name" className="file-name">
            {fileName}
          </div>
        </div>
        <button type="button" className="upload-action-button" disabled={isDisabled} onClick={handleUpload}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="upload-action-icon">
            <path fill-rule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.99c-1.25.687-2.779-.217-2.779-.164V5.653z" clip-rule="evenodd" />
          </svg>
          アップロード
        </button>
      </div>
    </>
  );
}

export default App;
