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
    <div className="color-selector">
      <div className="color-selector-title">表示する色:</div>
      <div className="color-options">
        {COLOR_OPTIONS.map((color) => (
          <div key={color.value} className="color-option">
            <label className="color-checkbox-label">
              <input
                type="checkbox"
                checked={selectedColors.includes(color.value)}
                onChange={() => handleColorToggle(color.value)}
                className="color-checkbox"
              />
              <span 
                className="color-sample" 
                style={{ backgroundColor: color.code }}
              ></span>
              <span className="color-name">{color.name}</span>
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ColorSelector;