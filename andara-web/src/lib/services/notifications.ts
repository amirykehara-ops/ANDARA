// src/lib/services/notifications.ts

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'alert';
  read: boolean;
  createdAt: string;
  link?: string;
  guide_email?: string;
}

// ─── LOCAL STORAGE HELPERS ───────────────────────────────────────────────────

function getLocal<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch (e) {
    return fallback;
  }
}

function setLocal(key: string, data: any): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {}
}

// ─── NOTIFICATION SERVICE ────────────────────────────────────────────────────

export async function getNotifications(guideEmail: string): Promise<AppNotification[]> {
  const local = getLocal<AppNotification[]>('andara_notifications', []);
  return local.filter(n => n.guide_email === guideEmail).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function addNotification(notification: Omit<AppNotification, 'id' | 'read' | 'createdAt'>, guideEmail: string): Promise<void> {
  const local = getLocal<AppNotification[]>('andara_notifications', []);
  
  const newNotif: AppNotification = {
    ...notification,
    id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    read: false,
    createdAt: new Date().toISOString(),
    guide_email: guideEmail,
  };

  local.unshift(newNotif);
  
  // Keep only the last 50 notifications to prevent local storage bloat
  if (local.length > 50) {
    local.pop();
  }

  setLocal('andara_notifications', local);
  
  // Emit event to update UI
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('andara_notifications_update'));
  }
}

export async function markNotificationAsRead(id: string): Promise<void> {
  const local = getLocal<AppNotification[]>('andara_notifications', []);
  const idx = local.findIndex(n => n.id === id);
  if (idx >= 0) {
    local[idx].read = true;
    setLocal('andara_notifications', local);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('andara_notifications_update'));
    }
  }
}

export async function markAllNotificationsAsRead(guideEmail: string): Promise<void> {
  const local = getLocal<AppNotification[]>('andara_notifications', []);
  let updated = false;
  local.forEach(n => {
    if (n.guide_email === guideEmail && !n.read) {
      n.read = true;
      updated = true;
    }
  });
  
  if (updated) {
    setLocal('andara_notifications', local);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('andara_notifications_update'));
    }
  }
}
