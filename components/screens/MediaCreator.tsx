import React, { useState, useEffect, useRef } from 'react';
import { WindowFrame } from '../ui/WindowFrame';
import { MediaConfig, OsVersion, PartitionScheme } from '../../types';
import { HardDrive, Settings, ChevronDown, ChevronUp, FileUp, Download, File, Folder, Search, ArrowUp, Monitor, Globe, Check, X, Loader2 } from 'lucide-react';
import { playSound } from '../../services/soundService';
import { useSimulation } from '../../contexts/SimulationContext';

interface MediaCreatorProps {
  onComplete: (config: MediaConfig) => void;
}

// ... FilePicker and Downloader remain same, ensure they are kept in full file content ...
const FilePicker = ({ onClose, onSelect }: { onClose: () => void, onSelect: (file: string) => void }) => {
    // ... FilePicker implementation
    const [path, setPath] = useState("This PC > Downloads");
    const [selectedFile, setSelectedFile] = useState<string | null>(null);
    const files = [
        { name: "Win11_23H2_English_x64.iso", size: "6.24 GB", type: "Disc Image File", date: "10/12/2023" },
        { name: "Win10_22H2_English_x64.iso", size: "5.88 GB", type: "Disc Image File", date: "05/08/2023" },
        { name: "Ubuntu_22.04.3_LTS.iso", size: "4.69 GB", type: "Disc Image File", date: "08/15/2023" },
        { name: "Homework_Final.docx", size: "24 KB", type: "Word Document", date: "01/02/2025" }
    ];
    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/10 backdrop-blur-[1px]">
            <div className="bg-[#f0f0f0] text-gray-900 border border-gray-400 shadow-2xl w-[600px] h-[400px] flex flex-col font-sans text-xs rounded-sm animate-in zoom-in-95 duration-100">
                <div className="flex justify-between items-center p-2 bg-white border-b border-gray-200"><span>Open</span><button onClick={onClose}><X size={14}/></button></div>
                <div className="flex-1 p-2 overflow-y-auto">
                    {files.map(f => (
                        <div key={f.name} onClick={() => setSelectedFile(f.name)} onDoubleClick={() => { if(f.name.endsWith('.iso')) onSelect(f.name); }} className={`grid grid-cols-[2fr_1fr_1fr] px-2 py-1 ${selectedFile === f.name ? 'bg-[#cce8ff]' : ''}`}>
                            <span>{f.name}</span><span>{f.date}</span><span>{f.type}</span>
                        </div>
                    ))}
                </div>
                <div className="p-2 border-t flex justify-end gap-2">
                    <button disabled={!selectedFile} onClick={() => selectedFile && onSelect(selectedFile)} className="px-6 py-1 border border-[#0078d7] bg-[#e1e1e1]">Open</button>
                    <button onClick={onClose} className="px-6 py-1 border border-gray-300 bg-[#e1e1e1]">Cancel</button>
                </div>
            </div>
        </div>
    );
};

const Downloader = ({ onClose, onDownload }: { onClose: () => void, onDownload: (file: string) => void }) => {
    // ... Downloader implementation
    const [progress, setProgress] = useState(0);
    useEffect(() => {
        const t = setInterval(() => {
            setProgress(prev => { if (prev >= 100) { clearInterval(t); onDownload("Win11_23H2_English_x64.iso"); return 100; } return prev + 2; });
        }, 50);
        return () => clearInterval(t);
    }, []);
    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/10 backdrop-blur-[1px]">
            <div className="bg-white p-4 shadow-xl border w-[400px]">
                <div>Downloading... {progress}%</div>
                <div className="h-4 bg-gray-100 w-full border mt-2"><div className="h-full bg-green-500" style={{width: `${progress}%`}}></div></div>
            </div>
        </div>
    )
};

export const MediaCreator: React.FC<MediaCreatorProps> = ({ onComplete }) => {
  const { showToast, guidedMode } = useSimulation();
  // State
  const [device, setDevice] = useState("32GB");
  const [osVersion, setOsVersion] = useState<OsVersion>('Windows 11');
  const [partitionScheme, setPartitionScheme] = useState<PartitionScheme>('GPT');
  const [targetSystem, setTargetSystem] = useState('UEFI (non CSM)');
  const [volumeLabel, setVolumeLabel] = useState('WINSIM_USB');
  const [fileSystem, setFileSystem] = useState('NTFS');
  const [clusterSize, setClusterSize] = useState('4096 bytes (Default)');
  
  // Selection States
  const [isoName, setIsoName] = useState<string | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [showDownloader, setShowDownloader] = useState(false);

  // Process States
  const [isBurning, setIsBurning] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("READY");
  const [logs, setLogs] = useState<string[]>([]);
  const [showLog, setShowLog] = useState(false);

  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { logEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [logs]);

  useEffect(() => {
    if (partitionScheme === 'GPT') { setTargetSystem('UEFI (non CSM)'); } else { setTargetSystem('BIOS (or UEFI-CSM)'); }
  }, [partitionScheme]);

  useEffect(() => {
      if (isoName) {
          if (isoName.includes("Win10")) { setOsVersion("Windows 10"); setVolumeLabel("ESD-ISO"); } 
          else if (isoName.includes("Win11")) { setOsVersion("Windows 11"); setVolumeLabel("WINSIM_11_X64"); }
          addLog(`Selected ISO: ${isoName}`);
      }
  }, [isoName]);

  useEffect(() => {
    if (isBurning) {
      setLogs([]);
      addLog(`Formatting ${volumeLabel} (${fileSystem})...`);
      setStatusText("Formatting...");
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsBurning(false);
            setIsFinished(true);
            setStatusText("READY");
            addLog("Finalizing, please wait...");
            addLog("Creation finished! Please close this application to boot.");
            playSound('notification');
            return 100;
          }
          const next = prev + (Math.random() * 3);
          return Math.min(next, 100);
        });
      }, 100); 
      return () => clearInterval(interval);
    }
  }, [isBurning]);

  const addLog = (msg: string) => {
      const time = new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setLogs(prev => [...prev, `[${time}] ${msg}`]);
  };

  const handleStart = () => {
    if(!isoName) return;
    playSound('click');
    setIsBurning(true);
    setProgress(0);
    setIsFinished(false);
    setShowLog(true);
  };

  const handleClose = () => {
    if (isFinished) {
      playSound('click');
      onComplete({ osVersion, partitionScheme, label: volumeLabel, isCreated: true });
    }
  };

  return (
    <div className="w-full h-full bg-[url('https://picsum.photos/1920/1080?blur=10')] bg-cover flex items-center justify-center p-4 font-sans select-none relative">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm z-0"></div>

      {showPicker && <FilePicker onClose={() => setShowPicker(false)} onSelect={(f) => { setIsoName(f); setShowPicker(false); }} />}
      {showDownloader && <Downloader onClose={() => setShowDownloader(false)} onDownload={(f) => { setIsoName(f); setShowDownloader(false); }} />}

      <WindowFrame title="Rufus 4.5.2180 (Portable)" className="z-10 w-[420px] shadow-2xl border-gray-400" autoHeight={true}>
        <div className="bg-[#ECECE9] p-3 text-[11px] text-gray-800 flex flex-col gap-3">
          {/* Drive Properties */}
          <div className="flex flex-col gap-2">
             <div className="flex items-center gap-1 text-gray-700 font-semibold border-b border-gray-300 pb-0.5"><HardDrive size={14}/> <span>Drive Properties</span></div>
             <div className="space-y-2 pl-1">
                 <div>
                     <label className="block mb-1 text-gray-700">Device</label>
                     <select disabled={isBurning} className="w-full border border-gray-400 p-1 bg-white shadow-sm focus:border-blue-500 outline-none text-gray-900" value={device} onChange={(e) => setDevice(e.target.value)}>
                         <option value="32GB">WinSim USB (32 GB) - [USB]</option>
                     </select>
                 </div>
                 <div>
                     <label className="block mb-1 text-gray-700">Boot selection</label>
                     <div className="flex gap-1 h-7">
                         <div className={`flex-1 border border-gray-400 p-1 shadow-sm flex justify-between items-center cursor-default ${isoName ? 'bg-white text-black' : 'bg-gray-100 text-gray-600 italic'}`}>
                             <span className="truncate">{isoName || "Disk or ISO image (Please select)"}</span>
                         </div>
                         <button 
                            disabled={isBurning}
                            className={`px-3 border border-gray-400 bg-gray-100 hover:bg-gray-200 shadow-sm text-gray-700 font-semibold ${guidedMode && !isoName ? 'ring-2 ring-yellow-400 animate-pulse' : ''}`}
                            onClick={() => { playSound('click'); setShowPicker(true); }}
                         >
                             SELECT
                         </button>
                         <button disabled={isBurning} className="px-2 border border-gray-400 bg-gray-100 hover:bg-gray-200 shadow-sm text-gray-700" onClick={() => { playSound('click'); setShowDownloader(true); }}><Download size={14}/></button>
                     </div>
                 </div>
                 <div>
                     <label className="block mb-1 text-gray-700">Partition scheme</label>
                     <select disabled={isBurning} className="w-full border border-gray-400 p-1 bg-white shadow-sm outline-none text-gray-900" value={partitionScheme} onChange={(e) => setPartitionScheme(e.target.value as PartitionScheme)}>
                         <option value="GPT">GPT</option>
                         <option value="MBR">MBR</option>
                     </select>
                 </div>
                 <div><label className="block mb-1 text-gray-700">Target system</label><input disabled className="w-full border border-gray-300 bg-gray-100 p-1 text-gray-500" value={targetSystem} /></div>
             </div>
          </div>

          {/* Format Options */}
          <div className="flex flex-col gap-2 mt-1">
             <div className="flex items-center gap-1 text-gray-700 font-semibold border-b border-gray-300 pb-0.5"><Settings size={14}/> <span>Format Options</span></div>
             <div className="space-y-2 pl-1">
                 <div>
                     <label className="block mb-1 text-gray-700">Volume label</label>
                     <input disabled={isBurning} className="w-full border border-gray-400 p-1 bg-white shadow-sm outline-none text-gray-900" value={volumeLabel} onChange={(e) => setVolumeLabel(e.target.value.toUpperCase())}/>
                 </div>
                 <div className="flex gap-2">
                     <div className="flex-1"><label className="block mb-1 text-gray-700">File system</label><select disabled={isBurning} className="w-full border border-gray-400 p-1 bg-white shadow-sm outline-none text-gray-900" value={fileSystem} onChange={e => setFileSystem(e.target.value)}><option>NTFS</option><option>FAT32 (Default)</option></select></div>
                     <div className="flex-1"><label className="block mb-1 text-gray-700">Cluster size</label><select disabled={isBurning} className="w-full border border-gray-400 p-1 bg-white shadow-sm outline-none text-gray-900" value={clusterSize} onChange={e => setClusterSize(e.target.value)}><option>4096 bytes (Default)</option></select></div>
                 </div>
             </div>
          </div>

          {/* Status & Buttons */}
          <div className="mt-2 space-y-2">
              <div className="flex items-center justify-between text-gray-700 cursor-pointer" onClick={() => setShowLog(!showLog)}><span>Status</span>{showLog ? <ChevronDown size={14}/> : <ChevronUp size={14}/>}</div>
              <div className="h-6 w-full bg-gray-200 border border-gray-400 relative">
                  {isBurning && <div className="absolute inset-0 bg-[#00AA00] transition-all duration-200" style={{ width: `${progress}%` }}></div>}
                  {isFinished && <div className="absolute inset-0 bg-[#00AA00] w-full"></div>}
                  <div className={`absolute inset-0 flex items-center justify-center font-semibold ${isFinished || isBurning ? 'text-white' : 'text-gray-800'}`}>{statusText}</div>
              </div>
              {showLog && (<div className="h-32 bg-white border border-gray-400 overflow-y-auto font-mono text-[10px] p-1 shadow-inner text-gray-900">{logs.map((log, i) => <div key={i}>{log}</div>)}<div ref={logEndRef} /></div>)}
              <div className="flex gap-2 pt-2 border-t border-gray-300">
                  <button className="px-4 py-1.5 border border-gray-400 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-sm shadow-sm flex items-center gap-1" onClick={() => setShowLog(!showLog)}><FileUp size={14}/> Log</button>
                  <div className="flex-1"></div>
                  <button disabled={isBurning} className="px-6 py-1.5 border border-gray-400 bg-gray-100 hover:bg-gray-200 rounded-sm shadow-sm text-gray-800 disabled:opacity-50" onClick={handleClose}>{isFinished ? 'CLOSE' : 'CLOSE'}</button>
                  <button 
                    disabled={isBurning || !isoName}
                    className={`px-6 py-1.5 border border-gray-400 bg-gray-100 hover:bg-gray-200 rounded-sm shadow-sm text-gray-800 font-semibold disabled:opacity-50 ${guidedMode && isoName && !isBurning ? 'ring-2 ring-yellow-400 animate-pulse' : ''}`}
                    onClick={handleStart}
                  >
                      {isFinished ? 'START' : 'START'}
                  </button>
              </div>
          </div>
        </div>
      </WindowFrame>
    </div>
  );
};