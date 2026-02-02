import React, { useState, useEffect, useRef } from 'react';
import { InstallState } from '../../types';
import { Loader2, Mic, User, Wifi, WifiOff, Globe, Lock, Shield, Eye, Keyboard, RefreshCcw, ChevronDown, Check, Speaker, Monitor, HardDrive, Cpu, Cog, AlertTriangle, ArrowLeft } from 'lucide-react';
import { playSound } from '../../services/soundService';

interface OOBEProps {
  state: InstallState;
  onNext: (newState: InstallState, data?: any) => void;
}

export const OOBE: React.FC<OOBEProps> = ({ state, onNext }) => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [connectingWifi, setConnectingWifi] = useState<string | null>(null);
    const [showLimitedSetup, setShowLimitedSetup] = useState(false);
    const [wifiPassword, setWifiPassword] = useState("");
    const [selectedNetwork, setSelectedNetwork] = useState<string | null>(null);

    // -- Region --
    if (state === InstallState.OOBE_REGION) {
        return (
            <div className="w-full h-full bg-[#004275] text-white flex flex-col items-center justify-center p-8 overflow-hidden relative">
                 <div className="absolute top-0 right-0 w-1/2 h-full bg-white opacity-5 transform skew-x-12 translate-x-20"></div>

                 <div className="z-10 max-w-2xl w-full">
                    <h1 className="text-4xl font-light mb-8">Let's start with region. Is this right?</h1>
                    
                    <div className="h-96 overflow-y-auto bg-black/20 backdrop-blur-sm border border-white/10 rounded-lg p-2 custom-scrollbar">
                         {['United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'France', 'Japan', 'South Korea', 'Brazil'].map(country => (
                             <button key={country} onClick={() => playSound('click')} className={`w-full text-left p-4 hover:bg-white/10 transition-colors flex items-center gap-4 ${country === 'United States' ? 'bg-white/20' : ''}`}>
                                <span className="text-lg">{country}</span>
                             </button>
                         ))}
                    </div>

                    <div className="flex justify-end mt-8 gap-4">
                        <button 
                            onClick={() => { playSound('click'); onNext(InstallState.OOBE_KEYBOARD); }}
                            className="px-8 py-2 bg-[#0078D7] hover:bg-[#006CC1] transition-colors text-white font-semibold rounded-sm shadow-md"
                        >
                            Yes
                        </button>
                    </div>
                 </div>
                 
                 <div className="absolute bottom-8 left-8 flex items-center gap-4 text-gray-300">
                     <button className="p-2 rounded-full border border-gray-400 hover:bg-white/10" onClick={() => playSound('click')}><Mic size={20}/></button>
                 </div>
            </div>
        );
    }

    // -- Keyboard --
    if (state === InstallState.OOBE_KEYBOARD) {
        return (
            <div className="w-full h-full bg-[#004275] text-white flex flex-col items-center justify-center p-8 overflow-hidden relative">
                 <div className="absolute top-0 right-0 w-1/2 h-full bg-white opacity-5 transform skew-x-12 translate-x-20"></div>

                 <div className="z-10 max-w-2xl w-full">
                    <h1 className="text-4xl font-light mb-8">Is this the right keyboard layout?</h1>
                    
                    <div className="h-96 overflow-y-auto bg-black/20 backdrop-blur-sm border border-white/10 rounded-lg p-2 custom-scrollbar">
                         {['US', 'UK', 'Canadian Multilingual Standard', 'French', 'German', 'Japanese', 'Korean'].map(layout => (
                             <button key={layout} onClick={() => playSound('click')} className={`w-full text-left p-4 hover:bg-white/10 transition-colors flex items-center gap-4 ${layout === 'US' ? 'bg-white/20' : ''}`}>
                                <Keyboard size={24} className="opacity-70"/>
                                <span className="text-lg">{layout}</span>
                             </button>
                         ))}
                    </div>

                    <div className="flex justify-between mt-8">
                         <button 
                            onClick={() => { playSound('click'); onNext(InstallState.OOBE_NETWORK); }}
                            className="px-8 py-2 border border-white/50 hover:bg-white/10 transition-colors text-white font-semibold rounded-sm"
                        >
                            Skip
                        </button>
                        <button 
                            onClick={() => { playSound('click'); onNext(InstallState.OOBE_NETWORK); }}
                            className="px-8 py-2 bg-[#0078D7] hover:bg-[#006CC1] transition-colors text-white font-semibold rounded-sm shadow-md"
                        >
                            Yes
                        </button>
                    </div>
                 </div>
            </div>
        );
    }

    // -- Network --
    if (state === InstallState.OOBE_NETWORK) {
        const handleNetworkClick = (ssid: string, secure: boolean) => {
            playSound('click');
            if (secure) {
                setSelectedNetwork(ssid);
                setWifiPassword("");
            } else {
                connect(ssid);
            }
        };

        const connect = (ssid: string) => {
             setSelectedNetwork(null);
             setConnectingWifi(ssid);
             setTimeout(() => {
                setConnectingWifi(null);
                onNext(InstallState.OOBE_UPDATES);
             }, 3000);
        };

        if (showLimitedSetup) {
             return (
                <div className="w-full h-full bg-[#004275] text-white flex flex-col items-center justify-center p-8 overflow-hidden relative">
                    <div className="z-10 max-w-2xl w-full flex gap-8">
                        <div className="w-1/2">
                            <h1 className="text-3xl font-light mb-4">You'll lose out on a lot of features</h1>
                            <p className="text-gray-300 mb-4 text-sm">If you continue with limited setup, you won't be able to sign in with a Microsoft account, get the latest security updates, or use cloud storage.</p>
                            <p className="text-gray-300 text-sm">We recommend connecting to a network now to get the full experience.</p>
                        </div>
                        <div className="w-1/2 flex flex-col justify-center items-start gap-4 border-l border-white/10 pl-8">
                             <button 
                                onClick={() => setShowLimitedSetup(false)}
                                className="px-6 py-2 bg-[#0078D7] hover:bg-[#006CC1] shadow-md w-full text-left flex items-center justify-between group"
                             >
                                <span>Connect now</span> <Wifi size={16}/>
                             </button>
                             <button 
                                onClick={() => {
                                    playSound('click');
                                    // SKIP UPDATES if limited setup
                                    onNext(InstallState.OOBE_USER);
                                }}
                                className="px-6 py-2 border border-white/30 hover:bg-white/10 w-full text-left text-sm"
                             >
                                Continue with limited setup
                             </button>
                        </div>
                    </div>
                </div>
             );
        }

        return (
            <div className="w-full h-full bg-[#004275] text-white flex flex-col items-center justify-center p-8 overflow-hidden relative">
                 <div className="absolute top-0 right-0 w-1/2 h-full bg-white opacity-5 transform skew-x-12 translate-x-20"></div>

                 {selectedNetwork && (
                     <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in">
                         <div className="bg-[#003055] p-6 rounded-lg shadow-xl w-96 border border-white/10">
                             <h3 className="text-xl mb-4 font-light">{selectedNetwork}</h3>
                             <p className="mb-2 text-sm text-gray-300">Enter the network security key</p>
                             <input 
                                type="password" 
                                autoFocus
                                value={wifiPassword}
                                onChange={(e) => setWifiPassword(e.target.value)}
                                className="w-full bg-white/10 border border-white/30 p-2 mb-4 focus:outline-none focus:border-blue-400"
                             />
                             <div className="flex justify-end gap-2">
                                 <button onClick={() => setSelectedNetwork(null)} className="px-4 py-1.5 border border-white/30 hover:bg-white/10">Cancel</button>
                                 <button 
                                    onClick={() => connect(selectedNetwork)} 
                                    disabled={wifiPassword.length < 4}
                                    className="px-4 py-1.5 bg-[#0078D7] hover:bg-[#006CC1] disabled:opacity-50"
                                 >
                                     Next
                                 </button>
                             </div>
                         </div>
                     </div>
                 )}

                 <div className="z-10 max-w-2xl w-full flex gap-12">
                    <div className="w-1/2">
                        <h1 className="text-4xl font-light mb-4">Let's connect you to a network</h1>
                        <p className="text-gray-300 mb-8">You'll need an internet connection to finish setting up your device.</p>
                        <Globe size={120} className="text-white/20"/>
                    </div>
                    
                    <div className="w-1/2 h-96 flex flex-col">
                        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2">
                             {[
                                 {ssid: 'Home WiFi 5G', strength: 4, secure: true},
                                 {ssid: 'Neighbor_Network', strength: 2, secure: true},
                                 {ssid: 'CoffeeShop_Guest', strength: 3, secure: false},
                                 {ssid: 'Hidden Network', strength: 0, secure: true}
                             ].map((net, i) => (
                                 <button 
                                    key={i} 
                                    onClick={() => handleNetworkClick(net.ssid, net.secure)}
                                    className="w-full text-left p-4 hover:bg-white/10 transition-colors flex items-center justify-between group"
                                 >
                                    <div className="flex items-center gap-4">
                                        <Wifi size={20}/>
                                        <span className="text-lg">{net.ssid}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {net.secure && <Lock size={14} className="text-gray-400"/>}
                                        {connectingWifi === net.ssid && <Loader2 className="animate-spin" size={16}/>}
                                    </div>
                                 </button>
                             ))}
                        </div>
                        
                        <div className="mt-8 pt-4 border-t border-white/20">
                            <button 
                                onClick={() => { playSound('click'); setShowLimitedSetup(true); }}
                                className="text-sm text-gray-300 hover:text-white flex items-center gap-2"
                            >
                                <WifiOff size={16}/>
                                I don't have internet
                            </button>
                            <p className="text-xs text-gray-400 mt-2">Skipping network connection will limit your setup experience.</p>
                        </div>
                    </div>
                 </div>
            </div>
        );
    }

    // -- Checking for Updates --
    if (state === InstallState.OOBE_UPDATES) {
        return <UpdateCheck onComplete={() => onNext(InstallState.OOBE_USER)}/>;
    }

    // -- User Account --
    if (state === InstallState.OOBE_USER) {
        return (
            <div className="w-full h-full bg-[#004275] text-white flex flex-col items-center justify-center p-8 overflow-hidden relative">
                 <div className="absolute top-0 right-0 w-1/2 h-full bg-white opacity-5 transform skew-x-12 translate-x-20"></div>

                 <div className="z-10 max-w-md w-full">
                    <h1 className="text-3xl font-light mb-2">Who's going to use this PC?</h1>
                    
                    <div className="space-y-6 mt-8">
                        <div className="relative">
                            <input 
                                type="text" 
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="NAME"
                                className="w-full bg-transparent border-b-2 border-white/50 py-2 text-2xl placeholder-white/50 focus:outline-none focus:border-white transition-colors"
                            />
                        </div>
                        
                        <div className="relative">
                            <input 
                                type="password" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="PASSWORD (OPTIONAL)"
                                className="w-full bg-transparent border-b-2 border-white/50 py-2 text-2xl placeholder-white/50 focus:outline-none focus:border-white transition-colors"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end mt-12 gap-4">
                        <button 
                            disabled={!username}
                            onClick={() => {
                                playSound('click');
                                if (password.length > 0) {
                                    onNext(InstallState.OOBE_SECURITY_QUESTIONS, { username });
                                } else {
                                    onNext(InstallState.OOBE_PRIVACY, { username });
                                }
                            }}
                            className="px-8 py-2 bg-[#0078D7] hover:bg-[#006CC1] disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-white font-semibold rounded-sm shadow-md"
                        >
                            Next
                        </button>
                    </div>
                 </div>
            </div>
        )
    }

    // -- Security Questions --
    if (state === InstallState.OOBE_SECURITY_QUESTIONS) {
        return <SecurityQuestionsStep onNext={() => onNext(InstallState.OOBE_JUST_A_MOMENT)} />;
    }

    // -- Just A Moment --
    if (state === InstallState.OOBE_JUST_A_MOMENT) {
        return <JustAMoment onNext={() => onNext(InstallState.OOBE_PIN)} />;
    }

    // -- PIN Setup --
    if (state === InstallState.OOBE_PIN) {
        return <PinSetupStep onNext={() => onNext(InstallState.OOBE_PRIVACY)} />;
    }

    // -- Privacy Settings --
    if (state === InstallState.OOBE_PRIVACY) {
        return (
            <div className="w-full h-full bg-[#004275] text-white flex flex-col items-center justify-center p-8 overflow-hidden relative">
                 <div className="absolute top-0 right-0 w-1/2 h-full bg-white opacity-5 transform skew-x-12 translate-x-20"></div>

                 <div className="z-10 w-full max-w-5xl h-[80vh] flex flex-col">
                    <h1 className="text-3xl font-light mb-8 text-center">Choose privacy settings for your device</h1>
                    
                    <div className="flex-1 overflow-y-auto grid grid-cols-3 gap-6 p-4">
                         {[
                             { icon: <Globe/>, title: "Location", desc: "Get location-based experiences like directions and weather." },
                             { icon: <Shield/>, title: "Find My Device", desc: "Use your device's location data to help you find your device if you lose it." },
                             { icon: <Eye/>, title: "Diagnostic data", desc: "Send diagnostic data to Microsoft to help keep your device secure and up to date." },
                             { icon: <User/>, title: "Inking & Typing", desc: "Send inking and typing data to Microsoft to improve the language recognition and suggestion capabilities." },
                             { icon: <Globe/>, title: "Tailored experiences", desc: "Let Microsoft use your diagnostic data to offer you personalized tips, ads, and recommendations." },
                             { icon: <Shield/>, title: "Advertising ID", desc: "Let apps use advertising ID to provide more interesting advertising to you." },
                         ].map((item, i) => (
                             <div key={i} className="bg-white/10 p-6 rounded-sm flex flex-col gap-4">
                                 <div className="flex items-center gap-3 text-xl">
                                     {item.icon} {item.title}
                                 </div>
                                 <p className="text-sm text-gray-300 flex-1">{item.desc}</p>
                                 <div className="flex bg-white/20 rounded-full p-1 w-32 relative cursor-pointer" onClick={(e) => {
                                     playSound('click');
                                     const t = e.currentTarget;
                                     t.classList.toggle('justify-end');
                                 }}>
                                     <div className="w-1/2 h-6 bg-white rounded-full shadow-sm"></div>
                                 </div>
                             </div>
                         ))}
                    </div>

                    <div className="flex justify-end mt-8 gap-4 pt-4 border-t border-white/10">
                        <button 
                            onClick={() => { playSound('click'); onNext(InstallState.GETTING_READY); }}
                            className="px-8 py-2 bg-[#0078D7] hover:bg-[#006CC1] transition-colors text-white font-semibold rounded-sm shadow-md"
                        >
                            Accept
                        </button>
                    </div>
                 </div>
            </div>
        )
    }

    // -- Getting Ready --
    if (state === InstallState.GETTING_READY) {
        return <GettingReadyAnimation />;
    }

    // -- Driver Setup (New) --
    if (state === InstallState.DRIVER_SETUP) {
        return <DriverSetupStep onNext={() => onNext(InstallState.DESKTOP)} />;
    }

    return null;
}

const UpdateCheck = ({ onComplete }: { onComplete: () => void }) => {
    const [failed, setFailed] = useState(false);
    
    // 30% failure chance initially, persisted for this mount
    const shouldFail = useRef(Math.random() < 0.3);
    const retryCount = useRef(0);

    const check = () => {
        setFailed(false);
        setTimeout(() => {
            if (shouldFail.current && retryCount.current < 1) {
                setFailed(true);
                retryCount.current++;
                playSound('error');
            } else {
                onComplete();
            }
        }, 3000 + Math.random() * 2000);
    };

    useEffect(() => {
        check();
    }, []);

    if (failed) {
        return (
            <div className="w-full h-full bg-[#004275] text-white flex flex-col items-center justify-center p-8">
                <AlertTriangle size={64} className="text-yellow-400 mb-8" />
                <div className="text-3xl font-light mb-4">Something went wrong</div>
                <div className="text-xl text-gray-300 font-light mb-8 text-center max-w-lg">
                    We couldn't connect to the update service. You can try again, or skip for now. Error code: OOBEIDPS.
                </div>
                <div className="flex gap-4">
                     <button onClick={() => onComplete()} className="px-6 py-2 border border-white/30 hover:bg-white/10 transition-colors">Skip</button>
                     <button onClick={check} className="px-6 py-2 bg-[#0078D7] hover:bg-[#006CC1] shadow-lg">Try again</button>
                </div>
            </div>
        )
    }

    return (
        <div className="w-full h-full bg-[#004275] text-white flex flex-col items-center justify-center p-8">
            <Loader2 className="animate-spin mb-8 text-white/80" size={64}/>
            <div className="text-3xl font-light mb-2">Checking for updates</div>
            <div className="text-xl text-gray-300 font-light">This might take a few minutes</div>
        </div>
    );
};

const JustAMoment = ({ onNext }: { onNext: () => void }) => {
    useEffect(() => {
        const t = setTimeout(onNext, 2500);
        return () => clearTimeout(t);
    }, [onNext]);

    return (
        <div className="w-full h-full bg-[#004275] text-white flex flex-col items-center justify-center p-8">
            <Loader2 className="animate-spin mb-8 text-white/80" size={64}/>
            <div className="text-3xl font-light mb-2">Just a moment...</div>
        </div>
    );
}

const SecurityQuestionsStep = ({ onNext }: { onNext: () => void }) => {
    const questions = [
        "What was your first pet's name?",
        "What is the name of the city where you were born?",
        "What was your childhood nickname?",
        "What is the name of your first school?",
        "What's the name of the first cousin you met?",
        "What's the first name of your oldest nephew?"
    ];

    const [q1, setQ1] = useState(questions[0]);
    const [a1, setA1] = useState("");
    const [q2, setQ2] = useState(questions[1]);
    const [a2, setA2] = useState("");
    const [q3, setQ3] = useState(questions[2]);
    const [a3, setA3] = useState("");

    const isValid = a1.length > 0 && a2.length > 0 && a3.length > 0;

    const renderField = (idx: number, q: string, setQ: any, a: string, setA: any) => (
        <div className="mb-6">
            <label className="block text-sm mb-2 opacity-80">Security question {idx} of 3</label>
            <div className="relative mb-2">
                <select 
                    value={q} 
                    onChange={(e) => setQ(e.target.value)} 
                    onClick={() => playSound('click')}
                    className="w-full bg-white text-black p-2 pr-8 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                    {questions.map((ques, i) => <option key={i} value={ques}>{ques}</option>)}
                </select>
                <ChevronDown className="absolute right-2 top-2.5 text-gray-500 pointer-events-none" size={16}/>
            </div>
            <input 
                type="text" 
                value={a} 
                onChange={(e) => setA(e.target.value)} 
                placeholder="Your answer"
                className="w-full bg-white text-black p-2 focus:outline-none focus:ring-2 focus:ring-blue-400 border-t border-gray-200"
            />
        </div>
    );

    return (
        <div className="w-full h-full bg-[#004275] text-white flex flex-col items-center justify-center p-8 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-1/2 h-full bg-white opacity-5 transform skew-x-12 translate-x-20"></div>
            <div className="z-10 max-w-md w-full">
                <h1 className="text-3xl font-light mb-6">Create security questions for this account</h1>
                <p className="mb-8 opacity-80">In case you forget your password, these questions will help you reset it.</p>
                
                {renderField(1, q1, setQ1, a1, setA1)}
                {renderField(2, q2, setQ2, a2, setA2)}
                {renderField(3, q3, setQ3, a3, setA3)}

                <div className="flex justify-end mt-8">
                    <button 
                        disabled={!isValid}
                        onClick={() => { playSound('click'); onNext(); }}
                        className="px-8 py-2 bg-[#0078D7] hover:bg-[#006CC1] disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-white font-semibold rounded-sm shadow-md"
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
};

const PinSetupStep = ({ onNext }: { onNext: () => void }) => {
    const [pin, setPin] = useState("");
    const [confirm, setConfirm] = useState("");

    return (
        <div className="w-full h-full bg-[#004275] text-white flex flex-col items-center justify-center p-8 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-1/2 h-full bg-white opacity-5 transform skew-x-12 translate-x-20"></div>
            <div className="z-10 max-w-md w-full">
                <div className="mb-6">
                    <Shield size={48} className="text-white mb-4"/>
                    <h1 className="text-3xl font-light mb-2">Create a PIN</h1>
                    <p className="opacity-80">Create a PIN to sign in to this device. It's faster and more secure than a password.</p>
                </div>

                <div className="space-y-4 mb-8">
                    <input 
                        type="password" 
                        value={pin}
                        onChange={(e) => setPin(e.target.value)}
                        placeholder="New PIN"
                        className="w-full bg-white text-black p-2 border-b-2 border-transparent focus:border-blue-500 focus:outline-none"
                    />
                    <input 
                        type="password" 
                        value={confirm}
                        onChange={(e) => setConfirm(e.target.value)}
                        placeholder="Confirm PIN"
                        className="w-full bg-white text-black p-2 border-b-2 border-transparent focus:border-blue-500 focus:outline-none"
                    />
                    <div className="flex items-center gap-2 text-sm opacity-80 mt-2">
                        <input type="checkbox" id="letters" className="w-4 h-4"/>
                        <label htmlFor="letters">Include letters and symbols</label>
                    </div>
                </div>

                <div className="flex justify-end gap-4">
                     <button 
                        onClick={() => { playSound('click'); onNext(); }}
                        className="px-8 py-2 border border-white/30 hover:bg-white/10 transition-colors text-white font-semibold rounded-sm"
                    >
                        Skip
                    </button>
                    <button 
                        disabled={pin.length < 4 || pin !== confirm}
                        onClick={() => { playSound('click'); onNext(); }}
                        className="px-8 py-2 bg-[#0078D7] hover:bg-[#006CC1] disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-white font-semibold rounded-sm shadow-md"
                    >
                        OK
                    </button>
                </div>
            </div>
        </div>
    )
}

const GettingReadyAnimation = () => {
    const [text, setText] = useState("Hi");
    const [bgColor, setBgColor] = useState("bg-black");

    useEffect(() => {
        const sequence = [
            { t: "Hi", c: "bg-black", d: 2000 },
            { t: "We're getting everything ready for you", c: "bg-[#004275]", d: 3000 },
            { t: "This might take a few minutes", c: "bg-[#002050]", d: 4000 },
            { t: "Don't turn off your PC", c: "bg-[#001030]", d: 4000 },
            { t: "Almost there", c: "bg-black", d: 2000 },
        ];

        let currentIndex = 0;
        
        const run = () => {
            if (currentIndex >= sequence.length) return;
            const step = sequence[currentIndex];
            setText(step.t);
            setBgColor(step.c);
            currentIndex++;
            setTimeout(run, step.d);
        };

        run();
    }, []);

    return (
        <div className={`w-full h-full flex flex-col items-center justify-center transition-colors duration-[2000ms] ${bgColor}`}>
            <div className="text-center">
                <h1 className="text-4xl font-light text-white fade-in-out">{text}</h1>
            </div>
             {/* Subtle gradient overlay to mimic the authentic look */}
            <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/20 pointer-events-none"></div>
        </div>
    )
}

interface DriverInfo {
    id: string;
    name: string;
    icon: React.ReactNode;
    status: 'pending' | 'installing' | 'installed' | 'error';
}

const DriverSetupStep = ({ onNext }: { onNext: () => void }) => {
    const [drivers, setDrivers] = useState<DriverInfo[]>([]);
    const [isScanning, setIsScanning] = useState(false);
    const [scanComplete, setScanComplete] = useState(false);
    const [installing, setInstalling] = useState(false);
    const [screenFlash, setScreenFlash] = useState(false);
    const [globalError, setGlobalError] = useState(false);

    // 40% chance of GPU failure
    const shouldFailGpu = useRef(Math.random() < 0.4);

    const handleScan = () => {
        setIsScanning(true);
        playSound('click');
        setTimeout(() => {
            setDrivers([
                { id: 'gpu', name: 'WinSim Virtual Graphics Adapter', icon: <Monitor size={24}/>, status: 'pending' },
                { id: 'audio', name: 'High Definition Audio Device', icon: <Speaker size={24}/>, status: 'pending' },
                { id: 'net', name: 'WinSim Ethernet Controller', icon: <Wifi size={24}/>, status: 'pending' },
                { id: 'chip', name: 'Intel(R) Chipset Family', icon: <Cpu size={24}/>, status: 'pending' },
            ]);
            setIsScanning(false);
            setScanComplete(true);
            playSound('notification');
        }, 2000);
    };

    const installDrivers = async () => {
        setInstalling(true);
        setGlobalError(false);
        playSound('click');

        // Helper to update a driver status
        const updateStatus = (id: string, status: DriverInfo['status']) => {
            setDrivers(prev => prev.map(d => d.id === id ? { ...d, status } : d));
        };

        let hasError = false;

        for (let i = 0; i < drivers.length; i++) {
            const driver = drivers[i];
            
            // Skip already installed
            if (driver.status === 'installed') continue;
            
            updateStatus(driver.id, 'installing');
            
            await new Promise(r => setTimeout(r, 1500)); // Simulate install time
            
            // Special Effects
            if (driver.id === 'gpu') {
                if (shouldFailGpu.current) {
                    // Fail logic
                    setScreenFlash(true);
                    await new Promise(r => setTimeout(r, 200));
                    setScreenFlash(false);
                    updateStatus(driver.id, 'error');
                    hasError = true;
                    // Reset failure chance so next try succeeds
                    shouldFailGpu.current = false;
                    continue; // Stop chain or continue? Real windows usually continues others, but lets stop to show error
                }
                setScreenFlash(true);
                await new Promise(r => setTimeout(r, 200));
                setScreenFlash(false);
            } else if (driver.id === 'audio') {
                playSound('notification');
            }

            updateStatus(driver.id, 'installed');
        }

        setInstalling(false);
        if (!hasError) {
             setTimeout(onNext, 1000); // Auto advance after complete
        } else {
            playSound('error');
            setGlobalError(true);
        }
    };

    return (
        <div className="w-full h-full bg-[#004275] text-white flex flex-col items-center justify-center p-8 overflow-hidden relative">
            {screenFlash && <div className="absolute inset-0 bg-black z-[9999]"></div>}
            
            <div className="absolute top-0 right-0 w-1/2 h-full bg-white opacity-5 transform skew-x-12 translate-x-20"></div>

            <div className="z-10 max-w-2xl w-full flex flex-col items-center">
                 <div className="mb-8">
                    <Cog size={64} className={`text-white/80 ${isScanning || installing ? 'animate-spin' : ''}`} />
                 </div>
                 
                 <h1 className="text-3xl font-light mb-2 text-center">Let's set up your hardware</h1>
                 <p className="text-gray-300 mb-8 text-center max-w-md">Windows detects your hardware to ensure everything works smoothly.</p>

                 <div className="w-full bg-white/10 rounded-md border border-white/10 p-4 min-h-[300px] flex flex-col">
                     {!scanComplete && !isScanning && (
                         <div className="flex-1 flex flex-col items-center justify-center opacity-70">
                             <p className="mb-4">Click Scan to detect hardware changes.</p>
                             <button onClick={handleScan} className="px-6 py-2 bg-white/20 hover:bg-white/30 rounded-sm">Scan now</button>
                         </div>
                     )}
                     
                     {isScanning && (
                         <div className="flex-1 flex flex-col items-center justify-center">
                             <Loader2 size={32} className="animate-spin mb-4"/>
                             <p>Detecting hardware...</p>
                         </div>
                     )}

                     {scanComplete && (
                         <div className="flex-1 space-y-2">
                             {drivers.map(d => (
                                 <div key={d.id} className={`flex items-center gap-4 p-3 rounded-sm ${d.status === 'error' ? 'bg-red-500/20 border border-red-500/50' : 'bg-black/20'}`}>
                                     <div className="text-white/80">{d.icon}</div>
                                     <div className="flex-1 font-medium">{d.name}</div>
                                     <div className="w-32 text-right text-sm">
                                         {d.status === 'pending' && <span className="text-gray-400">Waiting...</span>}
                                         {d.status === 'installing' && <span className="text-blue-300 animate-pulse">Installing...</span>}
                                         {d.status === 'installed' && <span className="text-green-400 flex items-center justify-end gap-1"><Check size={14}/> Ready</span>}
                                         {d.status === 'error' && <span className="text-red-400 font-bold flex items-center justify-end gap-1"><AlertTriangle size={14}/> Failed</span>}
                                     </div>
                                 </div>
                             ))}
                         </div>
                     )}
                 </div>

                 {scanComplete && (
                     <div className="mt-8 flex gap-4 items-center">
                         {globalError && <span className="text-red-300 animate-pulse mr-4">Some drivers failed to install.</span>}
                         
                         <button 
                            disabled={installing}
                            onClick={() => onNext()} 
                            className="px-6 py-2 text-gray-300 hover:text-white disabled:opacity-50"
                         >
                             Skip for now
                         </button>
                         <button 
                            disabled={installing || drivers.every(d => d.status === 'installed')}
                            onClick={installDrivers} 
                            className="px-8 py-2 bg-[#0078D7] hover:bg-[#006CC1] disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-white font-semibold rounded-sm shadow-md"
                         >
                            {globalError ? 'Retry' : (drivers.every(d => d.status === 'installed') ? 'Done' : 'Install Drivers')}
                        </button>
                     </div>
                 )}
            </div>
        </div>
    )
}