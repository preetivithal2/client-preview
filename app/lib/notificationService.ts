/** Simple client-side notification service using localStorage with 24hr expiry */

const STORAGE_KEY = "app_notifications";
const TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

export interface AppNotification {
  id: string;
  type: "offline" | "delete";
  message: string;
  timestamp: number;
}

export function getNotifications(): AppNotification[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const all: AppNotification[] = JSON.parse(raw);
    const now = Date.now();
    // Filter out expired ones and clean up
    const active = all.filter((n) => now - n.timestamp < TTL_MS);
    if (active.length !== all.length) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(active));
    }
    return active;
  } catch {
    return [];
  }
}

export function addNotification(type: AppNotification["type"], message: string) {
  try {
    const existing = getNotifications();
    existing.push({
      id: `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      type,
      message,
      timestamp: Date.now(),
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
    window.dispatchEvent(new Event("notification-update"));
    // Play notification sound
    playNotifySound();
  } catch {
    // localStorage full or unavailable — silently ignore
  }
}

function playNotifySound() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 520;
    osc.type = "sine";
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.3);
  } catch {
    // Audio not available — silently ignore
  }
}

export function dismissNotification(id: string) {
  try {
    const active = getNotifications().filter((n) => n.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(active));
    window.dispatchEvent(new Event("notification-update"));
  } catch {
    // ignore
  }
}
