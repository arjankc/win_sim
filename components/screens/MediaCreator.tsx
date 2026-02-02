import React, { useState, useEffect } from 'react';
import { WindowFrame, SetupButton } from '../ui/WindowFrame';
import { MediaConfig, OsVersion, PartitionScheme } from '../../types';
import { Disc, Save, HardDrive, AlertCircle, FileUp } from 'lucide-react';

interface MediaCreatorProps {
  onComplete: (config: MediaConfig) => void;
}

export const MediaCreator: React.FC<MediaCreatorProps> = ({ onComplete }) => {
  const [osVersion, setOsVersion] = useState<OsVersion>('Windows 11');
  const [partitionScheme, setPartitionScheme] = useState<PartitionScheme>('GPT');
  const [progress, setProgress] = useState(0);
  const [isBurning, setIsBurning] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [statusText, setStatusText] = useState("Ready to start.");

  useEffect(() => {
    if (isBurning) {
      setStatusText("Formatting volume (Quick)...");
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsBurning(false);
            setIsFinished(true);
            setStatusText("READY");
            return 100;
          }
          
          // Realistic stages
          const next = prev + (Math.random() * 2);
          
          if (next > 10 && next < 15) setStatusText("Creating file system: NTFS...");
          if (next > 20 && next < 80) setStatusText(`Copying ISO files: ${(next * 123).toFixed(0)} / 4096 MB...`);
          if (next > 90) setStatusText("Finalizing (making bootable)...");

          return next;
        });
      }, 100); // 100ms * 100 steps ~= 10 seconds total
      return () => clearInterval(interval);
    }
  }, [isBurning]);

  const handleStart = () => {
    setIsBurning(true);
    setProgress(0);
  };

  const handleClose = () => {
    if (isFinished) {
      onComplete({
        osVersion,
        partitionScheme,
        label: 'WINSIM_USB',
        isCreated: true
      });
    }
  };

  return (
    <div className="w-full h-full bg-[url('https://picsum.photos/1920/1080?blur=10')] bg-cover flex items-center justify-center p-4">
      {/* Background overlay to simulate 'Host' OS */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm z-0"></div>

      <WindowFrame title="WinSim Bootable Media Creator" className="z-10 w-[450px] h-auto min-h-[500px]">
        <div className="bg-[#F0F0F0] p-4 h-full text-sm flex flex-col gap-4">
          
          <div className="space-y-1">
            <label className="font-semibold text-gray-700">Device</label>
            <div className="bg-white border border-gray-300 p-2 flex items-center gap-2 text-gray-700">
              <HardDrive size={16} className="text-gray-500" />
              <span>32 GB USB Flash Drive (No Label)</span>
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-gray-700">Boot Selection</label>
            <div className="flex gap-2">
              <select 
                disabled={isBurning || isFinished}
                value={osVersion}
                onChange={(e) => setOsVersion(e.target.value as OsVersion)}
                className="flex-1 border border-gray-300 p-2 text-gray-700"
              >
                <option value="Windows 11">Windows 11 (ISO)</option>
                <option value="Windows 10">Windows 10 (ISO)</option>
              </select>
              <button disabled className="bg-gray-200 border border-gray-300 px-3 text-gray-600 cursor-not-allowed">SELECT</button>
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-gray-700">Partition Scheme</label>
            <select 
              disabled={isBurning || isFinished}
              value={partitionScheme}
              onChange={(e) => setPartitionScheme(e.target.value as PartitionScheme)}
              className="w-full border border-gray-300 p-2 text-gray-700"
            >
              <option value="GPT">GPT</option>
              <option value="MBR">MBR</option>
            </select>
            <div className="text-xs text-gray-500 mt-1 italic">
              {partitionScheme === 'GPT' ? 'Target System: UEFI (non CSM)' : 'Target System: BIOS (or UEFI-CSM)'}
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-gray-700">Volume Label</label>
            <input 
              disabled 
              value="WINSIM_USB" 
              className="w-full border border-gray-300 p-2 bg-gray-100 text-gray-500"
            />
          </div>

          <div className="space-y-1">
             <label className="font-semibold text-gray-700">File System</label>
             <div className="w-full border border-gray-300 p-2 bg-gray-100 text-gray-500">NTFS</div>
          </div>

          <div className="bg-gray-200 p-3 border border-gray-300 rounded text-xs text-gray-600 mt-2">
            <div className="font-bold flex items-center gap-1 mb-1">
              <AlertCircle size={12} /> Status
            </div>
            {statusText}
            {isBurning && (
               <div className="w-full h-4 bg-gray-300 mt-2 border border-gray-400">
                  <div className="h-full bg-green-500 transition-all duration-200" style={{ width: `${progress}%` }}></div>
               </div>
            )}
             {isFinished && (
               <div className="w-full h-8 bg-green-600 mt-2 text-white flex items-center justify-center font-bold">READY</div>
            )}
          </div>

          <div className="mt-auto flex justify-between pt-4 border-t border-gray-300">
            <button 
                onClick={handleClose}
                disabled={!isFinished}
                className="px-6 py-2 border border-gray-300 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 text-gray-900"
            >
                {isFinished ? 'Restart into Simulator' : 'Close'}
            </button>
            <button 
              onClick={handleStart}
              disabled={isBurning || isFinished}
              className="px-6 py-2 border border-gray-400 bg-gray-200 hover:bg-gray-300 disabled:opacity-50 font-semibold text-gray-900"
            >
              START
            </button>
          </div>

        </div>
      </WindowFrame>
    </div>
  );
};