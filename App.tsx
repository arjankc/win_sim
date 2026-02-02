import React, { useState, useEffect } from 'react';
import { InstallState, MediaConfig, BiosConfig } from './types';
import { MediaCreator } from './components/screens/MediaCreator';
import { Bios } from './components/screens/Bios';
import { SetupWizard } from './components/screens/SetupWizard';
import { OOBE } from './components/screens/OOBE';
import { Desktop } from './components/screens/Desktop';
import { AlertTriangle, Power, Maximize2 } from 'lucide-react';
import { playSound } from './services/soundService';

const App: React.FC = () => {
  // Simulation State
  const [hasStarted, setHasStarted] = useState(false);
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

  // --- Full Screen / Start Logic ---

  const handlePowerOn = async () => {
    try {
        if (!document.fullscreenElement) {
            await document.documentElement.requestFullscreen();
        }
    } catch (err) {
        console.error("Error attempting to enable full-screen mode:", err);
    }
    
    // Resume audio context if it was suspended (browser policy)
    playSound('click');
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

  // 0. Power On Screen (Landing Page)
  if (!hasStarted) {
      return (
          <div className="w-full h-full bg-[#111] flex flex-col items-center justify-center text-gray-300 font-sans select-none">
              <div className="mb-8 relative group cursor-pointer" onClick={handlePowerOn}>
                  <div className="w-24 h-24 rounded-full border-4 border-gray-600 flex items-center justify-center group-hover:border-blue-500 group-hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] transition-all duration-500 bg-[#1a1a1a]">
                      <Power size={48} className="text-gray-500 group-hover:text-blue-400 transition-colors duration-500" />
                  </div>
              </div>
              <h1 className="text-2xl font-light tracking-widest uppercase mb-2">WinSim</h1>
              <p className="text-sm text-gray-500 mb-8">OS Installation Simulator</p>
              
              <button 
                onClick={handlePowerOn}
                className="flex items-center gap-2 px-6 py-2 border border-gray-700 hover:border-blue-500 hover:bg-blue-500/10 hover:text-blue-400 rounded-full transition-all text-sm uppercase tracking-wider"
              >
                  <Maximize2 size={16} /> Power On System
              </button>
              
              <div className="absolute bottom-8 text-xs text-gray-700 max-w-md text-center">
                  For the best experience, this simulator requires Full Screen mode and Sound enabled.
              </div>
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