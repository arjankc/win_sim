import React, { useState, useEffect } from 'react';
import { BiosConfig } from '../../types';
import { playSound } from '../../services/soundService';

interface BiosProps {
  onSaveAndExit: (config: BiosConfig) => void;
  initialConfig: BiosConfig;
}

export const Bios: React.FC<BiosProps> = ({ onSaveAndExit, initialConfig }) => {
  const [config, setConfig] = useState<BiosConfig>(initialConfig);
  const [activeTab, setActiveTab] = useState(0); // 0: Main, 1: Boot, 2: Exit
  const [selectedRow, setSelectedRow] = useState(0);
  
  const tabs = ['Main', 'Boot', 'Exit'];

  // Ensure bootOrder has defaults if missing
  useEffect(() => {
    if (!config.bootOrder || config.bootOrder.length === 0) {
        setConfig(prev => ({ ...prev, bootOrder: ['Removable Devices', 'Hard Drive', 'CD-ROM Drive', 'Network Boot'] }));
    }
  }, []);

  // Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      playSound('bios-beep'); // Beep on every interaction
      
      switch(e.key) {
        case 'Tab':
          if (e.shiftKey) {
            setActiveTab(prev => (prev - 1 + tabs.length) % tabs.length);
          } else {
            setActiveTab(prev => (prev + 1) % tabs.length);
          }
          setSelectedRow(0);
          break;
        case 'ArrowRight':
          setActiveTab(prev => (prev + 1) % tabs.length);
          setSelectedRow(0);
          break;
        case 'ArrowLeft':
          setActiveTab(prev => (prev - 1 + tabs.length) % tabs.length);
          setSelectedRow(0);
          break;
        case 'ArrowDown':
          setSelectedRow(prev => Math.min(prev + 1, getRowCount(activeTab) - 1));
          break;
        case 'ArrowUp':
          setSelectedRow(prev => Math.max(prev - 1, 0));
          break;
        case 'Enter':
          handleEnterKey();
          break;
        case '+':
        case '=':
           handleValueChange(1);
           break;
        case '-':
        case '_':
           handleValueChange(-1);
           break;
        case 'F10':
          onSaveAndExit(config);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, selectedRow, config]);

  const getRowCount = (tabIdx: number) => {
    if (tabIdx === 0) return 4; // Main
    if (tabIdx === 1) return 3 + (config.bootOrder?.length || 0); // Boot settings + devices
    if (tabIdx === 2) return 2; // Exit
    return 0;
  };

  const moveBootItem = (index: number, direction: number) => {
      const newOrder = [...(config.bootOrder || [])];
      const newIndex = index + direction;
      if (newIndex >= 0 && newIndex < newOrder.length) {
          [newOrder[index], newOrder[newIndex]] = [newOrder[newIndex], newOrder[index]];
          setConfig(prev => ({ ...prev, bootOrder: newOrder }));
          setSelectedRow(prev => prev + direction); // Follow the item
      }
  };

  const handleValueChange = (direction: number) => {
      if (activeTab === 1) {
          // If we are selecting one of the boot devices (rows 3,4,5,6 etc)
          if (selectedRow >= 3) {
              moveBootItem(selectedRow - 3, direction === 1 ? -1 : 1); // + moves up (lower index), - moves down
          } else {
              // Standard toggles
              handleEnterKey();
          }
      }
  };

  const handleEnterKey = () => {
    if (activeTab === 1) { // Boot Tab
      if (selectedRow === 0) { // Boot Mode
        setConfig(prev => ({ ...prev, bootMode: prev.bootMode === 'UEFI' ? 'Legacy' : 'UEFI' }));
      } else if (selectedRow === 1) { // Secure Boot
        setConfig(prev => ({ ...prev, secureBoot: !prev.secureBoot }));
      } else if (selectedRow === 2) { // USB Boot
        setConfig(prev => ({ ...prev, usbBootEnabled: !prev.usbBootEnabled }));
      }
    } else if (activeTab === 2) { // Exit Tab
      if (selectedRow === 0) { // Save Changes and Exit
         onSaveAndExit(config);
      }
    }
  };

  return (
    <div className="w-full h-full bg-[#0000AA] text-white font-mono p-4 select-none cursor-none flex flex-col text-xs md:text-base overflow-auto">
      {/* Header */}
      <div className="flex justify-between border-b-2 border-white pb-1 mb-2 shrink-0">
        <div>Phoenix TrustedCore(tm) Setup Utility</div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 md:gap-8 mb-4 border-b border-white pb-1 shrink-0 overflow-x-auto">
        {tabs.map((tab, idx) => (
          <div key={tab} className={`${activeTab === idx ? 'bg-white text-[#0000AA] px-2' : 'text-gray-300'}`}>
            {tab}
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col md:flex-row gap-4 overflow-hidden">
        {/* Settings Area */}
        <div className="w-full md:w-2/3 border-r-0 md:border-r border-white pr-0 md:pr-4 overflow-y-auto pb-4 md:pb-0">
            
            {activeTab === 0 && (
              <div className="space-y-2">
                <div className={`flex justify-between px-2 ${selectedRow === 0 ? 'bg-white text-[#0000AA]' : ''}`}>
                  <span>System Time:</span> <span>[12:00:00]</span>
                </div>
                <div className={`flex justify-between px-2 ${selectedRow === 1 ? 'bg-white text-[#0000AA]' : ''}`}>
                  <span>System Date:</span> <span>[01/01/2025]</span>
                </div>
                <div className={`flex justify-between px-2 ${selectedRow === 2 ? 'bg-white text-[#0000AA]' : ''}`}>
                  <span>CPU Type:</span> <span>Intel(R) Core(TM) i9</span>
                </div>
                <div className={`flex justify-between px-2 ${selectedRow === 3 ? 'bg-white text-[#0000AA]' : ''}`}>
                  <span>System Memory:</span> <span>64 GB</span>
                </div>
              </div>
            )}

            {activeTab === 1 && (
              <div className="space-y-2">
                 <div className={`flex justify-between px-2 ${selectedRow === 0 ? 'bg-white text-[#0000AA]' : ''}`}>
                  <span>Boot Mode:</span> 
                  <span className={config.bootMode === 'UEFI' ? 'text-yellow-300' : 'text-cyan-300'}>[{config.bootMode}]</span>
                </div>
                <div className={`flex justify-between px-2 ${selectedRow === 1 ? 'bg-white text-[#0000AA]' : ''}`}>
                  <span>Secure Boot:</span> 
                  <span className={config.secureBoot ? 'text-green-300' : 'text-red-300'}>[{config.secureBoot ? 'Enabled' : 'Disabled'}]</span>
                </div>
                <div className={`flex justify-between px-2 ${selectedRow === 2 ? 'bg-white text-[#0000AA]' : ''}`}>
                  <span>USB Boot Support:</span> 
                  <span className={config.usbBootEnabled ? 'text-green-300' : 'text-red-300'}>[{config.usbBootEnabled ? 'Enabled' : 'Disabled'}]</span>
                </div>
                
                <div className="mt-4 border-t border-white/30 pt-2">
                    <div className="mb-2 text-yellow-300">Boot Device Priority</div>
                    {config.bootOrder?.map((device, idx) => (
                        <div key={device} className={`flex justify-between px-2 ${selectedRow === 3 + idx ? 'bg-white text-[#0000AA]' : ''}`}>
                            <span>{idx + 1}. {device}</span>
                        </div>
                    ))}
                </div>
              </div>
            )}

            {activeTab === 2 && (
               <div className="space-y-2">
                <div className={`px-2 ${selectedRow === 0 ? 'bg-white text-[#0000AA]' : ''}`}>
                   Exit Saving Changes
                </div>
                <div className={`px-2 ${selectedRow === 1 ? 'bg-white text-[#0000AA]' : ''}`}>
                   Exit Discarding Changes
                </div>
               </div>
            )}
        </div>

        {/* Sidebar Help */}
        <div className="w-full md:w-1/3 text-xs md:text-sm text-gray-200 border-t md:border-t-0 border-white pt-2 md:pt-0">
            {activeTab === 1 && selectedRow < 3 && (
              <div>
                  <p className="mb-4">Select UEFI for modern Windows installations (GPT).</p>
                  <p>Secure boot ensures only authorized software boots.</p>
              </div>
            )}
            {activeTab === 1 && selectedRow >= 3 && (
                <div>
                    <p className="mb-4 text-yellow-300">Item Specific Help</p>
                    <p>Keys used to view or configure devices:</p>
                    <p className="mt-2"><span className="text-white font-bold">+/-</span> : Move device Up or Down.</p>
                    <p><span className="text-white font-bold">Enter</span> : Select.</p>
                </div>
            )}
             {activeTab === 2 && (
              <p>Save configuration and restart the system.</p>
            )}
        </div>
      </div>

      {/* Footer Controls */}
      <div className="border-t-2 border-white pt-2 flex flex-col md:flex-row justify-between text-xs shrink-0 gap-2 md:gap-0">
        <div className="flex flex-wrap gap-2">
           <span className="mr-4">F1: Help</span>
           <span className="mr-4">↑↓: Select Item</span>
           <span className="mr-4">←→/Tab: Select Menu</span>
        </div>
        <div className="flex flex-wrap gap-2">
           <span className="mr-4">+/-: Change Values</span>
           <span className="mr-4">Enter: Select</span>
           <span className="mr-4">F10: Save and Exit</span>
        </div>
      </div>
    </div>
  );
};