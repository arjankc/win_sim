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
            } else if (cmd) {
                newLines.push(`'${cmd.split(' ')[0]}' is not recognized as an internal or external command,`);
                newLines.push("operable program or batch file.");
            }
            newLines.push(""); 
            setLines(newLines);
            setInput("");
        }
    };

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
            <div className="text-xs text-gray-600 text-center md:text-left hidden md:block">
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
              </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 items-start md:items-center gap-2 md:gap-4">
              <label className="text-left md:text-right font-medium text-sm">Time and currency format:</label>
              <select className="col-span-2 border border-gray-300 p-1 w-full text-sm outline-none focus:border-blue-500 cursor-pointer hover:border-blue-400">
                  <option>English (United States)</option>
                  <option>English (United Kingdom)</option>
              </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 items-start md:items-center gap-2 md:gap-4">
              <label className="text-left md:text-right font-medium text-sm">Keyboard or input method:</label>
              <select className="col-span-2 border border-gray-300 p-1 w-full text-sm outline-none focus:border-blue-500 cursor-pointer hover:border-blue-400">
                  <option>US</option>
                  <option>United Kingdom</option>
              </select>
            </div>
          </div>

          <div className="mt-4 md:mt-auto flex justify-end shrink-0">
            <SetupButton onClick={onNext} isPrimary={true}>Next</SetupButton>
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
                className="px-6 md:px-8 py-3 bg-white border border-gray-400 shadow-sm hover:shadow-md hover:border-blue-500 text-base md:text-lg font-semibold flex items-center gap-2 mx-auto active:scale-95 transition-transform text-gray-900 whitespace-nowrap animate-pulse delay-75"
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

const RecoveryChooseOption = ({ onNext }: { onNext: (state: InstallState) => void }) => {
    return (
        <RecoveryLayout title="Choose an option">
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <RecoveryOptionTile icon={<ArrowRight size={24}/>} title="Continue" desc="Exit and continue to Windows" onClick={() => onNext(InstallState.REBOOT_REQUIRED)}/>
                 <RecoveryOptionTile icon={<Disc size={24}/>} title="Use a device" desc="Use a USB drive, network connection, or Windows recovery DVD" onClick={() => onNext(InstallState.RECOVERY_USE_DEVICE)}/>
                 <RecoveryOptionTile icon={<Wrench size={24}/>} title="Troubleshoot" desc="Reset your PC or see advanced options" onClick={() => onNext(InstallState.RECOVERY_TROUBLESHOOT)}/>
                 <RecoveryOptionTile icon={<Power size={24}/>} title="Turn off your PC" onClick={() => window.location.reload()}/>
             </div>
        </RecoveryLayout>
    );
};

const RecoveryLayout = ({ title, children, onBack }: { title: string, children?: React.ReactNode, onBack?: () => void }) => (
    <div className="w-full h-full bg-[#0078D7] p-4 md:p-12 flex flex-col items-center justify-center animate-in fade-in select-none overflow-y-auto">
        <h1 className="text-2xl md:text-4xl font-light mb-8 md:mb-12 self-start md:ml-[10%] flex items-center gap-4 text-white">
            {onBack && <button onClick={() => { playSound('click'); onBack(); }} className="hover:bg-white/20 p-2 rounded-full"><ArrowLeft/></button>}
            {title}
        </h1>
        <div className="w-full max-w-4xl">{children}</div>
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

const RecoveryUseDevice = ({ onNext }: { onNext: (state: InstallState) => void }) => (
    <RecoveryLayout title="Use a device" onBack={() => onNext(InstallState.RECOVERY_CHOOSE_OPTION)}>
        <div className="max-w-xl mx-auto space-y-4">
            <RecoveryListButton title="EFI USB Device (WinSim USB)" desc="Removable Disk" onClick={() => window.location.reload()} />
            <RecoveryListButton title="EFI Network (IPv4)" desc="PXE Network Boot" onClick={() => window.location.reload()} />
        </div>
    </RecoveryLayout>
);

const RecoveryListButton = ({ title, desc, onClick }: { title: string, desc?: string, onClick: () => void }) => (
    <button onClick={() => { playSound('click'); onClick(); }} className="w-full text-left bg-black/20 hover:bg-white/20 p-4 mb-2 transition-all border border-transparent hover:border-white/30 flex flex-col text-white">
        <span className="font-semibold text-lg">{title}</span>
        {desc && <span className="text-sm opacity-80">{desc}</span>}
    </button>
);

const RecoveryTroubleshoot = ({ onNext }: { onNext: (state: InstallState) => void }) => (
    <RecoveryLayout title="Troubleshoot" onBack={() => onNext(InstallState.RECOVERY_CHOOSE_OPTION)}>
         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
             <RecoveryOptionTile icon={<RotateCcw size={24}/>} title="Reset this PC" desc="Lets you choose to keep or remove your personal files, and then reinstalls Windows." onClick={() => onNext(InstallState.RECOVERY_RESET_KEEP_REMOVE)}/>
             <RecoveryOptionTile icon={<Wrench size={24}/>} title="Advanced options" onClick={() => onNext(InstallState.RECOVERY_ADVANCED)}/>
         </div>
    </RecoveryLayout>
);

const ResetPC_KeepOrRemove = ({ onNext }: { onNext: (state: InstallState) => void }) => (
    <RecoveryLayout title="Reset this PC" onBack={() => onNext(InstallState.RECOVERY_TROUBLESHOOT)}>
        <div className="max-w-xl mx-auto space-y-4">
            <RecoveryListButton title="Keep my files" desc="Removes apps and settings, but keeps your personal files." onClick={() => onNext(InstallState.RECOVERY_RESET_CLOUD_LOCAL)}/>
            <RecoveryListButton title="Remove everything" desc="Removes all of your personal files, apps, and settings." onClick={() => onNext(InstallState.RECOVERY_RESET_CLOUD_LOCAL)}/>
        </div>
    </RecoveryLayout>
);

const ResetPC_CloudOrLocal = ({ onNext }: { onNext: (state: InstallState) => void }) => (
    <RecoveryLayout title="Reset this PC" onBack={() => onNext(InstallState.RECOVERY_RESET_KEEP_REMOVE)}>
        <div className="max-w-xl mx-auto space-y-4">
            <RecoveryListButton title="Cloud download" desc="Download and reinstall Windows" onClick={() => onNext(InstallState.RECOVERY_RESET_CONFIRM)}/>
            <RecoveryListButton title="Local reinstall" desc="Reinstall Windows from this device" onClick={() => onNext(InstallState.RECOVERY_RESET_CONFIRM)}/>
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
                if(prev >= 100) { clearInterval(t); onComplete(); return 100; }
                return prev + 0.5;
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

const RecoveryAdvanced = ({ onNext, onOpenCmd }: { onNext: (state: InstallState) => void, onOpenCmd: () => void }) => (
    <RecoveryLayout title="Advanced options" onBack={() => onNext(InstallState.RECOVERY_TROUBLESHOOT)}>
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl">
             <RecoveryOptionTile icon={<Wrench size={24}/>} title="Startup Repair" desc="Fix problems that keep Windows from loading" onClick={() => onNext(InstallState.RECOVERY_STARTUP_REPAIR)}/>
             <RecoveryOptionTile icon={<Settings size={24}/>} title="UEFI Firmware Settings" desc="Change settings in your PC's UEFI firmware" onClick={() => onNext(InstallState.RECOVERY_UEFI_CONFIRM)}/>
             <RecoveryOptionTile icon={<Terminal size={24}/>} title="Command Prompt" desc="Use the Command Prompt for advanced troubleshooting" onClick={onOpenCmd}/>
             <RecoveryOptionTile icon={<History size={24}/>} title="System Restore" desc="Use a restore point recorded on your PC to restore Windows" onClick={() => onNext(InstallState.RECOVERY_SYSTEM_RESTORE)} />
             <RecoveryOptionTile icon={<Undo2 size={24}/>} title="Uninstall Updates" desc="Remove recently installed quality or feature updates" onClick={() => onNext(InstallState.RECOVERY_UNINSTALL_UPDATES)} />
             <RecoveryOptionTile icon={<Disc size={24}/>} title="System Image Recovery" desc="Recover Windows using a specific system image file" onClick={() => onNext(InstallState.RECOVERY_IMAGE_RECOVERY)} />
         </div>
    </RecoveryLayout>
);

const UefiSettingsConfirm = ({ onNext }: { onNext: (state: InstallState) => void }) => (
    <RecoveryLayout title="UEFI Firmware Settings" onBack={() => onNext(InstallState.RECOVERY_ADVANCED)}>
        <div className="max-w-xl mx-auto text-white">
            <p className="mb-8">Restart to change UEFI firmware settings.</p>
            <button onClick={() => onNext(InstallState.BIOS_POST)} className="px-8 py-2 bg-white text-[#0078D7] hover:bg-gray-100 font-semibold shadow-lg">Restart</button>
        </div>
    </RecoveryLayout>
);

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
             <img src="https://upload.wikimedia.org/wikipedia/commons/c/c7/Windows_logo_-_2012.png" alt="Windows Logo" className="w-24 h-auto mb-16"/>
            <Loader2 className="animate-spin text-white mb-8" size={48}/>
            <div className="text-white text-lg font-light text-center px-4">{status}</div>
        </div>
    );
};

const SystemRestoreStep = ({ onBack }: { onBack: () => void }) => {
    return <div className="w-full h-full bg-[#0078D7] text-white flex items-center justify-center">System Restore Placeholder</div>
};
const UninstallUpdatesStep = ({ onNext, onBack }: { onNext: any, onBack: any }) => <RecoveryLayout title="Uninstall Updates" onBack={onBack}><div>Placeholder</div></RecoveryLayout>;
const UninstallUpdatesConfirm = ({ onNext, onBack }: { onNext: any, onBack: any, type: any }) => <RecoveryLayout title="Uninstall Updates" onBack={onBack}><button onClick={onNext}>Uninstall</button></RecoveryLayout>;
const UninstallUpdatesProgress = ({ onComplete }: { onComplete: any }) => { useEffect(() => { onComplete() }, []); return null; };
const SystemImageRecoveryStep = ({ onBack }: { onBack: any }) => <div className="w-full h-full bg-[#0078D7] text-white flex items-center justify-center"><button onClick={onBack}>Back</button></div>;


const ProductKeyStep: React.FC<{onNext: () => void}> = ({onNext}) => (
    <div className="w-full h-full flex items-center justify-center bg-[url('https://picsum.photos/1920/1080?blur=5')] bg-cover p-2">
        <WindowFrame title="Windows Setup">
            <div className="h-full w-full bg-white p-4 md:p-8 flex flex-col text-gray-900 overflow-y-auto">
                <h2 className="text-xl text-[#0078D7] mb-2">Activate Windows</h2>
                <p className="text-gray-600 mb-8">If this is the first time you're installing Windows on this PC (or you're installing a different edition), you need to enter a valid product key.</p>
                <div className="mb-6 overflow-x-auto">
                    <label className="block mb-2 font-bold text-gray-700">Product key</label>
                    <div className="flex gap-2 min-w-max">
                            {[0,1,2,3,4].map(i => (<input key={i} className="w-16 h-10 border border-gray-300 text-center uppercase" maxLength={5} placeholder="XXXXX"/>))}
                    </div>
                </div>
                <div className="mt-auto flex flex-col md:flex-row justify-between items-center gap-4">
                    <button onClick={onNext} className="text-[#0078D7] hover:underline text-sm md:text-base ring-2 ring-transparent hover:ring-yellow-400/50 rounded px-1">I don't have a product key</button>
                    <SetupButton onClick={onNext} isPrimary={false}>Next</SetupButton>
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
                <div className="flex-1 border border-gray-300 overflow-y-scroll p-4 bg-white text-xs font-sans mb-4 text-gray-700 leading-normal select-none shadow-inner">
                    <p className="font-bold text-sm mb-4">MICROSOFT SOFTWARE LICENSE TERMS</p>
                    <p className="font-bold mb-2">WINDOWS OPERATING SYSTEM</p>
                    
                    <p className="mb-4">IF YOU LIVE IN (OR IF YOUR PRINCIPAL PLACE OF BUSINESS IS IN) THE UNITED STATES, PLEASE READ THE BINDING ARBITRATION CLAUSE AND CLASS ACTION WAIVER IN SECTION 11. IT AFFECTS HOW DISPUTES ARE RESOLVED.</p>

                    <p className="mb-4">Thank you for choosing Microsoft.</p>

                    <p className="mb-4">Depending on how you obtained the Windows software, this is a license agreement between (i) you and the device manufacturer or software installer that distributes the software with your device; or (ii) you and Microsoft Corporation (or, based on where you live or, if a business, where your principal place of business is located, one of its affiliates) if you acquired the software from a retailer. Microsoft is the device manufacturer for devices produced by Microsoft or one of its affiliates, and Microsoft is the retailer if you acquired the software directly from Microsoft.</p>

                    <p className="mb-4">This agreement describes your rights and the conditions upon which you may use the Windows software. You should review the entire agreement, including any supplemental license terms that accompany the software and any linked terms, because all of the terms are important and together create this agreement that applies to you. You can review linked terms by pasting the (aka.ms/) link into a browser window.</p>

                    <p className="font-bold mb-2">1. OVERVIEW.</p>
                    <p className="mb-4 pl-4">
                        <b>a. Applicability.</b> This agreement applies to the Windows software that is preinstalled on your device, or acquired from a retailer and installed by you, the media on which you received the software (if any), any fonts, icons, images or sound files included with the software, and also any Microsoft updates, upgrades, supplements or services for the software, unless other terms come with them.
                    </p>

                    <p className="font-bold mb-2">2. INSTALLATION AND USE RIGHTS.</p>
                    <p className="mb-4 pl-4">
                        <b>a. License.</b> The software is licensed, not sold. Under this agreement, we grant you the right to install and run one instance of the software on your device (the licensed device), for use by one person at a time, so long as you comply with all the terms of this agreement. Updating or upgrading from non-genuine software with software from Microsoft or authorized sources does not make your original version or the updated/upgraded version genuine, and in that situation, you do not have a license to install or use the software.
                    </p>
                    <p className="mb-4 pl-4">
                        <b>b. Device.</b> In this agreement, "device" means a hardware system (whether physical or virtual) with an internal storage device capable of running the software. A hardware partition or blade is considered to be a device.
                    </p>

                    <p className="font-bold mb-2">3. PRIVACY; CONSENT TO USE OF DATA.</p>
                    <p className="mb-4 pl-4">
                        Your privacy is important to us. Some of the software features send or receive information when using those features. Many of these features can be switched off in the user interface, or you can choose not to use them. By accepting this agreement and using the software you agree that Microsoft may collect, use, and disclose the information as described in the Microsoft Privacy Statement (aka.ms/privacy), and as may be described in the user interface associated with the software features.
                    </p>
                    
                    <p className="font-bold mb-2">4. AUTHORIZED SOFTWARE AND ACTIVATION.</p>
                    <p className="mb-4 pl-4">
                        You are authorized to use this software only if you are properly licensed and the software has been properly activated with a genuine product key or by other authorized method. When you connect to the Internet while using the software, the software will automatically contact Microsoft or its affiliate to conduct activation to associate it with a certain device. You can also activate the software manually by Internet or telephone.
                    </p>

                    <p className="mb-8">
                        EULAID:W11_RTM_PRO_EN-US
                    </p>
                </div>
                <div className="flex items-center gap-2 mb-4">
                    <input type="checkbox" id="accept" className="w-4 h-4 accent-[#0078D7]" checked={licenseAccepted} onChange={(e) => setLicenseAccepted(e.target.checked)}/>
                    <label htmlFor="accept" className="select-none text-gray-900 text-sm">I accept the license terms</label>
                </div>
                <div className="flex justify-end">
                    <SetupButton disabled={!licenseAccepted} onClick={onNext} isPrimary={true}>Next</SetupButton>
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
                        <div className="text-xs text-gray-600 mt-1">The files, settings, and applications are moved to Windows with this option.</div>
                    </div>
                </button>
                <button onClick={onNext} className="w-full text-left p-4 border border-gray-300 hover:bg-[#E5F1FB] hover:border-[#0078D7] transition-colors group flex gap-4 items-start ring-2 ring-yellow-400/50">
                    <div className="p-2 bg-gray-100 rounded group-hover:bg-white shrink-0"><HardDrive className="text-blue-500"/></div>
                    <div>
                        <div className="font-bold text-gray-800">Custom: Install Windows only (advanced)</div>
                        <div className="text-xs text-gray-600 mt-1">The files, settings, and applications aren't moved to Windows with this option.</div>
                    </div>
                </button>
            </div>
            </div>
        </WindowFrame>
    </div>
);

const PartitionStep: React.FC<{onNext: () => void}> = ({onNext}) => {
    const [partitions, setPartitions] = useState<Partition[]>([{ id: 'p0', name: 'Drive 0 Unallocated Space', totalSizeMB: 2048000, freeSpaceMB: 2048000, type: 'Unallocated' }]);
    const [selectedPartitionId, setSelectedPartitionId] = useState<string>('p0');
    const [showNewModal, setShowNewModal] = useState(false);
    const [pendingPartitionSize, setPendingPartitionSize] = useState(0);

    const formatSize = (mb: number) => mb >= 1024 ? (mb / 1024).toFixed(1) + " GB" : mb + " MB";

    const initiateCreatePartition = () => {
        // Simple logic for brevity in this update
        setPartitions([
            { id: 'efi', name: 'Drive 0 Partition 1: System', totalSizeMB: 100, freeSpaceMB: 70, type: 'System' },
            { id: 'msr', name: 'Drive 0 Partition 2: MSR (Reserved)', totalSizeMB: 16, freeSpaceMB: 16, type: 'MSR (Reserved)' },
            { id: 'pri', name: 'Drive 0 Partition 3', totalSizeMB: pendingPartitionSize, freeSpaceMB: pendingPartitionSize, type: 'Primary' },
            { id: 'rem', name: 'Drive 0 Unallocated Space', totalSizeMB: 2048000 - pendingPartitionSize - 116, freeSpaceMB: 2048000 - pendingPartitionSize - 116, type: 'Unallocated' }
        ]);
        setSelectedPartitionId('pri');
        setShowNewModal(false);
    };

    const currentSelected = partitions.find(p => p.id === selectedPartitionId);

    return (
        <div className="w-full h-full flex items-center justify-center bg-[url('https://picsum.photos/1920/1080?blur=5')] bg-cover p-2">
        <WindowFrame title="Windows Setup">
           <div className="h-full w-full bg-white p-4 md:p-8 flex flex-col text-gray-900 relative">
              <h2 className="text-xl text-[#0078D7] mb-4">Where do you want to install Windows?</h2>
              
              <div className="border border-gray-300 h-64 bg-white overflow-y-auto overflow-x-auto mb-4 relative shadow-inner">
                  <table className="w-full text-left text-sm border-collapse min-w-[500px]">
                      <thead className="bg-white sticky top-0">
                          <tr><th className="p-2 border-r">Name</th><th className="p-2 border-r">Total Size</th><th className="p-2 border-r">Free Space</th><th className="p-2">Type</th></tr>
                      </thead>
                      <tbody>
                          {partitions.map(part => (
                              <tr key={part.id} onClick={() => { setSelectedPartitionId(part.id); }} className={`cursor-pointer ${selectedPartitionId === part.id ? 'bg-[#CCE8FF]' : 'hover:bg-[#E5F1FB]'}`}>
                                  <td className="p-2 border-r">{part.name}</td><td className="p-2 border-r">{formatSize(part.totalSizeMB)}</td><td className="p-2 border-r">{formatSize(part.freeSpaceMB)}</td><td className="p-2">{part.type}</td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>

              <div className="flex flex-wrap gap-4 mb-8 text-sm text-gray-700 items-center">
                  <button onClick={() => { if (currentSelected) { setPendingPartitionSize(currentSelected.totalSizeMB); setShowNewModal(true); } }} disabled={!currentSelected || currentSelected.type !== 'Unallocated'} className="flex items-center gap-1 hover:text-blue-600 disabled:text-gray-400"><Plus size={14}/> New</button>
              </div>

              {showNewModal && (
                  <div className="bg-[#F0F0F0] border border-gray-300 p-2 mb-4 flex flex-wrap items-center gap-4 text-sm">
                      <div className="flex items-center gap-2"><span>Size:</span><input type="number" className="w-24 border px-1" value={pendingPartitionSize} onChange={(e) => setPendingPartitionSize(Number(e.target.value))}/> <span>MB</span></div>
                      <button onClick={initiateCreatePartition} className="px-4 border bg-white">Apply</button>
                  </div>
              )}

              <div className="mt-auto flex justify-end">
                  <SetupButton disabled={!currentSelected || (currentSelected.type !== 'Primary' && currentSelected.type !== 'Unallocated')} onClick={onNext} isPrimary={true}>Next</SetupButton>
              </div>
           </div>
        </WindowFrame>
      </div>
    );
};

const CopyingStep: React.FC<{onNext: () => void, onBack: () => void}> = ({onNext, onBack}) => {
    const [progress, setProgress] = useState(0);
    const [installTips, setInstallTips] = useState<string[]>(DEFAULT_TIPS);
    const [currentTipIndex, setCurrentTipIndex] = useState(0);
    
    useEffect(() => {
        const timer = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) { clearInterval(timer); setTimeout(onNext, 2000); return 100; }
                return prev + 0.5;
            });
        }, 100);
        return () => clearInterval(timer);
    }, [onNext]);

    return (
        <div className="w-full h-full flex items-center justify-center bg-[url('https://picsum.photos/1920/1080?blur=5')] bg-cover p-2">
          <WindowFrame title="Windows Setup">
                <div className="h-full w-full bg-white p-4 md:p-12 flex flex-col relative overflow-hidden text-gray-900">
                    <h2 className="text-xl text-[#0078D7] mb-8">Installing Windows</h2>
                    <div className="space-y-4 text-gray-700 select-none">
                        <div className="flex items-center gap-3"><div className="w-5 flex justify-center"><Check className="text-green-600 font-bold" size={18}/></div><span>Copying Windows files (100%)</span></div>
                        <div className="flex items-center gap-3"><div className="w-5 flex justify-center"><span className="w-4"/></div><span className="font-bold text-black">Getting files ready for installation ({Math.floor(progress)}%)</span></div>
                        <div className="flex items-center gap-3"><div className="w-5 flex justify-center"><span className="w-4"/></div><span className="text-gray-600">Installing features</span></div>
                    </div>
                    <div className="absolute bottom-0 left-0 w-full bg-gray-100 h-28 p-6 border-t border-gray-200 flex flex-col justify-between">
                        <div className="w-full h-4 bg-gray-300 rounded-full overflow-hidden shadow-inner relative"><div className="h-full bg-[#00AA00]" style={{ width: `${progress}%` }}/></div>
                    </div>
                </div>
          </WindowFrame>
        </div>
    );
};

export const SetupWizard: React.FC<SetupWizardProps> = ({ state, onNext }) => {
  const [showCmd, setShowCmd] = useState(false);
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.shiftKey && e.key === 'F10') { e.preventDefault(); setShowCmd(prev => !prev); } };
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