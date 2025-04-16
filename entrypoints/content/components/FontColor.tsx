import React, { useState, useEffect } from 'react';

// 提供する色のリスト
const COLOR_OPTIONS = [
  { name: '赤', value: 'red', code: '#FF0000' },
  { name: '青', value: 'blue', code: '#0000FF' },
  { name: '黄色', value: 'yellow', code: '#FFFF00' },
  { name: '紫', value: 'purple', code: '#800080' },
  { name: '黒', value: 'black', code: '#000000' },
  { name: '白', value: 'white', code: '#FFFFFF' }
];

interface ColorSelectorProps {
  onColorChange: (selectedColors: string[]) => void;
  initialColors?: string[];
}

const ColorSelector: React.FC<ColorSelectorProps> = ({ 
  onColorChange, 
  initialColors = [] 
}) => {
  const [selectedColors, setSelectedColors] = useState<string[]>(initialColors);

  // 初期値が変更された場合に更新
  useEffect(() => {
    setSelectedColors(initialColors);
  }, [initialColors]);

  // チェックボックスの状態変更時の処理
  const handleColorToggle = (colorValue: string) => {
    const updatedColors = selectedColors.includes(colorValue)
      ? selectedColors.filter(color => color !== colorValue)
      : [...selectedColors, colorValue];
    
    setSelectedColors(updatedColors);
    onColorChange(updatedColors);
    
    // Chrome Storageに保存
    chrome.storage.local.set({ selectedColors: updatedColors });
  };

  return (
    <div className="w-full mb-4">
      <div className="text-base mb-2 text-slate-700">表示する色:</div>
      <div className="grid gap-2 grid-cols-2">
        {COLOR_OPTIONS.map((color) => (
          <div key={color.value} className="mb-2">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={selectedColors.includes(color.value)}
                onChange={() => handleColorToggle(color.value)}
                className="mr-2 cursor-pointer"
              />
              <span 
                className="inline-block size-4 rounded-sm mr-2 border border-solid border-slate-300" 
                style={{ backgroundColor: color.code }}
              ></span>
              <span className="text-sm text-slate-950">{color.name}</span>
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ColorSelector;