import { useState, useCallback } from 'react';
import { PushNotification, NotificationPreference, Incident, SeverityLevel, IncidentCategory } from '../types';

const DEFAULT_PREF: NotificationPreference = {
  isSubscribed: true,
  geofence: 'all',
  severities: ['critical', 'high', 'medium', 'low'],
  categories: ['flooding', 'fire', 'accident', 'road-closure', 'power-outage', 'medical', 'other'],
};

function loadPref(): NotificationPreference {
  try {
    const saved = localStorage.getItem('alertgh_notif_pref');
    if (saved) return JSON.parse(saved);
  } catch {}
  return DEFAULT_PREF;
}

function loadNotifications(): PushNotification[] {
  try {
    const saved = localStorage.getItem('alertgh_notifications');
    if (saved) return JSON.parse(saved);
  } catch {}
  return [];
}

export function useNotifications() {
  const [notifPref, setNotifPrefState] = useState<NotificationPreference>(loadPref);
  const [notifications, setNotificationsState] = useState<PushNotification[]>(loadNotifications);
  const [activeToast, setActiveToast] = useState<PushNotification | null>(null);
  const [isMuted, setIsMuted] = useState(false);

  const setNotifPref = useCallback((updater: NotificationPreference | ((prev: NotificationPreference) => NotificationPreference)) => {
    setNotifPrefState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      localStorage.setItem('alertgh_notif_pref', JSON.stringify(next));
      return next;
    });
  }, []);

  const setNotifications = useCallback((updater: PushNotification[] | ((prev: PushNotification[]) => PushNotification[])) => {
    setNotificationsState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      localStorage.setItem('alertgh_notifications', JSON.stringify(next));
      return next;
    });
  }, []);

  const playAlertSound = useCallback((muted: boolean) => {
    if (muted) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.connect(gain1); gain1.connect(ctx.destination);
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(523.25, ctx.currentTime);
      gain1.gain.setValueAtTime(0.12, ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc1.start(ctx.currentTime); osc1.stop(ctx.currentTime + 0.25);
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.connect(gain2); gain2.connect(ctx.destination);
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(659.25, ctx.currentTime + 0.08);
      gain2.gain.setValueAtTime(0.12, ctx.currentTime + 0.08);
      gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc2.start(ctx.currentTime + 0.08); osc2.stop(ctx.currentTime + 0.35);
    } catch {}
  }, []);

  const triggerPushNotification = useCallback((
    type: PushNotification['type'],
    incident: Incident,
    customTitle?: string,
    customMessage?: string
  ) => {
    setNotifPrefState(pref => {
      if (!pref.isSubscribed) return pref;
      if (pref.geofence !== 'all' && pref.geofence.toLowerCase() !== incident.region?.toLowerCase()) return pref;
      if (!pref.severities.includes(incident.severity)) return pref;
      if (!pref.categories.includes(incident.category)) return pref;

      const id = `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const title = customTitle ?? (
        type === 'new_incident' ? `🚨 NEW ${incident.severity.toUpperCase()} EMERGENCY` :
        type === 'status_update' ? `🔄 STATUS RESOLVED/UPDATED` : `ℹ️ OFFICIAL INFO UPDATED`
      );
      const message = customMessage ?? `${incident.title} reported in ${incident.city}, ${incident.region}.`;

      const newNotif: PushNotification = {
        id, title, message,
        incidentId: incident.id,
        timestamp: new Date().toISOString(),
        read: false, type,
        severity: incident.severity,
      };

      setNotificationsState(prev => {
        const next = [newNotif, ...prev];
        localStorage.setItem('alertgh_notifications', JSON.stringify(next));
        return next;
      });

      setIsMuted(muted => { playAlertSound(muted); return muted; });

      setActiveToast(newNotif);
      setTimeout(() => setActiveToast(curr => curr?.id === id ? null : curr), 5500);

      return pref;
    });
  }, [playAlertSound]);

  return {
    notifPref, setNotifPref,
    notifications, setNotifications,
    activeToast, setActiveToast,
    isMuted, setIsMuted,
    triggerPushNotification,
  };
}
