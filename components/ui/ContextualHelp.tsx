import React, { useState, useEffect } from 'react';
import { HelpCircle, X, Info, Lightbulb } from 'lucide-react';
import { InstallState } from '../../types';
import { playSound } from '../../services/soundService';

const HELP_CONTENT: Partial<Record<InstallState, { title: string, text: string }>> = {
  [InstallState.MEDIA_CREATOR]: {
    title: "Media Creation Tool",
    text: "This step simulates creating a bootable USB drive using software like Rufus. Select a Windows ISO file and a target USB drive, then click START to format and prepare the installation media."
  },
  [InstallState.BIOS_POST]: {
    title: "Power-On Self-Test (POST)",
    text: "The system is initializing hardware. This is your brief window to enter the BIOS Setup by pressing the setup key (often DEL or F2) or the Boot Menu key (F12)."
  },
  [InstallState.BIOS_SETUP]: {
    title: "BIOS Setup Utility",
    text: "Here you configure low-level hardware settings. Critical for installation: Ensure your USB drive is prioritized in the 'Boot' menu order so the computer loads the installer instead of the empty hard drive."
  },
  [InstallState.BOOT_CHECK]: {
    title: "Boot Check",
    text: "The system is verifying if the boot configuration is valid. It checks if the Partition Scheme (MBR/GPT) matches the Boot Mode (Legacy/UEFI) and Secure Boot settings."
  },
  [InstallState.BOOT_PROMPT]: {
    title: "Boot Prompt",
    text: "The system found bootable media! You must press any key on your keyboard immediately when you see the text, or the system might timeout and try the next (empty) boot device."
  },
  [InstallState.BOOT_ERROR]: {
    title: "Boot Failure",
    text: "The system could not boot. This usually happens if the BIOS settings (Legacy vs UEFI, Secure Boot) don't match the way the USB media was created. Restart and check your BIOS settings."
  },
  [InstallState.SETUP_LANGUAGE]: {
    title: "Windows Setup",
    text: "The installation environment has loaded. Select your language, time, and currency formats to begin."
  },
  [InstallState.SETUP_INSTALL_NOW]: {
    title: "Install or Repair",
    text: "Click 'Install now' to proceed with a fresh installation. You can also click 'Repair your computer' to access the Windows Recovery Environment (WinRE) tools."
  },
  [InstallState.SETUP_KEY]: {
    title: "Product Key",
    text: "In a real scenario, you'd enter your license key here. For this simulation, you can click 'I don't have a product key' to skip activation."
  },
  [InstallState.SETUP_LICENSE]: {
    title: "License Terms",
    text: "Read the End User License Agreement (EULA). You must accept the terms to continue."
  },
  [InstallState.SETUP_TYPE]: {
    title: "Installation Type",
    text: "Select 'Custom: Install Windows only' for a fresh install (clean slate). The 'Upgrade' option simulates upgrading an existing OS installation while keeping files."
  },
  [InstallState.SETUP_PARTITION]: {
    title: "Partition Management",
    text: "Choose where to install Windows. You can select 'Unallocated Space' and click Next to let Windows partition it automatically, or manually 'New' to create custom partitions."
  },
  [InstallState.SETUP_COPYING]: {
    title: "Installing Windows",
    text: "Windows is copying files and installing features. This runs automatically. In this simulator, we might trigger a random error to test your troubleshooting skills!"
  },
  [InstallState.REBOOT_REQUIRED]: {
    title: "Restarting",
    text: "Windows needs to restart to initialize the new hardware configurations and drivers."
  },
  [InstallState.OOBE_REGION]: {
    title: "Out-of-Box Experience (OOBE)",
    text: "Welcome to the user setup wizard. Start by confirming your region settings."
  },
  [InstallState.OOBE_NETWORK]: {
    title: "Network Setup",
    text: "Connect to a Wi-Fi network. In this simulation, this step is crucial for downloading updates (simulated) and setting up an online account."
  },
  [InstallState.OOBE_USER]: {
    title: "User Account",
    text: "Create your local user account. Enter a name and an optional password."
  },
  [InstallState.GETTING_READY]: {
    title: "Finalizing",
    text: "The system is preparing your desktop environment. This involves creating user profiles and setting up initial policies."
  },
  [InstallState.DRIVER_SETUP]: {
    title: "Driver Installation",
    text: "Windows is detecting hardware and installing necessary drivers (GPU, Audio, Network). Screen flickering during GPU driver installation is normal."
  },
  [InstallState.DESKTOP]: {
    title: "Windows Desktop",
    text: "Simulation Complete! You are now in the desktop environment. Explore the Start Menu, open apps like VS Code or Edge, or try 'Ctrl+Shift+Esc' to open Task Manager."
  },
  [InstallState.RECOVERY_CHOOSE_OPTION]: {
    title: "Recovery Environment",
    text: "You are in the WinRE (Windows Recovery Environment). Use 'Troubleshoot' to access advanced repair tools like Command Prompt, System Restore, or Startup Repair."
  }
};

export const ContextualHelp: React.FC<{ state: InstallState }> = ({ state }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);
  const [lastState, setLastState] = useState(state);

  // Update content when state changes
  useEffect(() => {
    if (state !== lastState) {
        setHasUnread(true);
        setLastState(state);
        // Optional: Close on state change to avoid stale info? 
        // Or keep open if user is reading? Let's keep it user-controlled but show notification dot.
    }
  }, [state, lastState]);

  const content = HELP_CONTENT[state] || { 
    title: "Simulator Info", 
    text: "Follow the on-screen instructions to proceed with the operation." 
  };

  const toggle = () => {
      playSound('click');
      setIsOpen(!isOpen);
      if (!isOpen) setHasUnread(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[99999] flex flex-col items-end pointer-events-auto font-sans select-none">
        {/* Popover Card */}
        {isOpen && (
            <div className="mb-4 w-80 bg-white/90 backdrop-blur-md text-gray-900 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.3)] border border-white/20 overflow-hidden animate-in slide-in-from-bottom-5 zoom-in-95 duration-200">
                <div className="bg-[#0078D7] px-4 py-3 flex justify-between items-center text-white">
                    <div className="flex items-center gap-2 font-semibold">
                        <Lightbulb size={18} className="text-yellow-300 fill-yellow-300"/>
                        <span>{content.title}</span>
                    </div>
                    <button onClick={toggle} className="hover:bg-white/20 p-1 rounded transition-colors"><X size={16}/></button>
                </div>
                <div className="p-5 text-sm leading-relaxed text-gray-700">
                    {content.text}
                </div>
                <div className="bg-gray-50 px-4 py-2 text-[10px] text-gray-400 border-t flex justify-between">
                    <span>WinSim Contextual Help</span>
                    <span>State: {state}</span>
                </div>
            </div>
        )}

        {/* FAB */}
        <button 
            onClick={toggle}
            className={`
                group relative w-12 h-12 rounded-full shadow-xl flex items-center justify-center transition-all duration-300
                ${isOpen ? 'bg-white text-[#0078D7] rotate-90' : 'bg-[#0078D7] text-white hover:bg-[#006CC1] hover:scale-110'}
            `}
            title="Simulator Help"
        >
            {isOpen ? <X size={24} /> : <HelpCircle size={28} />}
            
            {/* Unread Dot */}
            {!isOpen && hasUnread && (
                <span className="absolute top-0 right-0 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
            )}
        </button>
    </div>
  );
};