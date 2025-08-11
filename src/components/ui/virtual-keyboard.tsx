import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface VirtualKeyboardProps {
  highlightKey?: string;
  className?: string;
}

const VirtualKeyboard = ({ highlightKey, className }: VirtualKeyboardProps) => {
  const [pressedKey, setPressedKey] = useState<string>('');

  useEffect(() => {
    if (highlightKey) {
      setPressedKey(highlightKey);
      const timer = setTimeout(() => setPressedKey(''), 150);
      return () => clearTimeout(timer);
    }
  }, [highlightKey]);

  const keyboardRows = [
    ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', 'Backspace'],
    ['Tab', 'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '[', ']', '\\'],
    ['CapsLock', 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ';', "'", 'Enter'],
    ['Shift', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', ',', '.', '/', 'Shift'],
    ['Ctrl', 'Alt', 'Space', 'Alt', 'Ctrl']
  ];

  const getKeyWidth = (key: string) => {
    switch (key) {
      case 'Backspace': return 'w-16';
      case 'Tab': return 'w-12';
      case 'CapsLock': return 'w-14';
      case 'Enter': return 'w-16';
      case 'Shift': return 'w-20';
      case 'Space': return 'w-64';
      case 'Ctrl':
      case 'Alt': return 'w-10';
      default: return 'w-8';
    }
  };

  const normalizeKey = (key: string) => {
    const keyMap: Record<string, string> = {
      ' ': 'Space',
      'Backspace': 'Backspace',
      'Tab': 'Tab',
      'Enter': 'Enter',
      'Shift': 'Shift',
      'Control': 'Ctrl',
      'Alt': 'Alt',
      'CapsLock': 'CapsLock'
    };
    return keyMap[key] || key.toUpperCase();
  };

  const isKeyHighlighted = (key: string) => {
    if (!highlightKey) return false;
    const normalized = normalizeKey(highlightKey);
    return key === normalized || key.toUpperCase() === normalized;
  };

  return (
    <div className={cn("bg-secondary/30 p-4 rounded-lg border", className)}>
      <div className="space-y-2">
        {keyboardRows.map((row, rowIndex) => (
          <div key={rowIndex} className="flex justify-center space-x-1">
            {row.map((key) => (
              <button
                key={key}
                className={cn(
                  "h-8 text-xs font-medium rounded border transition-all duration-150",
                  getKeyWidth(key),
                  "bg-background hover:bg-primary/10 border-border",
                  isKeyHighlighted(key) && "bg-primary text-primary-foreground scale-110 shadow-lg",
                  pressedKey === key && "bg-accent text-accent-foreground scale-95"
                )}
                disabled
              >
                {key}
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default VirtualKeyboard;