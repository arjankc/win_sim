import React, { useState, useEffect, useRef } from 'react';
import { WindowFrame, SetupButton } from '../ui/WindowFrame';
import { InstallState, DEFAULT_TIPS } from '../../types';
import { generateInstallationTips } from '../../services/geminiService';
import { ArrowRight, HardDrive, RefreshCw, Plus, X as XIcon, AlertTriangle, Info } from 'lucide-react';
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
        <div className="absolute top-10 left-10 w-[600px] h-[400px] bg-black border-2 border-gray-500 shadow-2xl z-[9999] flex flex-col font-mono text-gray-300 text-sm animate-in zoom-in-95">
            <div className="bg-white text-black px-2 py-0.5 flex justify-between select-none">
                <span>Administrator: X:\windows\system32\cmd.exe</span>
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
                        className="flex-1 bg-transparent border-none outline-none ml-1 text-gray-300"
                        autoFocus
                    />
                </div>
            </div>
        </div>
    );
};

// --- Sub-Components ---

const LanguageStep: React.FC<{onNext: () => void}> = ({onNext}) => (
  <div className="w-full h-full bg-[#400040] flex items-center justify-center bg-[url('https://picsum.photos/1920/1080?blur=5')] bg-cover">
    <WindowFrame title="Windows Setup">
      <div className="flex h-full">
        <div className="w-48 bg-white p-4 flex flex-col justify-between border-r border-gray-200">
            <div className="mt-4">
                  <div className="w-24 h-24 rounded-full bg-blue-600 flex items-center justify-center text-white text-4xl font-bold mx-auto mb-4">
                    W
                  </div>
            </div>
            <div className="text-xs text-gray-500">
                &copy; 2025 Microsoft Corp.
            </div>
        </div>
        <div className="flex-1 bg-white p-8 flex flex-col">
          <h2 className="text-2xl font-light text-[#0078D7] mb-8">Windows Setup</h2>
          
          <div className="space-y-4 max-w-md text-gray-900">
            <div className="grid grid-cols-3 items-center gap-4">
              <label className="text-right font-medium">Language to install:</label>
              <select className="col-span-2 border p-1 w-full"><option>English (United States)</option></select>
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <label className="text-right font-medium">Time and currency:</label>
              <select className="col-span-2 border p-1 w-full"><option>English (United States)</option></select>
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <label className="text-right font-medium">Keyboard method:</label>
              <select className="col-span-2 border p-1 w-full"><option>US</option></select>
            </div>
          </div>

          <div className="mt-auto flex justify-end">
            <SetupButton onClick={onNext}>Next</SetupButton>
          </div>
        </div>
      </div>
    </WindowFrame>
  </div>
);

const InstallNowStep: React.FC<{onNext: () => void}> = ({onNext}) => (
   <div className="w-full h-full flex items-center justify-center bg-[url('https://picsum.photos/1920/1080?blur=5')] bg-cover">
     <WindowFrame title="Windows Setup">
       <div className="h-full w-full bg-white flex flex-col items-center justify-center relative">
           <div className="absolute top-0 left-0 w-full h-full bg-[url('https://picsum.photos/800/600?blur=2')] opacity-10 pointer-events-none"></div>
           <div className="z-10 text-center">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white text-6xl font-bold mx-auto mb-8 shadow-lg">
                    W
                 </div>
               <button 
                onClick={onNext}
                className="px-8 py-3 bg-white border border-gray-400 shadow-sm hover:shadow-md hover:border-blue-500 text-lg font-semibold flex items-center gap-2 mx-auto active:scale-95 transition-transform text-gray-900"
               >
                 Install now <ArrowRight size={20}/>
               </button>
               <div className="mt-12 text-blue-600 text-sm hover:underline cursor-pointer">Repair your computer</div>
           </div>
       </div>
     </WindowFrame>
   </div>
);

const ProductKeyStep: React.FC<{onNext: () => void}> = ({onNext}) => (
    <div className="w-full h-full flex items-center justify-center bg-[url('https://picsum.photos/1920/1080?blur=5')] bg-cover">
        <WindowFrame title="Windows Setup">
            <div className="h-full w-full bg-white p-8 flex flex-col text-gray-900">
                <h2 className="text-xl text-[#0078D7] mb-2">Activate Windows</h2>
                <p className="text-gray-600 mb-8">If this is the first time you're installing Windows on this PC (or you're installing a different edition), you need to enter a valid product key.</p>
                
                <div className="mb-6">
                    <label className="block mb-2 font-bold text-gray-700">Product key</label>
                    <div className="flex gap-2">
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

                <div className="mt-auto flex justify-between items-center">
                    <button onClick={onNext} className="text-[#0078D7] hover:underline">I don't have a product key</button>
                    <SetupButton onClick={onNext}>Next</SetupButton>
                </div>
            </div>
        </WindowFrame>
    </div>
);

const LicenseStep: React.FC<{onNext: () => void}> = ({onNext}) => {
    const [licenseAccepted, setLicenseAccepted] = useState(false);
    return (
        <div className="w-full h-full flex items-center justify-center bg-[url('https://picsum.photos/1920/1080?blur=5')] bg-cover">
          <WindowFrame title="Windows Setup">
             <div className="h-full w-full bg-white p-8 flex flex-col text-gray-900">
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
                    <label htmlFor="accept" className="select-none text-gray-900">I accept the license terms</label>
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
    <div className="w-full h-full flex items-center justify-center bg-[url('https://picsum.photos/1920/1080?blur=5')] bg-cover">
        <WindowFrame title="Windows Setup">
            <div className="h-full w-full bg-white p-8 flex flex-col text-gray-900">
            <h2 className="text-xl text-[#0078D7] mb-8">Which type of installation do you want?</h2>
            <div className="space-y-4">
                <button className="w-full text-left p-4 border border-gray-300 hover:bg-[#E5F1FB] hover:border-[#0078D7] transition-colors group flex gap-4 items-start">
                    <div className="p-2 bg-gray-100 rounded group-hover:bg-white"><ArrowRight className="text-blue-500"/></div>
                    <div>
                        <div className="font-bold text-gray-800">Upgrade: Install Windows and keep files, settings, and applications</div>
                        <div className="text-xs text-gray-500 mt-1">The files, settings, and applications are moved to Windows with this option.</div>
                    </div>
                </button>
                <button 
                    onClick={onNext}
                    className="w-full text-left p-4 border border-gray-300 hover:bg-[#E5F1FB] hover:border-[#0078D7] transition-colors group flex gap-4 items-start">
                    <div className="p-2 bg-gray-100 rounded group-hover:bg-white"><HardDrive className="text-blue-500"/></div>
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
        // Just trigger the alert confirmation flow
        setShowSystemPartitionAlert(true);
        setShowNewModal(false);
    };

    const confirmCreatePartition = () => {
        const selectedPart = partitions.find(p => p.id === selectedPartitionId);
        if (!selectedPart) return;

        // Realistic Windows UEFI partitioning
        // If the drive is completely empty (single unallocated partition), Windows creates System + MSR + Primary
        const isFreshDrive = partitions.length === 1 && partitions[0].type === 'Unallocated';
        let newPartList = partitions.filter(p => p.id !== selectedPartitionId);

        let sizeToConsume = pendingPartitionSize;

        if (isFreshDrive) {
            // 1. EFI System Partition (100MB)
            newPartList.push({ id: 'efi', name: 'Drive 0 Partition 1: System', totalSizeMB: 100, freeSpaceMB: 70, type: 'System' });
            // 2. MSR Partition (16MB)
            newPartList.push({ id: 'msr', name: 'Drive 0 Partition 2: MSR (Reserved)', totalSizeMB: 16, freeSpaceMB: 16, type: 'MSR (Reserved)' });
            
            // Adjust requested size if possible, or just take remainder
            // But usually the user enters the size for the PRIMARY partition.
            // System partitions are taken from the remaining space OR deducted.
            // In simulation, we deduct the overhead (116MB) from the unallocated space first, then create primary.
        }

        const partNum = newPartList.length + 1;
        newPartList.push({
            id: Math.random().toString(36),
            name: `Drive 0 Partition ${partNum}`,
            totalSizeMB: sizeToConsume,
            freeSpaceMB: sizeToConsume,
            type: 'Primary'
        });

        // Calculate used space including overhead if fresh
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
        
        // Sort partitions by name/id logic approx
        // Actually since we pushed in order, they are fine. 
        // But Unallocated should be last if we split.
        // For simplicity, our logic appends correctly.

        setPartitions(newPartList);
        setShowSystemPartitionAlert(false);
        setPendingPartitionSize(0);
        // Select the new Primary partition
        const newPrimary = newPartList.find(p => p.type === 'Primary');
        if(newPrimary) setSelectedPartitionId(newPrimary.id);
    };

    const handleDeletePartition = () => {
        const selectedPart = partitions.find(p => p.id === selectedPartitionId);
        if (!selectedPart || selectedPart.type === 'Unallocated') return;
        
        // Simplified delete: turn into Unallocated. 
        // Real windows merges adjacent unallocated spaces.
        // Sim: Just mark as Unallocated and maybe merge later? 
        // For this sim, let's just rename it "Unallocated"
        setPartitions(partitions.map(p => p.id === selectedPartitionId ? { ...p, name: 'Drive 0 Unallocated Space', type: 'Unallocated', freeSpaceMB: p.totalSizeMB } : p));
    };

    const handleFormat = () => {
        setShowFormatModal(false);
        // Visual feedback
        const btn = document.getElementById('format-btn');
        if(btn) btn.innerText = "Formatting...";
        setTimeout(() => {
            if(btn) btn.innerText = "Format";
        }, 1000);
    };

    const currentSelected = partitions.find(p => p.id === selectedPartitionId);

    // Warning logic
    const isSmallDisk = currentSelected && currentSelected.type !== 'Unallocated' && currentSelected.totalSizeMB < 20480; // 20GB

    return (
        <div className="w-full h-full flex items-center justify-center bg-[url('https://picsum.photos/1920/1080?blur=5')] bg-cover">
        <WindowFrame title="Windows Setup">
           <div className="h-full w-full bg-white p-8 flex flex-col text-gray-900 relative">
              <h2 className="text-xl text-[#0078D7] mb-4">Where do you want to install Windows?</h2>
              
              <div className="border border-gray-300 h-64 bg-white overflow-y-auto mb-4 relative shadow-inner">
                  <table className="w-full text-left text-sm border-collapse">
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

              <div className="flex gap-4 mb-8 text-sm text-gray-700 items-center">
                  <button className="flex items-center gap-1 hover:text-blue-600 disabled:text-gray-400" onClick={() => window.location.reload()}><RefreshCw size={14}/> Refresh</button>
                  <button onClick={handleDeletePartition} disabled={!currentSelected || currentSelected.type === 'Unallocated'} className="flex items-center gap-1 hover:text-blue-600 disabled:text-gray-400 disabled:cursor-not-allowed"><XIcon size={14}/> Delete</button>
                  <button id="format-btn" onClick={() => setShowFormatModal(true)} disabled={!currentSelected || currentSelected.type === 'Unallocated'} className="flex items-center gap-1 hover:text-blue-600 disabled:text-gray-400 disabled:cursor-not-allowed"><HardDrive size={14}/> Format</button>
                  <button onClick={() => { if (currentSelected) { setPendingPartitionSize(currentSelected.totalSizeMB); setShowNewModal(true); } }} disabled={!currentSelected || currentSelected.type !== 'Unallocated'} className="flex items-center gap-1 hover:text-blue-600 disabled:text-gray-400 disabled:cursor-not-allowed"><Plus size={14}/> New</button>
              </div>

              {showNewModal && (
                  <div className="bg-[#F0F0F0] border border-gray-300 p-2 mb-4 flex items-center gap-4 text-sm animate-in fade-in slide-in-from-top-2">
                      <span>Size:</span>
                      <div className="flex items-center"><input type="number" className="w-24 border border-gray-400 px-1" value={pendingPartitionSize} onChange={(e) => setPendingPartitionSize(Number(e.target.value))}/> <span className="ml-1">MB</span></div>
                      <button onClick={initiateCreatePartition} className="px-4 border border-gray-400 bg-white hover:bg-blue-50">Apply</button>
                      <button onClick={() => setShowNewModal(false)} className="px-4 border border-gray-400 bg-white hover:bg-red-50">Cancel</button>
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
                      <div className="bg-white border border-[#1883D7] shadow-lg p-4 w-96">
                          <h3 className="text-[#0078D7] text-lg mb-2">Windows Setup</h3>
                          <p className="text-sm text-gray-700 mb-6">If you format this partition, any data stored on it will be lost.</p>
                          <div className="flex justify-end gap-2"><button onClick={handleFormat} className="px-4 py-1 border border-gray-400 bg-gray-100 hover:bg-gray-200 text-sm">OK</button><button onClick={() => setShowFormatModal(false)} className="px-4 py-1 border border-gray-400 bg-gray-100 hover:bg-gray-200 text-sm">Cancel</button></div>
                      </div>
                  </div>
              )}

              {showSystemPartitionAlert && (
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center z-50">
                      <div className="bg-white border border-[#1883D7] shadow-lg p-4 w-96">
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

const CopyingStep: React.FC<{onNext: () => void, onBack: () => void}> = ({onNext, onBack}) => {
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

                // Trigger failure logic (around 50% global progress, which is inside "Getting files ready")
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

                // Simulation Stages (Global Progress 0-100)
                if (prev < 5) {
                    // Stage 1: Copying Windows files (0-5%) - Very Fast
                    increment = 2 + rand * 3;
                } else if (prev < 85) {
                    // Stage 2: Getting files ready (5-85%) - Variable Speed
                    const localPercent = ((prev - 5) / 80) * 100;
                    
                    if (localPercent < 10) increment = rand * 0.3; // Slow start (0-10%)
                    else if (localPercent < 50) increment = rand * 1.5; // Cruising (10-50%)
                    else if (localPercent < 80) increment = rand * 2.5; // Fast (50-80%)
                    else {
                        // Stalling near end (80-100%)
                        if (rand > 0.6) increment = 0; // Stall
                        else increment = rand * 0.5;
                    }
                } else if (prev < 92) {
                    // Stage 3: Installing features (85-92%) - Fast
                    increment = rand * 2;
                } else if (prev < 97) {
                    // Stage 4: Installing updates (92-97%) - Medium
                    increment = rand * 1;
                } else {
                    // Stage 5: Finishing up (97-100%) - Fast
                    increment = rand * 2;
                }
                
                return Math.min(prev + increment, 100);
            });
        }, 400); // Slightly slower tick for realism

        const tipTimer = setInterval(() => setCurrentTipIndex(prev => (prev + 1) % installTips.length), 5000);
        return () => { clearInterval(timer); clearInterval(tipTimer); };
    }, [installTips.length, error]);

    // Auto restart countdown
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

    return (
        <div className="w-full h-full flex items-center justify-center bg-[url('https://picsum.photos/1920/1080?blur=5')] bg-cover">
          <WindowFrame title="Windows Setup">
             {/* Error Modal Overlay */}
             {error && (
                 <div className="absolute inset-0 bg-black/40 z-50 flex items-center justify-center animate-in fade-in">
                     <div className="bg-white border border-[#1883D7] shadow-xl p-4 w-[400px] select-none">
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
                 <div className="h-full w-full bg-white p-12 flex flex-col justify-center text-gray-900">
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
                <div className="h-full w-full bg-white p-12 flex flex-col relative overflow-hidden text-gray-900">
                    <h2 className="text-xl text-[#0078D7] mb-8">Installing Windows</h2>
                    <div className="space-y-4 text-gray-700 select-none">
                        <div className="flex items-center gap-3">
                            {progress > 5 ? <span className="text-green-600 font-bold">✓</span> : <span className="w-4"/>} 
                            <span className={progress <= 5 ? "font-bold" : "text-gray-500"}>Copying Windows files ({progress > 5 ? '100' : '0'}%)</span>
                        </div>
                        <div className="flex items-center gap-3">
                            {progress >= 85 ? <span className="text-green-600 font-bold">✓</span> : <span className="w-4"/>} 
                            <span className={progress > 5 && progress < 85 ? "font-bold" : (progress >= 85 ? "text-gray-500" : "")}>
                                Getting files ready for installation ({getFilesReadyPercent(progress)}%)
                            </span>
                        </div>
                        <div className="flex items-center gap-3">
                            {progress >= 92 ? <span className="text-green-600 font-bold">✓</span> : <span className="w-4"/>} 
                            <span className={progress >= 85 && progress < 92 ? "font-bold" : (progress >= 92 ? "text-gray-500" : "")}>Installing features</span>
                        </div>
                        <div className="flex items-center gap-3">
                            {progress >= 97 ? <span className="text-green-600 font-bold">✓</span> : <span className="w-4"/>} 
                            <span className={progress >= 92 && progress < 97 ? "font-bold" : (progress >= 97 ? "text-gray-500" : "")}>Installing updates</span>
                        </div>
                        <div className="flex items-center gap-3">
                            {progress >= 100 ? <span className="text-green-600 font-bold">✓</span> : <span className="w-4"/>} 
                            <span className={progress >= 97 && progress < 100 ? "font-bold" : (progress >= 100 ? "text-gray-500" : "")}>Finishing up</span>
                        </div>
                    </div>
                    <div className="absolute bottom-0 left-0 w-full bg-gray-100 h-24 p-6 border-t border-gray-200">
                        <div className="w-full h-4 bg-gray-300 rounded-full overflow-hidden shadow-inner">
                            <div className="h-full bg-[#0078D7] transition-all duration-500 ease-out" style={{ width: `${progress}%` }}/>
                        </div>
                        <div className="mt-4 text-center text-gray-500 text-sm italic animate-fade-in transition-opacity duration-500">"{installTips[currentTipIndex % installTips.length]}"</div>
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
        case InstallState.SETUP_LANGUAGE:
        return <LanguageStep onNext={() => onNext(InstallState.SETUP_INSTALL_NOW)} />;
        case InstallState.SETUP_INSTALL_NOW:
        return <InstallNowStep onNext={() => onNext(InstallState.SETUP_KEY)} />;
        case InstallState.SETUP_KEY:
        return <ProductKeyStep onNext={() => onNext(InstallState.SETUP_LICENSE)} />;
        case InstallState.SETUP_LICENSE:
        return <LicenseStep onNext={() => onNext(InstallState.SETUP_TYPE)} />;
        case InstallState.SETUP_TYPE:
        return <TypeStep onNext={() => onNext(InstallState.SETUP_PARTITION)} />;
        case InstallState.SETUP_PARTITION:
        return <PartitionStep onNext={() => onNext(InstallState.SETUP_COPYING)} />;
        case InstallState.SETUP_COPYING:
        return <CopyingStep onNext={() => onNext(InstallState.REBOOT_REQUIRED)} onBack={() => onNext(InstallState.SETUP_PARTITION)} />;
        default:
        return null;
    }
  };

  return (
      <>
        {renderStep()}
        {showCmd && <CommandPromptOverlay onClose={() => setShowCmd(false)} />}
      </>
  );
};