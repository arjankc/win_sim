import React, { useState, useEffect, useRef } from 'react';
import { WindowFrame, SetupButton } from '../ui/WindowFrame';
import { InstallState, DEFAULT_TIPS } from '../../types';
import { generateInstallationTips } from '../../services/geminiService';
import { 
    ArrowRight, HardDrive, RefreshCw, Plus, X as XIcon, AlertTriangle, Info, 
    Power, RotateCcw, Wrench, Terminal, Settings, Disc, History, Undo2, ArrowLeft, Loader2, Check, Cloud, Monitor, Trash2, Clock, Globe
} from 'lucide-react';
import { playSound } from '../../services/soundService';

interface SetupWizardProps {
  state: InstallState;
  onNext: (newState: InstallState) => void;
}

// --- Shared Interfaces ---
interface Partition {
    id: string;
    name: string;
    totalSizeMB: number;
    freeSpaceMB: number;
    type: string;
}

// --- CMD Component ---
const CommandPromptOverlay = ({ onClose }: { onClose: () => void }) => {
    const [lines, setLines] = useState<string[]>(["Microsoft Windows [Version 10.0.22621.1]", "(c) Microsoft Corporation. All rights reserved.", ""]);
    const [input, setInput] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            const cmd = input.trim().toLowerCase();
            const newLines = [...lines, `X:\\Sources>${input}`];

            if (cmd === 'exit') {
                onClose();
                return;
            } else if (cmd === 'cls') {
                setLines([]);
                setInput("");
                return;
            } else if (cmd === 'help') {
                newLines.push("DISKPART    Manages disks, partitions, or volumes.");
                newLines.push("EXIT        Quits the CMD.EXE program (command interpreter).");
                newLines.push("CLS         Clears the screen.");
                newLines.push("DIR         Displays a list of files and subdirectories in a directory.");
                newLines.push("VER         Displays the Windows version.");
                newLines.push("BOOTREC     Fixes critical disk structures.");
            } else if (cmd === 'ver') {
                newLines.push("Microsoft Windows [Version 10.0.22621.1]");
            } else if (cmd === 'dir') {
                newLines.push(" Volume in drive X is Boot");
                newLines.push(" Volume Serial Number is 1234-5678");
                newLines.push("");
                newLines.push(" Directory of X:\\Sources");
                newLines.push("");
                newLines.push("01/01/2025  12:00 PM    <DIR>          .");
                newLines.push("01/01/2025  12:00 PM    <DIR>          ..");
                newLines.push("01/01/2025  12:00 PM             3,500 setup.exe");
                newLines.push("               1 File(s)          3,500 bytes");
                newLines.push("               2 Dir(s)               0 bytes free");
            } else if (cmd.startsWith('diskpart')) {
                newLines.push("Microsoft DiskPart version 10.0.22621.1");
                newLines.push("");
                newLines.push("DISKPART> ");
            } else if (cmd) {
                newLines.push(`'${cmd.split(' ')[0]}' is not recognized as an internal or external command,`);
                newLines.push("operable program or batch file.");
            }
            newLines.push(""); // spacer
            setLines(newLines);
            setInput("");
        }
    };

    // Keep focus
    useEffect(() => {
        if (inputRef.current) inputRef.current.focus();
    });

    return (
        <div className="absolute top-10 left-4 right-4 md:left-10 md:w-[600px] h-[400px] max-h-[80vh] bg-black border-2 border-gray-500 shadow-2xl z-[9999] flex flex-col font-mono text-gray-300 text-sm animate-in zoom-in-95">
            <div className="bg-white text-black px-2 py-0.5 flex justify-between select-none shrink-0">
                <span className="truncate">Administrator: X:\windows\system32\cmd.exe</span>
                <button onClick={onClose}><XIcon size={14}/></button>
            </div>
            <div className="flex-1 p-2 overflow-y-auto" onClick={() => inputRef.current?.focus()}>
                {lines.map((l, i) => <div key={i} className="whitespace-pre-wrap">{l}</div>)}
                <div className="flex">
                    <span>X:\Sources&gt;</span>
                    <input 
                        ref={inputRef}
                        type="text" 
                        value={input} 
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="flex-1 bg-transparent border-none outline-none ml-1 text-gray-300 min-w-0"
                        autoFocus
                    />
                </div>
            </div>
        </div>
    );
};

// --- Sub-Components ---

const LanguageStep: React.FC<{onNext: () => void}> = ({onNext}) => (
  <div className="w-full h-full bg-[#400040] flex items-center justify-center bg-[url('https://picsum.photos/1920/1080?blur=5')] bg-cover p-2">
    <WindowFrame title="Windows Setup">
      <div className="flex flex-col md:flex-row h-full overflow-y-auto">
        <div className="w-full md:w-48 bg-white p-4 flex flex-col justify-between border-b md:border-b-0 md:border-r border-gray-200 shrink-0">
            <div className="mt-4 flex md:block justify-center">
                  <img 
                    src="https://upload.wikimedia.org/wikipedia/commons/c/c7/Windows_logo_-_2012.png" 
                    alt="Windows Logo" 
                    className="w-16 md:w-24 h-auto mx-auto mb-0 md:mb-4"
                  />
            </div>
            <div className="text-xs text-gray-500 text-center md:text-left hidden md:block">
                &copy; 2025 Microsoft Corp.
            </div>
        </div>
        <div className="flex-1 bg-white p-4 md:p-8 flex flex-col min-h-0">
          <h2 className="text-xl md:text-2xl font-light text-[#0078D7] mb-6 md:mb-8">Windows Setup</h2>
          
          <div className="space-y-4 max-w-md text-gray-900 w-full overflow-y-auto flex-1">
            <div className="grid grid-cols-1 md:grid-cols-3 items-start md:items-center gap-2 md:gap-4">
              <label className="text-left md:text-right font-medium text-sm">Language to install:</label>
              <select className="col-span-2 border border-gray-300 p-1 w-full text-sm outline-none focus:border-blue-500 cursor-pointer hover:border-blue-400">
                  <option>English (United States)</option>
                  <option>English (United Kingdom)</option>
                  <option>French (France)</option>
                  <option>German (Germany)</option>
                  <option>Spanish (Spain)</option>
                  <option>Japanese</option>
                  <option>Chinese (Simplified)</option>
              </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 items-start md:items-center gap-2 md:gap-4">
              <label className="text-left md:text-right font-medium text-sm">Time and currency format:</label>
              <select className="col-span-2 border border-gray-300 p-1 w-full text-sm outline-none focus:border-blue-500 cursor-pointer hover:border-blue-400">
                  <option>English (United States)</option>
                  <option>English (United Kingdom)</option>
                  <option>French (France)</option>
                  <option>German (Germany)</option>
                  <option>Spanish (Spain)</option>
                  <option>Japanese (Japan)</option>
                  <option>Chinese (Simplified, China)</option>
              </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 items-start md:items-center gap-2 md:gap-4">
              <label className="text-left md:text-right font-medium text-sm">Keyboard or input method:</label>
              <select className="col-span-2 border border-gray-300 p-1 w-full text-sm outline-none focus:border-blue-500 cursor-pointer hover:border-blue-400">
                  <option>US</option>
                  <option>United Kingdom</option>
                  <option>French</option>
                  <option>German</option>
                  <option>Spanish</option>
                  <option>Japanese</option>
                  <option>Microsoft Pinyin</option>
              </select>
            </div>
          </div>

          <div className="mt-4 md:mt-auto flex justify-end shrink-0">
            <SetupButton onClick={onNext}>Next</SetupButton>
          </div>
        </div>
      </div>
    </WindowFrame>
  </div>
);

const InstallNowStep: React.FC<{onNext: () => void, onRepair: () => void}> = ({onNext, onRepair}) => (
   <div className="w-full h-full flex items-center justify-center bg-[url('https://picsum.photos/1920/1080?blur=5')] bg-cover p-2">
     <WindowFrame title="Windows Setup">
       <div className="h-full w-full bg-white flex flex-col items-center justify-center relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-full bg-[url('https://picsum.photos/800/600?blur=2')] opacity-10 pointer-events-none"></div>
           <div className="z-10 text-center p-4">
                <img 
                    src="https://upload.wikimedia.org/wikipedia/commons/c/c7/Windows_logo_-_2012.png" 
                    alt="Windows Logo" 
                    className="w-24 md:w-32 h-auto mx-auto mb-8 drop-shadow-lg"
                />
               <button 
                onClick={onNext}
                className="px-6 md:px-8 py-3 bg-white border border-gray-400 shadow-sm hover:shadow-md hover:border-blue-500 text-base md:text-lg font-semibold flex items-center gap-2 mx-auto active:scale-95 transition-transform text-gray-900 whitespace-nowrap"
               >
                 Install now <ArrowRight size={20}/>
               </button>
               <div 
                onClick={() => { playSound('click'); onRepair(); }}
                className="mt-12 text-blue-600 text-sm hover:underline cursor-pointer select-none"
               >
                 Repair your computer
               </div>
           </div>
       </div>
     </WindowFrame>
   </div>
);

// --- RECOVERY ENVIRONMENT COMPONENTS ---

const RecoveryLayout = ({ title, children, onBack }: { title: string, children?: React.ReactNode, onBack?: () => void }) => (
    <div className="w-full h-full bg-[#0078D7] p-4 md:p-12 flex flex-col items-center justify-center animate-in fade-in select-none overflow-y-auto">
        <h1 className="text-2xl md:text-4xl font-light mb-8 md:mb-12 self-start md:ml-[10%] flex items-center gap-4 text-white">
            {onBack && <button onClick={() => { playSound('click'); onBack(); }} className="hover:bg-white/20 p-2 rounded-full"><ArrowLeft/></button>}
            {title}
        </h1>
        <div className="w-full max-w-4xl">
            {children}
        </div>
    </div>
);

const RecoveryOptionTile = ({ icon, title, desc, onClick }: { icon: React.ReactNode, title: string, desc?: string, onClick: () => void }) => (
    <button onClick={() => { playSound('click'); onClick(); }} className="bg-[#0078D7] hover:bg-[#006CC1] border-2 border-transparent hover:border-white/50 p-4 md:p-6 flex flex-col items-start gap-4 transition-all w-full h-full text-left text-white">
        <div className="bg-white rounded-full p-2 text-[#0078D7] shrink-0">{icon}</div>
        <div>
            <div className="font-semibold text-base md:text-lg">{title}</div>
            {desc && <div className="text-xs md:text-sm opacity-80 mt-1">{desc}</div>}
        </div>
    </button>
);

const RecoveryListButton = ({ title, desc, onClick }: { title: string, desc?: string, onClick: () => void }) => (
    <button onClick={() => { playSound('click'); onClick(); }} className="w-full text-left bg-black/20 hover:bg-white/20 p-4 mb-2 transition-all border border-transparent hover:border-white/30 flex flex-col text-white">
        <span className="font-semibold text-lg">{title}</span>
        {desc && <span className="text-sm opacity-80">{desc}</span>}
    </button>
);

// 1. Choose Option
const RecoveryChooseOption = ({ onNext }: { onNext: (state: InstallState) => void }) => {
    return (
        <RecoveryLayout title="Choose an option">
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <RecoveryOptionTile 
                    icon={<ArrowRight size={24}/>} 
                    title="Continue" 
                    desc="Exit and continue to Windows" 
                    onClick={() => onNext(InstallState.REBOOT_REQUIRED)}
                 />
                 <RecoveryOptionTile 
                    icon={<Disc size={24}/>} 
                    title="Use a device" 
                    desc="Use a USB drive, network connection, or Windows recovery DVD" 
                    onClick={() => onNext(InstallState.RECOVERY_USE_DEVICE)}
                 />
                 <RecoveryOptionTile 
                    icon={<Wrench size={24}/>} 
                    title="Troubleshoot" 
                    desc="Reset your PC or see advanced options" 
                    onClick={() => onNext(InstallState.RECOVERY_TROUBLESHOOT)}
                 />
                 <RecoveryOptionTile 
                    icon={<Power size={24}/>} 
                    title="Turn off your PC" 
                    onClick={() => window.location.reload()}
                 />
             </div>
        </RecoveryLayout>
    );
};

// 1b. Use a Device
const RecoveryUseDevice = ({ onNext }: { onNext: (state: InstallState) => void }) => (
    <RecoveryLayout title="Use a device" onBack={() => onNext(InstallState.RECOVERY_CHOOSE_OPTION)}>
        <div className="max-w-xl mx-auto space-y-4">
            <RecoveryListButton 
                title="EFI USB Device (WinSim USB)" 
                desc="Removable Disk" 
                onClick={() => window.location.reload()} 
            />
            <RecoveryListButton 
                title="EFI Network (IPv4)" 
                desc="PXE Network Boot" 
                onClick={() => window.location.reload()} 
            />
            <RecoveryListButton 
                title="EFI Network (IPv6)" 
                desc="PXE Network Boot" 
                onClick={() => window.location.reload()} 
            />
        </div>
    </RecoveryLayout>
);

// 2. Troubleshoot
const RecoveryTroubleshoot = ({ onNext }: { onNext: (state: InstallState) => void }) => {
    return (
        <RecoveryLayout title="Troubleshoot" onBack={() => onNext(InstallState.RECOVERY_CHOOSE_OPTION)}>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <RecoveryOptionTile 
                    icon={<RotateCcw size={24}/>} 
                    title="Reset this PC" 
                    desc="Lets you choose to keep or remove your personal files, and then reinstalls Windows." 
                    onClick={() => onNext(InstallState.RECOVERY_RESET_KEEP_REMOVE)}
                 />
                 <RecoveryOptionTile 
                    icon={<Wrench size={24}/>} 
                    title="Advanced options" 
                    onClick={() => onNext(InstallState.RECOVERY_ADVANCED)}
                 />
             </div>
        </RecoveryLayout>
    );
};

// 3. Reset PC Flow
const ResetPC_KeepOrRemove = ({ onNext }: { onNext: (state: InstallState) => void }) => (
    <RecoveryLayout title="Reset this PC" onBack={() => onNext(InstallState.RECOVERY_TROUBLESHOOT)}>
        <div className="max-w-xl mx-auto space-y-4">
            <RecoveryListButton 
                title="Keep my files" 
                desc="Removes apps and settings, but keeps your personal files." 
                onClick={() => onNext(InstallState.RECOVERY_RESET_CLOUD_LOCAL)}
            />
            <RecoveryListButton 
                title="Remove everything" 
                desc="Removes all of your personal files, apps, and settings." 
                onClick={() => onNext(InstallState.RECOVERY_RESET_CLOUD_LOCAL)}
            />
        </div>
    </RecoveryLayout>
);

const ResetPC_CloudOrLocal = ({ onNext }: { onNext: (state: InstallState) => void }) => (
    <RecoveryLayout title="Reset this PC" onBack={() => onNext(InstallState.RECOVERY_RESET_KEEP_REMOVE)}>
        <div className="max-w-xl mx-auto space-y-4">
            <RecoveryListButton 
                title="Cloud download" 
                desc="Download and reinstall Windows" 
                onClick={() => onNext(InstallState.RECOVERY_RESET_CONFIRM)}
            />
            <RecoveryListButton 
                title="Local reinstall" 
                desc="Reinstall Windows from this device" 
                onClick={() => onNext(InstallState.RECOVERY_RESET_CONFIRM)}
            />
        </div>
    </RecoveryLayout>
);

const ResetPC_Confirm = ({ onNext }: { onNext: (state: InstallState) => void }) => (
    <RecoveryLayout title="Reset this PC" onBack={() => onNext(InstallState.RECOVERY_RESET_CLOUD_LOCAL)}>
        <div className="max-w-2xl mx-auto text-white">
            <div className="bg-black/20 p-6 mb-8 text-sm space-y-4 rounded-md">
                <h3 className="font-semibold text-lg">Ready to reset this PC</h3>
                <p>Resetting will:</p>
                <ul className="list-disc pl-5 space-y-1">
                    <li>Remove all apps and programs that didn't come with this PC</li>
                    <li>Change settings back to their defaults</li>
                    <li>Reinstall Windows without removing your personal files</li>
                </ul>
            </div>
            <div className="flex justify-end gap-4">
                <button onClick={() => onNext(InstallState.RECOVERY_RESET_CLOUD_LOCAL)} className="px-6 py-2 border border-white/30 hover:bg-white/10">Cancel</button>
                <button onClick={() => onNext(InstallState.RECOVERY_RESET_PROGRESS)} className="px-6 py-2 bg-white text-[#0078D7] hover:bg-gray-100 font-semibold shadow-lg">Reset</button>
            </div>
        </div>
    </RecoveryLayout>
);

const ResetPC_Progress = ({ onComplete }: { onComplete: () => void }) => {
    const [progress, setProgress] = useState(0);
    
    useEffect(() => {
        const t = setInterval(() => {
            setProgress(prev => {
                if(prev >= 100) {
                    clearInterval(t);
                    onComplete();
                    return 100;
                }
                return prev + 0.5; // Slow-ish
            });
        }, 100);
        return () => clearInterval(t);
    }, []);

    return (
        <div className="w-full h-full bg-black text-white flex flex-col items-center justify-center p-8">
            <Loader2 className="animate-spin mb-8 text-white/80" size={48}/>
            <div className="text-2xl font-light mb-2 text-center">Resetting this PC {Math.round(progress)}%</div>
            <div className="text-gray-400 text-center">This will take a while. Your PC will restart.</div>
        </div>
    )
};

// 4. Advanced Options
const RecoveryAdvanced = ({ onNext, onOpenCmd }: { onNext: (state: InstallState) => void, onOpenCmd: () => void }) => {
    return (
        <RecoveryLayout title="Advanced options" onBack={() => onNext(InstallState.RECOVERY_TROUBLESHOOT)}>
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl">
                 <RecoveryOptionTile 
                    icon={<Wrench size={24}/>} 
                    title="Startup Repair" 
                    desc="Fix problems that keep Windows from loading" 
                    onClick={() => onNext(InstallState.RECOVERY_STARTUP_REPAIR)}
                 />
                 <RecoveryOptionTile 
                    icon={<Settings size={24}/>} 
                    title="UEFI Firmware Settings" 
                    desc="Change settings in your PC's UEFI firmware"
                    onClick={() => onNext(InstallState.RECOVERY_UEFI_CONFIRM)}
                 />
                 <RecoveryOptionTile 
                    icon={<Terminal size={24}/>} 
                    title="Command Prompt" 
                    desc="Use the Command Prompt for advanced troubleshooting"
                    onClick={onOpenCmd}
                 />
                 <RecoveryOptionTile 
                    icon={<History size={24}/>} 
                    title="System Restore" 
                    desc="Use a restore point recorded on your PC to restore Windows"
                    onClick={() => onNext(InstallState.RECOVERY_SYSTEM_RESTORE)} 
                 />
                 <RecoveryOptionTile 
                    icon={<Undo2 size={24}/>} 
                    title="Uninstall Updates" 
                    desc="Remove recently installed quality or feature updates"
                    onClick={() => onNext(InstallState.RECOVERY_UNINSTALL_UPDATES)} 
                 />
                 <RecoveryOptionTile 
                    icon={<Disc size={24}/>} 
                    title="System Image Recovery" 
                    desc="Recover Windows using a specific system image file"
                    onClick={() => onNext(InstallState.RECOVERY_IMAGE_RECOVERY)} 
                 />
             </div>
        </RecoveryLayout>
    );
};

const UefiSettingsConfirm = ({ onNext }: { onNext: (state: InstallState) => void }) => {
    return (
        <RecoveryLayout title="UEFI Firmware Settings" onBack={() => onNext(InstallState.RECOVERY_ADVANCED)}>
            <div className="max-w-xl mx-auto text-white">
                <p className="mb-8">Restart to change UEFI firmware settings.</p>
                <button 
                    onClick={() => onNext(InstallState.BIOS_POST)}
                    className="px-8 py-2 bg-white text-[#0078D7] hover:bg-gray-100 font-semibold shadow-lg"
                >
                    Restart
                </button>
            </div>
        </RecoveryLayout>
    );
};

// 5. Tool Implementations

const StartupRepairStep = ({ onNext }: { onNext: (state: InstallState) => void }) => {
    const [status, setStatus] = useState("Diagnosing your PC");
    
    useEffect(() => {
        const t1 = setTimeout(() => setStatus("Checking disk for errors. This might take over an hour."), 3000);
        const t2 = setTimeout(() => setStatus("Attempting repairs..."), 6000);
        const t3 = setTimeout(() => setStatus("Finished"), 9000);

        return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
    }, []);

    if (status === "Finished") {
        return (
            <div className="w-full h-full bg-[#0078D7] flex flex-col items-center justify-center p-8 animate-in fade-in">
                <div className="bg-white text-black p-6 max-w-md shadow-xl border-2 border-white w-full">
                    <h2 className="text-xl mb-4 text-[#0078D7]">Startup Repair</h2>
                    <p className="mb-4 text-sm">Startup Repair could not repair your PC</p>
                    <p className="mb-6 text-sm">Press "Advanced options" to try other repair options to repair your PC or "Shut down" to turn off your PC.</p>
                    <p className="mb-6 text-xs text-gray-500 break-all">Log file: X:\Windows\System32\Logfiles\Srt\SrtTrail.txt</p>
                    <div className="flex flex-col sm:flex-row justify-end gap-2">
                        <button onClick={() => window.location.reload()} className="px-4 py-1 border border-gray-400 hover:bg-gray-100">Shut down</button>
                        <button onClick={() => onNext(InstallState.RECOVERY_ADVANCED)} className="px-4 py-1 border border-gray-400 hover:bg-gray-100">Advanced options</button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="w-full h-full bg-black flex flex-col items-center justify-center pt-20 animate-in fade-in">
             <img 
                src="https://upload.wikimedia.org/wikipedia/commons/c/c7/Windows_logo_-_2012.png" 
                alt="Windows Logo" 
                className="w-24 h-auto mb-16"
            />
            <Loader2 className="animate-spin text-white mb-8" size={48}/>
            <div className="text-white text-lg font-light text-center px-4">{status}</div>
        </div>
    );
};

const SystemRestoreStep = ({ onBack }: { onBack: () => void }) => {
    const [step, setStep] = useState<'select' | 'confirm' | 'restoring' | 'done'>('select');
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        if(step === 'restoring') {
            const t = setInterval(() => {
                setProgress(prev => {
                    if (prev >= 100) {
                        clearInterval(t);
                        setStep('done');
                        return 100;
                    }
                    return prev + 1;
                });
            }, 100);
            return () => clearInterval(t);
        }
    }, [step]);

    if (step === 'select') {
        return (
            <div className="w-full h-full bg-[#0078D7] flex items-center justify-center p-4 animate-in fade-in">
                <WindowFrame title="System Restore" className="w-full max-w-[600px] h-[450px] bg-white text-black shadow-2xl">
                    <div className="p-4 flex flex-col h-full bg-white overflow-hidden">
                        <h2 className="text-lg font-semibold text-[#0078D7] mb-2">Restore system files and settings</h2>
                        <p className="text-sm mb-4">System Restore can help fix problems that might be making your computer run slowly or stop responding.</p>
                        
                        <div className="border border-gray-300 flex-1 overflow-x-auto flex flex-col min-h-0">
                            <div className="bg-gray-100 p-2 border-b border-gray-300 text-xs font-semibold grid grid-cols-[150px_1fr_100px] min-w-[500px]">
                                <span>Date and Time</span>
                                <span>Description</span>
                                <span>Type</span>
                            </div>
                            <div className="p-2 text-xs grid grid-cols-[150px_1fr_100px] hover:bg-blue-100 cursor-pointer selected:bg-blue-200 bg-blue-50 min-w-[500px]">
                                <span>01/01/2025 10:00 PM</span>
                                <span>Automatic Restore Point</span>
                                <span>System</span>
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 mt-4 shrink-0">
                            <button onClick={onBack} className="px-4 py-1 border border-gray-400 hover:bg-gray-100">Cancel</button>
                            <button onClick={() => setStep('confirm')} className="px-4 py-1 border border-gray-400 hover:bg-gray-100">Next &gt;</button>
                        </div>
                    </div>
                </WindowFrame>
            </div>
        );
    }

    if (step === 'confirm') {
        return (
            <div className="w-full h-full bg-[#0078D7] flex items-center justify-center p-8 animate-in fade-in">
                <div className="bg-white p-6 shadow-xl w-full max-w-[500px]">
                    <h3 className="text-lg font-semibold mb-4 text-[#0078D7]">Confirm your restore point</h3>
                    <p className="mb-4 text-sm">Your computer will be restored to the state it was in before the event in the description field below.</p>
                    <div className="bg-gray-100 p-2 mb-4 border text-sm">
                        <b>Date:</b> 01/01/2025 10:00 PM<br/>
                        <b>Description:</b> Automatic Restore Point
                    </div>
                    <div className="flex justify-end gap-2">
                        <button onClick={() => setStep('select')} className="px-4 py-1 border border-gray-400">Back</button>
                        <button onClick={() => setStep('restoring')} className="px-4 py-1 border border-gray-400">Finish</button>
                    </div>
                </div>
            </div>
        )
    }

    if (step === 'restoring') {
        return (
            <div className="w-full h-full bg-black text-white flex flex-col items-center justify-center p-4">
                <div className="mb-4 text-center">Please wait while your Windows files and settings are being restored</div>
                <div className="mb-8 text-center">System Restore is initializing...</div>
                <div className="w-full max-w-sm h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500" style={{width: `${progress}%`}}></div>
                </div>
            </div>
        )
    }

    if (step === 'done') {
        return (
            <div className="w-full h-full bg-[#0078D7] flex items-center justify-center animate-in fade-in p-4">
                 <div className="bg-white p-6 shadow-xl w-full max-w-[400px]">
                    <h3 className="text-lg font-semibold mb-4 text-[#0078D7]">System Restore</h3>
                    <p className="text-sm mb-6">System Restore completed successfully. The system has been restored to 01/01/2025. Your documents have not been affected.</p>
                    <div className="flex justify-end">
                        <button onClick={() => window.location.reload()} className="px-4 py-1 border border-gray-400">Restart</button>
                    </div>
                 </div>
            </div>
        )
    }

    return null;
};

const UninstallUpdatesStep = ({ onNext, onBack }: { onNext: (state: InstallState) => void, onBack: () => void }) => {
    return (
        <RecoveryLayout title="Uninstall Updates" onBack={onBack}>
            <div className="max-w-xl mx-auto space-y-4">
                <RecoveryListButton 
                    title="Uninstall latest quality update" 
                    desc="Uninstall the latest monthly quality update." 
                    onClick={() => onNext(InstallState.RECOVERY_UNINSTALL_QUALITY_CONFIRM)}
                />
                <RecoveryListButton 
                    title="Uninstall latest feature update" 
                    desc="Uninstall the latest feature update." 
                    onClick={() => onNext(InstallState.RECOVERY_UNINSTALL_FEATURE_CONFIRM)}
                />
            </div>
        </RecoveryLayout>
    );
};

const UninstallUpdatesConfirm = ({ type, onNext, onBack }: { type: 'quality'|'feature', onNext: () => void, onBack: () => void }) => {
    return (
        <RecoveryLayout title={`Uninstall latest ${type} update`} onBack={onBack}>
            <div className="max-w-2xl mx-auto text-white">
                <div className="bg-black/20 p-6 mb-8 text-sm space-y-4 rounded">
                    <h3 className="font-semibold text-lg">Uninstall latest {type} update</h3>
                    <p>{type === 'quality' 
                        ? "Uninstalling the latest quality update might fix recent issues. You won't be able to use Windows while this is happening."
                        : "Uninstalling the latest feature update might take a while. You won't be able to use Windows while this is happening."}
                    </p>
                    <div className="mt-4 font-semibold text-sm">User: WinSim User</div>
                </div>
                <div className="flex justify-end gap-4">
                    <button onClick={onBack} className="px-6 py-2 border border-white/30 hover:bg-white/10">Cancel</button>
                    <button onClick={onNext} className="px-6 py-2 bg-white text-[#0078D7] hover:bg-gray-100 font-semibold shadow-lg">Uninstall {type} update</button>
                </div>
            </div>
        </RecoveryLayout>
    );
}

const UninstallUpdatesProgress = ({ onComplete }: { onComplete: () => void }) => {
    const [progress, setProgress] = useState(0);
    const [finished, setFinished] = useState(false);

    useEffect(() => {
        const t = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(t);
                    setFinished(true);
                    return 100;
                }
                return prev + 0.8;
            });
        }, 100);
        return () => clearInterval(t);
    }, []);

    if (finished) {
        return (
            <div className="w-full h-full bg-[#0078D7] flex flex-col items-center justify-center animate-in fade-in p-8">
                <div className="bg-white text-black p-6 max-w-md shadow-xl border-2 border-white w-full">
                    <h2 className="text-xl mb-4 text-[#0078D7]">Uninstall Updates</h2>
                    <p className="mb-6 text-sm">The update was successfully uninstalled.</p>
                    <div className="flex justify-end">
                        <button onClick={() => window.location.reload()} className="px-6 py-1 border border-gray-400 hover:bg-gray-100">Done</button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="w-full h-full bg-black text-white flex flex-col items-center justify-center p-8">
            <Loader2 className="animate-spin mb-8 text-white/80" size={48}/>
            <div className="text-2xl font-light mb-2 text-center">Uninstalling update...</div>
            <div className="text-gray-400 text-center">This might take a few minutes.</div>
        </div>
    )
}

const SystemImageRecoveryStep = ({ onBack }: { onBack: () => void }) => {
    const [step, setStep] = useState<'scanning' | 'select' | 'options' | 'confirm' | 'restoring' | 'finished'>('scanning');
    const [progress, setProgress] = useState(0);
    const [useLatest, setUseLatest] = useState(true);

    useEffect(() => {
        if (step === 'scanning') {
            const t = setTimeout(() => setStep('select'), 2000);
            return () => clearTimeout(t);
        }
        if (step === 'restoring') {
            const t = setInterval(() => {
                setProgress(prev => {
                    if (prev >= 100) {
                        clearInterval(t);
                        setStep('finished');
                        return 100;
                    }
                    return prev + 0.5;
                });
            }, 100);
            return () => clearInterval(t);
        }
    }, [step]);

    if (step === 'scanning') {
        return (
            <div className="w-full h-full bg-[#0078D7] flex flex-col items-center justify-center animate-in fade-in">
                <div className="bg-white p-8 shadow-xl flex flex-col items-center rounded-sm">
                    <Loader2 className="animate-spin text-[#0078D7] mb-4" size={32}/>
                    <div className="text-gray-900">Scanning for system image disks...</div>
                </div>
            </div>
        );
    }

    if (step === 'select') {
        return (
            <div className="w-full h-full bg-[#0078D7] flex items-center justify-center animate-in fade-in p-4">
                <div className="bg-white border border-[#1883D7] shadow-xl p-4 w-full max-w-[600px] text-gray-900">
                    <h3 className="text-lg text-[#0078D7] mb-4">Re-image your computer</h3>
                    <p className="text-sm mb-4">Select a system image backup.</p>
                    
                    <div className="space-y-4 mb-6 text-sm">
                        <div className="flex gap-2">
                            <input type="radio" id="latest" checked={useLatest} onChange={() => setUseLatest(true)} className="mt-1" />
                            <div className="flex-1">
                                <label htmlFor="latest" className="font-semibold block">Use the latest available system image (recommended)</label>
                                <div className="ml-1 bg-gray-100 border border-gray-300 p-2 mt-1 text-gray-600">
                                    <div>Location: WinSim_Backup (D:)</div>
                                    <div>Date: 01/01/2025 12:00 PM</div>
                                    <div>Computer: DESKTOP-WINSIM</div>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-2 items-start">
                            <input type="radio" id="select" checked={!useLatest} onChange={() => setUseLatest(false)} className="mt-1" />
                            <label htmlFor="select">Select a system image</label>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2">
                        <button onClick={onBack} className="px-4 py-1 border border-gray-400 bg-gray-100 hover:bg-gray-200 text-sm">Cancel</button>
                        <button onClick={() => setStep('options')} className="px-4 py-1 border border-gray-400 bg-gray-100 hover:bg-gray-200 text-sm">Next &gt;</button>
                    </div>
                </div>
            </div>
        );
    }

    if (step === 'options') {
        return (
            <div className="w-full h-full bg-[#0078D7] flex items-center justify-center animate-in fade-in p-4">
                <div className="bg-white border border-[#1883D7] shadow-xl p-4 w-full max-w-[600px] text-gray-900">
                    <h3 className="text-lg text-[#0078D7] mb-4">Re-image your computer</h3>
                    <p className="text-sm mb-4">Choose additional restore options.</p>
                    
                    <div className="space-y-2 mb-6 text-sm">
                        <div className="flex gap-2 items-center">
                            <input type="checkbox" id="format" disabled checked className="w-4 h-4" />
                            <label htmlFor="format" className="text-gray-500">Format and repartition disks</label>
                        </div>
                        <p className="ml-6 text-xs text-gray-500 mb-4">You can exclude disks from being formatted or repartitioned.</p>
                        
                        <button className="px-4 py-1 border border-gray-300 bg-gray-50 text-gray-400 text-xs">Exclude disks...</button>
                        <div className="h-4"></div>
                        <button className="px-4 py-1 border border-gray-300 bg-gray-50 text-gray-400 text-xs">Advanced...</button>
                    </div>

                    <div className="flex justify-end gap-2">
                        <button onClick={() => setStep('select')} className="px-4 py-1 border border-gray-400 bg-gray-100 hover:bg-gray-200 text-sm">&lt; Back</button>
                        <button onClick={() => setStep('confirm')} className="px-4 py-1 border border-gray-400 bg-gray-100 hover:bg-gray-200 text-sm">Next &gt;</button>
                    </div>
                </div>
            </div>
        );
    }

    if (step === 'confirm') {
        return (
            <div className="w-full h-full bg-[#0078D7] flex items-center justify-center animate-in fade-in p-4">
                <div className="bg-white border border-[#1883D7] shadow-xl p-4 w-full max-w-[500px] text-gray-900">
                    <div className="flex items-center gap-4 mb-6">
                        <AlertTriangle className="text-yellow-500 shrink-0" size={32} />
                        <p className="text-sm">Your computer will be restored from the following system image:</p>
                    </div>
                    
                    <div className="bg-gray-100 border border-gray-300 p-2 text-sm mb-6">
                        <div><b>Date:</b> 01/01/2025 12:00 PM</div>
                        <div><b>Computer:</b> DESKTOP-WINSIM</div>
                        <div><b>Drives to restore:</b> C:, EFI System Partition, Recovery</div>
                    </div>

                    <p className="text-xs text-red-600 mb-6">All data on the drives to be restored will be replaced with the data in the system image.</p>

                    <div className="flex justify-end gap-2">
                        <button onClick={() => setStep('options')} className="px-4 py-1 border border-gray-400 bg-gray-100 hover:bg-gray-200 text-sm">Cancel</button>
                        <button onClick={() => setStep('restoring')} className="px-4 py-1 border border-gray-400 bg-gray-100 hover:bg-gray-200 text-sm">Finish</button>
                    </div>
                </div>
            </div>
        );
    }

    if (step === 'restoring') {
        return (
            <div className="w-full h-full bg-white border border-[#1883D7] shadow-xl p-6 flex flex-col max-w-lg mx-auto self-center mt-32 text-gray-900">
                <h3 className="text-lg text-[#0078D7] mb-4">Re-image your computer</h3>
                <p className="mb-2 text-sm">Restoring disk (C:)...</p>
                <div className="w-full h-4 bg-gray-200 border border-gray-400 mb-2">
                    <div className="h-full bg-green-500" style={{width: `${progress}%`}}></div>
                </div>
                <p className="text-xs text-gray-500 text-center">This might take from a few minutes to a few hours.</p>
            </div>
        );
    }

    if (step === 'finished') {
        return (
            <div className="w-full h-full bg-[#0078D7] flex items-center justify-center animate-in fade-in p-4">
                <div className="bg-white border border-[#1883D7] shadow-xl p-4 w-full max-w-[400px] text-gray-900">
                    <h3 className="text-lg text-[#0078D7] mb-4">Re-image your computer</h3>
                    <p className="text-sm mb-6">The restore operation completed successfully.</p>
                    <div className="flex justify-end">
                        <button onClick={() => window.location.reload()} className="px-4 py-1 border border-gray-400 bg-gray-100 hover:bg-gray-200 text-sm">Restart now</button>
                    </div>
                </div>
            </div>
        );
    }

    return null;
};

// --- Product Key, License, etc (Existing) ---

const ProductKeyStep: React.FC<{onNext: () => void}> = ({onNext}) => (
    <div className="w-full h-full flex items-center justify-center bg-[url('https://picsum.photos/1920/1080?blur=5')] bg-cover p-2">
        <WindowFrame title="Windows Setup">
            <div className="h-full w-full bg-white p-4 md:p-8 flex flex-col text-gray-900 overflow-y-auto">
                <h2 className="text-xl text-[#0078D7] mb-2">Activate Windows</h2>
                <p className="text-gray-600 mb-8">If this is the first time you're installing Windows on this PC (or you're installing a different edition), you need to enter a valid product key.</p>
                
                <div className="mb-6 overflow-x-auto">
                    <label className="block mb-2 font-bold text-gray-700">Product key</label>
                    <div className="flex gap-2 min-w-max">
                            {[0,1,2,3,4].map(i => (
                                <input 
                                key={i} 
                                className="w-16 h-10 border border-gray-300 text-center uppercase" 
                                maxLength={5}
                                placeholder="XXXXX"
                                />
                            ))}
                    </div>
                </div>

                <div className="mt-auto flex flex-col md:flex-row justify-between items-center gap-4">
                    <button onClick={onNext} className="text-[#0078D7] hover:underline text-sm md:text-base">I don't have a product key</button>
                    <SetupButton onClick={onNext}>Next</SetupButton>
                </div>
            </div>
        </WindowFrame>
    </div>
);

const LicenseStep: React.FC<{onNext: () => void}> = ({onNext}) => {
    const [licenseAccepted, setLicenseAccepted] = useState(false);
    return (
        <div className="w-full h-full flex items-center justify-center bg-[url('https://picsum.photos/1920/1080?blur=5')] bg-cover p-2">
          <WindowFrame title="Windows Setup">
             <div className="h-full w-full bg-white p-4 md:p-8 flex flex-col text-gray-900">
                <h2 className="text-xl text-[#0078D7] mb-4">Applicable notices and license terms</h2>
                <div className="flex-1 border border-gray-300 overflow-y-scroll p-4 bg-gray-50 text-xs font-mono mb-4 text-gray-700 leading-normal select-none">
                    <p className="font-bold mb-2">MICROSOFT SOFTWARE LICENSE TERMS</p>
                    <p className="mb-2">WINDOWS OPERATING SYSTEM</p>
                    <p className="mb-4">IF YOU LIVE IN (OR IF YOUR PRINCIPAL PLACE OF BUSINESS IS IN) THE UNITED STATES, PLEASE READ THE BINDING ARBITRATION CLAUSE AND CLASS ACTION WAIVER IN SECTION 11. IT AFFECTS HOW DISPUTES ARE RESOLVED.</p>
                    <p>Thank you for choosing Microsoft.</p>
                    <p className="mb-4">Depending on how you obtained the Windows software, this is a license agreement between (i) you and the device manufacturer or software installer that distributes the software with your device; or (ii) you and Microsoft Corporation (or, based on where you live or, if a business, where your principal place of business is located, one of its affiliates) if you acquired the software from a retailer. Microsoft is the device manufacturer for devices produced by Microsoft or one of its affiliates, and for devices where you acquired the software directly from Microsoft.</p>
                    <p className="font-bold mt-4">1. INSTALLATION AND USE RIGHTS.</p>
                    <p>a. License. The software is licensed, not sold. Under this agreement, we grant you the right to install and run one instance of the software on your device (the licensed device), for use by one person at a time, so long as you comply with all the terms of this agreement.</p>
                    <p>b. Device. In this agreement, "device" means a hardware system (whether physical or virtual) with an internal storage device capable of running the software. A hardware partition or blade is considered to be a device.</p>
                    <p>c. Restrictions. The manufacturer or installer and Microsoft reserve all rights (such as rights under intellectual property laws) not expressly granted in this agreement. For example, this license does not give you any right to, and you may not: use or virtualize features of the software separately; publish, copy (other than the permitted backup copy), rent, lease, or lend the software; transfer the software (except as permitted by this agreement); attempt to circumvent technical protection measures in the software; or reverse engineer, decompile, or disassemble the software, except if the laws where you live (or, if a business, where your principal place of business is located) permit this even when this agreement prohibits it. In that case, you may do only what your law allows.</p>
                    
                    <p className="font-bold mt-4">2. LICENSE CONDITIONS.</p>
                    <p>a. Rights. The software is licensed, not sold. This agreement only gives you some rights to use the software. Microsoft reserves all other rights. Unless applicable law gives you more rights despite this limitation, you may use the software only as expressly permitted in this agreement.</p>
                    <p>b. Multi-use scenarios. You may install and use one copy of the software on one device. You may not install or use a copy of the software on a second device, including a virtual device.</p>
                    
                    <p className="font-bold mt-4">3. PRIVACY; DATA COLLECTION.</p>
                    <p>Your privacy is important to us. Some of the software features send or receive information when using those features. Many of these features can be switched off in the user interface, or you can choose not to use them. By accepting this agreement and using the software you agree that Microsoft may collect, use, and disclose the information as described in the Microsoft Privacy Statement (aka.ms/privacy), and as may be described in the user interface associated with the software features.</p>

                    <p className="font-bold mt-4">4. UPDATES.</p>
                    <p>The software periodically checks for system and app updates, and downloads and installs them for you. You may obtain updates only from Microsoft or authorized sources, and Microsoft may need to update your system to provide you with those updates. By accepting this agreement, you agree to receive these types of automatic updates without any additional notice.</p>

                    <p className="font-bold mt-4">5. GEOGRAPHIC AND EXPORT RESTRICTIONS.</p>
                    <p>If there is a geographic region indicated on your software packaging, then you may activate the software only in that region. You must also comply with all domestic and international export laws and regulations that apply to the software, which include restrictions on destinations, end users, and end use.</p>

                    <p className="font-bold mt-4">6. SUPPORT.</p>
                    <p>For software that is preinstalled on your device, please contact the device manufacturer or installer for support options. Refer to the user guide that came with your device. Microsoft does not provide support services for the software, unless you purchased the software directly from Microsoft.</p>

                    <p className="font-bold mt-4">7. ENTIRE AGREEMENT.</p>
                    <p>This agreement (including the warranty below), any addendum or amendment included with the software, and the terms for supplements, updates, digital services and support services that you use, are the entire agreement for the software and any such supplements, updates, digital services and support services.</p>

                    <p className="font-bold mt-4">8. APPLICABLE LAW.</p>
                    <p>a. United States. If you acquired the software in the United States, Washington state law governs the interpretation of this agreement and applies to claims for breach of it, regardless of conflict of laws principles. The laws of the state where you live govern all other claims, including claims under state consumer protection laws, unfair competition laws, and in tort.</p>
                    <p>b. Outside the United States. If you acquired the software in any other country, the laws of that country apply.</p>

                    <p className="mt-8 italic text-gray-500">EULAID:WINSIM_11_PRO_RTM_EN-US</p>
                </div>
                <div className="flex items-center gap-2 mb-4">
                    <input 
                      type="checkbox" 
                      id="accept" 
                      className="w-4 h-4" 
                      checked={licenseAccepted}
                      onChange={(e) => setLicenseAccepted(e.target.checked)}
                    />
                    <label htmlFor="accept" className="select-none text-gray-900 text-sm">I accept the license terms</label>
                </div>
                <div className="flex justify-end">
                    <SetupButton disabled={!licenseAccepted} onClick={onNext}>Next</SetupButton>
                </div>
             </div>
          </WindowFrame>
        </div>
    );
};

const TypeStep: React.FC<{onNext: () => void}> = ({onNext}) => (
    <div className="w-full h-full flex items-center justify-center bg-[url('https://picsum.photos/1920/1080?blur=5')] bg-cover p-2">
        <WindowFrame title="Windows Setup">
            <div className="h-full w-full bg-white p-4 md:p-8 flex flex-col text-gray-900 overflow-y-auto">
            <h2 className="text-xl text-[#0078D7] mb-8">Which type of installation do you want?</h2>
            <div className="space-y-4">
                <button className="w-full text-left p-4 border border-gray-300 hover:bg-[#E5F1FB] hover:border-[#0078D7] transition-colors group flex gap-4 items-start">
                    <div className="p-2 bg-gray-100 rounded group-hover:bg-white shrink-0"><ArrowRight className="text-blue-500"/></div>
                    <div>
                        <div className="font-bold text-gray-800">Upgrade: Install Windows and keep files, settings, and applications</div>
                        <div className="text-xs text-gray-500 mt-1">The files, settings, and applications are moved to Windows with this option.</div>
                    </div>
                </button>
                <button 
                    onClick={onNext}
                    className="w-full text-left p-4 border border-gray-300 hover:bg-[#E5F1FB] hover:border-[#0078D7] transition-colors group flex gap-4 items-start">
                    <div className="p-2 bg-gray-100 rounded group-hover:bg-white shrink-0"><HardDrive className="text-blue-500"/></div>
                    <div>
                        <div className="font-bold text-gray-800">Custom: Install Windows only (advanced)</div>
                        <div className="text-xs text-gray-500 mt-1">The files, settings, and applications aren't moved to Windows with this option.</div>
                    </div>
                </button>
            </div>
            </div>
        </WindowFrame>
    </div>
);

const PartitionStep: React.FC<{onNext: () => void}> = ({onNext}) => {
    const [partitions, setPartitions] = useState<Partition[]>([
        { id: 'p0', name: 'Drive 0 Unallocated Space', totalSizeMB: 2048000, freeSpaceMB: 2048000, type: 'Unallocated' }
    ]);
    const [selectedPartitionId, setSelectedPartitionId] = useState<string>('p0');
    const [showNewModal, setShowNewModal] = useState(false);
    const [newSizeMB, setNewSizeMB] = useState(0);
    const [showFormatModal, setShowFormatModal] = useState(false);
    const [showSystemPartitionAlert, setShowSystemPartitionAlert] = useState(false);
    const [pendingPartitionSize, setPendingPartitionSize] = useState(0);

    const formatSize = (mb: number) => mb >= 1024 ? (mb / 1024).toFixed(1) + " GB" : mb + " MB";

    const initiateCreatePartition = () => {
        setShowSystemPartitionAlert(true);
        setShowNewModal(false);
    };

    const confirmCreatePartition = () => {
        const selectedPart = partitions.find(p => p.id === selectedPartitionId);
        if (!selectedPart) return;

        const isFreshDrive = partitions.length === 1 && partitions[0].type === 'Unallocated';
        let newPartList = partitions.filter(p => p.id !== selectedPartitionId);

        let sizeToConsume = pendingPartitionSize;

        if (isFreshDrive) {
            newPartList.push({ id: 'efi', name: 'Drive 0 Partition 1: System', totalSizeMB: 100, freeSpaceMB: 70, type: 'System' });
            newPartList.push({ id: 'msr', name: 'Drive 0 Partition 2: MSR (Reserved)', totalSizeMB: 16, freeSpaceMB: 16, type: 'MSR (Reserved)' });
        }

        const partNum = newPartList.length + 1;
        newPartList.push({
            id: Math.random().toString(36),
            name: `Drive 0 Partition ${partNum}`,
            totalSizeMB: sizeToConsume,
            freeSpaceMB: sizeToConsume,
            type: 'Primary'
        });

        const overhead = isFreshDrive ? 116 : 0;
        const totalUsed = sizeToConsume + overhead;
        const remaining = selectedPart.totalSizeMB - totalUsed;

        if (remaining > 0) {
            newPartList.push({
                id: Math.random().toString(36),
                name: `Drive 0 Unallocated Space`,
                totalSizeMB: remaining,
                freeSpaceMB: remaining,
                type: 'Unallocated'
            });
        }
        
        setPartitions(newPartList);
        setShowSystemPartitionAlert(false);
        setPendingPartitionSize(0);
        const newPrimary = newPartList.find(p => p.type === 'Primary');
        if(newPrimary) setSelectedPartitionId(newPrimary.id);
    };

    const handleDeletePartition = () => {
        const selectedPart = partitions.find(p => p.id === selectedPartitionId);
        if (!selectedPart || selectedPart.type === 'Unallocated') return;
        setPartitions(partitions.map(p => p.id === selectedPartitionId ? { ...p, name: 'Drive 0 Unallocated Space', type: 'Unallocated', freeSpaceMB: p.totalSizeMB } : p));
    };

    const handleFormat = () => {
        setShowFormatModal(false);
        const btn = document.getElementById('format-btn');
        if(btn) btn.innerText = "Formatting...";
        setTimeout(() => {
            if(btn) btn.innerText = "Format";
        }, 1000);
    };

    const currentSelected = partitions.find(p => p.id === selectedPartitionId);
    const isSmallDisk = currentSelected && currentSelected.type !== 'Unallocated' && currentSelected.totalSizeMB < 20480; // 20GB

    return (
        <div className="w-full h-full flex items-center justify-center bg-[url('https://picsum.photos/1920/1080?blur=5')] bg-cover p-2">
        <WindowFrame title="Windows Setup">
           <div className="h-full w-full bg-white p-4 md:p-8 flex flex-col text-gray-900 relative">
              <h2 className="text-xl text-[#0078D7] mb-4">Where do you want to install Windows?</h2>
              
              <div className="border border-gray-300 h-64 bg-white overflow-y-auto overflow-x-auto mb-4 relative shadow-inner">
                  <table className="w-full text-left text-sm border-collapse min-w-[500px]">
                      <thead className="bg-white sticky top-0">
                          <tr>
                              <th className="p-2 font-normal text-gray-600 border-r border-gray-300 w-1/2">Name</th>
                              <th className="p-2 font-normal text-gray-600 border-r border-gray-300">Total Size</th>
                              <th className="p-2 font-normal text-gray-600 border-r border-gray-300">Free Space</th>
                              <th className="p-2 font-normal text-gray-600">Type</th>
                          </tr>
                      </thead>
                      <tbody>
                          {partitions.map(part => (
                              <tr 
                                key={part.id} 
                                onClick={() => { setSelectedPartitionId(part.id); setShowNewModal(false); }}
                                className={`cursor-pointer ${selectedPartitionId === part.id ? 'bg-[#CCE8FF]' : 'hover:bg-[#E5F1FB]'}`}
                              >
                                  <td className="p-2 flex items-center gap-2 border-r border-transparent"><HardDrive size={16} className="text-gray-500"/> {part.name}</td>
                                  <td className="p-2 border-r border-transparent">{formatSize(part.totalSizeMB)}</td>
                                  <td className="p-2 border-r border-transparent">{formatSize(part.freeSpaceMB)}</td>
                                  <td className="p-2">{part.type === 'Unallocated' ? '' : part.type}</td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>

              <div className="flex flex-wrap gap-4 mb-8 text-sm text-gray-700 items-center">
                  <button className="flex items-center gap-1 hover:text-blue-600 disabled:text-gray-400" onClick={() => window.location.reload()}><RefreshCw size={14}/> Refresh</button>
                  <button onClick={handleDeletePartition} disabled={!currentSelected || currentSelected.type === 'Unallocated'} className="flex items-center gap-1 hover:text-blue-600 disabled:text-gray-400 disabled:cursor-not-allowed"><XIcon size={14}/> Delete</button>
                  <button id="format-btn" onClick={() => setShowFormatModal(true)} disabled={!currentSelected || currentSelected.type === 'Unallocated'} className="flex items-center gap-1 hover:text-blue-600 disabled:text-gray-400 disabled:cursor-not-allowed"><HardDrive size={14}/> Format</button>
                  <button onClick={() => { if (currentSelected) { setPendingPartitionSize(currentSelected.totalSizeMB); setShowNewModal(true); } }} disabled={!currentSelected || currentSelected.type !== 'Unallocated'} className="flex items-center gap-1 hover:text-blue-600 disabled:text-gray-400 disabled:cursor-not-allowed"><Plus size={14}/> New</button>
              </div>

              {showNewModal && (
                  <div className="bg-[#F0F0F0] border border-gray-300 p-2 mb-4 flex flex-wrap items-center gap-4 text-sm animate-in fade-in slide-in-from-top-2">
                      <div className="flex items-center gap-2">
                        <span>Size:</span>
                        <div className="flex items-center"><input type="number" className="w-24 border border-gray-400 px-1" value={pendingPartitionSize} onChange={(e) => setPendingPartitionSize(Number(e.target.value))}/> <span className="ml-1">MB</span></div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={initiateCreatePartition} className="px-4 border border-gray-400 bg-white hover:bg-blue-50">Apply</button>
                        <button onClick={() => setShowNewModal(false)} className="px-4 border border-gray-400 bg-white hover:bg-red-50">Cancel</button>
                      </div>
                  </div>
              )}

              {partitions.length === 1 && selectedPartitionId === partitions[0].id && (
                 <div className="flex items-center gap-2 text-xs text-gray-600 mb-2 p-2 bg-yellow-50 border border-yellow-100"><Info size={14} className="text-blue-600"/> Windows cannot be installed to this hard disk space.</div>
              )}

              {isSmallDisk && (
                 <div className="flex items-center gap-2 text-xs text-gray-600 mb-2 p-2 bg-yellow-50 border border-yellow-100 animate-in fade-in"><AlertTriangle size={14} className="text-orange-600"/> The recommended size for the partition is at least 20480 MB.</div>
              )}

              <div className="mt-auto flex justify-end">
                  <SetupButton disabled={!currentSelected || (currentSelected.type !== 'Primary' && currentSelected.type !== 'Unallocated')} onClick={onNext}>Next</SetupButton>
              </div>
              
              {showFormatModal && (
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center z-50">
                      <div className="bg-white border border-[#1883D7] shadow-lg p-4 w-96 max-w-full m-4">
                          <h3 className="text-[#0078D7] text-lg mb-2">Windows Setup</h3>
                          <p className="text-sm text-gray-700 mb-6">If you format this partition, any data stored on it will be lost.</p>
                          <div className="flex justify-end gap-2"><button onClick={handleFormat} className="px-4 py-1 border border-gray-400 bg-gray-100 hover:bg-gray-200 text-sm">OK</button><button onClick={() => setShowFormatModal(false)} className="px-4 py-1 border border-gray-400 bg-gray-100 hover:bg-gray-200 text-sm">Cancel</button></div>
                      </div>
                  </div>
              )}

              {showSystemPartitionAlert && (
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center z-50">
                      <div className="bg-white border border-[#1883D7] shadow-lg p-4 w-96 max-w-full m-4">
                          <h3 className="text-[#0078D7] text-lg mb-2">Windows Setup</h3>
                          <p className="text-sm text-gray-700 mb-6">To ensure that all Windows features work correctly, Windows might create additional partitions for system files.</p>
                          <div className="flex justify-end gap-2">
                              <button onClick={confirmCreatePartition} className="px-4 py-1 border border-gray-400 bg-gray-100 hover:bg-gray-200 text-sm">OK</button>
                              <button onClick={() => setShowSystemPartitionAlert(false)} className="px-4 py-1 border border-gray-400 bg-gray-100 hover:bg-gray-200 text-sm">Cancel</button>
                          </div>
                      </div>
                  </div>
              )}
           </div>
        </WindowFrame>
      </div>
    );
};

// ... (CopyingStep, Main SetupWizard, etc.)
// Re-exporting Main Component for clarity, using existing CopyingStep as is but ensuring WindowFrame is wrapped

const CopyingStep: React.FC<{onNext: () => void, onBack: () => void}> = ({onNext, onBack}) => {
    // ... logic same as provided in prompt ...
    // Need to include logic here to not break the file structure, assuming logic unchanged but wrapper responsive.
    const [progress, setProgress] = useState(0);
    const [installTips, setInstallTips] = useState<string[]>(DEFAULT_TIPS);
    const [currentTipIndex, setCurrentTipIndex] = useState(0);
    const [restartTimer, setRestartTimer] = useState(10);
    const [finished, setFinished] = useState(false);
    const [error, setError] = useState<{code: string, message: string} | null>(null);
    
    const shouldFail = useRef(Math.random() < 0.3);
    const hasFailed = useRef(false);

    useEffect(() => {
        generateInstallationTips().then(tips => { if (tips && tips.length > 0) setInstallTips(tips); });
        
        const timer = setInterval(() => {
            if (error) return;

            setProgress(prev => {
                if (prev >= 100) { 
                    clearInterval(timer); 
                    setFinished(true);
                    return 100; 
                }

                if (shouldFail.current && !hasFailed.current && prev > 50) {
                    hasFailed.current = true;
                    playSound('error');
                    setError({
                        code: "0x8007025D",
                        message: "Windows cannot install required files. The file may be corrupt or missing. Make sure all files required for installation are available, and restart the installation."
                    });
                    return prev;
                }

                let increment = 0;
                const rand = Math.random();
                if (prev < 5) increment = 2 + rand * 3;
                else if (prev < 85) {
                    const localPercent = ((prev - 5) / 80) * 100;
                    if (localPercent < 10) increment = rand * 0.3;
                    else if (localPercent < 50) increment = rand * 1.5;
                    else if (localPercent < 80) increment = rand * 2.5;
                    else { if (rand > 0.6) increment = 0; else increment = rand * 0.5; }
                } else if (prev < 92) increment = rand * 2;
                else if (prev < 97) increment = rand * 1;
                else increment = rand * 2;
                
                return Math.min(prev + increment, 100);
            });
        }, 400);

        const tipTimer = setInterval(() => setCurrentTipIndex(prev => (prev + 1) % installTips.length), 5000);
        return () => { clearInterval(timer); clearInterval(tipTimer); };
    }, [installTips.length, error]);

    useEffect(() => {
        if (finished) {
            const t = setInterval(() => {
                setRestartTimer(prev => {
                    if (prev <= 1) {
                        clearInterval(t);
                        onNext();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(t);
        }
    }, [finished, onNext]);

    const getFilesReadyPercent = (p: number) => {
        if (p < 5) return 0;
        if (p >= 85) return 100;
        return Math.floor(((p - 5) / 80) * 100);
    };

    const INSTALL_STAGES = [
        { label: "Copying Windows files", threshold: 5, showPercent: false },
        { label: "Getting files ready for installation", threshold: 85, showPercent: true },
        { label: "Installing features", threshold: 92, showPercent: false },
        { label: "Installing updates", threshold: 97, showPercent: false },
        { label: "Finishing up", threshold: 100, showPercent: false }
    ];

    const getCurrentStageIndex = (p: number) => {
        if (p < 5) return 0;
        if (p < 85) return 1;
        if (p < 92) return 2;
        if (p < 97) return 3;
        if (p < 100) return 4;
        return 4;
    };
    const currentStage = getCurrentStageIndex(progress);

    return (
        <div className="w-full h-full flex items-center justify-center bg-[url('https://picsum.photos/1920/1080?blur=5')] bg-cover p-2">
          <WindowFrame title="Windows Setup">
             {/* Error Modal Overlay */}
             {error && (
                 <div className="absolute inset-0 bg-black/40 z-50 flex items-center justify-center animate-in fade-in p-4">
                     <div className="bg-white border border-[#1883D7] shadow-xl p-4 w-full max-w-[400px] select-none">
                         <div className="flex items-center gap-2 mb-4">
                             <div className="bg-red-500 rounded-full p-1 text-white"><XIcon size={20}/></div>
                             <h3 className="text-[#0078D7] text-lg">Windows Setup</h3>
                         </div>
                         <p className="text-sm text-gray-800 mb-2">{error.message}</p>
                         <p className="text-sm text-gray-800 mb-6">Error code: {error.code}</p>
                         <div className="flex justify-end">
                             <button 
                                onClick={onBack}
                                className="px-6 py-1.5 border border-gray-400 bg-gray-100 hover:bg-gray-200 text-sm"
                            >
                                OK
                            </button>
                         </div>
                     </div>
                 </div>
             )}

             {finished ? (
                 <div className="h-full w-full bg-white p-4 md:p-12 flex flex-col justify-center text-gray-900">
                     <h2 className="text-xl text-[#0078D7] mb-4">Windows needs to restart to continue</h2>
                     <div className="w-full h-4 bg-gray-200 rounded-full mb-4 overflow-hidden">
                         <div className="h-full bg-green-500 transition-all duration-1000" style={{width: `${(10-restartTimer)*10}%`}}></div>
                     </div>
                     <p>Restarting in {restartTimer} seconds...</p>
                     <div className="mt-8">
                        <SetupButton onClick={() => onNext()}>Restart now</SetupButton>
                     </div>
                 </div>
             ) : (
                <div className="h-full w-full bg-white p-4 md:p-12 flex flex-col relative overflow-hidden text-gray-900">
                    <h2 className="text-xl text-[#0078D7] mb-8">Installing Windows</h2>
                    <div className="space-y-4 text-gray-700 select-none">
                        {INSTALL_STAGES.map((stage, idx) => {
                            const isCompleted = currentStage > idx;
                            const isActive = currentStage === idx;
                            return (
                                <div key={idx} className="flex items-center gap-3">
                                    <div className="w-5 flex justify-center">
                                        {isCompleted ? <Check className="text-green-600 font-bold" size={18}/> : <span className="w-4"/>}
                                    </div>
                                    <span className={`text-sm md:text-base ${isActive ? "font-bold text-black" : (isCompleted ? "text-gray-500" : "text-gray-400")}`}>
                                        {stage.label} {stage.showPercent && isActive ? `(${getFilesReadyPercent(progress)}%)` : ''}
                                        {stage.label === 'Copying Windows files' && isActive && progress > 2 && ' (100%)'}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                    
                    <div className="absolute bottom-0 left-0 w-full bg-gray-100 h-28 p-6 border-t border-gray-200 flex flex-col justify-between">
                        <div className="w-full h-4 bg-gray-300 rounded-full overflow-hidden shadow-inner relative">
                            <div className="h-full bg-[#00AA00] transition-all duration-300 ease-linear" style={{ width: `${progress}%` }}/>
                        </div>
                        <div className="relative h-6 mt-2 overflow-hidden">
                             {installTips.map((tip, i) => (
                                 <div 
                                    key={i} 
                                    className={`absolute inset-0 text-center text-gray-600 text-xs md:text-sm italic transition-opacity duration-1000 flex items-center justify-center ${i === currentTipIndex ? 'opacity-100' : 'opacity-0'}`}
                                 >
                                     "{tip}"
                                 </div>
                             ))}
                        </div>
                    </div>
                </div>
             )}
          </WindowFrame>
        </div>
    );
};

// --- Main Component ---

export const SetupWizard: React.FC<SetupWizardProps> = ({ state, onNext }) => {
  const [showCmd, setShowCmd] = useState(false);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
        if (e.shiftKey && e.key === 'F10') {
            e.preventDefault();
            setShowCmd(prev => !prev);
        }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const renderStep = () => {
    switch (state) {
        case InstallState.SETUP_LANGUAGE: return <LanguageStep onNext={() => onNext(InstallState.SETUP_INSTALL_NOW)} />;
        case InstallState.SETUP_INSTALL_NOW: return <InstallNowStep onNext={() => onNext(InstallState.SETUP_KEY)} onRepair={() => onNext(InstallState.RECOVERY_CHOOSE_OPTION)} />;
        case InstallState.SETUP_KEY: return <ProductKeyStep onNext={() => onNext(InstallState.SETUP_LICENSE)} />;
        case InstallState.SETUP_LICENSE: return <LicenseStep onNext={() => onNext(InstallState.SETUP_TYPE)} />;
        case InstallState.SETUP_TYPE: return <TypeStep onNext={() => onNext(InstallState.SETUP_PARTITION)} />;
        case InstallState.SETUP_PARTITION: return <PartitionStep onNext={() => onNext(InstallState.SETUP_COPYING)} />;
        case InstallState.SETUP_COPYING: return <CopyingStep onNext={() => onNext(InstallState.REBOOT_REQUIRED)} onBack={() => onNext(InstallState.SETUP_PARTITION)} />;
        case InstallState.RECOVERY_CHOOSE_OPTION: return <RecoveryChooseOption onNext={onNext} />;
        case InstallState.RECOVERY_USE_DEVICE: return <RecoveryUseDevice onNext={onNext} />;
        case InstallState.RECOVERY_TROUBLESHOOT: return <RecoveryTroubleshoot onNext={onNext} />;
        case InstallState.RECOVERY_ADVANCED: return <RecoveryAdvanced onNext={onNext} onOpenCmd={() => setShowCmd(true)} />;
        case InstallState.RECOVERY_STARTUP_REPAIR: return <StartupRepairStep onNext={onNext} />;
        case InstallState.RECOVERY_RESET_KEEP_REMOVE: return <ResetPC_KeepOrRemove onNext={onNext} />;
        case InstallState.RECOVERY_RESET_CLOUD_LOCAL: return <ResetPC_CloudOrLocal onNext={onNext} />;
        case InstallState.RECOVERY_RESET_CONFIRM: return <ResetPC_Confirm onNext={onNext} />;
        case InstallState.RECOVERY_RESET_PROGRESS: return <ResetPC_Progress onComplete={() => onNext(InstallState.BIOS_POST)} />;
        case InstallState.RECOVERY_SYSTEM_RESTORE: return <SystemRestoreStep onBack={() => onNext(InstallState.RECOVERY_ADVANCED)} />;
        case InstallState.RECOVERY_UNINSTALL_UPDATES: return <UninstallUpdatesStep onNext={onNext} onBack={() => onNext(InstallState.RECOVERY_ADVANCED)} />;
        case InstallState.RECOVERY_UNINSTALL_QUALITY_CONFIRM: return <UninstallUpdatesConfirm type="quality" onNext={() => onNext(InstallState.RECOVERY_UNINSTALL_PROGRESS)} onBack={() => onNext(InstallState.RECOVERY_UNINSTALL_UPDATES)} />;
        case InstallState.RECOVERY_UNINSTALL_FEATURE_CONFIRM: return <UninstallUpdatesConfirm type="feature" onNext={() => onNext(InstallState.RECOVERY_UNINSTALL_PROGRESS)} onBack={() => onNext(InstallState.RECOVERY_UNINSTALL_UPDATES)} />;
        case InstallState.RECOVERY_UNINSTALL_PROGRESS: return <UninstallUpdatesProgress onComplete={() => onNext(InstallState.RECOVERY_UNINSTALL_UPDATES)} />;
        case InstallState.RECOVERY_IMAGE_RECOVERY: return <SystemImageRecoveryStep onBack={() => onNext(InstallState.RECOVERY_ADVANCED)} />;
        case InstallState.RECOVERY_UEFI_CONFIRM: return <UefiSettingsConfirm onNext={onNext} />;
        default: return null;
    }
  };

  return (
      <>
        {renderStep()}
        {showCmd && <CommandPromptOverlay onClose={() => setShowCmd(false)} />}
      </>
  );
};