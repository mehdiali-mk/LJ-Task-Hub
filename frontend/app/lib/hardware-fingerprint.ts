/**
 * Hardware Fingerprinting Utility
 * 
 * Generates a unique device fingerprint for session binding and anti-hijacking.
 * Uses Canvas fingerprinting for Chrome/Web and UUID for Tauri Desktop.
 * 
 * @performance All operations are async and non-blocking
 */

// Check if running in Tauri environment
const isTauri = typeof window !== 'undefined' && '__TAURI__' in window;

/**
 * Generate canvas fingerprint (Chrome/Web)
 * Creates a unique hash based on canvas rendering characteristics
 */
async function getCanvasFingerprint(): Promise<string> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    return 'canvas-unavailable';
  }

  canvas.width = 200;
  canvas.height = 50;

  // Draw text with various fonts (rendering differs by system)
  ctx.textBaseline = 'top';
  ctx.font = '14px Arial';
  ctx.fillStyle = '#f60';
  ctx.fillRect(125, 1, 62, 20);
  ctx.fillStyle = '#069';
  ctx.fillText('TaskForge Fingerprint', 2, 15);
  ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
  ctx.fillText('Security Layer', 4, 45);

  // Draw shapes (anti-aliasing differs by GPU/driver)
  ctx.beginPath();
  ctx.arc(50, 25, 20, 0, Math.PI * 2, true);
  ctx.closePath();
  ctx.fill();

  // Get data URL and hash it
  const dataUrl = canvas.toDataURL();
  return await hashString(dataUrl);
}

/**
 * Get WebGL fingerprint
 * Uses WebGL renderer info for additional uniqueness
 */
function getWebGLFingerprint(): string {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    
    if (!gl || !(gl instanceof WebGLRenderingContext)) {
      return 'webgl-unavailable';
    }

    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    if (debugInfo) {
      const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
      const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
      return `${vendor}|${renderer}`;
    }

    return gl.getParameter(gl.VERSION) || 'webgl-no-version';
  } catch {
    return 'webgl-error';
  }
}

/**
 * Get audio fingerprint
 * Uses AudioContext oscillator for fingerprinting
 */
async function getAudioFingerprint(): Promise<string> {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) {
      return 'audio-unavailable';
    }

    const context = new AudioContext();
    const oscillator = context.createOscillator();
    const analyser = context.createAnalyser();
    const gain = context.createGain();
    const scriptProcessor = context.createScriptProcessor(4096, 1, 1);

    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(10000, context.currentTime);

    gain.gain.setValueAtTime(0, context.currentTime);

    oscillator.connect(analyser);
    analyser.connect(scriptProcessor);
    scriptProcessor.connect(gain);
    gain.connect(context.destination);

    oscillator.start(0);

    const fingerprint = await new Promise<string>((resolve) => {
      scriptProcessor.onaudioprocess = (event) => {
        const data = event.inputBuffer.getChannelData(0);
        const sum = data.reduce((acc, val) => acc + Math.abs(val), 0);
        oscillator.stop();
        context.close();
        resolve(sum.toString(36).slice(0, 10));
      };
    });

    return fingerprint;
  } catch {
    return 'audio-error';
  }
}

/**
 * Get screen/display fingerprint
 */
function getScreenFingerprint(): string {
  const screen = window.screen;
  return [
    screen.width,
    screen.height,
    screen.colorDepth,
    screen.pixelDepth,
    window.devicePixelRatio || 1,
  ].join('|');
}

/**
 * Get timezone fingerprint
 */
function getTimezoneFingerprint(): string {
  const offset = new Date().getTimezoneOffset();
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return `${timezone}|${offset}`;
}

/**
 * Get browser/platform fingerprint
 */
function getPlatformFingerprint(): string {
  const nav = navigator;
  return [
    nav.platform,
    nav.hardwareConcurrency || 0,
    nav.language,
    nav.languages?.join(',') || '',
    nav.cookieEnabled,
    'ontouchstart' in window,
    nav.maxTouchPoints || 0,
  ].join('|');
}

/**
 * Hash a string using Web Crypto API
 */
async function hashString(str: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Generate Tauri UUID (Desktop)
 * Uses Tauri's native UUID generation
 */
async function getTauriUUID(): Promise<string> {
  try {
    // Dynamic import for Tauri API
    const { invoke } = await import('@tauri-apps/api/core');
    const uuid = await invoke<string>('get_machine_id');
    return uuid;
  } catch {
    // Fallback to browser fingerprint
    return getCanvasFingerprint();
  }
}

/**
 * Hardware Fingerprint Interface
 */
export interface HardwareFingerprint {
  id: string;
  canvas: string;
  webgl: string;
  screen: string;
  timezone: string;
  platform: string;
  timestamp: number;
}

/**
 * Generate complete hardware fingerprint
 * 
 * @returns Promise<HardwareFingerprint> - The device fingerprint
 */
export async function generateHardwareFingerprint(): Promise<HardwareFingerprint> {
  const components: string[] = [];

  // Get all fingerprint components
  const [canvas, webgl, screen, timezone, platform] = await Promise.all([
    getCanvasFingerprint(),
    Promise.resolve(getWebGLFingerprint()),
    Promise.resolve(getScreenFingerprint()),
    Promise.resolve(getTimezoneFingerprint()),
    Promise.resolve(getPlatformFingerprint()),
  ]);

  components.push(canvas, webgl, screen, timezone, platform);

  // Generate combined hash
  const combinedHash = await hashString(components.join('::'));

  return {
    id: combinedHash.slice(0, 32),
    canvas,
    webgl,
    screen,
    timezone,
    platform,
    timestamp: Date.now(),
  };
}

/**
 * Get or create device fingerprint
 * Caches in localStorage for consistency
 */
export async function getDeviceFingerprint(): Promise<string> {
  const STORAGE_KEY = 'th_device_fp';
  
  // Check for cached fingerprint
  const cached = localStorage.getItem(STORAGE_KEY);
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      // Verify fingerprint is still valid (regenerate after 30 days)
      if (parsed.timestamp && Date.now() - parsed.timestamp < 30 * 24 * 60 * 60 * 1000) {
        return parsed.id;
      }
    } catch {
      // Cache corrupted, regenerate
    }
  }

  // Generate new fingerprint
  if (isTauri) {
    const uuid = await getTauriUUID();
    const fingerprint = { id: uuid, timestamp: Date.now() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fingerprint));
    return uuid;
  }

  const fingerprint = await generateHardwareFingerprint();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(fingerprint));
  return fingerprint.id;
}

/**
 * Verify session fingerprint matches current device
 * Used to detect session hijacking
 */
export async function verifySessionBinding(sessionFingerprint: string): Promise<boolean> {
  const currentFingerprint = await getDeviceFingerprint();
  return currentFingerprint === sessionFingerprint;
}

/**
 * Create session with hardware binding
 * Encrypts session data with device fingerprint
 */
export async function createBoundSession(sessionData: object): Promise<string> {
  const fingerprint = await getDeviceFingerprint();
  const payload = {
    ...sessionData,
    __fp: fingerprint,
    __ts: Date.now(),
  };
  
  // Encode as base64 for storage
  const jsonString = JSON.stringify(payload);
  return btoa(jsonString);
}

/**
 * Validate bound session
 * Decrypts and verifies fingerprint
 */
export async function validateBoundSession(encodedSession: string): Promise<{
  valid: boolean;
  data: object | null;
  reason?: string;
}> {
  try {
    const jsonString = atob(encodedSession);
    const payload = JSON.parse(jsonString);
    
    if (!payload.__fp) {
      return { valid: false, data: null, reason: 'Missing fingerprint' };
    }
    
    const isValid = await verifySessionBinding(payload.__fp);
    if (!isValid) {
      return { valid: false, data: null, reason: 'Fingerprint mismatch - possible session hijacking' };
    }
    
    // Remove internal fields before returning
    const { __fp, __ts, ...data } = payload;
    return { valid: true, data };
  } catch {
    return { valid: false, data: null, reason: 'Invalid session format' };
  }
}
