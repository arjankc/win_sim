let audioCtx: AudioContext | null = null;

const getContext = () => {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioCtx;
};

export const playSound = (type: 'click' | 'bios-beep' | 'error' | 'notification' | 'startup' | 'shutdown' | 'window-open') => {
    try {
        const ctx = getContext();
        if (ctx.state === 'suspended') {
            ctx.resume();
        }
        const t = ctx.currentTime;

        switch (type) {
            case 'click':
                // Gentle UI tick
                const cOsc = ctx.createOscillator();
                const cGain = ctx.createGain();
                cOsc.connect(cGain);
                cGain.connect(ctx.destination);
                cOsc.type = 'triangle';
                cOsc.frequency.setValueAtTime(800, t);
                cOsc.frequency.exponentialRampToValueAtTime(1200, t + 0.05);
                cGain.gain.setValueAtTime(0.05, t);
                cGain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
                cOsc.start(t);
                cOsc.stop(t + 0.05);
                break;
            
            case 'bios-beep':
                // Harsh square wave beep
                const bOsc = ctx.createOscillator();
                const bGain = ctx.createGain();
                bOsc.connect(bGain);
                bGain.connect(ctx.destination);
                bOsc.type = 'square';
                bOsc.frequency.setValueAtTime(800, t);
                bGain.gain.setValueAtTime(0.05, t);
                bGain.gain.linearRampToValueAtTime(0.05, t + 0.1);
                bGain.gain.linearRampToValueAtTime(0, t + 0.11);
                bOsc.start(t);
                bOsc.stop(t + 0.11);
                break;

            case 'error':
                // Low sawtooth buzz
                const eOsc = ctx.createOscillator();
                const eGain = ctx.createGain();
                eOsc.connect(eGain);
                eGain.connect(ctx.destination);
                eOsc.type = 'sawtooth';
                eOsc.frequency.setValueAtTime(150, t);
                eGain.gain.setValueAtTime(0.1, t);
                eGain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);
                eOsc.start(t);
                eOsc.stop(t + 0.3);
                break;

            case 'notification':
                // Glassy chime
                const nOsc = ctx.createOscillator();
                const nGain = ctx.createGain();
                nOsc.connect(nGain);
                nGain.connect(ctx.destination);
                nOsc.type = 'sine';
                nOsc.frequency.setValueAtTime(523.25, t); // C5
                nOsc.frequency.linearRampToValueAtTime(783.99, t + 0.1); // G5
                nGain.gain.setValueAtTime(0.05, t);
                nGain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
                nOsc.start(t);
                nOsc.stop(t + 0.5);
                break;

             case 'startup':
                // Pleasant major chord swell
                [261.63, 329.63, 392.00, 523.25].forEach((freq, i) => {
                    const sOsc = ctx.createOscillator();
                    const sGain = ctx.createGain();
                    sOsc.connect(sGain);
                    sGain.connect(ctx.destination);
                    sOsc.type = 'sine';
                    sOsc.frequency.value = freq;
                    sGain.gain.setValueAtTime(0, t);
                    sGain.gain.linearRampToValueAtTime(0.05, t + 0.1 + (i*0.1));
                    sGain.gain.exponentialRampToValueAtTime(0.001, t + 3);
                    sOsc.start(t);
                    sOsc.stop(t + 3.5);
                });
                break;
            
            case 'window-open':
                // Quick swoosh
                const wOsc = ctx.createOscillator();
                const wGain = ctx.createGain();
                wOsc.connect(wGain);
                wGain.connect(ctx.destination);
                wOsc.type = 'sine';
                wOsc.frequency.setValueAtTime(400, t);
                wOsc.frequency.linearRampToValueAtTime(600, t + 0.1);
                wGain.gain.setValueAtTime(0.02, t);
                wGain.gain.linearRampToValueAtTime(0, t + 0.15);
                wOsc.start(t);
                wOsc.stop(t + 0.15);
                break;
        }
    } catch (e) {
        // Ignore audio context errors (e.g., if user hasn't interacted with page yet)
    }
}