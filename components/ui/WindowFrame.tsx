import React, { useState } from 'react';
import { X, Minus, Square, Copy } from 'lucide-react';
import { playSound } from '../../services/soundService';

interface WindowFrameProps {
  title: string;
  children: React.ReactNode;
  onClose?: () => void;
  className?: string;
}

export const WindowFrame: React.FC<WindowFrameProps> = ({ title, children, onClose, className = '' }) => {
  const [isMaximized, setIsMaximized] = useState(false);

  const toggleMaximize = () => {
    playSound('click');
    setIsMaximized(!isMaximized);
  };

  const containerClass = isMaximized 
    ? 'fixed inset-0 w-full h-full z-[100] rounded-none' 
    : `bg-[#EFEFEF] border border-[#1883D7] shadow-2xl w-full max-w-[800px] h-[80vh] max-h-[600px] m-4 rounded-sm animate-in zoom-in-95 duration-200 ${className}`;

  return (
    <div className={`flex flex-col font-sans text-sm text-gray-900 bg-[#EFEFEF] ${isMaximized ? '' : 'border border-[#1883D7]'} ${containerClass}`}>
      {/* Title Bar */}
      <div className="bg-white px-2 py-1 flex justify-between items-center select-none shrink-0" onDoubleClick={toggleMaximize}>
        <div className="flex items-center gap-2 overflow-hidden">
           {/* Icon placeholder */}
           <div className="w-4 h-4 bg-gradient-to-tr from-orange-400 to-yellow-400 rounded-sm shrink-0" />
           <span className="text-xs text-gray-700 truncate">{title}</span>
        </div>
        <div className="flex gap-1 shrink-0">
          <button onClick={() => playSound('click')} className="p-1 hover:bg-gray-200 text-gray-400"><Minus size={14}/></button>
          <button onClick={toggleMaximize} className="p-1 hover:bg-gray-200 text-gray-400">
             {isMaximized ? <Copy size={12}/> : <Square size={12}/>}
          </button>
          <button onClick={() => { playSound('click'); onClose?.(); }} className="p-1 hover:bg-red-500 hover:text-white text-gray-400 transition-colors"><X size={14}/></button>
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-1 p-0 relative overflow-hidden flex flex-col">
        {children}
      </div>
    </div>
  );
};

export const SetupButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ className, onClick, ...props }) => {
    return (
        <button 
            onClick={(e) => { playSound('click'); onClick?.(e); }}
            className={`px-6 py-1.5 bg-[#E1E1E1] border border-[#ADADAD] hover:border-[#0078D7] hover:bg-[#E5F1FB] active:bg-[#CCE4F7] focus:outline-none focus:ring-1 focus:ring-blue-400 text-black text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap ${className}`}
            {...props}
        />
    )
}