import React, { useState, useEffect, useRef } from 'react';
import { 
    Monitor, Wifi, Volume2, Battery, Search, X, Minus, Square, Settings, 
    Image as ImageIcon, Calculator, FileText, Power, Calendar as CalendarIcon, 
    ChevronUp, Bell, Code, Info, Moon, RefreshCcw, Folder, Terminal, ArrowLeft, 
    HardDrive, Activity, Palette, Play, Cpu, Layers, Database, ChevronRight, ChevronDown, Trash2,
    Bluetooth, Plane, Sun, Accessibility, BatteryCharging, Gamepad2, Flag, Smile, Bomb, Copy,
    Shield, Mail, Globe, Lock, CheckCircle, AlertTriangle, User,
    Download, Edit3, Send, Grid3X3, Projector, CheckSquare, List, Box, Mic
} from 'lucide-react';
import { generateWelcomeMessage } from '../../services/geminiService';
import { playSound } from '../../services/soundService';

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

const SecurityApp = () => {
    const [scanning, setScanning] = useState(false);
    const [scanProgress, setScanProgress] = useState(0);
    const [lastScan, setLastScan] = useState<string>("No recent scan");
    const [defUpdateDate, setDefUpdateDate] = useState<string>("1/1/2024");
    const [updatingDefs, setUpdatingDefs] = useState(false);
    const [threats, setThreats] = useState(0);
    const [firewall, setFirewall] = useState(true);
    const [realtime, setRealtime] = useState(true);
    const [tab, setTab] = useState('home');
    const [showAllowedApps, setShowAllowedApps] = useState(false);

    const startScan = () => {
        setScanning(true);
        setScanProgress(0);
        const interval = setInterval(() => {
            setScanProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setScanning(false);
                    setLastScan(new Date().toLocaleTimeString());
                    setThreats(0); // Always clean for now
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
            {/* Sidebar */}
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

            {/* Content */}
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
                                    <div className="text-xs text-gray-500">Files scanned: {Math.floor(scanProgress * 142)}</div>
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
                            <div className="text-sm text-gray-600 mb-2">Security intelligence is up to date.</div>
                            <div className="text-xs text-gray-500 mb-4">Last update: {defUpdateDate}</div>
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
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="bg-blue-100 p-4 rounded-full text-blue-600"><Globe size={32}/></div>
                                    <div>
                                        <div className="font-semibold text-lg">Domain network</div>
                                        <div className="text-sm text-gray-500">(Not connected)</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="bg-blue-100 p-4 rounded-full text-blue-600"><Lock size={32}/></div>
                                    <div>
                                        <div className="font-semibold text-lg">Private network</div>
                                        <div className="text-sm text-green-600">Active</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="bg-blue-100 p-4 rounded-full text-blue-600"><Globe size={32}/></div>
                                    <div>
                                        <div className="font-semibold text-lg">Public network</div>
                                        <div className="text-sm text-green-600">Active</div>
                                    </div>
                                </div>
                                <div className="border-t pt-6 space-y-4">
                                    <button onClick={() => setShowAllowedApps(true)} className="text-blue-600 text-sm hover:underline block">Allow an app through firewall</button>
                                    <div className="text-blue-600 text-sm hover:underline block cursor-pointer">Network and Internet troubleshooter</div>
                                    <div className="text-blue-600 text-sm hover:underline block cursor-pointer">Firewall notification settings</div>
                                </div>
                            </>
                        ) : (
                            <div className="animate-in fade-in slide-in-from-right-4">
                                <button onClick={() => setShowAllowedApps(false)} className="mb-4 flex items-center gap-2 text-blue-600 hover:underline"><ArrowLeft size={16}/> Back</button>
                                <h3 className="font-semibold text-lg mb-4">Allowed apps and features</h3>
                                <p className="text-sm text-gray-600 mb-4">Check the boxes next to the apps you want to allow to communicate over the network.</p>
                                <div className="border rounded h-64 overflow-y-auto">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-gray-100 border-b">
                                            <tr>
                                                <th className="p-2 font-normal">Allowed apps and features</th>
                                                <th className="p-2 font-normal w-20 text-center">Private</th>
                                                <th className="p-2 font-normal w-20 text-center">Public</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {[
                                                "Microsoft Office",
                                                "Core Networking",
                                                "File and Printer Sharing",
                                                "Google Chrome",
                                                "Microsoft Edge",
                                                "Remote Desktop",
                                                "Spotify Music",
                                                "Windows Security",
                                                "Zoom Meetings"
                                            ].map((app, i) => (
                                                <tr key={i} className="border-b last:border-0 hover:bg-gray-50">
                                                    <td className="p-2">{app}</td>
                                                    <td className="p-2 text-center"><input type="checkbox" defaultChecked className="rounded"/></td>
                                                    <td className="p-2 text-center"><input type="checkbox" defaultChecked={i % 2 === 0} className="rounded"/></td>
                                                </tr>
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
    const [setup, setSetup] = useState(true);
    const [email, setEmail] = useState("");
    const [view, setView] = useState<'inbox'|'sent'|'compose'>('inbox');
    
    // Fake email store
    const [inbox, setInbox] = useState([
        { from: 'WinSim Team', subject: 'Welcome to your new PC!', body: 'Thanks for trying out the WinSim OS Installation Simulator. We hope you enjoy the experience.', date: '10:00 AM' },
        { from: 'Microsoft Account', subject: 'Security alert', body: 'New sign-in detected from "WinSim Virtual Machine". Was this you?', date: '9:30 AM' }
    ]);
    const [sent, setSent] = useState<{to: string, subject: string, body: string, date: string}[]>([]);

    // Compose state
    const [to, setTo] = useState("");
    const [subject, setSubject] = useState("");
    const [body, setBody] = useState("");

    const handleSend = () => {
        const newEmail = { to, subject, body, date: new Date().toLocaleTimeString([], {hour: 'numeric', minute:'2-digit'}) };
        setSent([newEmail, ...sent]);
        setView('sent');
        
        // If sent to self, receive it
        if (to.toLowerCase().includes(email.toLowerCase()) || to.toLowerCase().includes('user')) {
            setTimeout(() => {
                setInbox([{ from: 'Me', subject, body, date: 'Just now' }, ...inbox]);
                playSound('notification');
            }, 2000);
        }

        // Reset
        setTo("");
        setSubject("");
        setBody("");
    };
    
    if (setup) {
        return (
            <div className="flex h-full bg-[#f3f3f3] items-center justify-center font-sans text-gray-900">
                <div className="bg-white p-8 shadow-xl w-96 flex flex-col gap-4">
                    <div className="flex items-center gap-2 text-xl font-semibold mb-4">
                        <div className="bg-blue-500 text-white p-1 rounded"><Mail size={20}/></div>
                        <span>Add an account</span>
                    </div>
                    <p className="text-sm text-gray-600">Enter your email address to get started.</p>
                    <input 
                        className="border-b-2 border-blue-500 p-2 outline-none focus:bg-gray-50" 
                        placeholder="Email address" 
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                    />
                    <div className="text-xs text-gray-500">We'll assume this is for simulation purposes.</div>
                    <div className="flex justify-end mt-4">
                        <button 
                            disabled={!email.includes('@')}
                            onClick={() => setSetup(false)} 
                            className="bg-blue-600 text-white px-6 py-2 hover:bg-blue-700 disabled:opacity-50"
                        >
                            Sign in
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="flex h-full bg-white text-gray-900 font-sans">
            {/* Sidebar */}
            <div className="w-48 bg-[#f0f0f0] flex flex-col border-r border-gray-200">
                <div className="p-4 font-semibold text-lg flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm">{email[0].toUpperCase()}</div>
                    Accounts
                </div>
                <div className="flex-1 overflow-y-auto pt-2">
                    <button onClick={() => setView('compose')} className="mx-4 mb-4 flex items-center justify-center gap-2 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 shadow-sm font-semibold text-sm">
                        <Edit3 size={16}/> New mail
                    </button>
                    <div className="px-4 py-2 font-semibold text-gray-600 text-xs uppercase tracking-wider">Folders</div>
                    <div onClick={() => setView('inbox')} className={`px-4 py-2 cursor-pointer flex justify-between items-center ${view === 'inbox' ? 'bg-white border-l-4 border-blue-600 font-semibold' : 'hover:bg-white border-l-4 border-transparent'}`}>
                        <span>Inbox</span> 
                        {inbox.length > 0 && <span className="text-blue-600 text-xs">{inbox.length}</span>}
                    </div>
                    <div onClick={() => setView('sent')} className={`px-4 py-2 cursor-pointer ${view === 'sent' ? 'bg-white border-l-4 border-blue-600 font-semibold' : 'hover:bg-white border-l-4 border-transparent'}`}>Sent</div>
                    <div className="px-4 py-2 hover:bg-white cursor-pointer border-l-4 border-transparent">Drafts</div>
                </div>
            </div>
            
            {/* Content Area */}
            <div className="flex-1 flex flex-col">
                {view === 'compose' ? (
                    <div className="flex-1 flex flex-col p-8 bg-white">
                        <div className="text-xl font-semibold mb-6">New Message</div>
                        <div className="space-y-4 flex-1 flex flex-col">
                            <input className="border-b p-2 outline-none focus:border-blue-500" placeholder="To" value={to} onChange={e => setTo(e.target.value)}/>
                            <input className="border-b p-2 outline-none focus:border-blue-500" placeholder="Subject" value={subject} onChange={e => setSubject(e.target.value)}/>
                            <textarea className="flex-1 border p-2 mt-4 resize-none outline-none focus:border-blue-500 rounded-sm" placeholder="Type your message..." value={body} onChange={e => setBody(e.target.value)}/>
                        </div>
                        <div className="flex justify-end mt-4">
                            <button onClick={handleSend} className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 flex items-center gap-2">
                                <Send size={16}/> Send
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex h-full">
                        {/* List */}
                        <div className="w-80 border-r border-gray-200 overflow-y-auto bg-white">
                            <div className="p-4 font-bold text-xl border-b border-gray-100 capitalize">{view}</div>
                            {(view === 'inbox' ? inbox : sent).map((msg, i) => (
                                <div key={i} className="p-4 border-b border-gray-100 hover:bg-blue-50 cursor-pointer">
                                    <div className="flex justify-between mb-1">
                                        <div className="font-semibold text-sm truncate w-40">{view === 'inbox' ? (msg as any).from : (msg as any).to}</div>
                                        <div className="text-xs text-gray-500">{msg.date}</div>
                                    </div>
                                    <div className="text-xs font-medium text-blue-600 truncate mb-1">{msg.subject}</div>
                                    <div className="text-xs text-gray-500 line-clamp-2">{msg.body}</div>
                                </div>
                            ))}
                            {(view === 'inbox' ? inbox : sent).length === 0 && (
                                <div className="p-8 text-center text-gray-400 text-sm">Nothing here yet.</div>
                            )}
                        </div>
                        {/* Reading Pane (Placeholder for simplicity) */}
                        <div className="flex-1 bg-gray-50 flex items-center justify-center text-gray-400">
                            <Mail size={48} className="opacity-20"/>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
};

// --- OFFICE APPS ---

const WordApp = () => (
    <div className="flex flex-col h-full bg-white text-gray-900 font-sans">
        <div className="bg-[#2B579A] text-white p-2 flex items-center gap-4">
            <FileText size={20}/>
            <span className="font-semibold text-sm">Document1 - Word</span>
        </div>
        <div className="bg-[#F3F3F3] border-b border-gray-300 p-2 flex gap-2 text-sm text-gray-700">
            <span className="hover:bg-gray-300 px-2 rounded cursor-pointer">File</span>
            <span className="hover:bg-gray-300 px-2 rounded cursor-pointer font-semibold border-b-2 border-[#2B579A]">Home</span>
            <span className="hover:bg-gray-300 px-2 rounded cursor-pointer">Insert</span>
            <span className="hover:bg-gray-300 px-2 rounded cursor-pointer">Layout</span>
        </div>
        <div className="bg-[#F3F3F3] p-2 border-b border-gray-300 flex gap-4 items-center h-10 shadow-sm">
            {/* Toolbar mocks */}
            <select className="border text-xs h-6 w-32"><option>Calibri</option></select>
            <select className="border text-xs h-6 w-12"><option>11</option></select>
            <div className="flex gap-1 border-l pl-2 border-gray-300">
                <button className="font-bold w-6 hover:bg-gray-300 rounded">B</button>
                <button className="italic w-6 hover:bg-gray-300 rounded">I</button>
                <button className="underline w-6 hover:bg-gray-300 rounded">U</button>
            </div>
        </div>
        <div className="flex-1 bg-[#F0F0F0] p-8 overflow-y-auto flex justify-center">
            <div 
                className="w-[816px] min-h-[1056px] bg-white shadow-lg p-12 outline-none" 
                contentEditable 
                suppressContentEditableWarning
                style={{fontFamily: 'Calibri, sans-serif'}}
            >
                <h1 className="text-2xl font-bold mb-4">PRC110 Assignment</h1>
                <p>Name: User</p>
                <p>Date: {new Date().toLocaleDateString()}</p>
                <br/>
                <p>Type here...</p>
            </div>
        </div>
        <div className="bg-[#2B579A] text-white text-xs px-2 py-0.5 flex justify-between">
            <div>Page 1 of 1 &nbsp; 32 words</div>
            <div>100%</div>
        </div>
    </div>
);

const ExcelApp = () => (
    <div className="flex flex-col h-full bg-white text-gray-900 font-sans">
        <div className="bg-[#217346] text-white p-2 flex items-center gap-4">
            <Grid3X3 size={20}/>
            <span className="font-semibold text-sm">Book1 - Excel</span>
        </div>
        <div className="bg-[#F3F3F3] border-b border-gray-300 p-2 flex gap-2 text-sm text-gray-700">
            <span className="hover:bg-gray-300 px-2 rounded cursor-pointer">File</span>
            <span className="hover:bg-gray-300 px-2 rounded cursor-pointer font-semibold border-b-2 border-[#217346]">Home</span>
            <span className="hover:bg-gray-300 px-2 rounded cursor-pointer">Insert</span>
            <span className="hover:bg-gray-300 px-2 rounded cursor-pointer">Formulas</span>
        </div>
        <div className="bg-white border-b border-gray-300 flex items-center px-2 py-1 gap-2">
            <span className="text-gray-500 font-serif italic font-bold">fx</span>
            <input className="flex-1 border border-gray-300 p-1 text-sm outline-none" placeholder=""/>
        </div>
        <div className="flex-1 overflow-auto bg-white">
            <div className="grid grid-cols-[40px_repeat(10,100px)] text-sm">
                <div className="bg-gray-100 border-b border-r border-gray-300"></div>
                {['A','B','C','D','E','F','G','H','I','J'].map(col => (
                    <div key={col} className="bg-gray-100 border-b border-r border-gray-300 text-center font-semibold text-gray-600">{col}</div>
                ))}
                {[...Array(20)].map((_, r) => (
                    <React.Fragment key={r}>
                        <div className="bg-gray-100 border-b border-r border-gray-300 text-center font-semibold text-gray-600">{r+1}</div>
                        {[...Array(10)].map((_, c) => (
                            <input key={`${r}-${c}`} className="border-b border-r border-gray-200 outline-none px-1 focus:border-green-500 focus:ring-1 focus:ring-green-500 z-10" />
                        ))}
                    </React.Fragment>
                ))}
            </div>
        </div>
        <div className="bg-[#F3F3F3] border-t border-gray-300 px-2 py-0.5 text-xs text-gray-600 flex gap-4">
            <span className="font-bold text-[#217346]">Sheet1</span>
            <span>+</span>
        </div>
    </div>
);

const PowerPointApp = () => (
    <div className="flex flex-col h-full bg-white text-gray-900 font-sans">
        <div className="bg-[#D24726] text-white p-2 flex items-center gap-4">
            <Projector size={20}/>
            <span className="font-semibold text-sm">Presentation1 - PowerPoint</span>
        </div>
        <div className="bg-[#F3F3F3] border-b border-gray-300 p-2 flex gap-2 text-sm text-gray-700">
            <span className="hover:bg-gray-300 px-2 rounded cursor-pointer">File</span>
            <span className="hover:bg-gray-300 px-2 rounded cursor-pointer font-semibold border-b-2 border-[#D24726]">Home</span>
            <span className="hover:bg-gray-300 px-2 rounded cursor-pointer">Insert</span>
            <span className="hover:bg-gray-300 px-2 rounded cursor-pointer">Design</span>
        </div>
        <div className="flex-1 flex bg-[#F0F0F0] overflow-hidden">
            {/* Slide sorter */}
            <div className="w-48 border-r border-gray-300 p-4 flex flex-col gap-4 overflow-y-auto">
                <div className="aspect-video bg-white border-2 border-[#D24726] shadow-sm p-2 flex flex-col justify-center items-center text-[4px]">
                    <div className="h-2 w-16 bg-gray-300 mb-1"></div>
                    <div className="h-1 w-10 bg-gray-200"></div>
                </div>
            </div>
            {/* Main Stage */}
            <div className="flex-1 p-8 flex items-center justify-center bg-[#E6E6E6]">
                <div className="aspect-video w-full max-w-4xl bg-white shadow-2xl flex flex-col items-center justify-center p-16 select-text">
                    <input className="text-5xl font-light text-center w-full border border-dotted border-transparent hover:border-gray-400 p-2 mb-4 outline-none placeholder-gray-400" placeholder="Click to add title"/>
                    <input className="text-2xl text-gray-500 text-center w-full border border-dotted border-transparent hover:border-gray-400 p-2 outline-none placeholder-gray-300" placeholder="Click to add subtitle"/>
                </div>
            </div>
        </div>
        <div className="bg-[#D24726] text-white text-xs px-2 py-0.5 flex justify-between">
            <div>Slide 1 of 1</div>
            <div>English (United States)</div>
        </div>
    </div>
);

const OfficeInstallerApp = ({ onComplete }: { onComplete: () => void }) => {
    const [progress, setProgress] = useState(0);
    
    useEffect(() => {
        const interval = setInterval(() => {
            setProgress(prev => {
                if(prev >= 100) {
                    clearInterval(interval);
                    setTimeout(onComplete, 1000);
                    return 100;
                }
                return prev + 0.5;
            });
        }, 30);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="h-full flex flex-col items-center justify-center bg-white p-8 text-center select-none">
            <div className="mb-8">
                <div className="flex gap-2 justify-center mb-4">
                    <div className="w-8 h-8 bg-[#D24726] text-white flex items-center justify-center font-bold">P</div>
                    <div className="w-8 h-8 bg-[#217346] text-white flex items-center justify-center font-bold">X</div>
                    <div className="w-8 h-8 bg-[#2B579A] text-white flex items-center justify-center font-bold">W</div>
                </div>
                <h2 className="text-2xl font-light text-gray-700">Installing Office...</h2>
                <p className="text-gray-500 text-sm mt-2">Please stay online while Office downloads.</p>
            </div>
            <div className="w-full max-w-md bg-gray-200 h-1 rounded-full overflow-hidden mb-2">
                <div className="h-full bg-[#D83B01] transition-all duration-100" style={{width: `${progress}%`}}></div>
            </div>
            <div className="text-xs text-gray-400">{Math.floor(progress)}%</div>
        </div>
    )
};

const TaskManagerApp = ({ openWindows, onCloseWindow, onBsod }: { openWindows: DesktopWindow[], onCloseWindow: (id: string) => void, onBsod: () => void }) => {
    const [tab, setTab] = useState('processes');
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const systemProcesses = [
        { id: 'sys1', name: 'System', status: 'Running', cpu: '0.1%', mem: '0.1 MB' },
        { id: 'sys2', name: 'Registry', status: 'Running', cpu: '0%', mem: '12 MB' },
        { id: 'sys3', name: 'Service Host: Local System', status: 'Running', cpu: '0%', mem: '4 MB' },
        { id: 'sys4', name: 'Client Server Runtime Process', status: 'Running', cpu: '0%', mem: '1.2 MB' },
        { id: 'sys5', name: 'Desktop Window Manager', status: 'Running', cpu: '0.2%', mem: '45 MB' },
    ];

    const apps = openWindows.map(w => ({ id: w.id, name: w.title, status: 'Running', cpu: '0%', mem: '120 MB', isApp: true }));
    const all = [...apps, ...systemProcesses];

    const handleEndTask = () => {
        if (!selectedId) return;
        const isApp = openWindows.find(w => w.id === selectedId);
        if (isApp) {
            onCloseWindow(selectedId);
            setSelectedId(null);
        } else {
            // System process
            onBsod();
        }
    };

    return (
        <div className="flex flex-col h-full bg-white text-xs select-none">
            <div className="flex bg-white border-b border-gray-200">
                 <button onClick={() => setTab('processes')} className={`px-4 py-2 border-b-2 ${tab === 'processes' ? 'border-blue-500 text-blue-600' : 'border-transparent'}`}>Processes</button>
                 <button className="px-4 py-2 border-b-2 border-transparent text-gray-500">Performance</button>
                 <button className="px-4 py-2 border-b-2 border-transparent text-gray-500">App history</button>
            </div>
            <div className="bg-gray-100 grid grid-cols-[3fr_1fr_1fr_1fr] px-4 py-1 border-b border-gray-200 text-gray-600 font-semibold">
                <div>Name</div>
                <div>Status</div>
                <div>CPU</div>
                <div>Memory</div>
            </div>
            <div className="flex-1 overflow-y-auto bg-white">
                {all.map(p => (
                    <div 
                        key={p.id} 
                        onClick={() => setSelectedId(p.id)}
                        className={`grid grid-cols-[3fr_1fr_1fr_1fr] px-4 py-2 border-b border-gray-50 cursor-pointer ${selectedId === p.id ? 'bg-blue-100' : 'hover:bg-gray-50'}`}
                    >
                        <div className="flex items-center gap-2">
                             <div className="w-3 h-3 bg-blue-500 rounded-sm"></div> {p.name}
                        </div>
                        <div>{p.status}</div>
                        <div>{p.cpu}</div>
                        <div>{p.mem}</div>
                    </div>
                ))}
            </div>
            <div className="p-2 border-t border-gray-200 flex justify-end bg-gray-50">
                <button 
                    disabled={!selectedId}
                    onClick={handleEndTask}
                    className="px-4 py-1.5 bg-gray-100 border border-gray-300 rounded hover:bg-gray-200 disabled:opacity-50 text-gray-800"
                >
                    End task
                </button>
            </div>
        </div>
    )
};

const CalculatorApp = () => {
    const [display, setDisplay] = useState("0");
    return (
        <div className="h-full bg-[#f3f3f3] flex flex-col p-2 gap-1 font-sans">
            <div className="flex-1 bg-transparent flex items-end justify-end text-4xl p-4 font-semibold text-gray-800 mb-2 truncate">
                {display}
            </div>
            <div className="grid grid-cols-4 gap-1 flex-1">
                 {['%', 'CE', 'C', 'del', '1/x', 'sq', 'sqrt', '/', '7', '8', '9', 'X', '4', '5', '6', '-', '1', '2', '3', '+', '+/-', '0', '.', '='].map(b => (
                     <button 
                        key={b}
                        onClick={() => setDisplay(prev => prev === "0" ? b : prev + b)}
                        className={`rounded hover:opacity-80 text-sm font-semibold ${['=', '+', '-', 'X', '/'].includes(b) ? 'bg-[#0078D7] text-white' : (['0','1','2','3','4','5','6','7','8','9'].includes(b) ? 'bg-white text-gray-900 border border-gray-200' : 'bg-[#f9f9f9] text-gray-900 border border-gray-200')}`}
                     >
                         {b}
                     </button>
                 ))}
            </div>
        </div>
    )
};

const NotepadApp = ({ theme }: { theme: 'light' | 'dark' }) => (
    <div className={`flex flex-col h-full ${theme === 'dark' ? 'bg-[#282828] text-white' : 'bg-white text-gray-900'}`}>
        <div className={`flex gap-4 p-1 text-xs border-b ${theme === 'dark' ? 'border-[#444] bg-[#333]' : 'border-gray-200 bg-white'}`}>
            <span>File</span><span>Edit</span><span>Format</span><span>View</span><span>Help</span>
        </div>
        <textarea className={`flex-1 resize-none p-2 outline-none font-mono text-sm bg-transparent border-none ${theme === 'dark' ? 'text-gray-200' : 'text-gray-900'}`} placeholder="Type here..." spellCheck={false}/>
        <div className={`flex justify-between px-2 py-0.5 text-xs ${theme === 'dark' ? 'bg-[#333] text-gray-400' : 'bg-[#f0f0f0] text-gray-600'}`}>
            <span>Ln 1, Col 1</span>
            <span>UTF-8</span>
        </div>
    </div>
);

const PaintApp = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [color, setColor] = useState("#000000");
    const [isDrawing, setIsDrawing] = useState(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        if(canvas) {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
            const ctx = canvas.getContext('2d');
            if(ctx) {
                ctx.fillStyle = "white";
                ctx.fillRect(0,0,canvas.width, canvas.height);
            }
        }
    }, []);

    const draw = (e: React.MouseEvent) => {
        if(!isDrawing || !canvasRef.current) return;
        const ctx = canvasRef.current.getContext('2d');
        if(ctx) {
            const rect = canvasRef.current.getBoundingClientRect();
            ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
            ctx.strokeStyle = color;
            ctx.lineWidth = 3;
            ctx.stroke();
        }
    };

    return (
        <div className="flex flex-col h-full bg-[#f0f0f0]">
            <div className="h-24 bg-[#f5f6f7] border-b border-gray-300 flex items-center px-4 gap-4 shadow-sm">
                <div className="flex flex-col items-center gap-1 border-r pr-4">
                     <div className="w-8 h-8 bg-white border border-black cursor-pointer"></div>
                     <span className="text-xs">Paste</span>
                </div>
                <div className="flex gap-1 border-r pr-4">
                     {['#000', '#888', '#fff', '#f00', '#0f0', '#00f', '#ff0', '#0ff', '#f0f'].map(c => (
                         <div key={c} onClick={() => setColor(c)} className={`w-6 h-6 border cursor-pointer ${color === c ? 'ring-2 ring-blue-400' : 'border-gray-400'}`} style={{backgroundColor: c}}></div>
                     ))}
                </div>
            </div>
            <div className="flex-1 p-4 overflow-auto bg-[#c0c0c0]">
                 <canvas 
                    ref={canvasRef} 
                    className="bg-white shadow-lg cursor-crosshair" 
                    style={{width: '100%', height: '100%'}}
                    onMouseDown={(e) => {
                        setIsDrawing(true);
                        const ctx = canvasRef.current?.getContext('2d');
                        const rect = canvasRef.current?.getBoundingClientRect();
                        if(ctx && rect) {
                            ctx.beginPath();
                            ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
                        }
                    }}
                    onMouseUp={() => setIsDrawing(false)}
                    onMouseMove={draw}
                 />
            </div>
        </div>
    )
};

const RegEditApp = () => (
    <div className="flex h-full bg-white text-gray-900 text-xs font-sans">
        <div className="w-64 border-r border-gray-300 p-1 overflow-auto bg-white">
            <div className="pl-0">Computer</div>
            <div className="pl-4 flex items-center gap-1"><Folder size={12} className="text-yellow-500 fill-yellow-500"/> HKEY_CLASSES_ROOT</div>
            <div className="pl-4 flex items-center gap-1"><Folder size={12} className="text-yellow-500 fill-yellow-500"/> HKEY_CURRENT_USER</div>
            <div className="pl-8 flex items-center gap-1"><Folder size={12} className="text-yellow-500 fill-yellow-500"/> AppEvents</div>
            <div className="pl-8 flex items-center gap-1"><Folder size={12} className="text-yellow-500 fill-yellow-500"/> Console</div>
            <div className="pl-8 flex items-center gap-1 bg-blue-100 border border-blue-200"><Folder size={12} className="text-yellow-500 fill-yellow-500"/> Control Panel</div>
            <div className="pl-8 flex items-center gap-1"><Folder size={12} className="text-yellow-500 fill-yellow-500"/> Environment</div>
            <div className="pl-8 flex items-center gap-1"><Folder size={12} className="text-yellow-500 fill-yellow-500"/> Software</div>
            <div className="pl-4 flex items-center gap-1"><Folder size={12} className="text-yellow-500 fill-yellow-500"/> HKEY_LOCAL_MACHINE</div>
            <div className="pl-4 flex items-center gap-1"><Folder size={12} className="text-yellow-500 fill-yellow-500"/> HKEY_USERS</div>
            <div className="pl-4 flex items-center gap-1"><Folder size={12} className="text-yellow-500 fill-yellow-500"/> HKEY_CURRENT_CONFIG</div>
        </div>
        <div className="flex-1 flex flex-col">
            <div className="border-b border-gray-300 px-2 py-1 flex gap-4 text-gray-500">
                <span>Name</span>
                <span>Type</span>
                <span>Data</span>
            </div>
            <div className="flex-1 overflow-auto bg-white p-1">
                 <div className="grid grid-cols-[1fr_1fr_2fr] gap-2 px-1 hover:bg-blue-50">
                     <span className="text-red-500">ab</span> (Default)
                     <span>REG_SZ</span>
                     <span>(value not set)</span>
                 </div>
                 <div className="grid grid-cols-[1fr_1fr_2fr] gap-2 px-1 hover:bg-blue-50">
                     <span className="text-blue-500">010</span> CurrentUser
                     <span>REG_SZ</span>
                     <span>User</span>
                 </div>
                 <div className="grid grid-cols-[1fr_1fr_2fr] gap-2 px-1 hover:bg-blue-50">
                     <span className="text-blue-500">011</span> WaitToKillAppTimeout
                     <span>REG_SZ</span>
                     <span>20000</span>
                 </div>
            </div>
            <div className="border-t border-gray-300 p-0.5 text-gray-500 bg-[#f0f0f0]">
                Computer\HKEY_CURRENT_USER\Control Panel
            </div>
        </div>
    </div>
);

const MinesweeperApp = () => {
    // Visual only
    return (
        <div className="w-full h-full bg-[#c0c0c0] flex flex-col p-1 border-2 border-white border-r-gray-500 border-b-gray-500">
             <div className="flex justify-between items-center bg-[#c0c0c0] border-2 border-gray-500 border-r-white border-b-white p-1 mb-1">
                 <div className="bg-black text-red-600 font-mono text-xl px-1 border border-gray-500">010</div>
                 <button className="border-2 border-white border-r-gray-500 border-b-gray-500 active:border-gray-500 active:border-r-white active:border-b-white p-1"><Smile className="text-yellow-400 fill-black bg-black rounded-full" size={16}/></button>
                 <div className="bg-black text-red-600 font-mono text-xl px-1 border border-gray-500">999</div>
             </div>
             <div className="flex-1 border-2 border-gray-500 border-r-white border-b-white grid grid-cols-9 grid-rows-9">
                 {[...Array(81)].map((_,i) => (
                     <button key={i} className="border border-white border-r-gray-500 border-b-gray-500 bg-[#c0c0c0] active:border-gray-400"></button>
                 ))}
             </div>
        </div>
    )
};

const BrowserApp = () => {
    const [url, setUrl] = useState("https://www.google.com");
    return (
        <div className="flex flex-col h-full bg-white">
            <div className="flex items-center gap-2 p-2 bg-[#f3f3f3] border-b border-gray-300">
                <div className="flex gap-2">
                    <button className="p-1 hover:bg-gray-200 rounded"><ArrowLeft size={16}/></button>
                    <button className="p-1 hover:bg-gray-200 rounded rotate-180"><ArrowLeft size={16}/></button>
                    <button className="p-1 hover:bg-gray-200 rounded"><RefreshCcw size={14}/></button>
                </div>
                <div className="flex-1 bg-white border border-gray-300 rounded-full px-4 py-1.5 flex items-center gap-2 text-sm shadow-sm">
                    <Lock size={12} className="text-green-600"/>
                    <input className="flex-1 outline-none" value={url} onChange={e => setUrl(e.target.value)}/>
                </div>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center bg-white">
                 <div className="text-4xl font-bold mb-4"><span className="text-blue-500">G</span><span className="text-red-500">o</span><span className="text-yellow-500">o</span><span className="text-blue-500">g</span><span className="text-green-500">l</span><span className="text-red-500">e</span></div>
                 <div className="w-1/2 border border-gray-200 rounded-full px-4 py-3 shadow-sm hover:shadow-md transition-shadow flex items-center gap-2">
                     <Search size={18} className="text-gray-400"/>
                     <input className="flex-1 outline-none" placeholder="Search Google or type a URL"/>
                     <Mic size={18} className="text-blue-500"/>
                 </div>
                 <div className="flex gap-4 mt-6">
                     <button className="px-4 py-2 bg-gray-50 hover:bg-gray-100 border border-transparent hover:border-gray-200 text-sm text-gray-800 rounded">Google Search</button>
                     <button className="px-4 py-2 bg-gray-50 hover:bg-gray-100 border border-transparent hover:border-gray-200 text-sm text-gray-800 rounded">I'm Feeling Lucky</button>
                 </div>
            </div>
        </div>
    )
};

const QuickSettings = ({ isDark, setIsDark, bgImage }: { isDark: boolean, setIsDark: (v: boolean) => void, bgImage: string }) => {
    return (
        <div className={`absolute bottom-12 right-2 backdrop-blur-xl border w-80 p-4 rounded-lg shadow-2xl animate-in slide-in-from-bottom-10 duration-200 z-[10000] ${isDark ? 'bg-[#2d2d2d]/90 border-[#444] text-white' : 'bg-[#f3f3f3]/90 border-gray-300 text-gray-900'}`} onClick={e => e.stopPropagation()}>
            <div className="grid grid-cols-3 gap-3 mb-6">
                 <button className={`h-20 rounded flex flex-col items-start justify-end p-3 transition-colors ${isDark ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'}`}>
                     <Wifi size={20} className="mb-auto"/>
                     <span className="text-xs font-semibold">Wi-Fi</span>
                 </button>
                 <button className={`h-20 rounded flex flex-col items-start justify-end p-3 transition-colors ${isDark ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'}`}>
                     <Bluetooth size={20} className="mb-auto"/>
                     <span className="text-xs font-semibold">Bluetooth</span>
                 </button>
                 <button className={`h-20 rounded flex flex-col items-start justify-end p-3 transition-colors ${isDark ? 'bg-[#444] hover:bg-[#555]' : 'bg-white hover:bg-gray-100'}`}>
                     <Plane size={20} className="mb-auto"/>
                     <span className="text-xs font-semibold">Airplane</span>
                 </button>
                 <button className={`h-20 rounded flex flex-col items-start justify-end p-3 transition-colors ${isDark ? 'bg-[#444] hover:bg-[#555]' : 'bg-white hover:bg-gray-100'}`}>
                     <BatteryCharging size={20} className="mb-auto"/>
                     <span className="text-xs font-semibold">Saver</span>
                 </button>
                 <button onClick={() => setIsDark(!isDark)} className={`h-20 rounded flex flex-col items-start justify-end p-3 transition-colors ${isDark ? 'bg-blue-600 text-white' : 'bg-white hover:bg-gray-100'}`}>
                     <Moon size={20} className="mb-auto"/>
                     <span className="text-xs font-semibold">Dark Mode</span>
                 </button>
                 <button className={`h-20 rounded flex flex-col items-start justify-end p-3 transition-colors ${isDark ? 'bg-[#444] hover:bg-[#555]' : 'bg-white hover:bg-gray-100'}`}>
                     <Accessibility size={20} className="mb-auto"/>
                     <span className="text-xs font-semibold">Access...</span>
                 </button>
            </div>
            <div className="space-y-4 mb-4">
                 <div className="flex gap-4 items-center">
                     <Sun size={18} className="text-gray-500"/>
                     <input type="range" className="flex-1 accent-blue-500 h-1 bg-gray-300 rounded-lg appearance-none cursor-pointer"/>
                 </div>
                 <div className="flex gap-4 items-center">
                     <Volume2 size={18} className="text-gray-500"/>
                     <input type="range" className="flex-1 accent-blue-500 h-1 bg-gray-300 rounded-lg appearance-none cursor-pointer"/>
                 </div>
            </div>
            <div className="flex justify-between items-center text-xs text-gray-500 pt-2 border-t border-gray-300/20">
                <div className="flex items-center gap-2">
                    <Battery size={14}/> 84%
                </div>
                <div className="cursor-pointer hover:text-blue-500"><Settings size={14}/></div>
            </div>
        </div>
    )
};

const SettingsApp = ({ bgImage, setBgImage, theme, setTheme }: { bgImage: string, setBgImage: (url: string) => void, theme: 'light'|'dark', setTheme: (t: 'light'|'dark') => void }) => {
    const [tab, setTab] = useState('system');
    // Network State
    const [ipConfig, setIpConfig] = useState({ ip: '192.168.1.105', sub: '255.255.255.0', gate: '192.168.1.1', dns: '8.8.8.8' });
    const [editIp, setEditIp] = useState(false);
    const [tempIp, setTempIp] = useState(ipConfig);
    const [diagnosing, setDiagnosing] = useState(false);
    const [diagResult, setDiagResult] = useState<string | null>(null);

    // Mock Installed Apps
    const installedApps = [
        { name: "Microsoft Office 365", publisher: "Microsoft Corporation", date: new Date().toLocaleDateString(), size: "2.4 GB", version: "16.0.14326" },
        { name: "Google Chrome", publisher: "Google LLC", date: "1/10/2024", size: "350 MB", version: "120.0.6099" },
        { name: "Microsoft Edge", publisher: "Microsoft Corporation", date: "1/10/2024", size: "450 MB", version: "120.0.2210" },
        { name: "Windows Security", publisher: "Microsoft Corporation", date: "1/1/2024", size: "12 MB", version: "1.0.0.0" },
        { name: "Calculator", publisher: "Microsoft Corporation", date: "1/1/2024", size: "2 MB", version: "11.2307" },
        { name: "Notepad", publisher: "Microsoft Corporation", date: "1/1/2024", size: "1.5 MB", version: "11.2311" },
        { name: "Photos", publisher: "Microsoft Corporation", date: "1/5/2024", size: "250 MB", version: "2024.11070" },
        { name: "Spotify", publisher: "Spotify AB", date: "1/12/2024", size: "180 MB", version: "1.2.26" },
        { name: "Visual Studio Code", publisher: "Microsoft Corporation", date: "1/15/2024", size: "380 MB", version: "1.85.1" },
        { name: "Zoom", publisher: "Zoom Video Communications", date: "1/18/2024", size: "150 MB", version: "5.17.0" },
    ];

    const wallpapers = [
        'https://picsum.photos/1920/1080?random=1',
        'https://picsum.photos/1920/1080?random=2',
        'https://picsum.photos/1920/1080?random=3',
        'https://picsum.photos/1920/1080?random=4',
    ];

    const isDark = theme === 'dark';
    const bgClass = isDark ? 'bg-[#202020] text-white' : 'bg-[#F0F0F0] text-gray-900';
    const cardClass = isDark ? 'bg-[#2b2b2b] border-[#444]' : 'bg-white border-gray-200';

    const runDiagnosis = () => {
        setDiagnosing(true);
        setDiagResult(null);
        setTimeout(() => {
            setDiagnosing(false);
            setDiagResult("Troubleshooting couldn't identify the problem.");
        }, 3000);
    };

    return (
        <div className={`flex h-full text-sm ${bgClass}`}>
            <div className={`w-48 border-r p-4 flex flex-col gap-1 ${isDark ? 'border-[#333] bg-[#2b2b2b]' : 'border-gray-200 bg-white'}`}>
                <div className="mb-4 font-bold text-lg px-2">Settings</div>
                <button onClick={() => setTab('system')} className={`text-left px-3 py-2 rounded ${tab === 'system' ? (isDark ? 'bg-[#333]' : 'bg-gray-100') : 'hover:opacity-70'}`}>System</button>
                <button onClick={() => setTab('apps')} className={`text-left px-3 py-2 rounded ${tab === 'apps' ? (isDark ? 'bg-[#333]' : 'bg-gray-100') : 'hover:opacity-70'}`}>Apps</button>
                <button onClick={() => setTab('personalization')} className={`text-left px-3 py-2 rounded ${tab === 'personalization' ? (isDark ? 'bg-[#333]' : 'bg-gray-100') : 'hover:opacity-70'}`}>Personalization</button>
                <button onClick={() => setTab('network')} className={`text-left px-3 py-2 rounded ${tab === 'network' ? (isDark ? 'bg-[#333]' : 'bg-gray-100') : 'hover:opacity-70'}`}>Network & internet</button>
            </div>
            <div className={`flex-1 p-8 overflow-y-auto ${isDark ? 'bg-[#1c1c1c]' : 'bg-[#FAFAFA]'}`}>
                {tab === 'system' && (
                    <div className="max-w-xl animate-in fade-in slide-in-from-bottom-2 duration-300">
                         <h2 className="text-2xl font-light mb-6">About</h2>
                         <div className={`p-6 border rounded shadow-sm space-y-4 ${cardClass}`}>
                             <div className="flex justify-between border-b border-gray-100/10 pb-2">
                                 <span className="opacity-70">Device name</span>
                                 <span className="font-semibold">DESKTOP-WINSIM</span>
                             </div>
                             <div className="flex justify-between border-b border-gray-100/10 pb-2">
                                 <span className="opacity-70">Processor</span>
                                 <span className="font-semibold">WinSim Virtual CPU @ 3.50GHz</span>
                             </div>
                             <div className="flex justify-between border-b border-gray-100/10 pb-2">
                                 <span className="opacity-70">Installed RAM</span>
                                 <span className="font-semibold">16.0 GB</span>
                             </div>
                             <div className="flex justify-between">
                                 <span className="opacity-70">Edition</span>
                                 <span className="font-semibold">Windows 11 Pro (Simulated)</span>
                             </div>
                         </div>
                    </div>
                )}
                {tab === 'apps' && (
                    <div className="max-w-3xl animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <h2 className="text-2xl font-light mb-6">Apps & features</h2>
                        <div className={`border rounded shadow-sm ${cardClass}`}>
                            <div className="grid grid-cols-[2fr_1fr_1fr_1fr] p-3 border-b font-semibold opacity-70 text-xs">
                                <div>Name</div>
                                <div>Publisher</div>
                                <div>Date</div>
                                <div className="text-right">Size</div>
                            </div>
                            {installedApps.map((app, i) => (
                                <div key={i} className={`grid grid-cols-[2fr_1fr_1fr_1fr] p-3 border-b last:border-0 hover:bg-black/5 items-center text-xs ${isDark ? 'border-[#333]' : 'border-gray-100'}`}>
                                    <div>
                                        <div className="font-semibold text-sm">{app.name}</div>
                                        <div className="opacity-60">{app.version}</div>
                                    </div>
                                    <div className="opacity-70">{app.publisher}</div>
                                    <div className="opacity-70">{app.date}</div>
                                    <div className="opacity-70 text-right">{app.size}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                {tab === 'personalization' && (
                    <div className="max-w-xl animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <h2 className="text-2xl font-light mb-6">Personalization</h2>
                        <div className={`p-6 border rounded shadow-sm mb-6 ${cardClass}`}>
                             <div className="flex justify-between items-center mb-4">
                                <span>Choose your mode</span>
                                <div className="flex bg-gray-200 rounded p-1">
                                    <button onClick={() => setTheme('light')} className={`px-3 py-1 rounded text-xs ${theme === 'light' ? 'bg-white shadow text-black' : 'text-gray-500'}`}>Light</button>
                                    <button onClick={() => setTheme('dark')} className={`px-3 py-1 rounded text-xs ${theme === 'dark' ? 'bg-[#444] shadow text-white' : 'text-gray-500'}`}>Dark</button>
                                </div>
                             </div>
                        </div>

                        <div className={`p-6 border rounded shadow-sm ${cardClass}`}>
                            <div className="mb-4 opacity-70">Choose a photo</div>
                            <div className="grid grid-cols-2 gap-4">
                                {wallpapers.map((wp, i) => (
                                    <button 
                                        key={i} 
                                        onClick={() => setBgImage(wp)}
                                        className={`aspect-video rounded overflow-hidden border-2 transition-all ${bgImage === wp ? 'border-blue-500 ring-2 ring-blue-200' : 'border-transparent hover:opacity-90'}`}
                                    >
                                        <img src={wp} className="w-full h-full object-cover" alt="wallpaper" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
                {tab === 'network' && (
                    <div className="max-w-xl animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <h2 className="text-2xl font-light mb-6">Network & internet</h2>
                        
                        <div className="flex items-center gap-4 mb-8">
                            <div className="relative">
                                <Monitor size={48} className="text-gray-400"/>
                                <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-0.5 border-2 border-white"><CheckCircle size={12} className="text-white"/></div>
                            </div>
                            <div>
                                <div className="font-semibold text-lg">Ethernet</div>
                                <div className="text-sm text-gray-500">Connected</div>
                            </div>
                        </div>

                        <div className={`p-6 border rounded shadow-sm mb-6 ${cardClass}`}>
                            <div className="font-semibold mb-4 flex justify-between items-center">
                                IP assignment
                                <button onClick={() => { setEditIp(true); setTempIp(ipConfig); }} className="px-4 py-1 bg-gray-100 hover:bg-gray-200 border rounded text-xs text-black">Edit</button>
                            </div>
                            <div className="space-y-1 text-xs text-gray-500">
                                <div>IPv4 address: <span className={isDark ? "text-gray-200" : "text-gray-900"}>{ipConfig.ip}</span></div>
                                <div>IPv4 subnet mask: <span className={isDark ? "text-gray-200" : "text-gray-900"}>{ipConfig.sub}</span></div>
                                <div>IPv4 gateway: <span className={isDark ? "text-gray-200" : "text-gray-900"}>{ipConfig.gate}</span></div>
                                <div>IPv4 DNS servers: <span className={isDark ? "text-gray-200" : "text-gray-900"}>{ipConfig.dns}</span></div>
                            </div>
                        </div>

                        <div className={`p-6 border rounded shadow-sm ${cardClass}`}>
                            <div className="font-semibold mb-2">Network troubleshooter</div>
                            <p className="text-xs text-gray-500 mb-4">Diagnose and fix network connection issues.</p>
                            <button onClick={runDiagnosis} disabled={diagnosing} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 text-xs">
                                {diagnosing ? 'Detecting problems...' : 'Run troubleshooter'}
                            </button>
                            {diagResult && (
                                <div className="mt-4 p-3 bg-gray-100 border-l-4 border-blue-500 text-xs text-black">
                                    {diagResult}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* IP Edit Modal */}
            {editIp && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-[10050]">
                    <div className={`p-6 rounded shadow-xl w-96 border ${cardClass}`}>
                        <h3 className="font-semibold text-lg mb-4">Edit IP settings</h3>
                        <div className="space-y-3 mb-6">
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">IPv4 address</label>
                                <input className="w-full border p-2 rounded text-sm text-black" value={tempIp.ip} onChange={e => setTempIp({...tempIp, ip: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Subnet mask</label>
                                <input className="w-full border p-2 rounded text-sm text-black" value={tempIp.sub} onChange={e => setTempIp({...tempIp, sub: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Gateway</label>
                                <input className="w-full border p-2 rounded text-sm text-black" value={tempIp.gate} onChange={e => setTempIp({...tempIp, gate: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Preferred DNS</label>
                                <input className="w-full border p-2 rounded text-sm text-black" value={tempIp.dns} onChange={e => setTempIp({...tempIp, dns: e.target.value})} />
                            </div>
                        </div>
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setEditIp(false)} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-sm text-black">Cancel</button>
                            <button onClick={() => { setIpConfig(tempIp); setEditIp(false); }} className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">Save</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const TerminalApp = ({ onBsod }: { onBsod: () => void }) => {
    const [lines, setLines] = useState<string[]>(["Microsoft Windows [Version 10.0.22621.1]", "(c) Microsoft Corporation. All rights reserved.", ""]);
    const [input, setInput] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    const handleKeyDown = async (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            const cmd = input.trim().toLowerCase();
            const newLines = [...lines, `C:\\Users\\User>${input}`];
            
            // Immediate update for user input
            setLines(newLines);
            setInput("");

            const addToLines = (line: string) => {
                setLines(prev => [...prev, line]);
            };

            const wait = (ms: number) => new Promise(r => setTimeout(r, ms));

            if (cmd === 'cls') { setLines([]); return; }
            else if (cmd === 'help') { addToLines("DIR, CLS, ECHO, VER, BSOD, EXIT, IPCONFIG, SYSTEMINFO, PING"); }
            else if (cmd === 'ver') { addToLines("Microsoft Windows [Version 10.0.22621.1]"); }
            else if (cmd === 'dir') { addToLines(" Directory of C:\\Users\\User"); addToLines("01/01/2025 <DIR> ."); addToLines("01/01/2025 <DIR> .."); addToLines("01/01/2025 <DIR> Documents"); }
            else if (cmd === 'bsod') { onBsod(); return; }
            else if (cmd === 'ipconfig') { 
                addToLines(""); 
                addToLines("Windows IP Configuration");
                addToLines("");
                addToLines("Ethernet adapter Ethernet:");
                addToLines("   Connection-specific DNS Suffix  . : winsim.local");
                addToLines("   IPv4 Address. . . . . . . . . . . : 192.168.1.105");
                addToLines("   Subnet Mask . . . . . . . . . . . : 255.255.255.0");
                addToLines("   Default Gateway . . . . . . . . . : 192.168.1.1");
                addToLines("   DNS Servers . . . . . . . . . . . : 8.8.8.8");
            }
            else if (cmd.startsWith('ping ')) {
                const host = input.split(' ')[1];
                if (!host) {
                    addToLines("Usage: ping <hostname>");
                } else {
                    const validHosts = ['google.com', 'microsoft.com', 'facebook.com', 'localhost', '127.0.0.1'];
                    const ipMap: Record<string, string> = {
                        'google.com': '142.250.190.46',
                        'microsoft.com': '20.112.250.133',
                        'facebook.com': '157.240.22.35',
                        'localhost': '127.0.0.1',
                        '127.0.0.1': '127.0.0.1'
                    };
                    const ip = ipMap[host.toLowerCase()] || '1.1.1.1';
                    
                    addToLines("");
                    addToLines(`Pinging ${host} [${ip}] with 32 bytes of data:`);
                    
                    for(let i=0; i<4; i++) {
                        await wait(800 + Math.random() * 400);
                        const time = Math.floor(Math.random() * 20 + 10);
                        addToLines(`Reply from ${ip}: bytes=32 time=${time}ms TTL=115`);
                    }
                    
                    addToLines("");
                    addToLines(`Ping statistics for ${ip}:`);
                    addToLines("    Packets: Sent = 4, Received = 4, Lost = 0 (0% loss),");
                    addToLines("Approximate round trip times in milli-seconds:");
                    addToLines("    Minimum = 10ms, Maximum = 35ms, Average = 22ms");
                }
            }
            else if (cmd === 'systeminfo') {
                 addToLines("");
                 addToLines("Host Name:                 DESKTOP-WINSIM");
                 addToLines("OS Name:                   Microsoft Windows 11 Pro");
                 addToLines("OS Version:                10.0.22621 N/A Build 22621");
                 addToLines("OS Manufacturer:           Microsoft Corporation");
                 addToLines("System Manufacturer:       WinSim Virtual Systems");
                 addToLines("System Type:               x64-based PC");
                 addToLines("Processor(s):              1 Processor(s) Installed.");
            }
            else if (cmd.startsWith('echo ')) { addToLines(input.substring(5)); }
            else if (cmd) { addToLines(`'${cmd.split(' ')[0]}' is not recognized.`); }
            
            addToLines("");
        }
    };

    return (
        <div className="flex flex-col h-full bg-black text-gray-200 font-mono text-sm p-2" onClick={() => inputRef.current?.focus()}>
            <div className="flex-1 overflow-y-auto">
                {lines.map((l, i) => <div key={i} className="whitespace-pre-wrap">{l}</div>)}
                <div className="flex">
                    <span>C:\Users\User&gt;</span>
                    <input ref={inputRef} type="text" value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown} className="flex-1 bg-transparent border-none outline-none ml-1 text-gray-200" autoFocus />
                </div>
            </div>
        </div>
    )
}

const ExplorerApp = ({ onBsod, onRun }: { onBsod: () => void, onRun: (file: string) => void }) => {
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
        "Downloads": [
            { name: "OfficeSetup.exe", type: "application", icon: <Download className="text-blue-500" size={32}/>, action: 'office-setup' }
        ],
        "Users": [{ name: "User", type: "folder", icon: <Folder className="text-yellow-500" size={32}/> }]
    };

    const [fileSystem, setFileSystem] = useState(initialFS);

    const currentFolder = path[path.length - 1];
    const items = fileSystem[currentFolder] || [];

    const handleNavigate = (item: any) => {
        if (item.type === 'file' || item.type === 'application') {
            if (item.action) onRun(item.action);
            return; 
        }
        setPath([...path, item.name]);
        setSelectedItem(null);
    };

    const handleDelete = () => {
        if (!selectedItem) return;
        
        // Critical System Failure Simulation
        if (currentFolder === "System32" && (selectedItem === "hal.dll" || selectedItem === "kernel32.dll" || selectedItem === "ntoskrnl.exe")) {
            onBsod();
            return;
        }

        // Standard deletion logic
        const newItems = items.filter((i: any) => i.name !== selectedItem);
        setFileSystem({ ...fileSystem, [currentFolder]: newItems });
        setSelectedItem(null);
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

// --- MAIN COMPONENT ---

export const Desktop: React.FC<DesktopProps> = ({ username = "User", onRestart }) => {
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
    const [officeInstalled, setOfficeInstalled] = useState(false);
    
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
        alert("Microsoft Office has been installed successfully!");
    };

    // App Launchers
    const launchSettings = () => openWindow('settings', 'Settings', <Settings size={18} className="text-gray-500"/>, <SettingsApp bgImage={bgImage} setBgImage={setBgImage} theme={theme} setTheme={setTheme}/>);
    const launchCalc = () => openWindow('calc', 'Calculator', <Calculator size={18} className="text-orange-500"/>, <CalculatorApp />, 320, 480);
    const launchNotepad = () => openWindow('notepad', 'Notepad', <FileText size={18} className="text-blue-500"/>, <NotepadApp theme={theme} />, 600, 400);
    const launchTerminal = () => openWindow('cmd', 'Command Prompt', <Terminal size={18} className="text-gray-500"/>, <TerminalApp onBsod={() => setBsod(true)}/>, 600, 350);
    const launchExplorer = () => openWindow('pc', 'File Explorer', <Folder size={18} className="text-yellow-500"/>, <ExplorerApp onBsod={() => setBsod(true)} onRun={handleRunCmd}/>, 800, 500);
    const launchPaint = () => openWindow('paint', 'Paint', <Palette size={18} className="text-purple-500"/>, <PaintApp/>, 800, 600);
    const launchRegEdit = () => openWindow('regedit', 'Registry Editor', <Database size={18} className="text-blue-400"/>, <RegEditApp />, 800, 500);
    const launchMinesweeper = () => openWindow('minesweeper', 'Minesweeper', <Bomb size={18} className="text-black"/>, <MinesweeperApp />, 300, 360);
    const launchSecurity = () => openWindow('security', 'Windows Security', <Shield size={18} className="text-blue-600"/>, <SecurityApp />, 800, 500);
    const launchMail = () => openWindow('mail', 'Mail', <Mail size={18} className="text-blue-500"/>, <MailApp />, 800, 500);
    
    // New Office Apps
    const launchWord = () => openWindow('word', 'Word', <FileText size={18} className="text-blue-700"/>, <WordApp />, 900, 600);
    const launchExcel = () => openWindow('excel', 'Excel', <Grid3X3 size={18} className="text-green-700"/>, <ExcelApp />, 900, 600);
    const launchPowerPoint = () => openWindow('ppt', 'PowerPoint', <Projector size={18} className="text-orange-600"/>, <PowerPointApp />, 900, 600);
    const launchOfficeSetup = () => openWindow('office-setup', 'Office Installer', <Download size={18} className="text-orange-600"/>, <OfficeInstallerApp onComplete={handleOfficeInstall} />, 400, 200);

    const launchEdge = () => openWindow('edge', 'Microsoft Edge', <div className="font-bold text-blue-500">e</div>, <BrowserApp/>, 1000, 600);
    
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
        else if (c === 'word' || c === 'winword') { if (officeInstalled) launchWord(); else alert("Word is not installed."); }
        else if (c === 'excel') { if (officeInstalled) launchExcel(); else alert("Excel is not installed."); }
        else if (c === 'powerpoint' || c === 'powerpnt') { if (officeInstalled) launchPowerPoint(); else alert("PowerPoint is not installed."); }
        else if (c === 'office-setup') launchOfficeSetup();
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

                <div onClick={launchSettings} className="flex flex-col items-center group cursor-pointer p-2 hover:bg-white/10 rounded border border-transparent hover:border-white/10 w-24">
                    <div className="w-8 h-8 bg-gray-600 rounded flex items-center justify-center text-white drop-shadow-md"><Settings size={20}/></div>
                    <span className="text-white text-xs mt-1 text-center drop-shadow-md text-shadow">Settings</span>
                </div>

                 <div onClick={launchVSCode} className="flex flex-col items-center group cursor-pointer p-2 hover:bg-white/10 rounded border border-transparent hover:border-white/10 w-24">
                    <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white drop-shadow-md"><Code size={20}/></div>
                    <span className="text-white text-xs mt-1 text-center drop-shadow-md text-shadow">VS Code</span>
                </div>
                
                <div onClick={launchMinesweeper} className="flex flex-col items-center group cursor-pointer p-2 hover:bg-white/10 rounded border border-transparent hover:border-white/10 w-24">
                    <div className="w-8 h-8 bg-white border border-gray-400 rounded flex items-center justify-center text-white drop-shadow-md"><Bomb size={24} className="text-black"/></div>
                    <span className="text-white text-xs mt-1 text-center drop-shadow-md text-shadow">Minesweeper</span>
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
                                 <div onClick={launchPaint} className={`flex flex-col items-center gap-2 p-2 rounded cursor-pointer transition-colors ${itemHoverClass}`}>
                                     <div className="w-10 h-10 bg-white border border-gray-300 rounded flex items-center justify-center text-purple-600"><Palette/></div>
                                     <div className="text-[11px]">Paint</div>
                                 </div>
                                  <div onClick={launchTerminal} className={`flex flex-col items-center gap-2 p-2 rounded cursor-pointer transition-colors ${itemHoverClass}`}>
                                     <div className="w-10 h-10 bg-black text-gray-200 border border-gray-600 rounded flex items-center justify-center"><Terminal/></div>
                                     <div className="text-[11px]">Terminal</div>
                                 </div>
                                 <div onClick={launchVSCode} className={`flex flex-col items-center gap-2 p-2 rounded cursor-pointer transition-colors ${itemHoverClass}`}>
                                     <div className="w-10 h-10 bg-blue-600 text-white rounded flex items-center justify-center"><Code/></div>
                                     <div className="text-[11px]">VS Code</div>
                                 </div>
                                 <div onClick={launchSecurity} className={`flex flex-col items-center gap-2 p-2 rounded cursor-pointer transition-colors ${itemHoverClass}`}>
                                     <div className="w-10 h-10 bg-blue-700 text-white rounded flex items-center justify-center"><Shield/></div>
                                     <div className="text-[11px]">Security</div>
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
                             </div>
                         </div>
                         <div className={`w-1/3 border-l pl-6 flex flex-col ${isDark ? 'border-[#444]' : ''}`}>
                             <div className="font-semibold mb-4 text-sm">Recommended</div>
                             <div className="space-y-4">
                                 <div className={`flex gap-3 items-center p-2 rounded cursor-pointer ${itemHoverClass}`}>
                                     <FileText className="text-gray-400" size={20}/>
                                     <div className="text-xs">
                                         <div className="font-semibold">Project_Notes.txt</div>
                                         <div className="text-gray-500">10m ago</div>
                                     </div>
                                 </div>
                                 <div className={`flex gap-3 items-center p-2 rounded cursor-pointer ${itemHoverClass}`}>
                                     <ImageIcon className="text-gray-400" size={20}/>
                                     <div className="text-xs">
                                         <div className="font-semibold">Screenshot_1.png</div>
                                         <div className="text-gray-500">2h ago</div>
                                     </div>
                                 </div>
                             </div>
                         </div>
                    </div>
                    
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
                                 <button onClick={() => onRestart()} className="w-full text-left px-4 py-2 hover:bg-[#3D3D3D] flex items-center gap-2 text-xs"><Moon size={12}/> Sleep</button>
                                 <button onClick={() => onRestart()} className="w-full text-left px-4 py-2 hover:bg-[#3D3D3D] flex items-center gap-2 text-xs"><Power size={12}/> Shut down</button>
                                 <button onClick={() => onRestart()} className="w-full text-left px-4 py-2 hover:bg-[#3D3D3D] flex items-center gap-2 text-xs"><RefreshCcw size={12}/> Restart</button>
                             </div>
                         </div>
                    </div>
                </div>
            )}
            
            {/* Calendar Flyout */}
            {calendarOpen && (
                <div className={`absolute bottom-12 right-2 backdrop-blur-xl border w-80 h-96 rounded-lg shadow-2xl p-4 flex flex-col animate-in slide-in-from-bottom-10 duration-200 z-[10000] ${flyoutClass}`} onClick={e => e.stopPropagation()}>
                    <div className="flex justify-between items-center mb-4">
                        <span className="font-semibold">{time.toLocaleDateString([], {weekday: 'long', month: 'long', day: 'numeric'})}</span>
                        <div className="flex gap-2 text-gray-500">
                             <ChevronUp size={16} className="rotate-180"/>
                             <ChevronUp size={16}/>
                        </div>
                    </div>
                    <div className="grid grid-cols-7 gap-1 text-center text-xs mb-2 text-gray-500">
                        <span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span>
                    </div>
                    <div className="grid grid-cols-7 gap-1 text-center text-sm flex-1 content-start">
                         {[...Array(5)].map((_, i) => <span key={`e-${i}`} className="text-gray-300">{27+i}</span>)}
                         {[...Array(30)].map((_, i) => (
                             <span key={i} className={`p-2 rounded-full cursor-pointer ${i+1 === time.getDate() ? 'bg-blue-500 text-white hover:bg-blue-600' : (isDark ? 'hover:bg-[#444]' : 'hover:bg-gray-200')}`}>
                                 {i+1}
                             </span>
                         ))}
                    </div>
                </div>
            )}

            {/* Quick Settings Flyout */}
            {quickSettingsOpen && <QuickSettings isDark={isDark} setIsDark={(v) => setTheme(v ? 'dark' : 'light')} bgImage={bgImage} />}

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
                    <div className={`w-1 h-8 border-l mx-1 ${isDark ? 'border-[#444]' : 'border-gray-300'}`}></div>
                     <div className={`p-2 rounded cursor-pointer ${itemHoverClass}`} onClick={() => { playSound('notification'); playSound('click'); }}><Bell size={16}/></div>
                     <div className="w-1.5 h-full hover:border-l hover:border-gray-400/50 flex items-end justify-end cursor-pointer group">
                         <div className="w-full h-full opacity-0 group-hover:opacity-100 bg-white/20 backdrop-blur-[1px]"></div>
                     </div>
                </div>
            </div>
        </div>
    );
};