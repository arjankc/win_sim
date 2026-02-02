import React from 'react';
import { X, Minus, Square } from 'lucide-react';
import { playSound } from '../../services/soundService';

interface WindowFrameProps {
  title: string;
  children: React.ReactNode;
  onClose?: () => void;
  className?: string;
}

export const WindowFrame: React.FC<WindowFrameProps> = ({ title, children, onClose, className = '' }) => {
  return (
    <div className={`bg-[#EFEFEF] border border-[#1883D7] shadow-2xl w-[800px] h-[600px] flex flex-col font-sans text-sm text-gray-900 animate-in zoom-in-95 duration-200 ${className}`}>
      {/* Title Bar */}
      <div className="bg-white px-2 py-1 flex justify-between items-center select-none">
        <div className="flex items-center gap-2">
           {/* Icon placeholder */}
           <div className="w-4 h-4 bg-gradient-to-tr from-orange-400 to-yellow-400 rounded-sm" />
           <span className="text-xs text-gray-700">{title}</span>
        </div>
        <div className="flex gap-1">
          <button onClick={() => playSound('click')} className="p-1 hover:bg-gray-200 text-gray-400"><Minus size={14}/></button>
          <button onClick={() => playSound('click')} className="p-1 hover:bg-gray-200 text-gray-400"><Square size={12}/></button>
          <button onClick={() => { playSound('click'); onClose?.(); }} className="p-1 hover:bg-red-500 hover:text-white text-gray-400 transition-colors"><X size={14}/></button>
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-1 p-0 relative overflow-hidden">
        {children}
      </div>
    </div>
  );
};

export const SetupButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ className, onClick, ...props }) => {
    return (
        <button 
            onClick={(e) => { playSound('click'); onClick?.(e); }}
            className={`px-6 py-1.5 bg-[#E1E1E1] border border-[#ADADAD] hover:border-[#0078D7] hover:bg-[#E5F1FB] active:bg-[#CCE4F7] focus:outline-none focus:ring-1 focus:ring-blue-400 text-black text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
            {...props}
        />
    )
}