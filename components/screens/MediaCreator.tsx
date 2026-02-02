import React, { useState, useEffect, useRef } from 'react';
import { WindowFrame } from '../ui/WindowFrame';
import { MediaConfig, OsVersion, PartitionScheme } from '../../types';
import { HardDrive, Settings, ChevronDown, ChevronUp, FileUp, Download, File, Folder, Search, ArrowUp, Monitor, Globe, Check, X, Loader2 } from 'lucide-react';
import { playSound } from '../../services/soundService';

interface MediaCreatorProps {
  onComplete: (config: MediaConfig) => void;
}

// --- SIMULATED FILE PICKER ---
const FilePicker = ({ onClose, onSelect }: { onClose: () => void, onSelect: (file: string) => void }) => {
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
                {/* Title Bar */}
                <div className="flex justify-between items-center p-2 bg-white border-b border-gray-200">
                    <span>Open</span>
                    <button onClick={onClose} className="hover:bg-red-500 hover:text-white p-1 rounded-sm text-gray-600"><X size={14}/></button>
                </div>
                
                {/* Address Bar */}
                <div className="flex gap-2 p-2 border-b border-gray-200 bg-white items-center">
                    <div className="flex gap-1 text-gray-500">
                        <button className="hover:bg-gray-200 p-1 rounded"><ArrowUp size={14}/></button>
                    </div>
                    <div className="flex-1 border border-gray-300 flex items-center px-2 py-1 gap-2">
                        <Folder size={14} className="text-yellow-500 fill-yellow-500"/>
                        <span>{path}</span>
                    </div>
                    <div className="w-48 border border-gray-300 flex items-center px-2 py-1">
                        <Search size={12} className="text-gray-400 mr-2"/>
                        <span className="text-gray-400">Search Downloads</span>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 flex overflow-hidden bg-white">
                    {/* Sidebar */}
                    <div className="w-32 border-r border-gray-200 p-2 space-y-1 text-gray-600">
                        <div className="flex items-center gap-2 p-1 hover:bg-blue-50 cursor-pointer"><Monitor size={14}/> Desktop</div>
                        <div className="flex items-center gap-2 p-1 bg-blue-100 border border-blue-200 rounded-sm cursor-pointer text-black"><Download size={14}/> Downloads</div>
                        <div className="flex items-center gap-2 p-1 hover:bg-blue-50 cursor-pointer"><File size={14}/> Documents</div>
                        <div className="flex items-center gap-2 p-1 hover:bg-blue-50 cursor-pointer"><HardDrive size={14}/> This PC</div>
                    </div>

                    {/* File List */}
                    <div className="flex-1 p-2 overflow-y-auto">
                        <div className="grid grid-cols-[2fr_1fr_1fr] text-gray-500 border-b pb-1 mb-1 px-2 font-semibold">
                            <span>Name</span>
                            <span>Date modified</span>
                            <span>Type</span>
                        </div>
                        {files.map(f => (
                            <div 
                                key={f.name}
                                onClick={() => { playSound('click'); setSelectedFile(f.name); }}
                                onDoubleClick={() => { if(f.name.endsWith('.iso')) onSelect(f.name); }}
                                className={`grid grid-cols-[2fr_1fr_1fr] px-2 py-1 cursor-default items-center group ${selectedFile === f.name ? 'bg-[#cce8ff] border border-[#99d1ff]' : 'hover:bg-[#e5f3ff] border border-transparent'}`}
                            >
                                <div className="flex items-center gap-2 truncate">
                                    {f.name.endsWith('.iso') ? <span className="text-purple-600"><File size={14}/></span> : <span className="text-blue-600"><File size={14}/></span>}
                                    <span className="truncate text-gray-900">{f.name}</span>
                                </div>
                                <span className="text-gray-600">{f.date}</span>
                                <span className="text-gray-600">{f.type}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-2 border-t border-gray-200 bg-[#f0f0f0] flex justify-end gap-2 items-center">
                    <div className="flex-1 flex gap-2 items-center">
                        <span className="w-16 text-right text-gray-700">File name:</span>
                        <input className="flex-1 border border-gray-300 px-2 py-1 text-gray-900 bg-white" value={selectedFile || ''} readOnly/>
                    </div>
                    <div className="flex gap-2">
                        <select className="border border-gray-300 px-2 py-1 w-32 bg-white text-gray-900">
                            <option>ISO Images (*.iso)</option>
                        </select>
                        <button 
                            disabled={!selectedFile || !selectedFile.endsWith('.iso')}
                            onClick={() => selectedFile && onSelect(selectedFile)}
                            className="px-6 py-1 border border-[#0078d7] bg-[#e1e1e1] text-black hover:bg-[#e5f1fb] hover:border-[#005a9e] disabled:opacity-50 min-w-[80px]"
                        >
                            Open
                        </button>
                        <button onClick={onClose} className="px-6 py-1 border border-gray-300 bg-[#e1e1e1] text-black hover:bg-[#e5f1fb] min-w-[80px]">Cancel</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- SIMULATED DOWNLOADER ---
const Downloader = ({ onClose, onDownload }: { onClose: () => void, onDownload: (file: string) => void }) => {
    const [step, setStep] = useState(0);
    const [progress, setProgress] = useState(0);
    const [downloading, setDownloading] = useState(false);
    const [fetchingInfo, setFetchingInfo] = useState(false);
    
    // Selection State
    const [version, setVersion] = useState("Windows 11");
    const [release, setRelease] = useState("23H2 (Build 22631.2428)");
    const [edition, setEdition] = useState("Windows 11 Home/Pro");
    const [lang, setLang] = useState("English (United States)");
    const [arch, setArch] = useState("x64");

    // Simulate fetching info delay when changing major options
    const handleChange = (setter: any, value: any, nextStep: number) => {
        setter(value);
        if (nextStep > step) {
            setFetchingInfo(true);
            setTimeout(() => {
                setFetchingInfo(false);
                setStep(nextStep);
            }, 600);
        } else {
            setStep(nextStep);
        }
    };

    useEffect(() => {
        if (downloading) {
            const t = setInterval(() => {
                setProgress(prev => {
                    if (prev >= 100) {
                        clearInterval(t);
                        onDownload(version === "Windows 11" ? "Win11_23H2_English_x64.iso" : "Win10_22H2_English_x64.iso");
                        return 100;
                    }
                    return prev + 1.5; // Fast download simulation
                });
            }, 50);
            return () => clearInterval(t);
        }
    }, [downloading, onDownload, version]);

    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/10 backdrop-blur-[1px]">
            <div className="bg-white text-gray-900 border border-gray-400 shadow-2xl w-[400px] flex flex-col font-sans text-xs rounded-sm animate-in zoom-in-95 duration-100 relative">
                <div className="bg-[#f0f0f0] p-2 border-b border-gray-300 font-semibold flex justify-between">
                    <span>Download ISO Image</span>
                    <button onClick={onClose} className="hover:bg-red-500 hover:text-white px-1 rounded-sm text-gray-600"><X size={14}/></button>
                </div>
                
                <div className="p-4 space-y-3 relative">
                    {fetchingInfo && (
                        <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center">
                            <Loader2 className="animate-spin text-blue-500" size={24}/>
                        </div>
                    )}

                    <div className="flex flex-col gap-1">
                        <label className="text-gray-700">Version</label>
                        <select 
                            className="border border-gray-300 p-1 w-full bg-white focus:border-blue-500 outline-none" 
                            value={version} 
                            onChange={e => { setVersion(e.target.value); setStep(0); }}
                            disabled={downloading}
                        >
                            <option>Windows 11</option>
                            <option>Windows 10</option>
                            <option>Windows 8.1</option>
                        </select>
                    </div>

                    <div className={`flex flex-col gap-1 transition-all ${step >= 0 ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                        <label className="text-gray-700">Release</label>
                        <select 
                            className="border border-gray-300 p-1 w-full bg-white focus:border-blue-500 outline-none" 
                            value={release} 
                            onChange={e => handleChange(setRelease, e.target.value, 1)} 
                            disabled={step < 0 || downloading}
                        >
                            {version === 'Windows 11' ? (
                                <>
                                    <option>23H2 (Build 22631.2428)</option>
                                    <option>22H2 (Build 22621.1702)</option>
                                </>
                            ) : (
                                <>
                                    <option>22H2 (Build 19045.2965)</option>
                                    <option>21H2 (Build 19044.1288)</option>
                                </>
                            )}
                        </select>
                    </div>

                    <div className={`flex flex-col gap-1 transition-all ${step >= 1 ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                        <label className="text-gray-700">Edition</label>
                        <select 
                            className="border border-gray-300 p-1 w-full bg-white focus:border-blue-500 outline-none" 
                            value={edition} 
                            onChange={e => handleChange(setEdition, e.target.value, 2)} 
                            disabled={step < 1 || downloading}
                        >
                            <option>{version} Home/Pro</option>
                            <option>{version} Education</option>
                        </select>
                    </div>

                    <div className={`flex flex-col gap-1 transition-all ${step >= 2 ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                        <label className="text-gray-700">Language</label>
                        <select 
                            className="border border-gray-300 p-1 w-full bg-white focus:border-blue-500 outline-none" 
                            value={lang} 
                            onChange={e => handleChange(setLang, e.target.value, 3)} 
                            disabled={step < 2 || downloading}
                        >
                            <option>English (United States)</option>
                            <option>English (International)</option>
                            <option>German</option>
                            <option>Spanish</option>
                            <option>French</option>
                        </select>
                    </div>

                    <div className={`flex flex-col gap-1 transition-all ${step >= 3 ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                        <label className="text-gray-700">Architecture</label>
                        <select 
                            className="border border-gray-300 p-1 w-full bg-white focus:border-blue-500 outline-none" 
                            value={arch} 
                            onChange={e => handleChange(setArch, e.target.value, 4)} 
                            disabled={step < 3 || downloading}
                        >
                            <option>x64</option>
                            {version !== 'Windows 11' && <option>x86</option>}
                        </select>
                    </div>

                    {downloading && (
                        <div className="mt-2 animate-in fade-in">
                            <div className="flex justify-between mb-1 text-gray-700">
                                <span>Downloading {version}...</span>
                                <span>{Math.round(progress)}%</span>
                            </div>
                            <div className="h-4 bg-gray-100 w-full border border-gray-300 overflow-hidden relative">
                                <div className="h-full bg-[#00D000]" style={{width: `${progress}%`}}></div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-3 bg-[#f0f0f0] border-t border-gray-300 flex justify-between">
                    <button onClick={onClose} className="px-4 py-1 border border-gray-400 bg-white hover:bg-gray-100 rounded-sm text-black">Cancel</button>
                    {!downloading && (
                        <button 
                            disabled={step < 4}
                            onClick={() => { setDownloading(true); playSound('click'); }} 
                            className="px-4 py-1 border border-[#0078d7] bg-[#0078d7] text-white hover:bg-[#006cc1] rounded-sm disabled:opacity-50"
                        >
                            Download
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export const MediaCreator: React.FC<MediaCreatorProps> = ({ onComplete }) => {
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

  // Auto-scroll logs
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  // Sync Partition Scheme -> Target System
  useEffect(() => {
    if (partitionScheme === 'GPT') {
      setTargetSystem('UEFI (non CSM)');
    } else {
      setTargetSystem('BIOS (or UEFI-CSM)');
    }
  }, [partitionScheme]);

  // Handle ISO selection updates
  useEffect(() => {
      if (isoName) {
          if (isoName.includes("Win10")) {
              setOsVersion("Windows 10");
              setVolumeLabel("ESD-ISO");
          } else if (isoName.includes("Win11")) {
              setOsVersion("Windows 11");
              setVolumeLabel("WINSIM_11_X64");
          } else if (isoName.includes("Ubuntu")) {
              // Not supported but we can let them try (it will fail boot check later)
              setVolumeLabel("UBUNTU_22_04");
          }
          addLog(`Selected ISO: ${isoName}`);
      }
  }, [isoName]);

  // Simulation Logic
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
            addLog("Found USB device: WinSim Virtual USB Device (32GB)");
            addLog("IMPORTANT: Secure Boot must be disabled for MBR/Legacy boot.");
            addLog("Creation finished! Please close this application to boot.");
            playSound('notification');
            return 100;
          }
          
          const next = prev + (Math.random() * 1.5);
          
          // Log generation based on progress thresholds (approximate)
          if (prev < 5 && next >= 5) addLog("Creating file system task: Completed.");
          if (prev < 10 && next >= 10) { addLog("Copying ISO files..."); setStatusText("Copying ISO files..."); }
          if (prev < 20 && next >= 20) addLog(`Extracting: Windows/System32/install.wim (4.2 GB)`);
          if (prev < 50 && next >= 50) addLog("Writing boot sector...");
          if (prev < 80 && next >= 80) addLog("Fixing up partition table...");
          
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
      onComplete({
        osVersion,
        partitionScheme,
        label: volumeLabel,
        isCreated: true
      });
    }
  };

  return (
    <div className="w-full h-full bg-[url('https://picsum.photos/1920/1080?blur=10')] bg-cover flex items-center justify-center p-4 font-sans select-none relative">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm z-0"></div>

      {showPicker && <FilePicker onClose={() => setShowPicker(false)} onSelect={(f) => { setIsoName(f); setShowPicker(false); }} />}
      {showDownloader && <Downloader onClose={() => setShowDownloader(false)} onDownload={(f) => { setIsoName(f); setShowDownloader(false); }} />}

      <WindowFrame title="Rufus 4.5.2180 (Portable)" className="z-10 w-[420px] h-auto shadow-2xl border-gray-400">
        <div className="bg-[#ECECE9] p-3 h-full text-[11px] text-gray-800 flex flex-col gap-3">
          
          {/* Drive Properties */}
          <div className="flex flex-col gap-2">
             <div className="flex items-center gap-1 text-gray-500 font-semibold border-b border-gray-300 pb-0.5">
                 <HardDrive size={14}/> <span>Drive Properties</span>
             </div>
             
             <div className="space-y-2 pl-1">
                 <div>
                     <label className="block mb-1 text-gray-700">Device</label>
                     <select 
                        disabled={isBurning}
                        className="w-full border border-gray-400 p-1 bg-white shadow-sm focus:border-blue-500 outline-none text-gray-900"
                        value={device}
                        onChange={(e) => setDevice(e.target.value)}
                     >
                         <option value="32GB">WinSim USB (32 GB) - [USB]</option>
                         <option value="64GB">Corsair Voyager (64 GB) - [USB]</option>
                     </select>
                 </div>

                 <div>
                     <label className="block mb-1 text-gray-700">Boot selection</label>
                     <div className="flex gap-1 h-7">
                         <div className={`flex-1 border border-gray-400 p-1 shadow-sm flex justify-between items-center cursor-default ${isoName ? 'bg-white text-black' : 'bg-gray-100 text-gray-500 italic'}`}>
                             <span className="truncate">{isoName || "Disk or ISO image (Please select)"}</span>
                         </div>
                         <button 
                            disabled={isBurning}
                            className="px-3 border border-gray-400 bg-gray-100 hover:bg-gray-200 shadow-sm text-gray-700 font-semibold"
                            onClick={() => { playSound('click'); setShowPicker(true); }}
                         >
                             SELECT
                         </button>
                         <button 
                            disabled={isBurning}
                            className="px-2 border border-gray-400 bg-gray-100 hover:bg-gray-200 shadow-sm text-gray-700"
                            onClick={() => { playSound('click'); setShowDownloader(true); }}
                            title="Download"
                         >
                             <Download size={14}/>
                         </button>
                     </div>
                 </div>

                 <div>
                     <label className="block mb-1 text-gray-700">Partition scheme</label>
                     <select 
                        disabled={isBurning}
                        className="w-full border border-gray-400 p-1 bg-white shadow-sm outline-none text-gray-900"
                        value={partitionScheme}
                        onChange={(e) => setPartitionScheme(e.target.value as PartitionScheme)}
                     >
                         <option value="GPT">GPT</option>
                         <option value="MBR">MBR</option>
                     </select>
                 </div>

                 <div>
                     <label className="block mb-1 text-gray-700">Target system</label>
                     <input disabled className="w-full border border-gray-300 bg-gray-100 p-1 text-gray-500" value={targetSystem} />
                 </div>
             </div>
          </div>

          {/* Format Options */}
          <div className="flex flex-col gap-2 mt-1">
             <div className="flex items-center gap-1 text-gray-500 font-semibold border-b border-gray-300 pb-0.5">
                 <Settings size={14}/> <span>Format Options</span>
             </div>

             <div className="space-y-2 pl-1">
                 <div>
                     <label className="block mb-1 text-gray-700">Volume label</label>
                     <input 
                        disabled={isBurning}
                        className="w-full border border-gray-400 p-1 bg-white shadow-sm outline-none text-gray-900"
                        value={volumeLabel}
                        onChange={(e) => setVolumeLabel(e.target.value.toUpperCase())}
                     />
                 </div>

                 <div className="flex gap-2">
                     <div className="flex-1">
                         <label className="block mb-1 text-gray-700">File system</label>
                         <select disabled={isBurning} className="w-full border border-gray-400 p-1 bg-white shadow-sm outline-none text-gray-900" value={fileSystem} onChange={e => setFileSystem(e.target.value)}>
                             <option>NTFS</option>
                             <option>FAT32 (Default)</option>
                         </select>
                     </div>
                     <div className="flex-1">
                         <label className="block mb-1 text-gray-700">Cluster size</label>
                         <select disabled={isBurning} className="w-full border border-gray-400 p-1 bg-white shadow-sm outline-none text-gray-900" value={clusterSize} onChange={e => setClusterSize(e.target.value)}>
                             <option>4096 bytes (Default)</option>
                             <option>8192 bytes</option>
                         </select>
                     </div>
                 </div>
             </div>
          </div>

          {/* Status & Buttons */}
          <div className="mt-2 space-y-2">
              <div className="flex items-center justify-between text-gray-500 cursor-pointer" onClick={() => setShowLog(!showLog)}>
                  <span>Status</span>
                  {showLog ? <ChevronDown size={14}/> : <ChevronUp size={14}/>}
              </div>
              
              <div className="h-6 w-full bg-gray-200 border border-gray-400 relative">
                  {isBurning && <div className="absolute inset-0 bg-[#00AA00] transition-all duration-200" style={{ width: `${progress}%` }}></div>}
                  {isFinished && <div className="absolute inset-0 bg-[#00AA00] w-full"></div>}
                  <div className={`absolute inset-0 flex items-center justify-center font-semibold ${isFinished || isBurning ? 'text-white' : 'text-gray-600'}`}>
                      {statusText}
                  </div>
              </div>

              {showLog && (
                  <div className="h-32 bg-white border border-gray-400 overflow-y-auto font-mono text-[10px] p-1 shadow-inner text-gray-900">
                      {logs.map((log, i) => <div key={i}>{log}</div>)}
                      <div ref={logEndRef} />
                  </div>
              )}

              <div className="flex gap-2 pt-2 border-t border-gray-300">
                  <button 
                    className="px-4 py-1.5 border border-gray-400 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-sm shadow-sm flex items-center gap-1"
                    onClick={() => setShowLog(!showLog)}
                  >
                      <FileUp size={14}/> Log
                  </button>
                  <div className="flex-1"></div>
                  <button 
                    disabled={isBurning}
                    className="px-6 py-1.5 border border-gray-400 bg-gray-100 hover:bg-gray-200 rounded-sm shadow-sm text-gray-800 disabled:opacity-50"
                    onClick={handleClose}
                  >
                      {isFinished ? 'CLOSE' : 'CLOSE'}
                  </button>
                  <button 
                    disabled={isBurning || !isoName}
                    className="px-6 py-1.5 border border-gray-400 bg-gray-100 hover:bg-gray-200 rounded-sm shadow-sm text-gray-800 font-semibold disabled:opacity-50"
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