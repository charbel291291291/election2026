/**
 * Secure Super Admin PIN Verification Utility
 * 
 * PIN: 9696 (stored in memory only, NOT in DB)
 * Security Features:
 * - Lockout after 5 failed attempts (30 sec cooldown)
 * - PIN validation in memory only
 * - No hardcoded PIN in UI
 */

const SUPER_ADMIN_PIN = "9696";
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 30000; // 30 seconds

interface LockoutState {
  failedAttempts: number;
  lockedUntil: number | null;
}

let lockoutState: LockoutState = {
  failedAttempts: 0,
  lockedUntil: null,
};

/**
 * Verify Super Admin PIN
 * @param pin - The PIN to verify
 * @returns { success: boolean, error?: string }
 */
export const verifySuperAdminPIN = (pin: string): { success: boolean; error?: string } => {
  // Check if locked out
  if (lockoutState.lockedUntil && Date.now() < lockoutState.lockedUntil) {
    const remainingSeconds = Math.ceil((lockoutState.lockedUntil - Date.now()) / 1000);
    return {
      success: false,
      error: `تم حظر الوصول. حاول مرة أخرى بعد ${remainingSeconds} ثانية.`,
    };
  }

  // Reset lockout if expired
  if (lockoutState.lockedUntil && Date.now() >= lockoutState.lockedUntil) {
    lockoutState = {
      failedAttempts: 0,
      lockedUntil: null,
    };
  }

  // Verify PIN
  if (pin === SUPER_ADMIN_PIN) {
    // Success - reset failed attempts
    lockoutState = {
      failedAttempts: 0,
      lockedUntil: null,
    };
    return { success: true };
  }

  // Failed attempt
  lockoutState.failedAttempts += 1;

  if (lockoutState.failedAttempts >= MAX_FAILED_ATTEMPTS) {
    lockoutState.lockedUntil = Date.now() + LOCKOUT_DURATION_MS;
    return {
      success: false,
      error: `تم حظر الوصول بعد ${MAX_FAILED_ATTEMPTS} محاولات فاشلة. حاول مرة أخرى بعد 30 ثانية.`,
    };
  }

  const remainingAttempts = MAX_FAILED_ATTEMPTS - lockoutState.failedAttempts;
  return {
    success: false,
    error: `PIN غير صحيح. محاولات متبقية: ${remainingAttempts}`,
  };
};

/**
 * Get remaining lockout time in seconds
 */
export const getLockoutRemainingSeconds = (): number => {
  if (!lockoutState.lockedUntil) return 0;
  const remaining = lockoutState.lockedUntil - Date.now();
  return remaining > 0 ? Math.ceil(remaining / 1000) : 0;
};

/**
 * Check if currently locked out
 */
export const isLockedOut = (): boolean => {
  if (!lockoutState.lockedUntil) return false;
  return Date.now() < lockoutState.lockedUntil;
};

/**
 * Get remaining attempts
 */
export const getRemainingAttempts = (): number => {
  if (isLockedOut()) return 0;
  return Math.max(0, MAX_FAILED_ATTEMPTS - lockoutState.failedAttempts);
};

/**
 * Reset lockout state (for testing/admin purposes)
 */
export const resetLockoutState = (): void => {
  lockoutState = {
    failedAttempts: 0,
    lockedUntil: null,
  };
};
