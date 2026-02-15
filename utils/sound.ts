
// Browser-native audio synthesizer to avoid external asset dependencies

const audioCtx = typeof window !== 'undefined' && window.AudioContext ? new window.AudioContext() : null;

export const playSound = (type: 'beep' | 'error' | 'success' | 'click') => {
  if (!audioCtx) return;
  if (audioCtx.state === 'suspended') audioCtx.resume();

  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  const now = audioCtx.currentTime;

  if (type === 'beep') {
    // High pitched digital beep
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(1200, now);
    oscillator.frequency.exponentialRampToValueAtTime(800, now + 0.1);
    
    gainNode.gain.setValueAtTime(0.1, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
    
    oscillator.start(now);
    oscillator.stop(now + 0.1);
  } else if (type === 'click') {
    // Mechanical click
    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(150, now);
    
    gainNode.gain.setValueAtTime(0.1, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
    
    oscillator.start(now);
    oscillator.stop(now + 0.05);
  } else if (type === 'error') {
    // Low buzzing error sound
    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(150, now);
    oscillator.frequency.linearRampToValueAtTime(100, now + 0.3);

    gainNode.gain.setValueAtTime(0.2, now);
    gainNode.gain.linearRampToValueAtTime(0.01, now + 0.3);

    oscillator.start(now);
    oscillator.stop(now + 0.3);
  } else if (type === 'success') {
    // Ascending success chime
    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(500, now);
    oscillator.frequency.setValueAtTime(1000, now + 0.1);
    oscillator.frequency.setValueAtTime(1500, now + 0.2);

    gainNode.gain.setValueAtTime(0.1, now);
    gainNode.gain.linearRampToValueAtTime(0.1, now + 0.2);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

    oscillator.start(now);
    oscillator.stop(now + 0.6);
  }
};
