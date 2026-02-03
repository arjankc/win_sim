import React, { useState, useEffect } from 'react';
import { InstallState, MediaConfig, BiosConfig } from './types';
import { MediaCreator } from './components/screens/MediaCreator';
import { Bios } from './components/screens/Bios';
import { SetupWizard } from './components/screens/SetupWizard';
import { OOBE } from './components/screens/OOBE';
import { Desktop } from './components/screens/Desktop';
import { ContextualHelp } from './components/ui/ContextualHelp';
import { AlertTriangle, Power, Maximize2, ChevronDown, Info } from 'lucide-react';
import { playSound } from './services/soundService';
import { SimulationProvider, useSimulation } from './contexts/SimulationContext';

// Toast Component
const ToastDisplay = () => {
    const { toasts } = useSimulation();
    if (toasts.length === 0) return null;

    return (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100000] flex flex-col gap-2 pointer-events-none">
            {toasts.map(t => (
                <div key={t.id} className="bg-black/80 backdrop-blur-md text-white px-4 py-2 rounded-full shadow-2xl flex items-center gap-2 animate-in slide-in-from-top-2 fade-in duration-300">
                    <Info size={16} className={t.type === 'simulation' ? "text-yellow-400" : "text-blue-400"} />
                    <span className="text-sm font-medium">{t.message}</span>
                </div>
            ))}
        </div>
    );
};

const AppContent: React.FC = () => {
  // Simulation State
  const [hasStarted, setHasStarted] = useState(false);
  const [startPoint, setStartPoint] = useState<InstallState>(InstallState.MEDIA_CREATOR);
  const [currentState, setCurrentState] = useState<InstallState>(InstallState.MEDIA_CREATOR);
  const [userData, setUserData] = useState<{username: string}>({ username: "User" });
  const [bootError, setBootError] = useState<string | null>(null);

  const [mediaConfig, setMediaConfig] = useState<MediaConfig | null>(null);
  const [biosConfig, setBiosConfig] = useState<BiosConfig>({
    bootMode: 'UEFI',
    secureBoot: true,
    usbBootEnabled: true,
    bootOrder: ['USB', 'HDD']
  });

  const { showToast } = useSimulation();

  // --- Full Screen / Start Logic ---

  const handlePowerOn = async () => {
    try {
        if (!document.fullscreenElement) {
            await document.documentElement.requestFullscreen();
        }
    } catch (err) {
        console.error("Error attempting to enable full-screen mode:", err);
    }
    
    // Auto-configure state if skipping steps
    if (startPoint !== InstallState.MEDIA_CREATOR) {
        // Assume valid media was created if we skip the creator
        if (!mediaConfig) {
            setMediaConfig({
                osVersion: 'Windows 11',
                partitionScheme: 'GPT',
                label: 'WINSIM_USB',
                isCreated: true
            });
        }
    }

    // Resume audio context if it was suspended (browser policy)
    playSound('click');
    setCurrentState(startPoint);
    setHasStarted(true);
  };

  // --- Logic Engine ---

  const checkBootCompatibility = () => {
    if (!mediaConfig || !mediaConfig.isCreated) {
      return "No bootable media found. Please insert a valid installation disk.";
    }

    if (!biosConfig.usbBootEnabled) {
      return "Boot device not found. (Hint: Check if USB Boot is enabled in BIOS)";
    }

    // Check Partition Scheme vs Boot Mode
    if (mediaConfig.partitionScheme === 'GPT' && biosConfig.bootMode === 'Legacy') {
        return "Selected boot device failed. \nReason: GPT formatted media requires UEFI Boot Mode.";
    }

    if (mediaConfig.partitionScheme === 'MBR' && biosConfig.bootMode === 'UEFI') {
        // Technically some UEFI have CSM, but for sim simplicity, we force match
        return "Selected boot device failed. \nReason: MBR formatted media requires Legacy Boot Mode (or CSM enabled).";
    }

    // Check Secure Boot compliance (Simulating that MBR/Legacy doesn't support Secure Boot usually)
    if (biosConfig.bootMode === 'Legacy' && biosConfig.secureBoot) {
       return "Secure Boot configuration error. \nReason: Secure Boot is enabled but system is in Legacy Mode.";
    }

    return null; // Success
  };

  // --- State Handlers ---

  const handleMediaCreated = (config: MediaConfig) => {
    setMediaConfig(config);
    setCurrentState(InstallState.BIOS_POST);
  };

  const handleBiosSave = (newConfig: BiosConfig) => {
      setBiosConfig(newConfig);
      setCurrentState(InstallState.BOOT_CHECK);
  };

  // --- Render Steps ---

  const renderSimulationContent = () => {
      // 0. Power On Screen (Landing Page)
      if (!hasStarted) {
          return (
              <div className="w-full h-full bg-[#111] flex flex-col items-center justify-center text-gray-300 font-sans select-none relative">
                  <div className="flex flex-col items-center z-10">
                      <div className="mb-8 relative group cursor-pointer" onClick={handlePowerOn}>
                          <div className="w-24 h-24 rounded-full border-4 border-gray-600 flex items-center justify-center group-hover:border-blue-500 group-hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] transition-all duration-500 bg-[#1a1a1a]">
                              <Power size={48} className="text-gray-500 group-hover:text-blue-400 transition-colors duration-500" />
                          </div>
                      </div>
                      <h1 className="text-3xl font-light tracking-widest uppercase mb-2 text-white">WinSim</h1>
                      <p className="text-sm text-gray-500 mb-12">OS Installation Simulator</p>
                      
                      {/* Jump Selector */}
                      <div className="mb-8 w-64 relative">
                          <label className="block text-[10px] text-gray-500 uppercase tracking-widest mb-2 text-center">Start Simulation From</label>
                          <div className="relative">
                              <select 
                                value={startPoint}
                                onChange={(e) => setStartPoint(e.target.value as InstallState)}
                                className="w-full appearance-none bg-[#222] border border-gray-700 text-gray-300 text-sm py-3 pl-4 pr-10 rounded-md outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer hover:bg-[#2a2a2a] transition-colors shadow-lg"
                              >
                                  <option value={InstallState.MEDIA_CREATOR}>Create Installation Media</option>
                                  <option value={InstallState.BIOS_POST}>System Boot (BIOS)</option>
                                  <option value={InstallState.SETUP_LANGUAGE}>Windows Setup</option>
                                  <option value={InstallState.OOBE_REGION}>Out-of-Box Experience</option>
                                  <option value={InstallState.DESKTOP}>Desktop Environment</option>
                                  <option value={InstallState.RECOVERY_CHOOSE_OPTION}>Recovery Mode</option>
                              </select>
                              <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-500">
                                  <ChevronDown size={16} />
                              </div>
                          </div>
                      </div>

                      <button 
                        onClick={handlePowerOn}
                        className="flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-full transition-all text-sm uppercase tracking-wider font-semibold shadow-lg shadow-blue-900/20 hover:shadow-blue-600/40 active:scale-95"
                      >
                          <Maximize2 size={16} /> Power On System
                      </button>
                  </div>
                  
                  <div className="absolute bottom-8 text-xs text-gray-600 max-w-md text-center">
                      For the best experience, this simulator requires Full Screen mode and Sound enabled.
                  </div>
                  
                  {/* Background Grid Effect */}
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,black_40%,transparent_100%)] pointer-events-none"></div>
              </div>
          )
      }

      // 1. Media Creator (The "Host" PC)
      if (currentState === InstallState.MEDIA_CREATOR) {
        return <MediaCreator onComplete={handleMediaCreated} />;
      }

      // 2. BIOS POST (The "Target" PC turning on)
      if (currentState === InstallState.BIOS_POST) {
         return (
            <div className="w-full h-full bg-black text-white font-mono p-10 flex flex-col justify-between cursor-none select-none">
                <div className="flex justify-between">
                    <span>Phoenix TrustedCore(tm) Desktop Guide</span>
                    <span>Energy Star Ally</span>
                </div>
                
                <div className="flex flex-col items-center justify-center h-full">
                   <div className="w-16 h-16 border-4 border-white rounded-full animate-spin mb-8 border-t-transparent"></div>
                   <div>Initializing Hardware...</div>
                </div>

                <div className="flex justify-between">
                    <span>Press &lt;DEL&gt; to enter SETUP</span>
                    <span>Press &lt;F12&gt; for Boot Menu</span>
                </div>

                {/* Hidden Interaction Layer */}
                <div 
                    className="absolute inset-0 z-50 opacity-0 cursor-pointer"
                    onClick={() => setCurrentState(InstallState.BIOS_SETUP)} 
                    title="Click to simulate pressing DEL"
                />
                {/* Auto-progress if no interaction */}
                <AutoAdvance 
                    delay={2500} 
                    onTime={() => setCurrentState(InstallState.BOOT_CHECK)} 
                />
            </div>
         );
      }

      // 3. BIOS Setup Utility
      if (currentState === InstallState.BIOS_SETUP) {
          return <Bios initialConfig={biosConfig} onSaveAndExit={handleBiosSave} />;
      }

      // 4. Boot Logic Check
      if (currentState === InstallState.BOOT_CHECK) {
          const error = checkBootCompatibility();
          if (error) {
              setBootError(error);
              setCurrentState(InstallState.BOOT_ERROR);
          } else {
              // Success! Move to Boot Prompt (The "Press any key" moment)
              setCurrentState(InstallState.BOOT_PROMPT);
          }
          return <div className="bg-black w-full h-full"></div>;
      }

      // 4b. Boot Prompt (Press any key...)
      if (currentState === InstallState.BOOT_PROMPT) {
          return <BootPrompt 
                    onSuccess={() => setCurrentState(InstallState.BOOT_LOGO)} 
                    onFailure={() => {
                        setBootError("Operating System not found.\nNo bootable device detected on HDD-0.");
                        setCurrentState(InstallState.BOOT_ERROR);
                    }} 
                 />;
      }

      // 5. Boot Error Screen
      if (currentState === InstallState.BOOT_ERROR) {
          return (
              <div className="bg-black w-full h-full text-gray-300 font-mono p-10 select-none">
                  <div className="border border-red-500 p-4 text-red-500 mb-4 inline-flex items-center gap-2">
                     <AlertTriangle size={20}/> Boot Failure
                  </div>
                  <p className="whitespace-pre-wrap leading-relaxed">{bootError}</p>
                  <p className="mt-8 text-white animate-pulse">Press any key to restart system...</p>
                  <div 
                    className="absolute inset-0" 
                    onClick={() => {
                        setBootError(null);
                        setCurrentState(InstallState.BIOS_POST);
                    }}
                  />
              </div>
          )
      }

      // 6. Windows Boot Logo (Loading)
      if (currentState === InstallState.BOOT_LOGO) {
        // Longer boot time for realism
        setTimeout(() => setCurrentState(InstallState.SETUP_LANGUAGE), 4000);
        return (
          <div className="w-full h-full bg-black flex items-center justify-center flex-col gap-12 select-none">
            <img 
                src="https://upload.wikimedia.org/wikipedia/commons/c/c7/Windows_logo_-_2012.png" 
                alt="Windows Logo" 
                className="w-32 h-auto"
            />
            <div className="w-8 h-8 border-4 border-t-white border-r-white border-b-transparent border-l-transparent rounded-full animate-spin"></div>
          </div>
        );
      }

      // 7. Reboot Sequence
      if (currentState === InstallState.REBOOT_REQUIRED) {
        setTimeout(() => setCurrentState(InstallState.OOBE_REGION), 4000);
        return (
          <div className="w-full h-full bg-black flex items-center justify-center flex-col select-none">
            <div className="text-white text-xl mb-4">Restarting...</div>
          </div>
        );
      }

      // 8. Getting Ready
      if (currentState === InstallState.GETTING_READY) {
          setTimeout(() => setCurrentState(InstallState.DRIVER_SETUP), 15000); // 15s for the full "Hi" animation
          return <OOBE state={InstallState.GETTING_READY} onNext={() => {}} />;
      }

      // 9. Desktop
      if (currentState === InstallState.DESKTOP) {
          return (
            <Desktop 
                username={userData.username} 
                onRestart={() => setCurrentState(InstallState.BIOS_POST)}
            />
          );
      }

      // 10. OOBE Wizard + Driver Setup
      if (currentState === InstallState.OOBE_REGION || 
          currentState === InstallState.OOBE_KEYBOARD || 
          currentState === InstallState.OOBE_NETWORK || 
          currentState === InstallState.OOBE_UPDATES || 
          currentState === InstallState.OOBE_USER || 
          currentState === InstallState.OOBE_SECURITY_QUESTIONS || 
          currentState === InstallState.OOBE_JUST_A_MOMENT ||
          currentState === InstallState.OOBE_PIN || 
          currentState === InstallState.OOBE_PRIVACY ||
          currentState === InstallState.DRIVER_SETUP) {
          return (
            <OOBE 
                state={currentState} 
                onNext={(next, data) => {
                    if(data) setUserData(prev => ({...prev, ...data}));
                    setCurrentState(next);
                }} 
            />
          );
      }

      // 11. Setup Wizard (Windowed)
      return (
        <SetupWizard 
            state={currentState} 
            onNext={(next) => setCurrentState(next)} 
        />
      );
  };

  return (
    <>
      {renderSimulationContent()}
      {hasStarted && <ContextualHelp state={currentState} />}
      <ToastDisplay />
    </>
  );
};

const App: React.FC = () => (
    <SimulationProvider>
        <AppContent />
    </SimulationProvider>
);

// --- Helpers ---

// Auto-advance helper with useEffect cleanup
const AutoAdvance = ({ delay, onTime }: { delay: number, onTime: () => void }) => {
    useEffect(() => {
        const t = setTimeout(onTime, delay);
        return () => clearTimeout(t);
    }, []);
    return null;
}

// "Press any key" logic
const BootPrompt = ({ onSuccess, onFailure }: { onSuccess: () => void, onFailure: () => void }) => {
    const [dots, setDots] = useState("");
    
    useEffect(() => {
        // The user has 3 seconds to press a key
        const failTimer = setTimeout(onFailure, 3000);

        const handleKey = () => {
            clearTimeout(failTimer);
            onSuccess();
        };

        window.addEventListener('keydown', handleKey);
        window.addEventListener('mousedown', handleKey);

        const dotInterval = setInterval(() => {
            setDots(prev => prev.length < 5 ? prev + "." : ".");
        }, 500);

        return () => {
            clearTimeout(failTimer);
            clearInterval(dotInterval);
            window.removeEventListener('keydown', handleKey);
            window.removeEventListener('mousedown', handleKey);
        };
    }, []);

    return (
        <div className="w-full h-full bg-black text-gray-300 font-mono p-4 select-none">
            Press any key to boot from CD or DVD{dots}
        </div>
    )
}

export default App;