import { useState, useEffect, useCallback, useRef } from 'react';
import {
  registerFCMToken,
  unregisterFCMToken,
  updateFCMTokenPrefs,
  FCMPermissionState,
} from '../firebase';
import { NotificationPreference } from '../types';

// Stable anonymous session ID persisted across page loads
function getSessionId(): string {
  let id = localStorage.getItem('alertgh_session_id');
  if (!id) {
    id = `anon-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    localStorage.setItem('alertgh_session_id', id);
  }
  return id;
}

export type FCMState = {
  permission: FCMPermissionState;
  isRegistered: boolean;
  isLoading: boolean;
  enablePush: () => Promise<void>;
  disablePush: () => Promise<void>;
};

export function useFCM(notifPref: NotificationPreference): FCMState {
  const sessionId = useRef(getSessionId()).current;

  const [permission, setPermission] = useState<FCMPermissionState>(() => {
    if (!('Notification' in window)) return 'unsupported';
    return (Notification.permission as FCMPermissionState);
  });
  const [isRegistered, setIsRegistered] = useState(() =>
    !!localStorage.getItem('alertgh_fcm_registered')
  );
  const [isLoading, setIsLoading] = useState(false);

  // Sync pref changes to Firestore when already registered
  useEffect(() => {
    if (!isRegistered) return;
    updateFCMTokenPrefs(sessionId, {
      geofence: notifPref.geofence,
      severities: notifPref.severities,
      categories: notifPref.categories,
    });
  }, [isRegistered, sessionId, notifPref.geofence, notifPref.severities, notifPref.categories]);

  // Listen for deep-link navigation messages from the FCM service worker
  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (event.data?.type === 'NAVIGATE_TO_INCIDENT') {
        // Dispatch a custom event the app can listen to
        window.dispatchEvent(new CustomEvent('fcm:navigate', { detail: { incidentId: event.data.incidentId } }));
      }
    };
    navigator.serviceWorker?.addEventListener('message', handler);
    return () => navigator.serviceWorker?.removeEventListener('message', handler);
  }, []);

  const enablePush = useCallback(async () => {
    setIsLoading(true);
    try {
      const { token, permission: perm } = await registerFCMToken(sessionId, {
        geofence: notifPref.geofence,
        severities: notifPref.severities,
        categories: notifPref.categories,
      });
      setPermission(perm);
      if (token) {
        setIsRegistered(true);
        localStorage.setItem('alertgh_fcm_registered', '1');
      }
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, notifPref]);

  const disablePush = useCallback(async () => {
    setIsLoading(true);
    try {
      await unregisterFCMToken(sessionId);
      setIsRegistered(false);
      localStorage.removeItem('alertgh_fcm_registered');
    } finally {
      setIsLoading(false);
    }
  }, [sessionId]);

  return { permission, isRegistered, isLoading, enablePush, disablePush };
}
