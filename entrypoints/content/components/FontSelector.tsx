import React, { useState, useEffect } from 'react';

// 提供するGoogle Fontsのリスト
const GOOGLE_FONTS = [
  { name: 'Rampart One', value: "'Rampart One', sans-serif" },
  { name: 'Open Sans', value: "'Open Sans', sans-serif" },
  { name: 'Noto Sans JP', value: "'Noto Sans JP', sans-serif" },
  { name: 'M PLUS 1p', value: "'M PLUS 1p', sans-serif" },
  { name: 'Kosugi Maru', value: "'Kosugi Maru', sans-serif" },
  { name: 'Sawarabi Gothic', value: "'Sawarabi Gothic', sans-serif" },
  { name: 'Sawarabi Mincho', value: "'Sawarabi Mincho', serif" },
  { name: 'Poppins', value: "'Poppins', sans-serif" },
  { name: 'Lato', value: "'Lato', sans-serif" },
  { name: 'Montserrat', value: "'Montserrat', sans-serif" }
];

interface FontSelectorProps {
  onFontChange: (font: string) => void;
  currentFont: string;
}

const FontSelector: React.FC<FontSelectorProps> = ({ onFontChange, currentFont }) => {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  
  // Google Fontsの読み込み
  useEffect(() => {
    // WebFontの読み込みスクリプト
    const loadFonts = async () => {
      const fontFamilies = GOOGLE_FONTS.map(font => {
        // スペースを+に変換
        const formattedName = font.name.replace(/\s+/g, '+');
        return formattedName;
      });
      
      // linkタグを生成してheadに追加
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = `https://fonts.googleapis.com/css2?family=${fontFamilies.join('&family=')}&display=swap`;
      document.head.appendChild(link);
      
      // フォントの読み込みが完了したらステートを更新
      link.onload = () => {
        setFontsLoaded(true);
      };
    };
    
    loadFonts();
  }, []);

  // フォント選択時の処理
  const handleFontChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedFont = e.target.value;
    onFontChange(selectedFont);
    
    // Chromeストレージに保存
    chrome.storage.local.set({ selectedFont });
  };

  return (
    <div className="w-full mb-3">
      <label htmlFor="font-select" className="block mb-1 text-500 text-slate-700">
        フォント選択:
      </label>
      <select
        id="font-select"
        value={currentFont}
        onChange={handleFontChange}
        className="border-custom w-full cursor-pointer rounded bg-white px-3 py-2 text-sm text-slate-950 transition duration-200 ease-in-out"
        disabled={!fontsLoaded}
      >
        {!fontsLoaded && <option value="">読み込み中...</option>}
        {GOOGLE_FONTS.map((font) => (
          <option
            key={font.name}
            value={font.value}
            style={{ fontFamily: font.value }}
          >
            {font.name}
          </option>
        ))}
      </select>
      {!fontsLoaded && <span className="block text-sm text-slate-500 mt-1">フォントを読み込み中...</span>}
    </div>
  );
};

export default FontSelector;