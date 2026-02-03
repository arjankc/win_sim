import React, { useState, useEffect, useRef } from 'react';
import { 
    Monitor, Wifi, Volume2, Battery, Search, X, Minus, Square, Settings, 
    Image as ImageIcon, Calculator, FileText, Power, Calendar as CalendarIcon, 
    ChevronUp, Bell, Code, Info, Moon, RefreshCcw, Folder, Terminal, ArrowLeft, 
    HardDrive, Activity, Palette, Play, Cpu, Layers, Database, ChevronRight, ChevronDown, Trash2,
    Bluetooth, Plane, Sun, Accessibility, BatteryCharging, Gamepad2, Flag, Smile, Bomb, Copy,
    Shield, Mail, Globe, Lock, CheckCircle, AlertTriangle, User,
    Download, Edit3, Send, Grid3X3, Projector, CheckSquare, List, Box, Mic, BarChart3, Binary, ArrowRight, Home, RefreshCw, Star, Disc,
    Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, Save, Undo, Redo, Clipboard, Scissors, Plus, Printer
} from 'lucide-react';
import { generateWelcomeMessage } from '../../services/geminiService';
import { playSound } from '../../services/soundService';
import { useSimulation } from '../../contexts/SimulationContext';

interface DesktopProps {
    username?: string;
    onRestart: () => void;
}

interface DesktopWindow {
    id: string;
    title: string;
    icon: React.ReactNode;
    content: React.ReactNode;
    x: number;
    y: number;
    width: number;
    height: number;
    zIndex: number;
    minimized: boolean;
    maximized: boolean;
    restoreRect?: { x: number, y: number, width: number, height: number }; // For restoring from maximize
    type: string; // 'app' | 'system'
}

// --- APP COMPONENTS ---

const DiskManagementApp = () => {
    const { showToast } = useSimulation();
    
    interface Partition {
        id: string;
        type: 'primary' | 'system' | 'unallocated';
        letter?: string;
        label: string;
        size: number; // GB
        fileSystem?: string;
        status: string;
        isBoot?: boolean;
    }

    const [partitions, setPartitions] = useState<Partition[]>([
        { id: 'sys', type: 'system', label: 'System Reserved', size: 0.5, fileSystem: 'NTFS', status: 'Healthy (System, Active, Primary Partition)' },
        { id: 'c', type: 'primary', letter: 'C', label: 'Windows', size: 60, fileSystem: 'NTFS', status: 'Healthy (Boot, Page File, Crash Dump, Basic Data Partition)', isBoot: true },
        { id: 'unalloc', type: 'unallocated', label: 'Unallocated', size: 39.5, status: 'Unallocated' }
    ]);

    const [contextMenu, setContextMenu] = useState<{x: number, y: number, partitionId: string} | null>(null);
    const [formatModal, setFormatModal] = useState<{id: string, label: string} | null>(null);

    const handleRightClick = (e: React.MouseEvent, id: string) => {
        e.preventDefault();
        e.stopPropagation();
        const rect = (e.target as HTMLElement).getBoundingClientRect();
        setContextMenu({ x: e.clientX, y: e.clientY, partitionId: id });
    };

    const handleCreateVolume = () => {
        setPartitions(prev => prev.map(p => {
            if (p.type === 'unallocated') {
                return {
                    ...p,
                    type: 'primary',
                    letter: 'E',
                    label: 'New Volume',
                    fileSystem: 'NTFS',
                    status: 'Healthy (Basic Data Partition)'
                };
            }
            return p;
        }));
        setContextMenu(null);
        playSound('notification');
    };

    const handleDeleteVolume = (id: string) => {
        const part = partitions.find(p => p.id === id);
        if (part?.isBoot || part?.type === 'system') {
            showToast("Windows cannot delete the system partition.", 'simulation');
            setContextMenu(null);
            return;
        }
        
        if (window.confirm("Deleting this volume will erase all data on it. Back up any data you want to keep before deleting. Do you want to continue?")) {
            setPartitions(prev => prev.map(p => {
                if (p.id === id) {
                    return {
                        ...p,
                        type: 'unallocated',
                        letter: undefined,
                        label: 'Unallocated',
                        fileSystem: undefined,
                        status: 'Unallocated'
                    };
                }
                return p;
            }));
            playSound('click');
        }
        setContextMenu(null);
    };

    const handleFormat = (id: string) => {
        const part = partitions.find(p => p.id === id);
        if (part?.isBoot || part?.type === 'system') {
            showToast("You cannot format this volume.", 'simulation');
            setContextMenu(null);
            return;
        }
        setFormatModal({ id, label: part?.label || "" });
        setContextMenu(null);
    };

    const confirmFormat = () => {
        if (!formatModal) return;
        setPartitions(prev => prev.map(p => {
            if (p.id === formatModal.id) {
                return { ...p, label: formatModal.label };
            }
            return p;
        }));
        setFormatModal(null);
        playSound('notification');
    };

    const totalSize = partitions.reduce((acc, p) => acc + p.size, 0);

    return (
        <div className="flex flex-col h-full bg-white text-gray-900 font-sans text-xs select-none relative" onClick={() => setContextMenu(null)}>
            <div className="bg-[#F0F0F0] border-b p-1 flex gap-2 text-gray-600">
                <div className="border border-transparent hover:border-gray-400 hover:bg-gray-200 p-1 rounded cursor-default"><Settings size={16}/></div>
                <div className="border border-transparent hover:border-gray-400 hover:bg-gray-200 p-1 rounded cursor-default"><RefreshCw size={16}/></div>
            </div>
            <div className="h-1/2 overflow-auto border-b border-gray-300">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-white sticky top-0">
                        <tr className="border-b border-gray-200 text-gray-500">
                            <th className="font-normal p-1 border-r w-32">Volume</th>
                            <th className="font-normal p-1 border-r w-20">Layout</th>
                            <th className="font-normal p-1 border-r w-20">Type</th>
                            <th className="font-normal p-1 border-r w-20">File System</th>
                            <th className="font-normal p-1 border-r">Status</th>
                            <th className="font-normal p-1 border-r w-20">Capacity</th>
                            <th className="font-normal p-1 w-20">Free Space</th>
                        </tr>
                    </thead>
                    <tbody>
                        {partitions.filter(p => p.type !== 'unallocated').map(p => (
                            <tr key={p.id} className="hover:bg-[#E5F3FF] cursor-default">
                                <td className="p-1 border-r flex items-center gap-1"><HardDrive size={12}/> {p.label} {p.letter ? `(${p.letter}:)` : ''}</td>
                                <td className="p-1 border-r">Simple</td>
                                <td className="p-1 border-r">Basic</td>
                                <td className="p-1 border-r">{p.fileSystem}</td>
                                <td className="p-1 border-r">{p.status}</td>
                                <td className="p-1 border-r">{p.size.toFixed(2)} GB</td>
                                <td className="p-1">{Math.floor(p.size * 0.1)} GB</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="flex-1 bg-[#F0F0F0] p-4 overflow-auto">
                <div className="flex gap-4">
                    <div className="w-32 bg-[#E1E1E1] border border-gray-400 p-2 flex flex-col items-center justify-center text-center shadow-sm">
                        <div className="font-bold">Disk 0</div>
                        <div>Basic</div>
                        <div>{totalSize} GB</div>
                        <div>Online</div>
                    </div>
                    <div className="flex-1 flex h-24 border border-gray-400 bg-white">
                        {partitions.map(p => {
                            const widthPercent = (p.size / totalSize) * 100;
                            const colorClass = p.type === 'unallocated' ? 'bg-black' : (p.type === 'primary' || p.type === 'system' ? 'bg-[#000080]' : 'bg-[#00AA00]');
                            const patternClass = p.type === 'unallocated' ? 'bg-[url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAYAAACp8Z5+AAAAIklEQVQIW2NkQAKrVq36zwjjgzj//v37zwjjgzj//v37zwQA7QxQP/x7a+4AAAAASUVORK5CYII=")]' : '';
                            
                            return (
                                <div 
                                    key={p.id} 
                                    style={{ width: `${widthPercent}%` }} 
                                    className="h-full border-r border-white flex flex-col group relative"
                                    onContextMenu={(e) => handleRightClick(e, p.id)}
                                >
                                    <div className={`h-2 ${colorClass} w-full`}></div>
                                    <div className={`flex-1 flex flex-col justify-center items-center text-center p-1 overflow-hidden hover:bg-blue-50 cursor-default ${patternClass}`}>
                                        <div className="font-bold truncate w-full">{p.label} {p.letter ? `(${p.letter}:)` : ''}</div>
                                        <div className="truncate w-full">{p.size.toFixed(2)} GB</div>
                                        <div className="truncate w-full text-[10px]">{p.type === 'unallocated' ? 'Unallocated' : p.fileSystem}</div>
                                        {p.status.includes("Healthy") && <div className="truncate w-full text-[10px]">Healthy</div>}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
                <div className="mt-8 flex gap-4 text-[10px] text-gray-600">
                    <div className="flex items-center gap-1"><div className="w-3 h-3 bg-[#000080]"></div> Primary partition</div>
                    <div className="flex items-center gap-1"><div className="w-3 h-3 bg-black"></div> Unallocated</div>
                </div>
            </div>
            {contextMenu && (
                <div className="fixed bg-white border border-gray-400 shadow-xl py-1 z-[10000] w-48" style={{ top: contextMenu.y, left: contextMenu.x }}>
                    {partitions.find(p => p.id === contextMenu.partitionId)?.type === 'unallocated' ? (
                        <>
                            <div className="px-4 py-1 hover:bg-[#E5F3FF] cursor-pointer font-bold" onClick={handleCreateVolume}>New Simple Volume...</div>
                            <div className="px-4 py-1 hover:bg-[#E5F3FF] cursor-pointer text-gray-400">New Spanned Volume...</div>
                            <div className="px-4 py-1 hover:bg-[#E5F3FF] cursor-pointer text-gray-400">New Striped Volume...</div>
                            <div className="border-t my-1"></div>
                            <div className="px-4 py-1 hover:bg-[#E5F3FF] cursor-pointer">Properties</div>
                        </>
                    ) : (
                        <>
                            <div className="px-4 py-1 hover:bg-[#E5F3FF] cursor-pointer">Open</div>
                            <div className="px-4 py-1 hover:bg-[#E5F3FF] cursor-pointer">Explore</div>
                            <div className="border-t my-1"></div>
                            <div className="px-4 py-1 hover:bg-[#E5F3FF] cursor-pointer text-gray-400">Mark Partition as Active</div>
                            <div className="px-4 py-1 hover:bg-[#E5F3FF] cursor-pointer text-gray-400">Change Drive Letter and Paths...</div>
                            <div className="px-4 py-1 hover:bg-[#E5F3FF] cursor-pointer" onClick={() => handleFormat(contextMenu.partitionId)}>Format...</div>
                            <div className="border-t my-1"></div>
                            <div className="px-4 py-1 hover:bg-[#E5F3FF] cursor-pointer text-gray-400">Shrink Volume...</div>
                            <div className="px-4 py-1 hover:bg-[#E5F3FF] cursor-pointer" onClick={() => handleDeleteVolume(contextMenu.partitionId)}>Delete Volume...</div>
                            <div className="border-t my-1"></div>
                            <div className="px-4 py-1 hover:bg-[#E5F3FF] cursor-pointer">Properties</div>
                        </>
                    )}
                </div>
            )}
            {formatModal && (
                <div className="absolute inset-0 bg-black/20 z-[10001] flex items-center justify-center">
                    <div className="bg-white border border-gray-400 shadow-xl p-1 w-80">
                        <div className="flex justify-between items-center bg-white p-2 mb-2">
                            <span className="font-bold">Format {formatModal.label}</span>
                            <button onClick={() => setFormatModal(null)}><X size={16}/></button>
                        </div>
                        <div className="p-4 space-y-4">
                            <div>
                                <label className="block mb-1">Volume label:</label>
                                <input className="w-full border border-gray-300 p-1" value={formatModal.label} onChange={e => setFormatModal({...formatModal, label: e.target.value})}/>
                            </div>
                            <div>
                                <label className="block mb-1">File system:</label>
                                <select className="w-full border border-gray-300 p-1" disabled><option>NTFS</option></select>
                            </div>
                            <div>
                                <label className="block mb-1">Allocation unit size:</label>
                                <select className="w-full border border-gray-300 p-1" disabled><option>Default</option></select>
                            </div>
                            <div className="flex items-center gap-2"><input type="checkbox" defaultChecked /> <label>Perform a quick format</label></div>
                        </div>
                        <div className="bg-[#F0F0F0] p-2 flex justify-end gap-2 border-t">
                            <button onClick={confirmFormat} className="px-4 py-1 border bg-[#E1E1E1] hover:bg-[#E5F1FB] border-gray-400">OK</button>
                            <button onClick={() => setFormatModal(null)} className="px-4 py-1 border bg-[#E1E1E1] hover:bg-[#E5F1FB] border-gray-400">Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
};

const SecurityApp = () => {
    const [scanning, setScanning] = useState(false);
    const [scanProgress, setScanProgress] = useState(0);
    const [lastScan, setLastScan] = useState<string>("No recent scan");
    const [defUpdateDate, setDefUpdateDate] = useState<string>("1/1/2024");
    const [updatingDefs, setUpdatingDefs] = useState(false);
    const [tab, setTab] = useState('home');
    const [showAllowedApps, setShowAllowedApps] = useState(false);
    const [realtime, setRealtime] = useState(true);

    const startScan = () => {
        setScanning(true);
        setScanProgress(0);
        const interval = setInterval(() => {
            setScanProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setScanning(false);
                    setLastScan(new Date().toLocaleTimeString());
                    return 0;
                }
                return prev + 1;
            });
        }, 50);
    };

    const updateDefs = () => {
        setUpdatingDefs(true);
        setTimeout(() => {
            setDefUpdateDate(new Date().toLocaleDateString());
            setUpdatingDefs(false);
        }, 2000);
    };

    return (
        <div className="flex h-full bg-white text-gray-900 font-sans select-none">
            <div className="w-64 bg-gray-100 p-4 border-r border-gray-200 flex flex-col gap-2">
                <div className="flex items-center gap-2 mb-6 px-2">
                    <Shield className="text-blue-600" size={24} />
                    <span className="font-semibold text-lg">Windows Security</span>
                </div>
                <button onClick={() => setTab('home')} className={`text-left px-4 py-3 rounded-sm hover:bg-gray-200 flex items-center gap-3 ${tab === 'home' ? 'bg-white shadow-sm border-l-4 border-blue-600' : ''}`}>
                    <Shield size={18} /> Home
                </button>
                <button onClick={() => setTab('virus')} className={`text-left px-4 py-3 rounded-sm hover:bg-gray-200 flex items-center gap-3 ${tab === 'virus' ? 'bg-white shadow-sm border-l-4 border-blue-600' : ''}`}>
                    <Activity size={18} /> Virus & threat protection
                </button>
                <button onClick={() => setTab('firewall')} className={`text-left px-4 py-3 rounded-sm hover:bg-gray-200 flex items-center gap-3 ${tab === 'firewall' ? 'bg-white shadow-sm border-l-4 border-blue-600' : ''}`}>
                    <Globe size={18} /> Firewall & network protection
                </button>
            </div>
            <div className="flex-1 p-8 overflow-y-auto">
                {tab === 'home' && (
                    <div className="max-w-2xl">
                        <h2 className="text-2xl font-light mb-6">Security at a glance</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-6 border rounded hover:shadow-md transition-shadow cursor-pointer" onClick={() => setTab('virus')}>
                                <div className="flex items-center gap-4 mb-2">
                                    <Activity size={32} className="text-blue-600"/>
                                    <div>
                                        <div className="font-semibold">Virus & threat protection</div>
                                        <div className="text-sm text-green-600">No actions needed.</div>
                                    </div>
                                </div>
                            </div>
                            <div className="p-6 border rounded hover:shadow-md transition-shadow cursor-pointer" onClick={() => setTab('firewall')}>
                                <div className="flex items-center gap-4 mb-2">
                                    <Globe size={32} className="text-blue-600"/>
                                    <div>
                                        <div className="font-semibold">Firewall & network protection</div>
                                        <div className="text-sm text-green-600">No actions needed.</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                {tab === 'virus' && (
                    <div className="max-w-2xl">
                        <h2 className="text-2xl font-light mb-6">Virus & threat protection</h2>
                        <div className="mb-8">
                            <div className="font-semibold mb-2">Current threats</div>
                            <div className="text-sm text-gray-600 mb-4">Last scan: {lastScan}</div>
                            {scanning ? (
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span>Estimated time remaining: 00:00:10</span>
                                        <button onClick={() => setScanning(false)} className="text-blue-600 border border-transparent hover:border-gray-300 px-3 rounded">Cancel</button>
                                    </div>
                                    <div className="h-1 bg-gray-200 overflow-hidden"><div className="h-full bg-blue-600 transition-all duration-75" style={{width: `${scanProgress}%`}}></div></div>
                                </div>
                            ) : (
                                <button onClick={startScan} className="bg-gray-100 hover:bg-gray-200 border border-gray-300 px-6 py-2 rounded-sm text-sm font-semibold">Quick scan</button>
                            )}
                        </div>
                        <div className="border-t pt-6 mb-6">
                            <div className="font-semibold mb-2">Virus & threat protection settings</div>
                            <div className="flex items-center justify-between py-2">
                                <div>
                                    <div className="font-medium">Real-time protection</div>
                                    <div className="text-sm text-gray-500">Locates and stops malware from installing or running on your device.</div>
                                </div>
                                <button onClick={() => setRealtime(!realtime)} className={`w-10 h-5 rounded-full relative transition-colors ${realtime ? 'bg-blue-600' : 'bg-gray-400'}`}>
                                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${realtime ? 'left-6' : 'left-1'}`}></div>
                                </button>
                            </div>
                        </div>
                        <div className="border-t pt-6">
                            <div className="font-semibold mb-2">Virus & threat protection updates</div>
                            <button onClick={updateDefs} disabled={updatingDefs} className="text-blue-600 text-sm font-medium hover:underline disabled:opacity-50">
                                {updatingDefs ? "Checking for updates..." : "Check for updates"}
                            </button>
                        </div>
                    </div>
                )}
                {tab === 'firewall' && (
                    <div className="max-w-2xl">
                        <h2 className="text-2xl font-light mb-6">Firewall & network protection</h2>
                        {!showAllowedApps ? (
                            <>
                                <div className="space-y-6 mb-8">
                                    <div className="flex items-center gap-4">
                                        <CheckCircle className="text-green-600" size={32}/>
                                        <div>
                                            <div className="font-semibold text-lg">Private network</div>
                                            <div className="text-sm text-gray-500">Firewall is on.</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <CheckCircle className="text-green-600" size={32}/>
                                        <div>
                                            <div className="font-semibold text-lg">Public network</div>
                                            <div className="text-sm text-gray-500">Firewall is on.</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-blue-600 text-sm hover:underline block cursor-pointer" onClick={() => setShowAllowedApps(true)}>Allow an app through firewall</div>
                            </>
                        ) : (
                            <div className="animate-in fade-in">
                                <button onClick={() => setShowAllowedApps(false)} className="mb-4 flex items-center gap-2 text-blue-600 hover:underline"><ArrowLeft size={16}/> Back</button>
                                <div className="border rounded h-64 overflow-y-auto">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-gray-100 border-b"><tr><th className="p-2">Allowed apps</th></tr></thead>
                                        <tbody>
                                            {["Microsoft Office", "Google Chrome", "Spotify Music", "WinSim Core", "Microsoft Edge"].map((app, i) => (
                                                <tr key={i} className="border-b"><td className="p-2">{app}</td></tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
};

const MailApp = () => {
    const { showToast } = useSimulation();
    const [setup, setSetup] = useState(true);
    const [email, setEmail] = useState("");
    const [view, setView] = useState<'inbox'|'sent'|'compose'>('inbox');
    const [inbox, setInbox] = useState([{ from: 'WinSim Team', subject: 'Welcome', body: 'Welcome to WinSim!', date: '10:00 AM' }]);
    const [sent, setSent] = useState<any[]>([]);
    const [to, setTo] = useState("");
    const [subject, setSubject] = useState("");
    const [body, setBody] = useState("");

    const handleSend = () => {
        setSent([{ to, subject, body, date: 'Now' }, ...sent]);
        setView('sent');
        // Self-send logic for assignment
        if (to.toLowerCase() === email.toLowerCase()) {
            setTimeout(() => {
                setInbox(prev => [{ from: 'Me', subject: `[Test] ${subject}`, body, date: 'Now' }, ...prev]);
                showToast("You received a new email", 'info');
                playSound('notification');
            }, 2000);
        }
        setTo(""); setSubject(""); setBody("");
    };
    
    if (setup) {
        return (
            <div className="flex h-full bg-[#f3f3f3] items-center justify-center font-sans text-gray-900">
                <div className="bg-white p-8 shadow-xl w-96 flex flex-col gap-4">
                    <div className="flex items-center gap-2 text-xl font-semibold mb-4">
                        <div className="bg-blue-500 text-white p-1 rounded"><Mail size={20}/></div><span>Add an account</span>
                    </div>
                    <input className="border-b-2 border-blue-500 p-2" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)}/>
                    <button disabled={!email.includes('@')} onClick={() => setSetup(false)} className="bg-blue-600 text-white px-6 py-2 hover:bg-blue-700 disabled:opacity-50 self-end">Sign in</button>
                </div>
            </div>
        )
    }
    return (
        <div className="flex h-full bg-white text-gray-900 font-sans">
            <div className="w-48 bg-[#f0f0f0] border-r p-2 flex flex-col gap-1">
                <div className="px-2 py-2 mb-2 font-bold truncate" title={email}>{email}</div>
                <button onClick={() => setView('compose')} className="bg-blue-600 text-white py-2 rounded mb-2">New Mail</button>
                <div onClick={() => setView('inbox')} className={`p-2 cursor-pointer rounded ${view === 'inbox' ? 'bg-blue-100 text-blue-700' : 'hover:bg-white'}`}>Inbox</div>
                <div onClick={() => setView('sent')} className={`p-2 cursor-pointer rounded ${view === 'sent' ? 'bg-blue-100 text-blue-700' : 'hover:bg-white'}`}>Sent</div>
            </div>
            <div className="flex-1 p-4">
                {view === 'compose' ? (
                    <div className="flex flex-col gap-4 h-full">
                        <input className="border-b p-2" placeholder="To" value={to} onChange={e => setTo(e.target.value)}/>
                        <input className="border-b p-2" placeholder="Subject" value={subject} onChange={e => setSubject(e.target.value)}/>
                        <textarea className="flex-1 border p-2 resize-none" value={body} onChange={e => setBody(e.target.value)}/>
                        <button onClick={handleSend} className="bg-blue-600 text-white px-4 py-2 self-end">Send</button>
                    </div>
                ) : (
                    <div className="space-y-1">
                        {view === 'inbox' ? 
                            (inbox.length === 0 ? <div className="text-gray-500 text-center mt-10">Nothing here</div> : inbox.map((m,i)=><div key={i} className="border-b p-3 hover:bg-blue-50 cursor-pointer"><div className="font-bold flex justify-between"><span>{m.from}</span><span className="text-xs font-normal text-gray-500">{m.date}</span></div><div>{m.subject}</div><div className="text-gray-500 truncate text-sm">{m.body}</div></div>)) 
                            : 
                            (sent.length === 0 ? <div className="text-gray-500 text-center mt-10">No sent mail</div> : sent.map((m,i)=><div key={i} className="border-b p-3 hover:bg-blue-50 cursor-pointer"><div className="font-bold flex justify-between"><span>To: {m.to}</span><span className="text-xs font-normal text-gray-500">{m.date}</span></div><div>{m.subject}</div></div>))
                        }
                    </div>
                )}
            </div>
        </div>
    )
};

const WordApp = () => {
    const { showToast } = useSimulation();
    return (
        <div className="flex flex-col h-full bg-white text-gray-900 font-sans select-none">
            {/* Title Bar */}
            <div className="bg-[#2B579A] text-white h-8 flex justify-between items-center px-2 text-xs">
                <div className="flex items-center gap-4">
                    <div className="flex gap-2">
                        <Save size={14} className="cursor-pointer hover:bg-white/20 rounded"/>
                        <Undo size={14} className="cursor-pointer hover:bg-white/20 rounded"/>
                        <Redo size={14} className="cursor-pointer hover:bg-white/20 rounded opacity-50"/>
                    </div>
                    <span>Document1 - Word</span>
                </div>
                <div className="flex items-center bg-white/20 rounded px-2 py-0.5 w-64 justify-center">
                    <Search size={12} className="mr-2"/> <span className="opacity-70">Search</span>
                </div>
                <div className="flex gap-2 items-center">
                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-[10px]">US</div>
                    <span>User</span>
                </div>
            </div>
            
            {/* Ribbon */}
            <div className="flex flex-col border-b border-gray-300 bg-gray-50">
                <div className="flex text-xs px-2 pt-1 gap-1 text-gray-700">
                    <span className="px-3 py-1 bg-[#2B579A] text-white rounded-t-sm cursor-default">File</span>
                    {['Home', 'Insert', 'Draw', 'Design', 'Layout', 'References', 'Mailings', 'Review', 'View', 'Help'].map((tab, i) => (
                        <span key={tab} className={`px-3 py-1 cursor-pointer hover:bg-gray-200 rounded-t-sm ${i === 0 ? 'bg-white border-b-2 border-[#2B579A] font-semibold text-[#2B579A]' : ''}`} onClick={() => i > 0 && showToast(`${tab} tab is simulated`, 'simulation')}>{tab}</span>
                    ))}
                </div>
                <div className="h-24 bg-white flex px-2 py-1 gap-2 items-start overflow-hidden text-gray-800">
                    {/* Clipboard */}
                    <div className="flex flex-col items-center justify-between h-full px-2 border-r border-gray-200 min-w-[60px]">
                        <div className="flex flex-col items-center cursor-pointer hover:bg-gray-100 p-1 rounded">
                            <Clipboard size={24} className="text-gray-600"/>
                            <span className="text-[10px]">Paste</span>
                        </div>
                        <div className="flex gap-1">
                            <Scissors size={12}/> <Copy size={12}/>
                        </div>
                        <span className="text-[10px] text-gray-500 mt-auto">Clipboard</span>
                    </div>
                    
                    {/* Font */}
                    <div className="flex flex-col h-full px-2 border-r border-gray-200 min-w-[140px]">
                        <div className="flex gap-1 mb-1">
                            <select className="border border-gray-300 text-xs h-6 w-28 bg-white outline-none"><option>Calibri (Body)</option></select>
                            <select className="border border-gray-300 text-xs h-6 w-12 bg-white outline-none"><option>11</option></select>
                        </div>
                        <div className="flex gap-1 mb-1">
                            <div className="p-1 hover:bg-gray-200 rounded cursor-pointer font-bold"><Bold size={14}/></div>
                            <div className="p-1 hover:bg-gray-200 rounded cursor-pointer italic"><Italic size={14}/></div>
                            <div className="p-1 hover:bg-gray-200 rounded cursor-pointer underline"><Underline size={14}/></div>
                        </div>
                        <span className="text-[10px] text-gray-500 mt-auto text-center">Font</span>
                    </div>

                    {/* Paragraph */}
                    <div className="flex flex-col h-full px-2 border-r border-gray-200 min-w-[140px]">
                        <div className="flex gap-1 mb-1">
                            <List size={14} className="cursor-pointer hover:bg-gray-200 p-0.5 rounded"/>
                        </div>
                        <div className="flex gap-1 mb-1">
                            <div className="p-1 hover:bg-gray-200 rounded cursor-pointer"><AlignLeft size={14}/></div>
                            <div className="p-1 hover:bg-gray-200 rounded cursor-pointer"><AlignCenter size={14}/></div>
                            <div className="p-1 hover:bg-gray-200 rounded cursor-pointer"><AlignRight size={14}/></div>
                        </div>
                        <span className="text-[10px] text-gray-500 mt-auto text-center">Paragraph</span>
                    </div>
                    
                    {/* Styles */}
                    <div className="flex flex-col h-full px-2 border-r border-gray-200 flex-1">
                        <div className="flex gap-1 overflow-hidden h-14">
                            {['Normal', 'No Spacing', 'Heading 1', 'Heading 2', 'Title'].map(s => (
                                <div key={s} className="flex flex-col items-center justify-center border border-transparent hover:border-gray-300 bg-white p-1 min-w-[60px] cursor-pointer">
                                    <div className="text-xl leading-none mb-1">AaBbCc</div>
                                    <div className="text-[10px] whitespace-nowrap">{s}</div>
                                </div>
                            ))}
                        </div>
                        <span className="text-[10px] text-gray-500 mt-auto text-center">Styles</span>
                    </div>
                </div>
            </div>

            {/* Workspace */}
            <div className="flex-1 bg-[#F3F2F1] p-4 overflow-auto flex justify-center relative">
                {/* Simulated page */}
                <div className="w-[816px] min-h-[1056px] bg-white shadow-xl p-[96px] outline-none cursor-text" contentEditable spellCheck={false}>
                    <h1 className="text-3xl font-bold mb-4">Document Title</h1>
                    <p className="mb-4">Type your text here...</p>
                </div>
            </div>

            {/* Status Bar */}
            <div className="h-6 bg-[#2B579A] text-white text-[10px] flex items-center px-2 justify-between">
                <div className="flex gap-4">
                    <span>Page 1 of 1</span>
                    <span>12 words</span>
                    <span>English (United States)</span>
                </div>
                <div className="flex gap-4 items-center">
                    <span>Focus</span>
                    <div className="flex items-center gap-2">
                        <Minus size={10} className="cursor-pointer"/>
                        <div className="w-24 h-1 bg-white/30 rounded-full"><div className="w-1/2 h-full bg-white rounded-full"></div></div>
                        <Plus size={10} className="cursor-pointer"/>
                        <span>100%</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ExcelApp = () => {
    const { showToast } = useSimulation();
    return (
        <div className="flex flex-col h-full bg-white text-gray-900 font-sans select-none">
            {/* Title Bar */}
            <div className="bg-[#217346] text-white h-8 flex justify-between items-center px-2 text-xs">
                <div className="flex items-center gap-4">
                    <div className="flex gap-2">
                        <Save size={14} className="cursor-pointer hover:bg-white/20 rounded"/>
                        <Undo size={14} className="cursor-pointer hover:bg-white/20 rounded"/>
                        <Redo size={14} className="cursor-pointer hover:bg-white/20 rounded opacity-50"/>
                    </div>
                    <span>Book1 - Excel</span>
                </div>
                <div className="flex items-center bg-white/20 rounded px-2 py-0.5 w-64 justify-center">
                    <Search size={12} className="mr-2"/> <span className="opacity-70">Search</span>
                </div>
                <div className="flex gap-2 items-center">
                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-[10px]">US</div>
                    <span>User</span>
                </div>
            </div>

            {/* Ribbon */}
            <div className="flex flex-col border-b border-gray-300 bg-gray-50">
                <div className="flex text-xs px-2 pt-1 gap-1 text-gray-700">
                    <span className="px-3 py-1 bg-[#217346] text-white rounded-t-sm cursor-default">File</span>
                    {['Home', 'Insert', 'Page Layout', 'Formulas', 'Data', 'Review', 'View', 'Help'].map((tab, i) => (
                        <span key={tab} className={`px-3 py-1 cursor-pointer hover:bg-gray-200 rounded-t-sm ${i === 0 ? 'bg-white border-b-2 border-[#217346] font-semibold text-[#217346]' : ''}`} onClick={() => i > 0 && showToast(`${tab} tab is simulated`, 'simulation')}>{tab}</span>
                    ))}
                </div>
                <div className="h-24 bg-white flex px-2 py-1 gap-2 items-start overflow-hidden text-gray-800">
                    <div className="flex flex-col items-center justify-between h-full px-2 border-r border-gray-200 min-w-[60px]">
                        <div className="flex flex-col items-center cursor-pointer hover:bg-gray-100 p-1 rounded">
                            <Clipboard size={24} className="text-gray-600"/>
                            <span className="text-[10px]">Paste</span>
                        </div>
                        <span className="text-[10px] text-gray-500 mt-auto">Clipboard</span>
                    </div>
                    <div className="flex flex-col h-full px-2 border-r border-gray-200 min-w-[140px]">
                        <div className="flex gap-1 mb-1">
                            <select className="border border-gray-300 text-xs h-6 w-28 bg-white outline-none"><option>Calibri</option></select>
                            <select className="border border-gray-300 text-xs h-6 w-12 bg-white outline-none"><option>11</option></select>
                        </div>
                        <div className="flex gap-1 mb-1">
                            <div className="p-1 hover:bg-gray-200 rounded cursor-pointer font-bold"><Bold size={14}/></div>
                            <div className="p-1 hover:bg-gray-200 rounded cursor-pointer italic"><Italic size={14}/></div>
                            <div className="p-1 hover:bg-gray-200 rounded cursor-pointer underline"><Underline size={14}/></div>
                        </div>
                        <span className="text-[10px] text-gray-500 mt-auto text-center">Font</span>
                    </div>
                    <div className="flex flex-col h-full px-2 border-r border-gray-200 min-w-[100px]">
                        <div className="flex gap-1 mb-1 mt-1 justify-center">
                            <div className="p-1 hover:bg-gray-200 rounded cursor-pointer"><AlignLeft size={14}/></div>
                            <div className="p-1 hover:bg-gray-200 rounded cursor-pointer"><AlignCenter size={14}/></div>
                            <div className="p-1 hover:bg-gray-200 rounded cursor-pointer"><AlignRight size={14}/></div>
                        </div>
                        <span className="text-[10px] text-gray-500 mt-auto text-center">Alignment</span>
                    </div>
                </div>
            </div>

            {/* Formula Bar */}
            <div className="flex items-center gap-2 p-1 border-b border-gray-300 bg-white">
                <div className="w-10 text-center border border-gray-300 text-sm py-0.5">A1</div>
                <div className="text-gray-400">fx</div>
                <input className="flex-1 border border-gray-300 px-2 py-0.5 text-sm outline-none focus:border-[#217346]"/>
            </div>

            {/* Grid */}
            <div className="flex-1 overflow-auto bg-white grid grid-cols-[40px_repeat(10,100px)] text-sm">
                <div className="bg-gray-100 border-b border-r"></div>{['A','B','C','D','E','F','G'].map(c=><div key={c} className="bg-gray-100 text-center border-b border-r text-gray-600 font-semibold flex items-center justify-center">{c}</div>)}
                {[...Array(30)].map((_,r)=><React.Fragment key={r}><div className="bg-gray-100 text-center border-b border-r text-gray-600 font-semibold flex items-center justify-center">{r+1}</div>{[...Array(7)].map((_,c)=><input key={c} className="border-b border-r px-1 outline-none focus:border-2 focus:border-[#217346] z-10"/>)}</React.Fragment>)}
            </div>

            {/* Status Bar */}
            <div className="h-6 bg-[#217346] text-white text-[10px] flex items-center px-2 justify-between">
                <div className="flex gap-4">
                    <span>Ready</span>
                </div>
                <div className="flex gap-4 items-center">
                    <span>Normal View</span>
                    <div className="flex items-center gap-2">
                        <Minus size={10} className="cursor-pointer"/>
                        <div className="w-24 h-1 bg-white/30 rounded-full"><div className="w-1/2 h-full bg-white rounded-full"></div></div>
                        <Plus size={10} className="cursor-pointer"/>
                        <span>100%</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

const PowerPointApp = () => {
    const { showToast } = useSimulation();
    return (
        <div className="flex flex-col h-full bg-white text-gray-900 font-sans select-none">
            {/* Title Bar */}
            <div className="bg-[#D24726] text-white h-8 flex justify-between items-center px-2 text-xs">
                <div className="flex items-center gap-4">
                    <div className="flex gap-2">
                        <Save size={14} className="cursor-pointer hover:bg-white/20 rounded"/>
                        <Undo size={14} className="cursor-pointer hover:bg-white/20 rounded"/>
                        <Redo size={14} className="cursor-pointer hover:bg-white/20 rounded opacity-50"/>
                    </div>
                    <span>Presentation1 - PowerPoint</span>
                </div>
                <div className="flex items-center bg-white/20 rounded px-2 py-0.5 w-64 justify-center">
                    <Search size={12} className="mr-2"/> <span className="opacity-70">Search</span>
                </div>
                <div className="flex gap-2 items-center">
                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-[10px]">US</div>
                    <span>User</span>
                </div>
            </div>

            {/* Ribbon */}
            <div className="flex flex-col border-b border-gray-300 bg-gray-50">
                <div className="flex text-xs px-2 pt-1 gap-1 text-gray-700">
                    <span className="px-3 py-1 bg-[#D24726] text-white rounded-t-sm cursor-default">File</span>
                    {['Home', 'Insert', 'Draw', 'Design', 'Transitions', 'Animations', 'Slide Show', 'Record', 'Review', 'View', 'Help'].map((tab, i) => (
                        <span key={tab} className={`px-3 py-1 cursor-pointer hover:bg-gray-200 rounded-t-sm ${i === 0 ? 'bg-white border-b-2 border-[#D24726] font-semibold text-[#D24726]' : ''}`} onClick={() => i > 0 && showToast(`${tab} tab is simulated`, 'simulation')}>{tab}</span>
                    ))}
                </div>
                <div className="h-24 bg-white flex px-2 py-1 gap-2 items-start overflow-hidden text-gray-800">
                    <div className="flex flex-col items-center justify-between h-full px-2 border-r border-gray-200 min-w-[60px]">
                        <div className="flex flex-col items-center cursor-pointer hover:bg-gray-100 p-1 rounded">
                            <Clipboard size={24} className="text-gray-600"/>
                            <span className="text-[10px]">Paste</span>
                        </div>
                        <span className="text-[10px] text-gray-500 mt-auto">Clipboard</span>
                    </div>
                    <div className="flex flex-col h-full px-2 border-r border-gray-200 min-w-[80px] items-center">
                        <div className="flex flex-col items-center cursor-pointer hover:bg-gray-100 p-1 rounded">
                            <div className="border border-gray-300 p-1 bg-white mb-1"><FileText size={16}/></div>
                            <span className="text-[10px] text-center">New<br/>Slide</span>
                        </div>
                        <span className="text-[10px] text-gray-500 mt-auto text-center">Slides</span>
                    </div>
                    <div className="flex flex-col h-full px-2 border-r border-gray-200 min-w-[140px]">
                        <div className="flex gap-1 mb-1">
                            <select className="border border-gray-300 text-xs h-6 w-28 bg-white outline-none"><option>Calibri Light</option></select>
                            <select className="border border-gray-300 text-xs h-6 w-12 bg-white outline-none"><option>60</option></select>
                        </div>
                        <div className="flex gap-1 mb-1">
                            <div className="p-1 hover:bg-gray-200 rounded cursor-pointer font-bold"><Bold size={14}/></div>
                            <div className="p-1 hover:bg-gray-200 rounded cursor-pointer italic"><Italic size={14}/></div>
                            <div className="p-1 hover:bg-gray-200 rounded cursor-pointer underline"><Underline size={14}/></div>
                        </div>
                        <span className="text-[10px] text-gray-500 mt-auto text-center">Font</span>
                    </div>
                </div>
            </div>

            {/* Content Split */}
            <div className="flex-1 flex overflow-hidden">
                {/* Thumbnails */}
                <div className="w-48 bg-gray-100 border-r border-gray-300 overflow-y-auto p-4 flex flex-col gap-4">
                    <div className="flex gap-1">
                        <span className="text-xs text-gray-500 mt-1">1</span>
                        <div className="flex-1 aspect-video bg-white shadow border-2 border-[#D24726] p-2 flex flex-col items-center justify-center gap-1 scale-100">
                            <div className="w-3/4 h-1 bg-gray-300"></div>
                            <div className="w-1/2 h-1 bg-gray-300"></div>
                        </div>
                    </div>
                </div>
                
                {/* Main Slide */}
                <div className="flex-1 bg-[#F0F0F0] flex items-center justify-center p-8 overflow-auto">
                    <div className="aspect-video w-3/4 bg-white shadow-xl flex flex-col items-center justify-center border border-gray-300 relative outline-none" contentEditable>
                        <div className="border border-dashed border-gray-300 p-8 w-3/4 text-center mb-4">
                            <h1 className="text-5xl text-gray-800 font-light">Click to add title</h1>
                        </div>
                        <div className="border border-dashed border-gray-300 p-4 w-2/3 text-center">
                            <h2 className="text-2xl text-gray-500">Click to add subtitle</h2>
                        </div>
                    </div>
                </div>
            </div>

            {/* Status Bar */}
            <div className="h-6 bg-[#D24726] text-white text-[10px] flex items-center px-2 justify-between">
                <div className="flex gap-4">
                    <span>Slide 1 of 1</span>
                    <span>English (United States)</span>
                </div>
                <div className="flex gap-4 items-center">
                    <span>Notes</span>
                    <span>Comments</span>
                    <div className="flex items-center gap-2">
                        <Minus size={10} className="cursor-pointer"/>
                        <div className="w-24 h-1 bg-white/30 rounded-full"><div className="w-1/2 h-full bg-white rounded-full"></div></div>
                        <Plus size={10} className="cursor-pointer"/>
                        <span>Fit</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

const CalculatorApp = () => {
    const [d, setD] = useState("0");
    return (
        <div className="h-full bg-[#f3f3f3] flex flex-col p-2 gap-1 font-sans">
            <div className="flex-1 flex items-end justify-end text-4xl p-2">{d}</div>
            <div className="grid grid-cols-4 gap-1 h-3/4">{['7','8','9','/','4','5','6','*','1','2','3','-','C','0','=','+'].map(b=><button key={b} onClick={()=>setD(d==='0'?b:d+b)} className="bg-white rounded hover:bg-gray-100">{b}</button>)}</div>
        </div>
    )
};

const NotepadApp = ({ theme }: { theme: 'light' | 'dark' }) => (
    <div className={`flex flex-col h-full ${theme === 'dark' ? 'bg-[#282828] text-white' : 'bg-white text-gray-900'}`}>
        <div className="border-b p-1 text-xs flex gap-2"><span>File</span><span>Edit</span></div>
        <textarea className="flex-1 resize-none p-2 bg-transparent outline-none border-none text-inherit"/>
    </div>
);

const PaintApp = () => (
    <div className="flex flex-col h-full bg-[#f0f0f0]">
        <div className="h-16 bg-white border-b flex items-center px-4 gap-2"><span>Brush</span><span>Color</span></div>
        <div className="flex-1 bg-white m-4 shadow cursor-crosshair"></div>
    </div>
);

const RegEditApp = () => (
    <div className="flex h-full bg-white text-gray-900 text-xs font-sans">
        <div className="w-48 border-r p-1"><div>Computer</div><div className="pl-2">HKEY_LOCAL_MACHINE</div></div>
        <div className="flex-1 p-1"><div className="grid grid-cols-3 gap-2 border-b"><span>Name</span><span>Type</span><span>Data</span></div></div>
    </div>
);

const MinesweeperApp = () => (
    <div className="w-full h-full bg-[#c0c0c0] flex flex-col p-1 border-2 border-white border-r-gray-500 border-b-gray-500 items-center justify-center">
        <div className="text-xl font-bold mb-4">Minesweeper</div>
        <div className="grid grid-cols-9 gap-0.5 border-4 border-gray-400">{[...Array(81)].map((_,i)=><div key={i} className="w-6 h-6 bg-gray-300 border border-white hover:bg-gray-400"></div>)}</div>
    </div>
);

const BrowserApp = ({ onDownload }: { onDownload: (file: string) => void }) => {
    const [url, setUrl] = useState("https://www.google.com");
    const [input, setInput] = useState("https://www.google.com");
    const [history, setHistory] = useState<string[]>(["https://www.google.com"]);
    const [historyIndex, setHistoryIndex] = useState(0);
    const [downloading, setDownloading] = useState<{file: string, progress: number} | null>(null);

    const navigate = (newUrl: string) => {
        setHistory(prev => [...prev.slice(0, historyIndex + 1), newUrl]);
        setHistoryIndex(prev => prev + 1);
        setUrl(newUrl);
        setInput(newUrl);
    };

    const goBack = () => {
        if (historyIndex > 0) {
            setHistoryIndex(prev => prev - 1);
            setUrl(history[historyIndex - 1]);
            setInput(history[historyIndex - 1]);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        let target = input;
        if (!input.startsWith('http')) target = `https://www.google.com/search?q=${input}`;
        navigate(target);
    };

    const startDownload = (file: string) => {
        setDownloading({ file, progress: 0 });
        const interval = setInterval(() => {
            setDownloading(prev => {
                if (!prev) return null;
                if (prev.progress >= 100) {
                    clearInterval(interval);
                    onDownload(file);
                    setTimeout(() => setDownloading(null), 2000);
                    return { ...prev, progress: 100 };
                }
                return { ...prev, progress: prev.progress + (Math.random() * 5) };
            });
        }, 100);
    };

    const renderContent = () => {
        if (url.includes("google.com")) {
            return (
                <div className="flex flex-col items-center justify-center h-full p-8">
                    <div className="text-6xl font-bold text-gray-700 mb-8"><span className="text-blue-500">G</span><span className="text-red-500">o</span><span className="text-yellow-500">o</span><span className="text-blue-500">g</span><span className="text-green-500">l</span><span className="text-red-500">e</span></div>
                    <form onSubmit={(e) => { e.preventDefault(); navigate(`https://www.google.com/search?q=${input.replace('https://www.google.com', '')}`); }} className="w-full max-w-lg">
                        <input className="w-full border rounded-full px-6 py-3 shadow-sm hover:shadow-md transition-shadow outline-none" placeholder="Search Google or type a URL" />
                        <div className="flex justify-center gap-4 mt-6">
                            <button type="submit" className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded text-sm text-gray-700">Google Search</button>
                            <button type="button" className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded text-sm text-gray-700">I'm Feeling Lucky</button>
                        </div>
                    </form>
                    <div className="mt-12 flex gap-4">
                        <div onClick={() => navigate("https://www.office.com")} className="flex flex-col items-center gap-2 cursor-pointer hover:bg-gray-100 p-4 rounded">
                            <div className="w-12 h-12 bg-[#D83B01] rounded flex items-center justify-center text-white font-bold text-2xl">O</div>
                            <span className="text-sm">Office</span>
                        </div>
                        <div onClick={() => navigate("https://www.ibm.com/products/spss-statistics")} className="flex flex-col items-center gap-2 cursor-pointer hover:bg-gray-100 p-4 rounded">
                            <div className="w-12 h-12 bg-blue-700 rounded flex items-center justify-center text-white font-bold text-xs p-1 text-center">IBM SPSS</div>
                            <span className="text-sm">SPSS</span>
                        </div>
                    </div>
                </div>
            );
        } else if (url.includes("office.com")) {
            return (
                <div className="h-full bg-[#FFF5F5] overflow-y-auto">
                    <div className="bg-[#D83B01] text-white p-4 flex justify-between items-center">
                        <span className="font-bold text-xl">Microsoft 365</span>
                        <div className="flex gap-4 text-sm">
                            <span>Products</span><span>Resources</span><span>Templates</span>
                        </div>
                    </div>
                    <div className="flex flex-col items-center text-center p-12">
                        <h1 className="text-5xl font-bold mb-6 text-gray-800">Create, share, and collaborate</h1>
                        <p className="text-xl text-gray-600 mb-8 max-w-2xl">Bring out your best in school, work, and life with Microsoft 365.</p>
                        <button onClick={() => startDownload("OfficeSetup.exe")} className="bg-[#D83B01] text-white px-8 py-4 rounded font-bold text-lg hover:bg-[#a82e00] shadow-lg transition-transform active:scale-95">
                            Install Office
                        </button>
                        <div className="mt-12 grid grid-cols-3 gap-8 max-w-4xl">
                            <div className="bg-white p-6 rounded shadow"><FileText size={32} className="text-blue-700 mb-2"/><h3 className="font-bold">Word</h3></div>
                            <div className="bg-white p-6 rounded shadow"><Grid3X3 size={32} className="text-green-700 mb-2"/><h3 className="font-bold">Excel</h3></div>
                            <div className="bg-white p-6 rounded shadow"><Projector size={32} className="text-orange-600 mb-2"/><h3 className="font-bold">PowerPoint</h3></div>
                        </div>
                    </div>
                </div>
            );
        } else if (url.includes("ibm.com")) {
            return (
                <div className="h-full bg-white overflow-y-auto">
                    <div className="bg-black text-white p-4 flex gap-4 items-center">
                        <span className="font-bold tracking-widest text-lg">IBM</span>
                        <span className="text-gray-300">Products / SPSS Statistics</span>
                    </div>
                    <div className="bg-[#F4F4F4] p-12">
                        <h1 className="text-4xl font-light text-gray-900 mb-4">IBM SPSS Statistics</h1>
                        <p className="text-lg text-gray-700 mb-8 max-w-3xl">The world's leading statistical software used to solve business and research problems by means of ad-hoc analysis, hypothesis testing, and predictive analytics.</p>
                        <div className="flex gap-4">
                            <button onClick={() => startDownload("SPSS_Setup.exe")} className="bg-[#0F62FE] text-white px-6 py-3 text-sm font-bold hover:bg-[#0353E9]">Download Installer</button>
                            <button className="border border-black px-6 py-3 text-sm font-bold hover:bg-black hover:text-white">View pricing</button>
                        </div>
                    </div>
                    <div className="p-12 grid grid-cols-2 gap-12">
                        <div>
                            <h3 className="text-xl font-bold mb-2">Easy to use</h3>
                            <p className="text-gray-600">A point-and-click interface allowing anyone to leverage the power of data analysis.</p>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold mb-2">Comprehensive</h3>
                            <p className="text-gray-600">Cover the entire analytical process from planning to data collection to analysis, reporting and deployment.</p>
                        </div>
                    </div>
                </div>
            );
        } else {
            return (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                    <Search size={48} className="mb-4 opacity-50"/>
                    <h2 className="text-xl">No results found for your search.</h2>
                    <p>Try searching for "office" or "spss".</p>
                </div>
            );
        }
    };

    return (
        <div className="flex flex-col h-full bg-white font-sans text-gray-900">
            <div className="flex items-center gap-2 p-2 bg-[#F3F3F3] border-b border-gray-300">
                <div className="flex gap-1">
                    <button onClick={goBack} disabled={historyIndex === 0} className="p-1.5 rounded hover:bg-gray-200 disabled:opacity-30"><ArrowLeft size={16}/></button>
                    <button className="p-1.5 rounded hover:bg-gray-200 disabled:opacity-30" disabled><ArrowRight size={16}/></button>
                    <button onClick={() => setUrl(url)} className="p-1.5 rounded hover:bg-gray-200"><RefreshCw size={14}/></button>
                </div>
                <div className="flex-1 bg-white border border-gray-300 rounded-full px-4 py-1.5 flex items-center shadow-sm">
                    {url.includes('google') ? <Search size={14} className="text-gray-400 mr-2"/> : <Lock size={14} className="text-green-600 mr-2"/>}
                    <input className="flex-1 outline-none text-sm" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if(e.key === 'Enter') handleSearch(e); }}/>
                </div>
                <div className="flex gap-2 text-gray-500 px-2">
                    <Star size={18} className="cursor-pointer hover:text-yellow-500"/>
                    <User size={18}/>
                </div>
            </div>
            
            {/* Bookmarks Bar */}
            <div className="flex gap-4 px-4 py-1.5 border-b border-gray-200 text-xs text-gray-600 bg-[#FAFAFA]">
                <div className="flex items-center gap-1 cursor-pointer hover:bg-gray-200 px-2 rounded" onClick={() => navigate("https://www.office.com")}>
                    <img src="https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg" className="w-3 h-3" alt=""/> Office
                </div>
                <div className="flex items-center gap-1 cursor-pointer hover:bg-gray-200 px-2 rounded" onClick={() => navigate("https://www.ibm.com/products/spss-statistics")}>
                    <span className="font-bold text-[10px]">IBM</span> SPSS Statistics
                </div>
            </div>

            <div className="flex-1 relative overflow-hidden">
                {renderContent()}
                
                {/* Downloads Bar */}
                {downloading && (
                    <div className="absolute bottom-0 left-0 right-0 bg-white border-t p-2 shadow-lg flex items-center justify-between animate-in slide-in-from-bottom-2">
                        <div className="flex items-center gap-4">
                            <div className="bg-gray-100 p-2 rounded border border-gray-300">
                                <FileText size={20} className="text-blue-500"/>
                            </div>
                            <div>
                                <div className="text-sm font-semibold">{downloading.file}</div>
                                <div className="text-xs text-gray-500">
                                    {downloading.progress < 100 ? `${Math.round(downloading.progress)}% - 2.4 MB/s` : 'Open file'}
                                </div>
                            </div>
                        </div>
                        {downloading.progress < 100 ? (
                            <div className="w-32 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                <div className="h-full bg-green-500 transition-all duration-100" style={{width: `${downloading.progress}%`}}></div>
                            </div>
                        ) : (
                            <button className="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded border">Open file</button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

const TaskManagerApp = ({ openWindows, onCloseWindow, onBsod }: { openWindows: DesktopWindow[], onCloseWindow: (id: string) => void, onBsod: () => void }) => (
    <div className="flex flex-col h-full bg-white text-xs select-none">
        <div className="bg-gray-100 border-b p-2 font-bold">Processes</div>
        <div className="flex-1 overflow-auto">
            {openWindows.map(w=><div key={w.id} className="p-2 hover:bg-blue-100 flex justify-between">{w.title} <button onClick={()=>onCloseWindow(w.id)} className="text-red-500">End</button></div>)}
            <div className="p-2 hover:bg-blue-100 text-red-600 cursor-pointer" onClick={onBsod}>System (Critical)</div>
        </div>
    </div>
);

// --- NEW SOFTWARE SIMULATIONS ---

const OfficeInstallerApp = ({ onComplete }: { onComplete: () => void }) => {
    const [progress, setProgress] = useState(0);
    const [stage, setStage] = useState<'splash'|'installing'|'finished'>('splash');
    
    useEffect(() => {
        if (stage === 'splash') {
            const t = setTimeout(() => setStage('installing'), 2500);
            return () => clearTimeout(t);
        }
        if (stage === 'installing') {
            const t = setInterval(() => {
                setProgress(prev => {
                    if (prev >= 100) {
                        clearInterval(t);
                        setStage('finished');
                        return 100;
                    }
                    // Simulate variable speed
                    const inc = Math.random() > 0.7 ? 2 : 0.2;
                    return Math.min(prev + inc, 100);
                });
            }, 50);
            return () => clearInterval(t);
        }
    }, [stage]);

    if (stage === 'splash') {
        return (
            <div className="h-full w-full bg-[#E74C3C] flex flex-col items-center justify-center text-white select-none">
                <div className="mb-4">
                    <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                </div>
                <div className="text-lg font-light">We're getting things ready</div>
            </div>
        )
    }

    if (stage === 'finished') {
        return (
            <div className="h-full w-full bg-white flex flex-col select-none animate-in fade-in">
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                    <div className="text-4xl text-[#E74C3C] mb-4">You're all set!</div>
                    <div className="text-xl text-gray-600 mb-2">Office is installed now</div>
                    <div className="text-sm text-gray-500 mb-8">Click Close to start using your apps.</div>
                    
                    {/* App Icons Row */}
                    <div className="flex gap-4 mb-8">
                         <div className="w-10 h-10 bg-[#2B579A] text-white flex items-center justify-center font-bold text-lg rounded-sm shadow">W</div>
                         <div className="w-10 h-10 bg-[#217346] text-white flex items-center justify-center font-bold text-lg rounded-sm shadow">X</div>
                         <div className="w-10 h-10 bg-[#D24726] text-white flex items-center justify-center font-bold text-lg rounded-sm shadow">P</div>
                    </div>
                </div>
                <div className="bg-[#f0f0f0] p-4 flex justify-center">
                    <button onClick={onComplete} className="bg-[#E74C3C] hover:bg-[#C0392B] text-white px-8 py-2 rounded shadow transition-colors">Close</button>
                </div>
            </div>
        )
    }

    return (
        <div className="h-full w-full bg-white flex flex-col select-none relative">
            <div className="flex-1 p-8 flex flex-col items-center justify-center">
                 <div className="flex gap-4 mb-12 opacity-100 transition-opacity">
                     <div className="w-12 h-12 bg-[#2B579A] text-white flex items-center justify-center font-bold text-2xl rounded-sm shadow-md animate-bounce delay-0">W</div>
                     <div className="w-12 h-12 bg-[#217346] text-white flex items-center justify-center font-bold text-2xl rounded-sm shadow-md animate-bounce delay-100">X</div>
                     <div className="w-12 h-12 bg-[#D24726] text-white flex items-center justify-center font-bold text-2xl rounded-sm shadow-md animate-bounce delay-200">P</div>
                     <div className="w-12 h-12 bg-[#00A4EF] text-white flex items-center justify-center font-bold text-2xl rounded-sm shadow-md animate-bounce delay-300">O</div>
                 </div>
                 
                 <h2 className="text-2xl text-gray-700 font-light mb-2">Installing Office</h2>
                 <p className="text-gray-500 text-sm mb-8">Please stay online while Office downloads.</p>
                 
                 <div className="w-64 h-1 bg-gray-200 rounded-full overflow-hidden">
                     <div className="h-full bg-[#E74C3C] transition-all duration-100" style={{width: `${progress}%`}}></div>
                 </div>
                 <div className="mt-2 text-xs text-gray-400">{Math.round(progress)}%</div>
            </div>
            
            <div className="absolute top-0 right-0 p-4">
               <button className="text-gray-400 hover:text-gray-600"><Minus size={16}/></button>
            </div>
        </div>
    )
};

const SPSSInstallerApp = ({ onComplete }: { onComplete: () => void }) => {
    // Layout: Left Sidebar (Image), Right Content, Bottom Buttons
    const [step, setStep] = useState(0); // 0: Welcome, 1: License, 2: Readme, 3: User, 4: Dest, 5: Ready, 6: Progress, 7: Finish
    const [progress, setProgress] = useState(0);
    const [statusText, setStatusText] = useState("Preparing to install...");

    // ... effect for install ...
    useEffect(() => {
        if (step === 6) {
            const interval = setInterval(() => {
                setProgress(prev => {
                    if (prev >= 100) {
                        clearInterval(interval);
                        setStep(7);
                        return 100;
                    }
                    if (prev < 30) setStatusText("Copying new files...");
                    else if (prev < 60) setStatusText("Registering components...");
                    else if (prev < 80) setStatusText("Updating registry...");
                    else setStatusText("Finalizing installation...");
                    return prev + 1;
                });
            }, 60);
            return () => clearInterval(interval);
        }
    }, [step]);

    return (
        <div className="h-full flex flex-col bg-[#F0F0F0] font-sans text-xs select-none border border-gray-400 shadow-xl">
            {/* Header (Title Bar handled by OS Window, so this is inside content) */}
            
            <div className="flex-1 flex bg-white">
                {/* Left Sidebar Image */}
                <div className="w-44 bg-gradient-to-b from-[#003399] to-[#6699FF] p-4 flex flex-col text-white relative overflow-hidden">
                    <div className="text-xl font-bold italic z-10">IBM SPSS<br/>Statistics</div>
                    <div className="mt-auto text-[10px] z-10">InstallShield</div>
                    {/* Abstract circles */}
                    <div className="absolute -right-10 top-10 w-32 h-32 rounded-full border-4 border-white/20"></div>
                    <div className="absolute -left-10 bottom-20 w-40 h-40 rounded-full border-8 border-white/10"></div>
                </div>

                {/* Right Content */}
                <div className="flex-1 p-6 flex flex-col relative overflow-y-auto">
                    {step === 0 && (
                        <>
                            <h3 className="font-bold text-lg mb-4">Welcome to the InstallShield Wizard for IBM SPSS Statistics 27</h3>
                            <p className="mb-4">The InstallShield(R) Wizard will install IBM SPSS Statistics 27 on your computer. To continue, click Next.</p>
                            <p className="mb-4 text-gray-600">WARNING: This program is protected by copyright law and international treaties.</p>
                        </>
                    )}
                    {step === 1 && (
                        <>
                            <h3 className="font-bold mb-2">License Agreement</h3>
                            <p className="mb-2">Please read the following license agreement carefully.</p>
                            <div className="border border-gray-400 h-32 overflow-y-scroll p-2 mb-4 bg-white font-mono text-[10px] text-gray-600">
                                IBM INTERNATIONAL PROGRAM LICENSE AGREEMENT<br/><br/>
                                Part 1 - General Terms<br/><br/>
                                BY DOWNLOADING, INSTALLING, COPYING, ACCESSING, CLICKING ON AN "ACCEPT" BUTTON, OR OTHERWISE USING THE PROGRAM, LICENSEE AGREES TO THE TERMS OF THIS AGREEMENT.
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="flex items-center gap-2"><input type="radio" name="lic" defaultChecked /> I accept the terms in the license agreement</label>
                                <label className="flex items-center gap-2"><input type="radio" name="lic" /> I do not accept the terms in the license agreement</label>
                            </div>
                        </>
                    )}
                    {step === 4 && (
                        <>
                            <h3 className="font-bold mb-4">Destination Folder</h3>
                            <p className="mb-4">Click Next to install to this folder, or click Change to install to a different folder.</p>
                            <div className="flex items-center gap-2 mb-4">
                                <div className="border border-gray-300 p-2 w-full bg-gray-50 text-gray-600">C:\Program Files\IBM\SPSS\Statistics\27\</div>
                                <button className="px-3 py-1 border bg-gray-200 hover:bg-gray-300">Change...</button>
                            </div>
                        </>
                    )}
                    {step === 5 && (
                        <>
                            <h3 className="font-bold mb-4">Ready to Install the Program</h3>
                            <p className="mb-4">The wizard is ready to begin installation.</p>
                            <p className="mb-4">Click Install to begin the installation.</p>
                            <p>If you want to review or change any of your installation settings, click Back. Click Cancel to exit the wizard.</p>
                        </>
                    )}
                    {step === 6 && (
                        <>
                            <h3 className="font-bold mb-4">Installing IBM SPSS Statistics 27</h3>
                            <p className="mb-2">The program features you selected are being installed.</p>
                            <p className="mb-2 text-gray-600">{statusText}</p>
                            <div className="w-full h-4 border border-gray-400 p-[1px]">
                                <div className="h-full bg-[#003399]" style={{width: `${progress}%`}}></div>
                            </div>
                        </>
                    )}
                    {step === 7 && (
                        <>
                            <h3 className="font-bold text-lg mb-4">InstallShield Wizard Completed</h3>
                            <p className="mb-4">The InstallShield Wizard has successfully installed IBM SPSS Statistics 27. Click Finish to exit the wizard.</p>
                            <label className="flex items-center gap-2 mt-8">
                                <input type="checkbox" defaultChecked /> Start IBM SPSS Statistics 27 now
                            </label>
                        </>
                    )}
                    {/* Fallback for skipped steps in this simplified view */}
                    {(step === 2 || step === 3) && (
                        <div>
                            <h3 className="font-bold mb-4">User Information</h3>
                            <div className="space-y-2">
                                <label className="block">Name: <input className="border w-full p-1" defaultValue="User"/></label>
                                <label className="block">Organization: <input className="border w-full p-1"/></label>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Footer Buttons */}
            <div className="bg-[#F0F0F0] border-t border-gray-300 p-3 flex justify-end gap-2">
                {step < 7 && (
                    <>
                        <button disabled={step === 0 || step === 6} onClick={() => setStep(s => s - 1)} className="w-20 py-1 border border-gray-400 bg-gray-200 hover:bg-gray-300 disabled:text-gray-400">Back</button>
                        {step < 5 ? (
                            <button onClick={() => setStep(s => s + 1)} className="w-20 py-1 border border-gray-400 bg-gray-200 hover:bg-gray-300">Next &gt;</button>
                        ) : (
                            step === 5 ? (
                                <button onClick={() => setStep(6)} className="w-20 py-1 border border-gray-400 bg-gray-200 hover:bg-gray-300">Install</button>
                            ) : (
                                <button disabled className="w-20 py-1 border border-gray-400 bg-gray-200 text-gray-400">Install</button>
                            )
                        )}
                        <button disabled={step === 6} onClick={onComplete} className="w-20 py-1 border border-gray-400 bg-gray-200 hover:bg-gray-300 ml-2">Cancel</button>
                    </>
                )}
                {step === 7 && (
                    <button onClick={onComplete} className="w-20 py-1 border border-gray-400 bg-gray-200 hover:bg-gray-300 font-bold">Finish</button>
                )}
            </div>
        </div>
    )
};

const SPSSApp = () => {
    return (
        <div className="flex flex-col h-full bg-[#F0F0F0] text-gray-900 font-sans text-xs">
            <div className="bg-white border-b flex p-1 gap-4 text-gray-700"><span>File</span><span>Edit</span><span>View</span><span>Data</span><span>Transform</span><span>Analyze</span><span>Graphs</span><span>Utilities</span></div>
            <div className="bg-[#E0E0E0] border-b p-1 flex gap-2 shadow-inner">
                <div className="bg-white border rounded p-0.5"><Folder size={14}/></div>
                <div className="bg-white border rounded p-0.5"><Copy size={14}/></div>
                <div className="w-[1px] bg-gray-400 h-4 mx-1"></div>
                <div className="bg-white border rounded p-0.5"><BarChart3 size={14}/></div>
            </div>
            <div className="flex-1 overflow-auto bg-white relative">
                <div className="grid grid-cols-[40px_repeat(6,80px)]">
                    <div className="bg-gray-100 border-b border-r h-6"></div>
                    {['var', 'var', 'var', 'var', 'var', 'var'].map((v,i) => (
                        <div key={i} className="bg-gray-100 border-b border-r h-6 text-center text-gray-500">{v}</div>
                    ))}
                    {[...Array(20)].map((_, r) => (
                        <React.Fragment key={r}>
                            <div className="bg-gray-100 border-b border-r text-center text-gray-500">{r+1}</div>
                            {[...Array(6)].map((_, c) => (
                                <div key={c} className="border-b border-r h-5"></div>
                            ))}
                        </React.Fragment>
                    ))}
                </div>
            </div>
            <div className="bg-[#F0F0F0] border-t p-1 flex gap-4 text-gray-600">
                <span className="font-bold text-black">Data View</span>
                <span>Variable View</span>
            </div>
            <div className="bg-[#E0E0E0] border-t p-0.5 px-2 text-gray-600">IBM SPSS Statistics Processor is ready</div>
        </div>
    )
};

const ExplorerApp = ({ onBsod, onRun, downloadedFiles = [] }: { onBsod: () => void, onRun: (file: string) => void, downloadedFiles?: string[] }) => {
    const { showToast } = useSimulation();
    const [path, setPath] = useState<string[]>(["This PC"]);
    const [selectedItem, setSelectedItem] = useState<string | null>(null);

    const initialFS: any = {
        "This PC": [
            { name: "Local Disk (C:)", type: "drive", icon: <HardDrive className="text-gray-500" size={32}/>, info: "80 GB free of 100 GB" },
            { name: "Documents", type: "folder", icon: <Folder className="text-yellow-500" size={32}/> },
            { name: "Downloads", type: "folder", icon: <Folder className="text-blue-500" size={32}/> },
        ],
        "Local Disk (C:)": [
             { name: "Program Files", type: "folder", icon: <Folder className="text-yellow-500" size={32}/> },
             { name: "Windows", type: "folder", icon: <Folder className="text-yellow-500" size={32}/> },
             { name: "Users", type: "folder", icon: <Folder className="text-yellow-500" size={32}/> },
        ],
        "Windows": [
            { name: "System32", type: "folder", icon: <Folder className="text-yellow-500" size={32}/> },
            { name: "Fonts", type: "folder", icon: <Folder className="text-yellow-500" size={32}/> },
        ],
        "System32": [
             { name: "hal.dll", type: "file", icon: <Settings className="text-gray-400" size={32}/> },
             { name: "kernel32.dll", type: "file", icon: <Settings className="text-gray-400" size={32}/> },
             { name: "ntoskrnl.exe", type: "file", icon: <Settings className="text-gray-400" size={32}/> },
        ],
        "Documents": [
            { name: "Notes.txt", type: "file", icon: <FileText className="text-gray-500" size={32}/> },
        ],
        "Downloads": [],
        "Users": [{ name: "User", type: "folder", icon: <Folder className="text-yellow-500" size={32}/> }]
    };

    const [fileSystem, setFileSystem] = useState(initialFS);

    // Sync downloaded files
    useEffect(() => {
        if (downloadedFiles.length > 0) {
            const newDownloads = downloadedFiles.map(file => {
                if (file.includes("Office")) return { name: file, type: "application", icon: <Download className="text-blue-500" size={32}/>, action: 'office-setup' };
                if (file.includes("SPSS")) return { name: file, type: "application", icon: <Binary className="text-blue-700" size={32}/>, action: 'spss-setup' };
                return { name: file, type: "file", icon: <FileText className="text-gray-500" size={32}/> };
            });
            setFileSystem((prev: any) => ({ ...prev, "Downloads": newDownloads }));
        }
    }, [downloadedFiles]);

    const currentFolder = path[path.length - 1];
    const items = fileSystem[currentFolder] || [];

    const handleNavigate = (item: any) => {
        if (item.type === 'file' || item.type === 'application') {
            if (item.action) onRun(item.action);
            else showToast("This file cannot be opened in the simulator.", 'simulation');
            return; 
        }
        setPath([...path, item.name]);
        setSelectedItem(null);
    };

    const handleDelete = () => {
        if (!selectedItem) return;
        if (currentFolder === "System32" && (selectedItem === "hal.dll" || selectedItem === "kernel32.dll" || selectedItem === "ntoskrnl.exe")) {
            onBsod();
            return;
        }
        const newItems = items.filter((i: any) => i.name !== selectedItem);
        setFileSystem({ ...fileSystem, [currentFolder]: newItems });
        setSelectedItem(null);
        playSound('click'); 
    }

    return (
        <div className="flex flex-col h-full bg-white text-gray-900 font-sans text-sm">
            <div className="flex items-center gap-2 p-2 border-b border-gray-200 bg-gray-50">
                <button onClick={() => { path.length > 1 && setPath(path.slice(0, -1)); setSelectedItem(null); }} disabled={path.length <= 1} className="p-1 hover:bg-gray-200 rounded disabled:opacity-30"><ArrowLeft size={16}/></button>
                <div className="flex-1 border border-gray-300 bg-white px-2 py-1 flex items-center gap-1 text-gray-600">
                    <Monitor size={14}/> <span>{path.join(' > ')}</span>
                </div>
                {selectedItem && <button onClick={handleDelete} className="p-1 hover:bg-red-100 text-red-500 rounded" title="Delete"><Trash2 size={16}/></button>}
            </div>
            <div className="flex-1 p-4 grid grid-cols-4 content-start gap-4 overflow-y-auto" onClick={() => setSelectedItem(null)}>
                {items.length === 0 && <div className="col-span-4 text-gray-400 text-center mt-10">This folder is empty.</div>}
                {items.map((item: any, i: number) => (
                    <div 
                        key={i} 
                        onDoubleClick={() => handleNavigate(item)} 
                        onClick={(e) => { e.stopPropagation(); setSelectedItem(item.name); }}
                        className={`flex flex-col items-center gap-1 p-2 border rounded cursor-pointer group ${selectedItem === item.name ? 'bg-blue-100 border-blue-200' : 'border-transparent hover:bg-blue-50 hover:border-blue-100'}`}
                    >
                        {item.icon}
                        <span className="text-center text-xs group-hover:text-blue-600 truncate w-full text-gray-800">{item.name}</span>
                        {item.info && <span className="text-[10px] text-gray-400">{item.info}</span>}
                    </div>
                ))}
            </div>
        </div>
    )
}

const RunDialog = ({ onClose, onRun }: { onClose: () => void, onRun: (cmd: string) => void }) => {
    const [cmd, setCmd] = useState("");
    
    return (
        <div className="fixed bottom-10 left-4 w-96 bg-[#F0F0F0] border border-[#1883D7] shadow-xl z-[10002] p-4 text-sm font-sans rounded-sm animate-in slide-in-from-bottom-5 zoom-in-95 text-gray-900">
            <div className="flex justify-between items-start mb-4">
                <div className="flex gap-4">
                    <Play className="text-gray-600 mt-1" size={24}/>
                    <div>
                        <h3 className="font-semibold text-gray-800">Run</h3>
                        <p className="text-gray-600 text-xs mt-1">Type the name of a program, folder, document, or Internet resource, and Windows will open it for you.</p>
                    </div>
                </div>
                <button onClick={onClose}><X size={16} className="text-gray-400 hover:text-red-500"/></button>
            </div>
            <div className="flex items-center gap-2 mb-4">
                <label className="text-gray-700">Open:</label>
                <input 
                    autoFocus 
                    className="flex-1 border border-gray-300 p-1 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm bg-white"
                    value={cmd}
                    onChange={e => setCmd(e.target.value)}
                    onKeyDown={e => { if(e.key === 'Enter') onRun(cmd); }}
                />
            </div>
            <div className="flex justify-end gap-2">
                <button onClick={() => onRun(cmd)} className="px-5 py-1 bg-[#E1E1E1] border border-[#ADADAD] hover:bg-[#E5F1FB] hover:border-[#0078D7] active:bg-[#CCE4F7] text-black text-sm transition-colors min-w-[70px]">OK</button>
                <button onClick={onClose} className="px-5 py-1 bg-[#E1E1E1] border border-[#ADADAD] hover:bg-[#E5F1FB] hover:border-[#0078D7] active:bg-[#CCE4F7] text-black text-sm transition-colors min-w-[70px]">Cancel</button>
            </div>
        </div>
    )
}

const SettingsApp = ({ bgImage, setBgImage, theme, setTheme }: { bgImage: string, setBgImage: (url: string) => void, theme: 'light'|'dark', setTheme: (t: 'light'|'dark') => void }) => {
    const { showToast } = useSimulation();
    const [tab, setTab] = useState('system');
    
    const wallpapers = [
        'https://picsum.photos/1920/1080?random=1',
        'https://picsum.photos/1920/1080?random=2',
        'https://picsum.photos/1920/1080?random=3',
        'https://picsum.photos/1920/1080?random=4',
    ];
    const isDark = theme === 'dark';
    
    return (
        <div className={`flex h-full text-sm ${isDark ? 'bg-[#202020] text-white' : 'bg-[#F0F0F0] text-gray-900'}`}>
            <div className={`w-48 border-r p-4 flex flex-col gap-1 ${isDark ? 'border-[#333] bg-[#2b2b2b]' : 'border-gray-200 bg-white'}`}>
                <div className="mb-4 font-bold text-lg px-2">Settings</div>
                <button onClick={() => setTab('system')} className="text-left px-3 py-2 rounded hover:bg-gray-200/20">System</button>
                <button onClick={() => setTab('personalization')} className="text-left px-3 py-2 rounded hover:bg-gray-200/20">Personalization</button>
                <button onClick={() => showToast("Network settings are limited in this demo.", 'simulation')} className="text-left px-3 py-2 rounded hover:bg-gray-200/20 opacity-50">Network</button>
            </div>
            <div className="flex-1 p-8">
                {tab === 'personalization' && (
                    <div>
                        <h2 className="text-2xl font-light mb-6">Personalization</h2>
                        <div className="flex gap-2 mb-4">
                            <button onClick={() => setTheme('light')} className="px-4 py-2 border rounded bg-white text-black">Light</button>
                            <button onClick={() => setTheme('dark')} className="px-4 py-2 border rounded bg-black text-white">Dark</button>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            {wallpapers.map((wp, i) => (
                                <img key={i} src={wp} className="w-full rounded cursor-pointer border-2 border-transparent hover:border-blue-500" onClick={() => setBgImage(wp)} alt="wp"/>
                            ))}
                        </div>
                    </div>
                )}
                {tab === 'system' && (
                    <div>
                        <h2 className="text-2xl font-light mb-6">System</h2>
                        <p>WinSim Virtual Machine</p>
                        <p className="text-gray-500">Edition: Windows 11 Pro (Simulated)</p>
                    </div>
                )}
            </div>
        </div>
    )
}

const QuickSettings = ({ isDark, setIsDark, bgImage }: { isDark: boolean, setIsDark: (v: boolean) => void, bgImage: string }) => {
    const { showToast } = useSimulation();
    
    return (
        <div className={`absolute bottom-12 right-2 backdrop-blur-xl border w-80 p-4 rounded-lg shadow-2xl animate-in slide-in-from-bottom-10 duration-200 z-[10000] ${isDark ? 'bg-[#2d2d2d]/90 border-[#444] text-white' : 'bg-[#f3f3f3]/90 border-gray-300 text-gray-900'}`} onClick={e => e.stopPropagation()}>
            <div className="grid grid-cols-3 gap-3 mb-6">
                 <button onClick={() => showToast("WiFi is simulated.", 'simulation')} className={`h-20 rounded flex flex-col items-start justify-end p-3 transition-colors ${isDark ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'}`}>
                     <Wifi size={20} className="mb-auto"/>
                     <span className="text-xs font-semibold">Wi-Fi</span>
                 </button>
                 <button onClick={() => showToast("Bluetooth is simulated.", 'simulation')} className={`h-20 rounded flex flex-col items-start justify-end p-3 transition-colors ${isDark ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'}`}>
                     <Bluetooth size={20} className="mb-auto"/>
                     <span className="text-xs font-semibold">Bluetooth</span>
                 </button>
                 <button onClick={() => setIsDark(!isDark)} className={`h-20 rounded flex flex-col items-start justify-end p-3 transition-colors ${isDark ? 'bg-blue-600 text-white' : 'bg-white hover:bg-gray-100'}`}>
                     <Moon size={20} className="mb-auto"/>
                     <span className="text-xs font-semibold">Dark Mode</span>
                 </button>
            </div>
            <div className="space-y-4 mb-4">
                 <div className="flex gap-4 items-center">
                     <Sun size={18} className="text-gray-500"/>
                     <input type="range" className="flex-1 accent-blue-500 h-1 bg-gray-300 rounded-lg appearance-none cursor-pointer" onChange={() => showToast("Brightness is simulated.")}/>
                 </div>
                 <div className="flex gap-4 items-center">
                     <Volume2 size={18} className="text-gray-500"/>
                     <input type="range" className="flex-1 accent-blue-500 h-1 bg-gray-300 rounded-lg appearance-none cursor-pointer" onChange={() => showToast("Volume is simulated.")}/>
                 </div>
            </div>
        </div>
    )
};

const TerminalApp = ({ onBsod }: { onBsod: () => void }) => {
    const [lines, setLines] = useState<string[]>(["Microsoft Windows [Version 10.0.22621.1]", "(c) Microsoft Corporation. All rights reserved.", "", "C:\\Users\\User>"]);
    const [input, setInput] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);
    const endRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        endRef.current?.scrollIntoView();
    }, [lines]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            const cmd = input.trim();
            const cmdLower = cmd.toLowerCase();
            const currentPrompt = lines[lines.length - 1];
            
            const history = [...lines.slice(0, -1), `${currentPrompt}${input}`];
            const newLines = [...history];

            if (cmdLower === 'cls') {
                setLines(["C:\\Users\\User>"]);
                setInput("");
                return;
            }
            
            if (cmdLower === 'help') {
                newLines.push("Supported commands: cls, exit, bsod, echo, date, time, ver, help, ping, ipconfig");
            } else if (cmdLower === 'ver') {
                newLines.push("Microsoft Windows [Version 10.0.22621.1]");
            } else if (cmdLower === 'bsod') {
                onBsod();
                return;
            } else if (cmdLower.startsWith('echo ')) {
                newLines.push(input.substring(5));
            } else if (cmdLower === 'date') {
                newLines.push("The current date is: " + new Date().toLocaleDateString());
            } else if (cmdLower === 'time') {
                newLines.push("The current time is: " + new Date().toLocaleTimeString());
            } else if (cmdLower === 'exit') {
            } else if (cmdLower === 'ipconfig') {
                newLines.push("");
                newLines.push("Windows IP Configuration");
                newLines.push("");
                newLines.push("Ethernet adapter Ethernet:");
                newLines.push("   Connection-specific DNS Suffix  . : winsim.local");
                newLines.push("   IPv4 Address. . . . . . . . . . . : 192.168.1.105");
                newLines.push("   Subnet Mask . . . . . . . . . . . : 255.255.255.0");
                newLines.push("   Default Gateway . . . . . . . . . : 192.168.1.1");
                newLines.push("   DNS Servers . . . . . . . . . . . : 8.8.8.8");
            } else if (cmdLower.startsWith('ping ')) {
                const host = input.split(' ')[1];
                if (!host) {
                    newLines.push("Usage: ping <hostname>");
                } else {
                    newLines.push(`Pinging ${host} with 32 bytes of data:`);
                    newLines.push(`Reply from 142.250.190.46: bytes=32 time=14ms TTL=115`);
                    newLines.push(`Reply from 142.250.190.46: bytes=32 time=16ms TTL=115`);
                    newLines.push(`Reply from 142.250.190.46: bytes=32 time=15ms TTL=115`);
                    newLines.push(`Reply from 142.250.190.46: bytes=32 time=14ms TTL=115`);
                    newLines.push("");
                    newLines.push(`Ping statistics for ${host}:`);
                    newLines.push("    Packets: Sent = 4, Received = 4, Lost = 0 (0% loss),");
                }
            } else if (cmd !== '') {
                 newLines.push(`'${cmd.split(' ')[0]}' is not recognized as an internal or external command,`);
                 newLines.push("operable program or batch file.");
            }

            newLines.push("C:\\Users\\User>");
            setLines(newLines);
            setInput("");
        }
    };

    return (
        <div className="h-full bg-black text-gray-300 font-mono text-xs p-2 overflow-y-auto cursor-text" onClick={() => inputRef.current?.focus()}>
            {lines.slice(0, -1).map((l, i) => (
                <div key={i} className="whitespace-pre-wrap min-h-[1.2em]">{l}</div>
            ))}
            <div className="flex">
                <span className="whitespace-pre-wrap shrink-0">{lines[lines.length - 1]}</span>
                <input 
                    ref={inputRef}
                    className="flex-1 bg-transparent border-none outline-none text-gray-300 ml-0.5 min-w-[10px]"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    autoFocus
                    spellCheck={false}
                    autoComplete="off"
                />
            </div>
            <div ref={endRef} />
        </div>
    );
};

// --- MAIN COMPONENT ---

export const Desktop: React.FC<DesktopProps> = ({ username = "User", onRestart }) => {
    const { showToast } = useSimulation();
    const [welcomeMsg, setWelcomeMsg] = useState("");
    const [startMenuOpen, setStartMenuOpen] = useState(false);
    const [calendarOpen, setCalendarOpen] = useState(false);
    const [quickSettingsOpen, setQuickSettingsOpen] = useState(false);
    const [time, setTime] = useState(new Date());
    const [windows, setWindows] = useState<DesktopWindow[]>([]);
    const [bgImage, setBgImage] = useState('https://picsum.photos/1920/1080');
    const [contextMenu, setContextMenu] = useState<{x: number, y: number} | null>(null);
    const [theme, setTheme] = useState<'light'|'dark'>('light');
    const [bsod, setBsod] = useState(false);
    const [runOpen, setRunOpen] = useState(false);
    
    // File System State
    const [downloadedFiles, setDownloadedFiles] = useState<string[]>([]);
    
    // Installed Software State
    const [officeInstalled, setOfficeInstalled] = useState(false);
    const [spssInstalled, setSpssInstalled] = useState(false);
    
    // Dragging State
    const [dragState, setDragState] = useState<{id: string, startX: number, startY: number, initX: number, initY: number} | null>(null);

    // openWindow needs to be stable or reference safe for effects/callbacks
    const openWindow = (id: string, title: string, icon: React.ReactNode, content: React.ReactNode, width = 800, height = 500) => {
        playSound('window-open');
        setWindows(prev => {
            if (prev.find(w => w.id === id)) {
                return prev.map(w => w.id === id ? { ...w, zIndex: Math.max(0, ...prev.map(ww => ww.zIndex)) + 1, minimized: false } : w);
            }
            const newZ = prev.length > 0 ? Math.max(0, ...prev.map(w => w.zIndex)) + 1 : 1;
            return [...prev, { 
                id, title, icon, content, width, height,
                x: 100 + (prev.length * 30), 
                y: 50 + (prev.length * 30), 
                zIndex: newZ, 
                minimized: false,
                maximized: false,
                type: 'app',
                restoreRect: undefined
            }];
        });
    };

    const closeWindow = (id: string) => {
        setWindows(prev => prev.filter(w => w.id !== id));
    };

    // App Launchers - Defined early to be used in effects if needed
    const launchTaskMgr = () => openWindow('taskmgr', 'Task Manager', <Activity size={18} className="text-green-600"/>, <TaskManagerApp openWindows={[]} onCloseWindow={closeWindow} onBsod={() => setBsod(true)}/>, 600, 450);

    // Initial apps launch
    useEffect(() => {
        // Startup sound
        setTimeout(() => playSound('startup'), 500);

        const timer = setInterval(() => setTime(new Date()), 1000);
        
        generateWelcomeMessage(username).then(msg => {
            setWelcomeMsg(msg);
            // Auto dismiss welcome message
            setTimeout(() => setWelcomeMsg(""), 5000);
        });
        
        const handleClickOutside = () => {
            setContextMenu(null);
            setStartMenuOpen(false);
            setCalendarOpen(false);
            setQuickSettingsOpen(false);
        };

        const handleGlobalKey = (e: KeyboardEvent) => {
            // Win + R
            if ((e.metaKey || e.ctrlKey) && e.key === 'r') {
                e.preventDefault();
                setRunOpen(prev => !prev);
            }
            // Ctrl + Shift + Esc
            if (e.ctrlKey && e.shiftKey && e.key === 'Escape') {
                e.preventDefault();
                launchTaskMgr();
            }
        };

        window.addEventListener('click', handleClickOutside);
        window.addEventListener('keydown', handleGlobalKey);
        return () => {
            clearInterval(timer);
            window.removeEventListener('click', handleClickOutside);
            window.removeEventListener('keydown', handleGlobalKey);
        };
    }, [username]);

    // BSOD Effect with Key interaction
    useEffect(() => {
        if (bsod) {
            playSound('error');
            const handleRestartKey = () => onRestart();
            window.addEventListener('keydown', handleRestartKey);
            window.addEventListener('click', handleRestartKey);
            return () => {
                window.removeEventListener('keydown', handleRestartKey);
                window.removeEventListener('click', handleRestartKey);
            };
        }
    }, [bsod, onRestart]);

    // Global Drag Handlers
    const handleMouseMove = (e: React.MouseEvent) => {
        if (!dragState) return;
        const deltaX = e.clientX - dragState.startX;
        const deltaY = e.clientY - dragState.startY;
        
        setWindows(prev => prev.map(w => 
            w.id === dragState.id ? { ...w, x: dragState.initX + deltaX, y: dragState.initY + deltaY } : w
        ));
    };

    const handleMouseUp = () => {
        setDragState(null);
    };

    const toggleMaximize = (id: string) => {
        setWindows(prev => prev.map(w => {
            if (w.id !== id) return w;
            const newMax = !w.maximized;
            
            if (newMax) {
                // Maximizing: Save current state
                return { 
                    ...w, 
                    maximized: true, 
                    restoreRect: { x: w.x, y: w.y, width: w.width, height: w.height },
                    // Set to full screen minus taskbar
                    x: 0, y: 0, 
                    // We handle width/height in render via style override usually, but for drag logic we can set them conceptually or rely on render
                };
            } else {
                // Restoring
                return {
                    ...w,
                    maximized: false,
                    x: w.restoreRect?.x || w.x,
                    y: w.restoreRect?.y || w.y,
                    width: w.restoreRect?.width || w.width,
                    height: w.restoreRect?.height || w.height
                };
            }
        }));
    };

    const startDrag = (e: React.MouseEvent, id: string, x: number, y: number) => {
        e.preventDefault();
        const win = windows.find(w => w.id === id);
        if (win?.maximized) return; // Prevent dragging if maximized
        
        setWindows(prev => prev.map(w => w.id === id ? { ...w, zIndex: Math.max(...prev.map(ww => ww.zIndex)) + 1 } : w));
        setDragState({ id, startX: e.clientX, startY: e.clientY, initX: x, initY: y });
    };

    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault();
        setContextMenu({ x: e.clientX, y: e.clientY });
    };

    const handleOfficeInstall = () => {
        setOfficeInstalled(true);
        closeWindow('office-setup');
        playSound('notification');
        showToast("Microsoft Office installed successfully!", 'success');
    };

    const handleSpssInstall = () => {
        setSpssInstalled(true);
        closeWindow('spss-setup');
        playSound('notification');
        showToast("IBM SPSS Statistics installed successfully!", 'success');
    };

    const handleDownload = (file: string) => {
        setDownloadedFiles(prev => [...prev, file]);
        playSound('notification');
        showToast(`${file} download complete.`, 'success');
    };

    // App Launchers
    const launchSettings = () => openWindow('settings', 'Settings', <Settings size={18} className="text-gray-500"/>, <SettingsApp bgImage={bgImage} setBgImage={setBgImage} theme={theme} setTheme={setTheme}/>);
    const launchCalc = () => openWindow('calc', 'Calculator', <Calculator size={18} className="text-orange-500"/>, <CalculatorApp />, 320, 480);
    const launchNotepad = () => openWindow('notepad', 'Notepad', <FileText size={18} className="text-blue-500"/>, <NotepadApp theme={theme} />, 600, 400);
    const launchTerminal = () => openWindow('cmd', 'Command Prompt', <Terminal size={18} className="text-gray-500"/>, <TerminalApp onBsod={() => setBsod(true)}/>, 600, 350);
    const launchExplorer = () => openWindow('pc', 'File Explorer', <Folder size={18} className="text-yellow-500"/>, <ExplorerApp onBsod={() => setBsod(true)} onRun={handleRunCmd} downloadedFiles={downloadedFiles}/>, 800, 500);
    const launchPaint = () => openWindow('paint', 'Paint', <Palette size={18} className="text-purple-500"/>, <PaintApp/>, 800, 600);
    const launchRegEdit = () => openWindow('regedit', 'Registry Editor', <Database size={18} className="text-blue-400"/>, <RegEditApp />, 800, 500);
    const launchMinesweeper = () => openWindow('minesweeper', 'Minesweeper', <Bomb size={18} className="text-black"/>, <MinesweeperApp />, 300, 360);
    const launchSecurity = () => openWindow('security', 'Windows Security', <Shield size={18} className="text-blue-600"/>, <SecurityApp />, 800, 500);
    const launchMail = () => openWindow('mail', 'Mail', <Mail size={18} className="text-blue-500"/>, <MailApp />, 800, 500);
    
    // New Office Apps
    const launchWord = () => openWindow('word', 'Word', <FileText size={18} className="text-blue-700"/>, <WordApp />, 900, 600);
    const launchExcel = () => openWindow('excel', 'Excel', <Grid3X3 size={18} className="text-green-700"/>, <ExcelApp />, 900, 600);
    const launchPowerPoint = () => openWindow('ppt', 'PowerPoint', <Projector size={18} className="text-orange-600"/>, <PowerPointApp />, 900, 600);
    const launchOfficeSetup = () => openWindow('office-setup', 'Office Installer', <Download size={18} className="text-orange-600"/>, <OfficeInstallerApp onComplete={handleOfficeInstall} />, 500, 350);

    // SPSS Apps
    const launchSpssSetup = () => openWindow('spss-setup', 'SPSS Installer', <Binary size={18} className="text-blue-600"/>, <SPSSInstallerApp onComplete={handleSpssInstall} />, 600, 450);
    const launchSpss = () => openWindow('spss', 'IBM SPSS Statistics', <BarChart3 size={18} className="text-blue-800"/>, <SPSSApp />, 900, 600);

    // Disk Management
    const launchDiskManagement = () => openWindow('diskmgmt', 'Disk Management', <HardDrive size={18} className="text-gray-600"/>, <DiskManagementApp />, 800, 600);

    const launchEdge = () => openWindow('edge', 'Microsoft Edge', <div className="font-bold text-blue-500">e</div>, <BrowserApp onDownload={handleDownload}/>, 1000, 600);
    
    const launchVSCode = () => openWindow('vscode', 'Visual Studio Code', <Code size={18} className="text-blue-400"/>, (
        <div className="h-full w-full bg-[#1E1E1E] flex text-gray-300 font-mono text-sm">
            <div className="w-12 bg-[#333] flex flex-col items-center py-4 gap-4">
                <FileText size={20} className="text-white"/>
                <Search size={20}/>
                <Code size={20}/>
            </div>
            <div className="w-48 bg-[#252526] p-2">
                <div className="text-xs font-bold mb-2">EXPLORER</div>
                <div className="pl-2">src</div>
                <div className="pl-4 text-blue-300">App.tsx</div>
                <div className="pl-4 text-yellow-300">index.html</div>
            </div>
            <div className="flex-1 p-4">
                <div className="text-green-500">// Welcome to VS Code</div>
                <div className="text-pink-400">console</div>.<span className="text-yellow-300">log</span>(<span className="text-orange-300">"Hello World"</span>);
            </div>
        </div>
    ));

    const handleRunCmd = (cmd: string) => {
        const c = cmd.toLowerCase().trim();
        setRunOpen(false);
        if (c === 'cmd') launchTerminal();
        else if (c === 'calc') launchCalc();
        else if (c === 'notepad') launchNotepad();
        else if (c === 'mspaint' || c === 'paint') launchPaint();
        else if (c === 'taskmgr') launchTaskMgr();
        else if (c === 'explorer') launchExplorer();
        else if (c === 'regedit') launchRegEdit();
        else if (c === 'minesweeper' || c === 'winmine') launchMinesweeper();
        else if (c === 'security') launchSecurity();
        else if (c === 'mail') launchMail();
        else if (c === 'diskmgmt.msc' || c === 'disk management') launchDiskManagement();
        else if (c === 'word' || c === 'winword') { if (officeInstalled) launchWord(); else showToast("Word is not installed. Download and run OfficeSetup from Edge.", 'simulation'); }
        else if (c === 'excel') { if (officeInstalled) launchExcel(); else showToast("Excel is not installed.", 'simulation'); }
        else if (c === 'powerpoint' || c === 'powerpnt') { if (officeInstalled) launchPowerPoint(); else showToast("PowerPoint is not installed.", 'simulation'); }
        else if (c === 'spss' || c === 'stats') { if (spssInstalled) launchSpss(); else showToast("SPSS is not installed. Download and run SPSS_Setup from Edge.", 'simulation'); }
        else if (c === 'office-setup') launchOfficeSetup();
        else if (c === 'spss-setup') launchSpssSetup();
        else if (c === 'winver') {
            openWindow('winver', 'About Windows', <Info size={18} className="text-blue-500"/>, (
                <div className="p-8 bg-white h-full flex flex-col gap-4 text-gray-900">
                    <div className="text-3xl text-blue-500 font-light">Windows 11</div>
                    <div className="text-sm">Microsoft Windows<br/>Version 22H2 (OS Build 22621.1)<br/>&copy; Microsoft Corporation. All rights reserved.</div>
                    <div className="text-sm">The Windows 11 Home operating system and its user interface are protected by trademark and other pending or existing intellectual property rights in the United States and other countries/regions.</div>
                    <div className="mt-auto flex justify-end"><button onClick={() => closeWindow('winver')} className="px-6 py-1 border border-blue-500 bg-white hover:bg-blue-50 text-blue-600 rounded">OK</button></div>
                </div>
            ), 400, 350);
        } else if (c !== '') {
            playSound('error');
            alert(`Windows cannot find '${cmd}'. Make sure you typed the name correctly, and then try again.`);
        }
    };

    if (bsod) {
        return (
            <div className="w-full h-full bg-[#0078D7] text-white p-20 flex flex-col justify-center animate-in zoom-in-95 duration-100 cursor-none select-none">
                <div className="text-9xl mb-8">:(</div>
                <div className="text-4xl mb-8">Your PC ran into a problem and needs to restart. We're just collecting some error info, and then we'll restart for you.</div>
                <div className="text-xl mb-8">20% complete</div>
                <div className="flex gap-4 items-center">
                    <div className="w-24 h-24 bg-white p-1"><div className="w-full h-full bg-black"></div></div>
                    <div className="text-sm">
                        For more information about this issue and possible fixes, visit https://www.windows.com/stopcode
                        <br/><br/>
                        If you call a support person, give them this info:
                        <br/>
                        Stop code: CRITICAL_PROCESS_DIED
                        <br/><br/>
                        <span className="animate-pulse font-bold">Press any key to restart...</span>
                    </div>
                </div>
            </div>
        )
    }

    const isDark = theme === 'dark';
    const taskbarClass = isDark ? 'bg-[#202020]/90 border-[#333]' : 'bg-[#F3F3F3]/90 border-gray-300/50';
    const startMenuClass = isDark ? 'bg-[#2d2d2d]/95 text-white border-[#444]' : 'bg-[#F2F2F2]/95 text-gray-900 border-gray-300';
    const flyoutClass = isDark ? 'bg-[#2d2d2d]/95 text-white border-[#444]' : 'bg-[#F2F2F2]/95 text-gray-900 border-gray-300';
    const itemHoverClass = isDark ? 'hover:bg-white/10' : 'hover:bg-white/50';

    return (
        <div 
            className="w-full h-full bg-cover relative overflow-hidden transition-all duration-500 select-none"
            style={{ backgroundImage: `url(${bgImage})` }}
            onContextMenu={handleContextMenu}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
        >
            {/* Run Dialog */}
            {runOpen && <RunDialog onClose={() => setRunOpen(false)} onRun={handleRunCmd} />}

            {/* Desktop Icons */}
            <div className="p-2 grid grid-flow-col grid-rows-[repeat(auto-fill,100px)] gap-2 w-fit h-[calc(100%-48px)] content-start">
                <div onClick={launchExplorer} className="flex flex-col items-center group cursor-pointer p-2 hover:bg-white/10 rounded border border-transparent hover:border-white/10 w-24">
                    <Monitor size={32} className="text-blue-200 drop-shadow-md"/>
                    <span className="text-white text-xs mt-1 text-center drop-shadow-md text-shadow line-clamp-2">This PC</span>
                </div>
                
                <div onClick={launchEdge} className="flex flex-col items-center group cursor-pointer p-2 hover:bg-white/10 rounded border border-transparent hover:border-white/10 w-24">
                    <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center text-white font-bold drop-shadow-md text-lg">e</div>
                    <span className="text-white text-xs mt-1 text-center drop-shadow-md text-shadow">Microsoft Edge</span>
                </div>

                <div onClick={() => openWindow('recycle', 'Recycle Bin', <Trash2 size={18} className="text-gray-400"/>, (
                     <div className="p-4 text-center text-gray-400 mt-10">This folder is empty.</div>
                ))} className="flex flex-col items-center group cursor-pointer p-2 hover:bg-white/10 rounded border border-transparent hover:border-white/10 w-24">
                    <Trash2 size={32} className="text-gray-200 drop-shadow-md"/>
                    <span className="text-white text-xs mt-1 text-center drop-shadow-md text-shadow">Recycle Bin</span>
                </div>

                {officeInstalled && (
                    <>
                        <div onClick={launchWord} className="flex flex-col items-center group cursor-pointer p-2 hover:bg-white/10 rounded border border-transparent hover:border-white/10 w-24 animate-in fade-in">
                            <div className="w-8 h-8 bg-[#2B579A] text-white rounded flex items-center justify-center font-bold text-xl drop-shadow-md">W</div>
                            <span className="text-white text-xs mt-1 text-center drop-shadow-md text-shadow">Word</span>
                        </div>
                        <div onClick={launchExcel} className="flex flex-col items-center group cursor-pointer p-2 hover:bg-white/10 rounded border border-transparent hover:border-white/10 w-24 animate-in fade-in">
                            <div className="w-8 h-8 bg-[#217346] text-white rounded flex items-center justify-center font-bold text-xl drop-shadow-md">X</div>
                            <span className="text-white text-xs mt-1 text-center drop-shadow-md text-shadow">Excel</span>
                        </div>
                        <div onClick={launchPowerPoint} className="flex flex-col items-center group cursor-pointer p-2 hover:bg-white/10 rounded border border-transparent hover:border-white/10 w-24 animate-in fade-in">
                            <div className="w-8 h-8 bg-[#D24726] text-white rounded flex items-center justify-center font-bold text-xl drop-shadow-md">P</div>
                            <span className="text-white text-xs mt-1 text-center drop-shadow-md text-shadow">PowerPoint</span>
                        </div>
                    </>
                )}

                {spssInstalled && (
                    <div onClick={launchSpss} className="flex flex-col items-center group cursor-pointer p-2 hover:bg-white/10 rounded border border-transparent hover:border-white/10 w-24 animate-in fade-in">
                        <div className="w-8 h-8 bg-white rounded flex items-center justify-center font-bold text-xl drop-shadow-md border border-gray-300"><BarChart3 className="text-blue-800"/></div>
                        <span className="text-white text-xs mt-1 text-center drop-shadow-md text-shadow">IBM SPSS</span>
                    </div>
                )}

                {/* Disk Management App Icon */}
                <div onClick={launchDiskManagement} className="flex flex-col items-center group cursor-pointer p-2 hover:bg-white/10 rounded border border-transparent hover:border-white/10 w-24">
                    <div className="w-10 h-10 bg-white border border-gray-300 rounded flex items-center justify-center text-gray-700"><HardDrive/></div>
                    <div className="text-white text-xs mt-1 text-center drop-shadow-md text-shadow">Disk Mgmt</div>
                </div>
            </div>

            {/* Notification/Welcome Toast */}
            {welcomeMsg && (
                <div className="absolute top-4 right-4 bg-[#1F1F1F] border border-[#333] p-4 rounded-md shadow-2xl w-80 animate-in slide-in-from-right duration-700 pointer-events-none z-[50]">
                     <div className="text-sm font-bold text-white mb-1 flex items-center gap-2"><Info size={14} className="text-blue-400"/> System</div>
                     <div className="text-xs text-gray-300">{welcomeMsg}</div>
                </div>
            )}

            {/* Context Menu */}
            {contextMenu && (
                <div 
                    className={`absolute shadow-xl border rounded py-1 w-56 text-sm z-[9999] ${isDark ? 'bg-[#2d2d2d] border-[#444] text-gray-200' : 'bg-[#EEEEEE] border-gray-300 text-gray-700'}`}
                    style={{ top: contextMenu.y, left: contextMenu.x }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className={`px-4 py-1.5 ${isDark ? 'hover:bg-[#444]' : 'hover:bg-white'} flex items-center gap-3 cursor-pointer`}>
                        <Monitor size={16}/> Display settings
                    </div>
                    <div className={`px-4 py-1.5 ${isDark ? 'hover:bg-[#444]' : 'hover:bg-white'} flex items-center gap-3 cursor-pointer`} onClick={() => { launchSettings(); setContextMenu(null); }}>
                        <Settings size={16}/> Personalize
                    </div>
                    <div className={`border-t my-1 ${isDark ? 'border-[#444]' : 'border-gray-300'}`}></div>
                    <div className={`px-4 py-1.5 ${isDark ? 'hover:bg-[#444]' : 'hover:bg-white'} flex items-center gap-3 cursor-pointer`} onClick={() => launchTaskMgr()}>
                        <Activity size={16}/> Task Manager
                    </div>
                    <div className={`px-4 py-1.5 ${isDark ? 'hover:bg-[#444]' : 'hover:bg-white'} flex items-center gap-3 cursor-pointer`} onClick={() => launchTerminal()}>
                        <Terminal size={16}/> Open Terminal
                    </div>
                    <div className={`px-4 py-1.5 ${isDark ? 'hover:bg-[#444]' : 'hover:bg-white'} flex items-center gap-3 cursor-pointer`} onClick={() => onRestart()}>
                        <RefreshCcw size={16}/> Restart Simulator
                    </div>
                </div>
            )}

            {/* Windows */}
            {windows.map(win => !win.minimized && (
                <div 
                    key={win.id}
                    className={`absolute shadow-2xl rounded-sm border flex flex-col overflow-hidden ${isDark ? 'bg-[#2b2b2b] border-[#444]' : 'bg-white border-[#1883D7]'}`}
                    style={{ 
                        left: win.maximized ? 0 : win.x, 
                        top: win.maximized ? 0 : win.y, 
                        width: win.maximized ? '100%' : win.width, 
                        height: win.maximized ? 'calc(100% - 48px)' : win.height, 
                        zIndex: win.zIndex,
                        borderRadius: win.maximized ? 0 : undefined
                    }}
                    onMouseDown={(e) => {
                         setWindows(prev => prev.map(w => w.id === win.id ? { ...w, zIndex: Math.max(...prev.map(ww => ww.zIndex)) + 1 } : w));
                    }}
                >
                    <div 
                        className={`px-3 py-2 flex justify-between items-center select-none border-b cursor-default ${isDark ? 'bg-[#2b2b2b] border-[#444]' : 'bg-white border-gray-200'}`}
                        onMouseDown={(e) => startDrag(e, win.id, win.x, win.y)}
                        onDoubleClick={() => toggleMaximize(win.id)}
                    >
                        <div className="flex items-center gap-2">
                             <span className="text-gray-500">{win.icon}</span>
                             <span className={`text-xs font-semibold ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>{win.title}</span>
                        </div>
                        <div className="flex gap-1" onMouseDown={e => e.stopPropagation()}>
                            <button 
                                onClick={() => setWindows(prev => prev.map(w => w.id === win.id ? { ...w, minimized: true } : w))}
                                className={`p-1.5 rounded-sm transition-colors ${isDark ? 'hover:bg-[#444] text-gray-400' : 'hover:bg-gray-200 text-gray-500'}`}
                            >
                                <Minus size={14}/>
                            </button>
                            <button 
                                onClick={() => toggleMaximize(win.id)}
                                className={`p-1.5 rounded-sm transition-colors ${isDark ? 'hover:bg-[#444] text-gray-400' : 'hover:bg-gray-200 text-gray-500'}`}
                            >
                                {win.maximized ? <Copy size={12}/> : <Square size={12}/>}
                            </button>
                            <button 
                                onClick={() => closeWindow(win.id)}
                                className={`p-1.5 hover:bg-red-500 hover:text-white rounded-sm transition-colors ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
                            >
                                <X size={14}/>
                            </button>
                        </div>
                    </div>
                    <div className="flex-1 overflow-hidden relative cursor-auto">
                        {win.id === 'taskmgr' 
                            ? <TaskManagerApp openWindows={windows} onCloseWindow={closeWindow} onBsod={() => setBsod(true)}/> 
                            : win.content
                        }
                    </div>
                </div>
            ))}

            {/* Start Menu */}
            {startMenuOpen && (
                <div className={`absolute bottom-12 left-2 backdrop-blur-xl border w-[640px] h-[600px] rounded-lg shadow-2xl p-6 flex flex-col animate-in slide-in-from-bottom-10 duration-200 z-[10000] ${startMenuClass}`} onClick={e => e.stopPropagation()}>
                    <div className="relative mb-6">
                        <Search className="absolute left-3 top-2.5 text-gray-400" size={18}/>
                        <input className={`w-full border rounded shadow-sm py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none ${isDark ? 'bg-[#333] border-[#555] text-white' : 'bg-white border-gray-300'}`} placeholder="Type here to search"/>
                    </div>
                    
                    <div className="flex-1 flex gap-8">
                         <div className="flex-1">
                             <div className="font-semibold mb-4 text-sm flex justify-between items-center">
                                 <span>Pinned</span>
                                 <button className={`px-2 py-0.5 rounded border text-xs shadow-sm ${isDark ? 'bg-[#333] border-[#555]' : 'bg-white'}`}>All apps &gt;</button>
                             </div>
                             <div className="grid grid-cols-4 gap-4">
                                 <div onClick={launchEdge} className={`flex flex-col items-center gap-2 p-2 rounded cursor-pointer transition-colors ${itemHoverClass}`}>
                                     <div className="w-10 h-10 bg-blue-500 text-white rounded flex items-center justify-center font-bold text-xl">e</div>
                                     <div className="text-[11px]">Edge</div>
                                 </div>
                                 <div onClick={launchMail} className={`flex flex-col items-center gap-2 p-2 rounded cursor-pointer transition-colors ${itemHoverClass}`}>
                                     <div className="w-10 h-10 bg-blue-500 text-white rounded flex items-center justify-center"><Mail/></div>
                                     <div className="text-[11px]">Mail</div>
                                 </div>
                                 <div onClick={launchSettings} className={`flex flex-col items-center gap-2 p-2 rounded cursor-pointer transition-colors ${itemHoverClass}`}>
                                     <div className="w-10 h-10 bg-gray-600 text-white rounded flex items-center justify-center"><Settings/></div>
                                     <div className="text-[11px]">Settings</div>
                                 </div>
                                 <div onClick={launchExplorer} className={`flex flex-col items-center gap-2 p-2 rounded cursor-pointer transition-colors ${itemHoverClass}`}>
                                     <div className="w-10 h-10 bg-yellow-100 text-yellow-600 border border-yellow-200 rounded flex items-center justify-center"><Folder/></div>
                                     <div className="text-[11px]">Explorer</div>
                                 </div>
                                 
                                 {/* Dynamic Office Apps */}
                                 {officeInstalled && (
                                     <>
                                        <div onClick={launchWord} className={`flex flex-col items-center gap-2 p-2 rounded cursor-pointer transition-colors ${itemHoverClass}`}>
                                            <div className="w-10 h-10 bg-[#2B579A] text-white rounded flex items-center justify-center font-bold text-xl">W</div>
                                            <div className="text-[11px]">Word</div>
                                        </div>
                                        <div onClick={launchExcel} className={`flex flex-col items-center gap-2 p-2 rounded cursor-pointer transition-colors ${itemHoverClass}`}>
                                            <div className="w-10 h-10 bg-[#217346] text-white rounded flex items-center justify-center font-bold text-xl">X</div>
                                            <div className="text-[11px]">Excel</div>
                                        </div>
                                        <div onClick={launchPowerPoint} className={`flex flex-col items-center gap-2 p-2 rounded cursor-pointer transition-colors ${itemHoverClass}`}>
                                            <div className="w-10 h-10 bg-[#D24726] text-white rounded flex items-center justify-center font-bold text-xl">P</div>
                                            <div className="text-[11px]">PowerPoint</div>
                                        </div>
                                     </>
                                 )}

                                 {spssInstalled && (
                                     <div onClick={launchSpss} className={`flex flex-col items-center gap-2 p-2 rounded cursor-pointer transition-colors ${itemHoverClass}`}>
                                         <div className="w-10 h-10 bg-white border border-gray-300 rounded flex items-center justify-center font-bold text-xl text-blue-800"><BarChart3/></div>
                                         <div className="text-[11px]">SPSS</div>
                                     </div>
                                 )}

                                 {/* Disk Management App Icon */}
                                 <div onClick={launchDiskManagement} className={`flex flex-col items-center gap-2 p-2 rounded cursor-pointer transition-colors ${itemHoverClass}`}>
                                     <div className="w-10 h-10 bg-white border border-gray-300 rounded flex items-center justify-center text-gray-700"><HardDrive/></div>
                                     <div className="text-[11px]">Disk Mgmt</div>
                                 </div>
                             </div>
                         </div>
                    </div>
                    
                    {/* User Profile Bar */}
                    <div className={`mt-auto border-t pt-4 flex justify-between items-center -mx-6 -mb-6 p-6 rounded-b-lg ${isDark ? 'border-[#444] bg-[#222]' : 'border-gray-300 bg-[#F9F9F9]'}`}>
                         <div className={`flex items-center gap-3 p-2 rounded cursor-pointer px-4 transition-colors ${itemHoverClass}`}>
                             <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs text-white shadow-sm">{username[0]}</div>
                             <span className="text-sm font-semibold">{username}</span>
                         </div>
                         <div className="relative group">
                             <button className={`p-2 rounded transition-colors ${isDark ? 'hover:bg-[#444] text-white' : 'hover:bg-gray-200 text-gray-600'}`}>
                                 <Power size={20}/>
                             </button>
                             <div className="absolute bottom-full right-0 mb-2 bg-[#2D2D2D] text-white rounded-lg shadow-xl py-1 w-32 hidden group-hover:block animate-in fade-in slide-in-from-bottom-1">
                                 <button onClick={() => onRestart()} className="w-full text-left px-4 py-2 hover:bg-[#3D3D3D] flex items-center gap-2 text-xs"><RefreshCcw size={12}/> Restart</button>
                             </div>
                         </div>
                    </div>
                </div>
            )}
            
            {/* Taskbar */}
            <div className={`absolute bottom-0 w-full h-12 backdrop-blur-md flex items-center justify-between px-4 z-[10001] border-t ${taskbarClass}`}>
                <div className="flex items-center gap-2 h-full">
                    <button 
                        onClick={(e) => { e.stopPropagation(); setStartMenuOpen(!startMenuOpen); setCalendarOpen(false); setQuickSettingsOpen(false); playSound('click'); }}
                        className={`h-9 w-9 rounded flex items-center justify-center transition-all hover:shadow-sm active:scale-95 group ${itemHoverClass}`}>
                        <div className="grid grid-cols-2 gap-[2px] transition-transform group-hover:gap-[3px]">
                            <div className="w-2 h-2 bg-blue-500 rounded-[1px]"></div>
                            <div className="w-2 h-2 bg-blue-500 rounded-[1px]"></div>
                            <div className="w-2 h-2 bg-blue-500 rounded-[1px]"></div>
                            <div className="w-2 h-2 bg-blue-500 rounded-[1px]"></div>
                        </div>
                    </button>
                    
                    <div className="flex gap-1 ml-2">
                        {windows.map(win => (
                             <div 
                                key={win.id}
                                onClick={() => {
                                    playSound('click');
                                    if(win.minimized) {
                                        setWindows(prev => prev.map(w => w.id === win.id ? { ...w, minimized: false, zIndex: Math.max(...prev.map(ww => ww.zIndex)) + 1 } : w));
                                    } else {
                                        const isTop = win.zIndex === Math.max(...windows.filter(w => !w.minimized).map(w => w.zIndex));
                                        if (isTop) {
                                            setWindows(prev => prev.map(w => w.id === win.id ? { ...w, minimized: true } : w));
                                        } else {
                                            setWindows(prev => prev.map(w => w.id === win.id ? { ...w, zIndex: Math.max(...prev.map(ww => ww.zIndex)) + 1 } : w));
                                        }
                                    }
                                }}
                                className={`w-9 h-9 rounded flex items-center justify-center cursor-pointer relative transition-all active:scale-95 ${!win.minimized ? (isDark ? 'bg-white/10' : 'bg-white shadow-sm') : itemHoverClass}`}
                             >
                                <div className={`text-gray-600 scale-75 ${isDark ? 'text-gray-300' : ''}`}>{win.icon}</div>
                                <div className={`absolute bottom-0.5 w-3 h-1 rounded-full transition-all ${win.minimized ? 'bg-gray-400 w-1' : 'bg-blue-500'}`}></div>
                             </div>
                        ))}
                    </div>
                </div>

                <div className={`flex items-center gap-2 h-full ${isDark ? 'text-gray-300' : 'text-gray-800'}`}>
                    <div className={`p-1 rounded cursor-pointer ${itemHoverClass}`} onClick={() => playSound('click')}><ChevronUp size={16}/></div>
                    <div className={`flex gap-2 px-2 py-1 rounded cursor-pointer ${itemHoverClass}`} 
                        onClick={(e) => {
                            e.stopPropagation();
                            setQuickSettingsOpen(!quickSettingsOpen);
                            setCalendarOpen(false);
                            setStartMenuOpen(false);
                            playSound('click');
                        }}>
                        <Wifi size={16}/>
                        <Volume2 size={16}/>
                        <Battery size={16}/>
                    </div>
                    <div 
                        onClick={(e) => { e.stopPropagation(); setCalendarOpen(!calendarOpen); setStartMenuOpen(false); setQuickSettingsOpen(false); playSound('click'); }}
                        className={`text-right px-2 py-1 rounded cursor-pointer transition-colors ${itemHoverClass}`}
                    >
                        <div className="text-xs leading-none mb-0.5">{time.toLocaleTimeString([], {hour: 'numeric', minute:'2-digit'})}</div>
                        <div className="text-xs leading-none">{time.toLocaleDateString([], {month: 'numeric', day: 'numeric', year: 'numeric'})}</div>
                    </div>
                </div>
            </div>
        </div>
    );
};