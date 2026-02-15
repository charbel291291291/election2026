
import React, { useRef } from 'react';

interface Props {
  children: React.ReactNode;
}

/**
 * SYSTEM DIAGNOSTICS COMPONENT
 * Monitors interaction frequency for advanced debugging modes.
 * Neutral naming used for security obfuscation.
 */
const SystemStatusCheck: React.FC<Props> = ({ children }) => {
  // Use refs to track state without triggering re-renders (performance & stealth)
  const clickCount = useRef(0);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleInteraction = (e: React.MouseEvent | React.TouchEvent) => {
    // Prevent text selection during rapid tapping
    if (e.type === 'click') {
       // Only process clicks to avoid double-firing with touch events
    }
    
    clickCount.current += 1;

    // Clear existing timer to reset the window
    if (resetTimer.current) {
      clearTimeout(resetTimer.current);
    }

    // Check threshold: 5 clicks
    if (clickCount.current >= 5) {
      // Dispatch the global event that SuperAdminAuth listens to
      // Using a custom event keeps this component decoupled from the auth logic
      window.dispatchEvent(new Event('trigger-root-access'));
      
      // Reset immediately after trigger
      clickCount.current = 0;
    } else {
      // Set/Reset the 2-second window timer
      resetTimer.current = setTimeout(() => {
        clickCount.current = 0;
      }, 2000);
    }
  };

  return (
    <div 
      onClick={handleInteraction as any}
      className="inline-block cursor-default select-none touch-manipulation"
      role="button"
      aria-hidden="true"
      style={{ WebkitTapHighlightColor: 'transparent' }}
    >
      {children}
    </div>
  );
};

export default SystemStatusCheck;
