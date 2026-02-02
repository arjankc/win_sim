import React, { useState, useEffect, useRef } from 'react';
import { 
    Monitor, Wifi, Volume2, Battery, Search, X, Minus, Square, Settings, 
    Image as ImageIcon, Calculator, FileText, Power, Calendar as CalendarIcon, 
    ChevronUp, Bell, Code, Info, Moon, RefreshCcw, Folder, Terminal, ArrowLeft, 
    HardDrive, Activity, Palette, Play, Cpu, Layers, Database, ChevronRight, ChevronDown, Trash2
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
    type: string; // 'app' | 'system'
}

// --- APP COMPONENTS ---

const BrowserApp = () => {
    const [url, setUrl] = useState("https://www.bing.com");
    const [inputValue, setInputValue] = useState("https://www.bing.com");
    const [page, setPage] = useState("home"); // home | google | error

    const navigate = (e: React.FormEvent) => {
        e.preventDefault();
        let target = inputValue.toLowerCase();
        if (!target.startsWith('http')) target = 'https://' + target;
        
        setUrl(target);
        if (target.includes("google")) setPage("google");
        else if (target.includes("bing")) setPage("home");
        else setPage("error");
    };

    return (
        <div className="flex flex-col h-full bg-white text-black font-sans">
            {/* Toolbar */}
            <div className="flex items-center gap-2 p-2 border-b bg-gray-50">
                <button className="p-1 hover:bg-gray-200 rounded text-gray-600"><ArrowLeft size={16}/></button>
                <button className="p-1 hover:bg-gray-200 rounded text-gray-600"><RefreshCcw size={14}/></button>
                <form onSubmit={navigate} className="flex-1">
                    <input 
                        className="w-full border border-gray-300 rounded-full px-4 py-1.5 text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all" 
                        value={inputValue} 
                        onChange={e=>setInputValue(e.target.value)} 
                        onFocus={(e) => e.target.select()}
                    />
                </form>
            </div>
            {/* Content */}
            <div className="flex-1 overflow-auto p-0 relative">
                {page === 'home' && (
                     <div className="flex flex-col items-center justify-center h-full bg-[url('https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=2000&q=80')] bg-cover bg-center">
                         <div className="bg-black/10 backdrop-blur-sm p-10 rounded-xl flex flex-col items-center w-full h-full justify-center">
                            <h1 className="text-6xl font-bold text-white mb-8 drop-shadow-lg">Bing</h1>
                            <div className="w-[600px] flex border-2 border-white/50 rounded-full shadow-2xl overflow-hidden p-3 bg-white">
                                <input className="flex-1 outline-none ml-2 text-lg" placeholder="Search the web" />
                                <Search className="text-blue-500 mr-2" size={24} />
                            </div>
                         </div>
                     </div>
                )}
                {page === 'google' && (
                    <div className="flex flex-col items-center justify-center h-full bg-white">
                         <div className="text-6xl font-bold mb-8 flex gap-1">
                             <span className="text-blue-500">G</span>
                             <span className="text-red-500">o</span>
                             <span className="text-yellow-500">o</span>
                             <span className="text-blue-500">g</span>
                             <span className="text-green-500">l</span>
                             <span className="text-red-500">e</span>
                         </div>
                         <div className="w-[500px] flex border border-gray-200 hover:shadow-md rounded-full p-3 bg-white transition-shadow">
                            <Search className="text-gray-400 ml-2" />
                            <input className="flex-1 outline-none ml-3" />
                         </div>
                         <div className="mt-8 flex gap-4">
                             <button className="bg-gray-50 border border-transparent hover:border-gray-200 hover:shadow-sm px-4 py-2 text-sm text-gray-800 rounded">Google Search</button>
                             <button className="bg-gray-50 border border-transparent hover:border-gray-200 hover:shadow-sm px-4 py-2 text-sm text-gray-800 rounded">I'm Feeling Lucky</button>
                         </div>
                    </div>
                )}
                {page === 'error' && (
                    <div className="flex flex-col items-center justify-center h-full text-gray-600 bg-[#f8f9fa]">
                        <span className="text-6xl mb-4 text-gray-400">:(</span>
                        <h2 className="text-2xl font-semibold mb-2">Hmm, we can't reach this page.</h2>
                        <p className="text-sm">Check if there is a typo in {url}</p>
                    </div>
                )}
            </div>
        </div>
    )
}

const RegEditApp = () => {
    const [selectedKey, setSelectedKey] = useState("Computer");
    const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set(["Computer"]));

    const toggleExpand = (key: string) => {
        const newSet = new Set(expandedKeys);
        if (newSet.has(key)) newSet.delete(key);
        else newSet.add(key);
        setExpandedKeys(newSet);
    };

    const treeData = {
        name: "Computer",
        children: [
            {
                name: "HKEY_CLASSES_ROOT",
                children: [{ name: ".exe" }, { name: "Directory" }]
            },
            {
                name: "HKEY_CURRENT_USER",
                children: [
                    { name: "Control Panel", children: [{ name: "Desktop" }, { name: "Mouse" }] },
                    { name: "Software", children: [{ name: "Microsoft" }, { name: "WinSim" }] }
                ]
            },
            {
                name: "HKEY_LOCAL_MACHINE",
                children: [
                    { name: "HARDWARE" },
                    { name: "SAM" },
                    { 
                        name: "SOFTWARE", 
                        children: [
                            { name: "Microsoft", children: [{ name: "Windows NT", children: [{ name: "CurrentVersion" }] }] }
                        ] 
                    },
                    { name: "SYSTEM" }
                ]
            },
            { name: "HKEY_USERS" },
            { name: "HKEY_CURRENT_CONFIG" }
        ]
    };

    const renderTree = (node: any, path: string = "") => {
        const currentPath = path ? `${path}\\${node.name}` : node.name;
        const isExpanded = expandedKeys.has(currentPath);
        const isSelected = selectedKey === currentPath;

        return (
            <div key={currentPath} className="select-none">
                <div 
                    className={`flex items-center gap-1 px-1 py-0.5 hover:bg-blue-50 cursor-default ${isSelected ? 'bg-blue-100 border border-blue-200' : 'border border-transparent'}`}
                    onClick={(e) => { e.stopPropagation(); setSelectedKey(currentPath); }}
                >
                    {node.children ? (
                        <div onClick={(e) => { e.stopPropagation(); toggleExpand(currentPath); }} className="p-0.5 hover:bg-gray-200 rounded">
                            {isExpanded ? <ChevronDown size={12} className="text-gray-500"/> : <ChevronRight size={12} className="text-gray-500"/>}
                        </div>
                    ) : <div className="w-4"/>}
                    <Folder size={14} className="text-yellow-500 fill-yellow-500"/>
                    <span className="text-xs truncate">{node.name}</span>
                </div>
                {isExpanded && node.children && (
                    <div className="pl-4 border-l border-gray-300 border-dotted ml-2">
                        {node.children.map((child: any) => renderTree(child, currentPath))}
                    </div>
                )}
            </div>
        );
    };

    const mockValues: Record<string, any[]> = {
        "Computer\\HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion": [
            { name: "(Default)", type: "REG_SZ", data: "(value not set)" },
            { name: "ProductName", type: "REG_SZ", data: "Windows 11 Pro" },
            { name: "CurrentBuild", type: "REG_SZ", data: "22621" },
            { name: "RegisteredOwner", type: "REG_SZ", data: "User" },
            { name: "SystemRoot", type: "REG_SZ", data: "C:\\Windows" },
        ],
        "Computer\\HKEY_CURRENT_USER\\Control Panel\\Desktop": [
            { name: "Wallpaper", type: "REG_SZ", data: "C:\\Windows\\Web\\Wallpaper\\Theme1\\img1.jpg" },
            { name: "CursorBlinkRate", type: "REG_SZ", data: "530" },
        ]
    };

    return (
        <div className="flex flex-col h-full bg-white text-xs font-sans">
             <div className="flex gap-1 p-1 border-b border-gray-200 bg-gray-50 text-gray-600">
                 <span>File</span> <span>Edit</span> <span>View</span> <span>Favorites</span> <span>Help</span>
             </div>
             <div className="border-b border-gray-200 bg-white p-1 flex items-center gap-1 text-gray-500">
                 <Monitor size={12}/>
                 <input className="w-full outline-none text-xs text-gray-700" value={selectedKey} readOnly/>
             </div>
             <div className="flex-1 flex overflow-hidden">
                 <div className="w-1/3 border-r border-gray-200 overflow-y-auto p-1 bg-white">
                     {renderTree(treeData)}
                 </div>
                 <div className="flex-1 bg-white overflow-y-auto">
                     <div className="grid grid-cols-[1fr_100px_1fr] gap-1 px-2 py-1 border-b border-gray-100 text-gray-500">
                         <div>Name</div>
                         <div>Type</div>
                         <div>Data</div>
                     </div>
                     {(mockValues[selectedKey] || [{ name: "(Default)", type: "REG_SZ", data: "(value not set)" }]).map((val, i) => (
                         <div key={i} className="grid grid-cols-[1fr_100px_1fr] gap-1 px-2 py-0.5 hover:bg-blue-50 cursor-default group">
                             <div className="flex items-center gap-2">
                                <span className="text-red-500 font-bold text-[10px]">ab</span>
                                {val.name}
                             </div>
                             <div>{val.type}</div>
                             <div className="truncate">{val.data}</div>
                         </div>
                     ))}
                 </div>
             </div>
             <div className="bg-gray-50 border-t border-gray-200 px-2 py-0.5 text-gray-500">
                 {selectedKey}
             </div>
        </div>
    )
}

const NotepadApp = ({ theme }: { theme: 'light' | 'dark' }) => (
    <div className={`flex flex-col h-full font-sans ${theme === 'dark' ? 'bg-[#2b2b2b] text-white' : 'bg-white text-black'}`}>
        <div className={`flex text-xs border-b select-none ${theme === 'dark' ? 'border-[#444] bg-[#333]' : 'border-gray-200 bg-white'}`}>
            <span className={`px-2 py-1 cursor-default ${theme === 'dark' ? 'hover:bg-[#444]' : 'hover:bg-gray-100'}`}>File</span>
            <span className={`px-2 py-1 cursor-default ${theme === 'dark' ? 'hover:bg-[#444]' : 'hover:bg-gray-100'}`}>Edit</span>
            <span className={`px-2 py-1 cursor-default ${theme === 'dark' ? 'hover:bg-[#444]' : 'hover:bg-gray-100'}`}>Format</span>
            <span className={`px-2 py-1 cursor-default ${theme === 'dark' ? 'hover:bg-[#444]' : 'hover:bg-gray-100'}`}>View</span>
            <span className={`px-2 py-1 cursor-default ${theme === 'dark' ? 'hover:bg-[#444]' : 'hover:bg-gray-100'}`}>Help</span>
        </div>
        <textarea 
            className={`flex-1 resize-none border-none outline-none p-1 font-mono text-sm overflow-auto ${theme === 'dark' ? 'bg-[#1e1e1e] text-gray-200' : 'bg-white text-black'}`}
            spellCheck={false} 
            autoFocus
            placeholder="Type something..."
        />
        <div className={`border-t px-2 py-0.5 text-xs text-right select-none flex justify-between ${theme === 'dark' ? 'bg-[#333] border-[#444] text-gray-400' : 'bg-gray-50 border-gray-200 text-gray-500'}`}>
            <span>UTF-8</span>
            <span>Ln 1, Col 1</span>
        </div>
    </div>
);

const PaintApp = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [color, setColor] = useState('#000000');
    const [size, setSize] = useState(2);
    const [isDrawing, setIsDrawing] = useState(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            canvas.width = canvas.parentElement?.clientWidth || 600;
            canvas.height = canvas.parentElement?.clientHeight || 400;
            const ctx = canvas.getContext('2d');
            if(ctx) {
                ctx.fillStyle = "white";
                ctx.fillRect(0,0,canvas.width, canvas.height);
            }
        }
    }, []);

    const startDraw = (e: React.MouseEvent) => {
        setIsDrawing(true);
        draw(e);
    };
    
    const stopDraw = () => {
        setIsDrawing(false);
        const ctx = canvasRef.current?.getContext('2d');
        if (ctx) ctx.beginPath();
    };

    const draw = (e: React.MouseEvent) => {
        if (!isDrawing) return;
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;

        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        ctx.lineWidth = size;
        ctx.lineCap = 'round';
        ctx.strokeStyle = color;

        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, y);
    };

    return (
        <div className="flex flex-col h-full bg-[#f0f0f0]">
             <div className="h-24 bg-[#f5f6f7] border-b border-gray-300 flex items-center px-4 gap-6 select-none">
                 <div className="flex flex-col gap-2">
                     <span className="text-xs text-gray-500 text-center">Brushes</span>
                     <div className="flex gap-1">
                        {[2, 4, 6, 8, 12].map(s => (
                            <button key={s} onClick={() => setSize(s)} className={`w-8 h-8 rounded border flex items-center justify-center ${size === s ? 'bg-blue-200 border-blue-400' : 'bg-white border-gray-300'}`}>
                                <div className="bg-black rounded-full" style={{width: s, height: s}}></div>
                            </button>
                        ))}
                     </div>
                 </div>
                 <div className="w-px h-16 bg-gray-300"></div>
                 <div className="flex flex-col gap-2">
                     <span className="text-xs text-gray-500 text-center">Colors</span>
                     <div className="grid grid-cols-5 gap-1">
                        {['#000000', '#7f7f7f', '#880015', '#ed1c24', '#ff7f27', '#fff200', '#22b14c', '#00a2e8', '#3f48cc', '#a349a4'].map(c => (
                            <button key={c} onClick={() => setColor(c)} className={`w-6 h-6 border ${color === c ? 'ring-2 ring-blue-400 z-10' : 'border-gray-400'}`} style={{backgroundColor: c}}></button>
                        ))}
                     </div>
                 </div>
             </div>
             <div className="flex-1 overflow-hidden bg-gray-200 p-4 relative cursor-crosshair">
                 <canvas 
                    ref={canvasRef}
                    onMouseDown={startDraw}
                    onMouseUp={stopDraw}
                    onMouseLeave={stopDraw}
                    onMouseMove={draw}
                    className="bg-white shadow-lg"
                 />
             </div>
        </div>
    )
}

const TaskManagerApp = ({ openWindows, onCloseWindow, onBsod }: { openWindows: DesktopWindow[], onCloseWindow: (id: string) => void, onBsod: () => void }) => {
    const [activeTab, setActiveTab] = useState('processes');
    const [cpuHistory, setCpuHistory] = useState<number[]>(new Array(40).fill(0));
    const [selectedId, setSelectedId] = useState<string | null>(null);

    // Mock CPU Graph
    useEffect(() => {
        const interval = setInterval(() => {
            setCpuHistory(prev => {
                const newVal = Math.random() * 30 + 10; // 10-40% usage random
                const newHist = [...prev.slice(1), newVal];
                return newHist;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const systemProcesses = [
        { id: 'sys1', title: 'System', type: 'system', icon: <Settings size={14}/>, mem: '124 MB', cpu: '1.2%' },
        { id: 'sys2', title: 'Desktop Window Manager', type: 'system', icon: <Layers size={14}/>, mem: '450 MB', cpu: '5.4%' },
        { id: 'sys3', title: 'Windows Explorer', type: 'system', icon: <Folder size={14}/>, mem: '80 MB', cpu: '0.1%' },
        { id: 'sys4', title: 'Service Host: Local System', type: 'system', icon: <Settings size={14}/>, mem: '32 MB', cpu: '0.0%' },
    ];

    const allProcs = [
        ...openWindows.map(w => ({ id: w.id, title: w.title, type: 'app', icon: w.icon, mem: `${Math.floor(Math.random() * 200 + 50)} MB`, cpu: '0.5%' })),
        ...systemProcesses
    ];

    const handleEndTask = () => {
        if (!selectedId) return;
        if (selectedId.startsWith('sys')) {
             if(selectedId === 'sys3') {
                // Kill explorer - could reload desktop, but for sim let's just do nothing or flicker
                alert("Windows Explorer restarting...");
             } else {
                 playSound('error');
                 onBsod(); // Kill system process = BSOD
             }
        } else {
            onCloseWindow(selectedId);
        }
    };

    return (
        <div className="flex flex-col h-full bg-white text-sm font-sans select-none">
            <div className="flex gap-1 p-2 border-b border-gray-200 text-xs">
                <button onClick={() => setActiveTab('processes')} className={`px-3 py-1 rounded hover:bg-gray-100 ${activeTab === 'processes' ? 'bg-gray-200 font-semibold' : ''}`}>Processes</button>
                <button onClick={() => setActiveTab('performance')} className={`px-3 py-1 rounded hover:bg-gray-100 ${activeTab === 'performance' ? 'bg-gray-200 font-semibold' : ''}`}>Performance</button>
            </div>
            
            {activeTab === 'processes' && (
                <>
                <div className="flex bg-gray-50 border-b border-gray-200 text-xs text-gray-500 py-1 px-2">
                    <div className="flex-1">Name</div>
                    <div className="w-16 text-right">CPU</div>
                    <div className="w-20 text-right">Memory</div>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {allProcs.map(p => (
                        <div 
                            key={p.id} 
                            onClick={() => setSelectedId(p.id)}
                            className={`flex items-center px-2 py-1 gap-2 cursor-default ${selectedId === p.id ? 'bg-blue-100' : 'hover:bg-gray-50'}`}
                        >
                            <div className="flex-1 flex items-center gap-2 truncate">
                                <span className="text-gray-500">{p.icon}</span>
                                <span>{p.title}</span>
                            </div>
                            <div className="w-16 text-right text-gray-600">{p.cpu}</div>
                            <div className="w-20 text-right text-gray-600">{p.mem}</div>
                        </div>
                    ))}
                </div>
                <div className="p-2 border-t border-gray-200 flex justify-end bg-gray-50">
                    <button 
                        onClick={handleEndTask}
                        disabled={!selectedId}
                        className="px-4 py-1.5 bg-white border border-gray-300 hover:bg-gray-100 disabled:opacity-50 text-xs rounded shadow-sm"
                    >
                        End task
                    </button>
                </div>
                </>
            )}

            {activeTab === 'performance' && (
                <div className="flex h-full">
                    <div className="w-32 bg-gray-50 border-r border-gray-200 p-2 flex flex-col gap-2">
                        <div className="bg-blue-50 border border-blue-200 p-2 rounded cursor-pointer">
                            <div className="font-bold text-blue-700 text-xs">CPU</div>
                            <div className="text-xl font-light">{cpuHistory[cpuHistory.length-1].toFixed(0)}%</div>
                        </div>
                        <div className="p-2 rounded hover:bg-gray-100 cursor-pointer text-gray-600">
                             <div className="font-bold text-xs">Memory</div>
                             <div className="text-sm">4.2/16.0 GB</div>
                        </div>
                    </div>
                    <div className="flex-1 p-4 flex flex-col">
                         <div className="flex justify-between items-end mb-2">
                             <div className="text-lg">CPU</div>
                             <div className="text-xs text-gray-500">Virtual CPU @ 3.50GHz</div>
                         </div>
                         <div className="flex-1 border border-gray-300 bg-white relative">
                             <div className="absolute inset-0 flex items-end">
                                 <svg className="w-full h-full" preserveAspectRatio="none">
                                     <polyline 
                                        fill="none" 
                                        stroke="#0078D7" 
                                        strokeWidth="1" 
                                        points={cpuHistory.map((val, i) => `${(i / (cpuHistory.length - 1)) * 100},${100 - val}`).join(' ')} 
                                        vectorEffect="non-scaling-stroke"
                                     />
                                     <polygon 
                                        fill="#0078D7" 
                                        fillOpacity="0.1" 
                                        points={`0,100 ${cpuHistory.map((val, i) => `${(i / (cpuHistory.length - 1)) * 100},${100 - val}`).join(' ')} 100,100`} 
                                     />
                                 </svg>
                             </div>
                             {/* Grid lines */}
                             <div className="absolute inset-0 grid grid-cols-4 grid-rows-4 pointer-events-none">
                                 {[...Array(16)].map((_, i) => <div key={i} className="border-r border-b border-gray-100 border-dashed"></div>)}
                             </div>
                         </div>
                         <div className="flex justify-between text-xs text-gray-400 mt-1">
                             <span>60 seconds</span>
                             <span>0</span>
                         </div>
                    </div>
                </div>
            )}
        </div>
    )
}

const CalculatorApp = () => {
    // ... (Existing Calculator Code - no changes needed for logic, styled nicely already)
    const [display, setDisplay] = useState('0');
    const [prev, setPrev] = useState<string | null>(null);
    const [op, setOp] = useState<string | null>(null);
    const [newNum, setNewNum] = useState(true);
    const handleNum = (n: string) => { if (newNum) { setDisplay(n); setNewNum(false); } else { setDisplay(display === '0' ? n : display + n); } };
    const handleOp = (o: string) => { setPrev(display); setOp(o); setNewNum(true); };
    const handleEq = () => { if (!prev || !op) return; const cur = parseFloat(display); const p = parseFloat(prev); let res = 0; if (op === '+') res = p + cur; if (op === '-') res = p - cur; if (op === '*') res = p * cur; if (op === '/') res = p / cur; setDisplay(res.toString().slice(0, 12)); setOp(null); setPrev(null); setNewNum(true); };
    const handleClear = () => { setDisplay('0'); setPrev(null); setOp(null); setNewNum(true); };
    const btnClass = "flex items-center justify-center bg-white hover:bg-gray-100 rounded text-sm font-medium border border-gray-100 transition-colors active:bg-gray-200";
    const opClass = "flex items-center justify-center bg-gray-50 hover:bg-gray-200 rounded text-sm font-medium border border-gray-100 transition-colors";
    const eqClass = "flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white rounded text-sm font-medium transition-colors";
    return (
        <div className="h-full bg-[#F3F3F3] flex flex-col p-2 select-none text-black">
            <div className="h-16 mb-2 flex items-end justify-end text-3xl font-light px-2 overflow-hidden">{display}</div>
            <div className="flex-1 grid grid-cols-4 gap-1">
                <button onClick={handleClear} className={`${opClass} col-span-2`}>C</button>
                <button className={opClass}>%</button>
                <button onClick={() => handleOp('/')} className={opClass}>÷</button>
                <button onClick={() => handleNum('7')} className={btnClass}>7</button>
                <button onClick={() => handleNum('8')} className={btnClass}>8</button>
                <button onClick={() => handleNum('9')} className={btnClass}>9</button>
                <button onClick={() => handleOp('*')} className={opClass}>×</button>
                <button onClick={() => handleNum('4')} className={btnClass}>4</button>
                <button onClick={() => handleNum('5')} className={btnClass}>5</button>
                <button onClick={() => handleNum('6')} className={btnClass}>6</button>
                <button onClick={() => handleOp('-')} className={opClass}>-</button>
                <button onClick={() => handleNum('1')} className={btnClass}>1</button>
                <button onClick={() => handleNum('2')} className={btnClass}>2</button>
                <button onClick={() => handleNum('3')} className={btnClass}>3</button>
                <button onClick={() => handleOp('+')} className={opClass}>+</button>
                <button onClick={() => handleNum('0')} className={`${btnClass} col-span-2`}>0</button>
                <button onClick={() => handleNum('.')} className={btnClass}>.</button>
                <button onClick={handleEq} className={eqClass}>=</button>
            </div>
        </div>
    );
};

const SettingsApp = ({ bgImage, setBgImage, theme, setTheme }: { bgImage: string, setBgImage: (url: string) => void, theme: 'light'|'dark', setTheme: (t: 'light'|'dark') => void }) => {
    const [tab, setTab] = useState('system');
    const wallpapers = [
        'https://picsum.photos/1920/1080?random=1',
        'https://picsum.photos/1920/1080?random=2',
        'https://picsum.photos/1920/1080?random=3',
        'https://picsum.photos/1920/1080?random=4',
    ];

    const isDark = theme === 'dark';
    const bgClass = isDark ? 'bg-[#202020] text-white' : 'bg-[#F0F0F0] text-black';
    const cardClass = isDark ? 'bg-[#2b2b2b] border-[#444]' : 'bg-white border-gray-200';

    return (
        <div className={`flex h-full text-sm ${bgClass}`}>
            <div className={`w-48 border-r p-4 flex flex-col gap-1 ${isDark ? 'border-[#333] bg-[#2b2b2b]' : 'border-gray-200 bg-white'}`}>
                <div className="mb-4 font-bold text-lg px-2">Settings</div>
                <button onClick={() => setTab('system')} className={`text-left px-3 py-2 rounded ${tab === 'system' ? (isDark ? 'bg-[#333]' : 'bg-gray-100') : 'hover:opacity-70'}`}>System</button>
                <button onClick={() => setTab('personalization')} className={`text-left px-3 py-2 rounded ${tab === 'personalization' ? (isDark ? 'bg-[#333]' : 'bg-gray-100') : 'hover:opacity-70'}`}>Personalization</button>
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
            </div>
        </div>
    );
};

const TerminalApp = ({ onBsod }: { onBsod: () => void }) => {
    const [lines, setLines] = useState<string[]>(["Microsoft Windows [Version 10.0.22621.1]", "(c) Microsoft Corporation. All rights reserved.", ""]);
    const [input, setInput] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            const cmd = input.trim().toLowerCase();
            const newLines = [...lines, `C:\\Users\\User>${input}`];
            if (cmd === 'cls') { setLines([]); setInput(""); return; }
            else if (cmd === 'help') { newLines.push("DIR, CLS, ECHO, VER, COLOR, BSOD, EXIT, IPCONFIG, SYSTEMINFO"); }
            else if (cmd === 'ver') { newLines.push("Microsoft Windows [Version 10.0.22621.1]"); }
            else if (cmd === 'dir') { newLines.push(" Directory of C:\\Users\\User"); newLines.push("01/01/2025 <DIR> ."); newLines.push("01/01/2025 <DIR> .."); newLines.push("01/01/2025 <DIR> Documents"); }
            else if (cmd === 'bsod') { onBsod(); return; }
            else if (cmd === 'ipconfig') { 
                newLines.push(""); 
                newLines.push("Windows IP Configuration");
                newLines.push("");
                newLines.push("Ethernet adapter Ethernet:");
                newLines.push("   Connection-specific DNS Suffix  . : winsim.local");
                newLines.push("   IPv4 Address. . . . . . . . . . . : 192.168.1.105");
                newLines.push("   Subnet Mask . . . . . . . . . . . : 255.255.255.0");
                newLines.push("   Default Gateway . . . . . . . . . : 192.168.1.1");
            }
            else if (cmd === 'systeminfo') {
                 newLines.push("");
                 newLines.push("Host Name:                 DESKTOP-WINSIM");
                 newLines.push("OS Name:                   Microsoft Windows 11 Pro");
                 newLines.push("OS Version:                10.0.22621 N/A Build 22621");
                 newLines.push("OS Manufacturer:           Microsoft Corporation");
                 newLines.push("System Manufacturer:       WinSim Virtual Systems");
                 newLines.push("System Type:               x64-based PC");
                 newLines.push("Processor(s):              1 Processor(s) Installed.");
            }
            else if (cmd.startsWith('echo ')) { newLines.push(input.substring(5)); }
            else if (cmd) { newLines.push(`'${cmd.split(' ')[0]}' is not recognized.`); }
            newLines.push("");
            setLines(newLines);
            setInput("");
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

const ExplorerApp = ({ onBsod }: { onBsod: () => void }) => {
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

    const currentFolder = path[path.length - 1];
    const items = fileSystem[currentFolder] || [];

    const handleNavigate = (item: any) => {
        if (item.type === 'file') return; // Open file logic later
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
        <div className="flex flex-col h-full bg-white text-black font-sans text-sm">
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
                        <span className="text-center text-xs group-hover:text-blue-600 truncate w-full">{item.name}</span>
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
        <div className="fixed bottom-10 left-4 w-96 bg-[#F0F0F0] border border-[#1883D7] shadow-xl z-[10002] p-4 text-sm font-sans rounded-sm animate-in slide-in-from-bottom-5 zoom-in-95">
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
                    className="flex-1 border border-gray-300 p-1 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
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
    const [time, setTime] = useState(new Date());
    const [windows, setWindows] = useState<DesktopWindow[]>([]);
    const [bgImage, setBgImage] = useState('https://picsum.photos/1920/1080');
    const [contextMenu, setContextMenu] = useState<{x: number, y: number} | null>(null);
    const [theme, setTheme] = useState<'light'|'dark'>('light');
    const [bsod, setBsod] = useState(false);
    const [runOpen, setRunOpen] = useState(false);
    
    // Dragging State
    const [dragState, setDragState] = useState<{id: string, startX: number, startY: number, initX: number, initY: number} | null>(null);

    // Initial apps launch
    useEffect(() => {
        // Startup sound
        setTimeout(() => playSound('startup'), 500);

        const timer = setInterval(() => setTime(new Date()), 1000);
        generateWelcomeMessage(username).then(setWelcomeMsg);
        
        const handleClickOutside = () => {
            setContextMenu(null);
            setStartMenuOpen(false);
            setCalendarOpen(false);
        };

        const handleGlobalKey = (e: KeyboardEvent) => {
            // Win + R
            if ((e.metaKey || e.ctrlKey) && e.key === 'r') {
                e.preventDefault();
                setRunOpen(prev => !prev);
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

    // BSOD Effect
    useEffect(() => {
        if (bsod) {
            playSound('error');
            const t = setTimeout(onRestart, 5000);
            return () => clearTimeout(t);
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

    const openWindow = (id: string, title: string, icon: React.ReactNode, content: React.ReactNode, width = 800, height = 500) => {
        playSound('window-open');
        if (windows.find(w => w.id === id)) {
            setWindows(prev => prev.map(w => w.id === id ? { ...w, zIndex: Math.max(...prev.map(ww => ww.zIndex), 0) + 1, minimized: false } : w));
            return;
        }
        const newZ = windows.length > 0 ? Math.max(...windows.map(w => w.zIndex)) + 1 : 1;
        setWindows(prev => [...prev, { 
            id, title, icon, content, width, height,
            x: 100 + (prev.length * 30), 
            y: 50 + (prev.length * 30), 
            zIndex: newZ, 
            minimized: false,
            maximized: false,
            type: 'app'
        }]);
    };

    const closeWindow = (id: string) => {
        setWindows(prev => prev.filter(w => w.id !== id));
    };

    const startDrag = (e: React.MouseEvent, id: string, x: number, y: number) => {
        e.preventDefault();
        setWindows(prev => prev.map(w => w.id === id ? { ...w, zIndex: Math.max(...prev.map(ww => ww.zIndex)) + 1 } : w));
        setDragState({ id, startX: e.clientX, startY: e.clientY, initX: x, initY: y });
    };

    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault();
        setContextMenu({ x: e.clientX, y: e.clientY });
    };

    // App Launchers
    const launchSettings = () => openWindow('settings', 'Settings', <Settings size={18} className="text-gray-500"/>, <SettingsApp bgImage={bgImage} setBgImage={setBgImage} theme={theme} setTheme={setTheme}/>);
    const launchCalc = () => openWindow('calc', 'Calculator', <Calculator size={18} className="text-orange-500"/>, <CalculatorApp />, 320, 480);
    const launchNotepad = () => openWindow('notepad', 'Notepad', <FileText size={18} className="text-blue-500"/>, <NotepadApp theme={theme} />, 600, 400);
    const launchTerminal = () => openWindow('cmd', 'Command Prompt', <Terminal size={18} className="text-gray-500"/>, <TerminalApp onBsod={() => setBsod(true)}/>, 600, 350);
    const launchExplorer = () => openWindow('pc', 'File Explorer', <Folder size={18} className="text-yellow-500"/>, <ExplorerApp onBsod={() => setBsod(true)}/>, 800, 500);
    const launchPaint = () => openWindow('paint', 'Paint', <Palette size={18} className="text-purple-500"/>, <PaintApp/>, 800, 600);
    const launchTaskMgr = () => openWindow('taskmgr', 'Task Manager', <Activity size={18} className="text-green-600"/>, <TaskManagerApp openWindows={windows} onCloseWindow={closeWindow} onBsod={() => setBsod(true)}/>, 600, 450);
    const launchRegEdit = () => openWindow('regedit', 'Registry Editor', <Database size={18} className="text-blue-400"/>, <RegEditApp />, 800, 500);

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
        else if (c === 'winver') {
            openWindow('winver', 'About Windows', <Info size={18} className="text-blue-500"/>, (
                <div className="p-8 bg-white h-full flex flex-col gap-4">
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
                        left: win.x, 
                        top: win.y, 
                        width: win.width, 
                        height: win.height, 
                        zIndex: win.zIndex 
                    }}
                    onMouseDown={(e) => {
                         setWindows(prev => prev.map(w => w.id === win.id ? { ...w, zIndex: Math.max(...prev.map(ww => ww.zIndex)) + 1 } : w));
                    }}
                >
                    <div 
                        className={`px-3 py-2 flex justify-between items-center select-none border-b cursor-default ${isDark ? 'bg-[#2b2b2b] border-[#444]' : 'bg-white border-gray-200'}`}
                        onMouseDown={(e) => startDrag(e, win.id, win.x, win.y)}
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
                            <button className={`p-1.5 rounded-sm transition-colors ${isDark ? 'hover:bg-[#444] text-gray-400' : 'hover:bg-gray-200 text-gray-500'}`}><Square size={12}/></button>
                            <button 
                                onClick={() => closeWindow(win.id)}
                                className={`p-1.5 hover:bg-red-500 hover:text-white rounded-sm transition-colors ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
                            >
                                <X size={14}/>
                            </button>
                        </div>
                    </div>
                    <div className="flex-1 overflow-hidden relative cursor-auto">
                        {win.content}
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

            {/* Taskbar */}
            <div className={`absolute bottom-0 w-full h-12 backdrop-blur-md flex items-center justify-between px-4 z-[10001] border-t ${taskbarClass}`}>
                <div className="flex items-center gap-2 h-full">
                    <button 
                        onClick={(e) => { e.stopPropagation(); setStartMenuOpen(!startMenuOpen); setCalendarOpen(false); playSound('click'); }}
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
                    <div className={`flex gap-2 px-2 py-1 rounded cursor-pointer ${itemHoverClass}`} onClick={() => playSound('click')}>
                        <Wifi size={16}/>
                        <Volume2 size={16}/>
                        <Battery size={16}/>
                    </div>
                    <div 
                        onClick={(e) => { e.stopPropagation(); setCalendarOpen(!calendarOpen); setStartMenuOpen(false); playSound('click'); }}
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