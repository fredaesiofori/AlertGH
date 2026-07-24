import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  query,
  orderBy,
  setDoc,
  deleteDoc,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { getStorage, ref, uploadString, getDownloadURL } from 'firebase/storage';
import { Incident, EmergencyContact } from './types';
import { INITIAL_INCIDENTS, EMERGENCY_CONTACTS } from './data/ghanaData';

const isFirebaseConfigured = !!(
  import.meta.env.VITE_FIREBASE_API_KEY &&
  import.meta.env.VITE_FIREBASE_PROJECT_ID
);

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

let app: any;
let db: any = null;
let auth: any = null;
let storage: any = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    db = getFirestore(app);
    auth = getAuth(app);
    storage = getStorage(app);
    console.log('Firebase initialized successfully!');
  } catch (error) {
    console.error('Failed to initialize Firebase:', error);
  }
} else {
  console.warn('Firebase environment variables are not configured. Falling back to local storage.');
}

// Rate limiting: max 3 incident submissions per 60 seconds per browser session
const RATE_LIMIT_MAX = 3;
const RATE_LIMIT_WINDOW_MS = 60_000;
const submissionTimestamps: number[] = [];

const checkRateLimit = (): void => {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW_MS;
  const recent = submissionTimestamps.filter(t => t > windowStart);
  if (recent.length >= RATE_LIMIT_MAX) {
    throw new Error('Too many reports submitted. Please wait a moment before trying again.');
  }
  submissionTimestamps.push(now);
};

// Input sanitization: strip HTML tags and trim
const sanitize = (str: string): string =>
  str.replace(/<[^>]*>/g, '').trim().slice(0, 2000);

// Log sanitization: strip newlines to prevent log injection
const sanitizeLog = (val: unknown): string =>
  String(val).replace(/\r?\n/g, ' ');

// Memory & LocalStorage Fallback State
const getLocalIncidents = (): Incident[] => {
  try {
    const saved = localStorage.getItem('alertgh_incidents');
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error('Error parsing local incidents:', sanitizeLog(e));
  }
  localStorage.setItem('alertgh_incidents', JSON.stringify(INITIAL_INCIDENTS));
  return INITIAL_INCIDENTS;
};

const saveLocalIncidents = (incidents: Incident[]) => {
  localStorage.setItem('alertgh_incidents', JSON.stringify(incidents));
};

const getLocalContacts = (): EmergencyContact[] => {
  try {
    const saved = localStorage.getItem('alertgh_emergency_contacts');
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error('Error parsing local emergency contacts:', sanitizeLog(e));
  }
  localStorage.setItem('alertgh_emergency_contacts', JSON.stringify(EMERGENCY_CONTACTS));
  return EMERGENCY_CONTACTS;
};

const saveLocalContacts = (contacts: EmergencyContact[]) => {
  localStorage.setItem('alertgh_emergency_contacts', JSON.stringify(contacts));
};

// Seeding Firestore Helper
const seedFirestoreIfNeeded = async (collectionName: string, initialData: any[]) => {
  if (!db) return;
  try {
    const colRef = collection(db, collectionName);
    const snapshot = await getDocs(colRef);
    if (snapshot.empty) {
      console.log(`Seeding ${collectionName} in Firestore...`);
      for (const item of initialData) {
        // Use setDoc with item.id to keep IDs clean, or addDoc if no ID
        if (item.id) {
          await setDoc(doc(db, collectionName, item.id), item);
        } else {
          await addDoc(colRef, item);
        }
      }
      console.log(`Finished seeding ${collectionName}.`);
    }
  } catch (error) {
    console.error(`Error seeding ${sanitizeLog(collectionName)}:`, sanitizeLog(error));
  }
};

// API Functions

export const fetchIncidentsFromFirestore = async (): Promise<Incident[]> => {
  if (!isFirebaseConfigured || !db) {
    return getLocalIncidents();
  }

  try {
    // Seed database on first run if empty
    await seedFirestoreIfNeeded('incidents', INITIAL_INCIDENTS);

    const colRef = collection(db, 'incidents');
    const q = query(colRef, orderBy('reportedAt', 'desc'));
    const snapshot = await getDocs(q);
    
    const incidents: Incident[] = [];
    snapshot.forEach((docSnap) => {
      incidents.push({
        id: docSnap.id,
        ...docSnap.data()
      } as Incident);
    });

    // If somehow empty after seed check, return initials
    if (incidents.length === 0) {
      return INITIAL_INCIDENTS;
    }
    
    // Save to local cache as a backup
    saveLocalIncidents(incidents);
    return incidents;
  } catch (error) {
    console.error('Failed to fetch incidents from Firestore:', sanitizeLog(error));
    // Graceful fallback to local cache
    return getLocalIncidents();
  }
};

export const fetchContactsFromFirestore = async (): Promise<EmergencyContact[]> => {
  if (!isFirebaseConfigured || !db) {
    return getLocalContacts();
  }

  try {
    // Seed database on first run if empty
    await seedFirestoreIfNeeded('emergency_contacts', EMERGENCY_CONTACTS);

    const colRef = collection(db, 'emergency_contacts');
    const snapshot = await getDocs(colRef);
    
    const contacts: EmergencyContact[] = [];
    snapshot.forEach((docSnap) => {
      contacts.push({
        id: docSnap.id,
        ...docSnap.data()
      } as EmergencyContact);
    });

    if (contacts.length === 0) {
      return EMERGENCY_CONTACTS;
    }

    saveLocalContacts(contacts);
    return contacts;
  } catch (error) {
    console.error('Failed to fetch emergency contacts from Firestore:', sanitizeLog(error));
    return getLocalContacts();
  }
};

// Upload base64 camera image to Firebase Storage, return public URL
export const uploadImageToStorage = async (base64DataUrl: string, incidentId: string): Promise<string> => {
  if (!isFirebaseConfigured || !storage) return base64DataUrl;
  try {
    const storageRef = ref(storage, `incident-images/${incidentId}-${Date.now()}.jpg`);
    await uploadString(storageRef, base64DataUrl, 'data_url');
    return await getDownloadURL(storageRef);
  } catch (error) {
    console.error('Failed to upload image to Storage:', sanitizeLog(error));
    return base64DataUrl; // fallback to base64
  }
};

// Real-time listener for incidents
export const subscribeToIncidents = (callback: (incidents: Incident[]) => void): Unsubscribe => {
  if (!isFirebaseConfigured || !db) {
    callback(getLocalIncidents());
    return () => {};
  }
  const q = query(collection(db, 'incidents'), orderBy('reportedAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const incidents: Incident[] = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Incident));
    saveLocalIncidents(incidents);
    callback(incidents);
  }, (error) => {
    console.error('Firestore snapshot error:', sanitizeLog(error));
    callback(getLocalIncidents());
  });
};

export const addIncidentToFirestore = async (newIncident: Omit<Incident, 'id' | 'reportedAt' | 'verificationScore' | 'upvotes' | 'downvotes' | 'status'>): Promise<Incident> => {
  // Rate limit check
  checkRateLimit();

  // Sanitize user-supplied text fields
  const sanitized = {
    ...newIncident,
    title: sanitize(newIncident.title).slice(0, 200),
    description: sanitize(newIncident.description),
    city: sanitize(newIncident.city).slice(0, 100),
    reportedBy: sanitize(newIncident.reportedBy).slice(0, 100),
  };

  const reportedAt = new Date().toISOString();
  const baseIncident = {
    ...sanitized,
    reportedAt,
    verificationScore: 1,
    upvotes: 1,
    downvotes: 0,
    status: 'active' as const,
  };

  if (!isFirebaseConfigured || !db) {
    const local = getLocalIncidents();
    const createdIncident: Incident = { ...baseIncident, id: `inc-${Date.now()}` };
    saveLocalIncidents([createdIncident, ...local]);
    return createdIncident;
  }

  try {
    // Upload camera image to Storage if it's a base64 data URL
    let finalIncident = { ...baseIncident };
    if (finalIncident.customImage?.startsWith('data:')) {
      const tempId = `inc-${Date.now()}`;
      finalIncident.customImage = await uploadImageToStorage(finalIncident.customImage, tempId);
    }
    const colRef = collection(db, 'incidents');
    const docRef = await addDoc(colRef, finalIncident);
    return { ...finalIncident, id: docRef.id };
  } catch (error) {
    console.error('Error adding incident to Firestore:', sanitizeLog(error));
    const local = getLocalIncidents();
    const createdIncident: Incident = { ...baseIncident, id: `inc-${Date.now()}` };
    saveLocalIncidents([createdIncident, ...local]);
    return createdIncident;
  }
};

export const updateIncidentInFirestore = async (id: string, updates: Partial<Incident>): Promise<void> => {
  if (!isFirebaseConfigured || !db) {
    const local = getLocalIncidents();
    const updated = local.map(inc => inc.id === id ? { ...inc, ...updates } : inc);
    saveLocalIncidents(updated);
    return;
  }

  try {
    const docRef = doc(db, 'incidents', id);
    await updateDoc(docRef, updates);
  } catch (error) {
    console.error(`Error updating incident ${sanitizeLog(id)} in Firestore:`, sanitizeLog(error));
    // Fallback save locally
    const local = getLocalIncidents();
    const updated = local.map(inc => inc.id === id ? { ...inc, ...updates } : inc);
    saveLocalIncidents(updated);
    throw error;
  }
};

export const deleteIncidentFromFirestore = async (id: string): Promise<void> => {
  if (!isFirebaseConfigured || !db) {
    const local = getLocalIncidents();
    const updated = local.filter(inc => inc.id !== id);
    saveLocalIncidents(updated);
    return;
  }

  try {
    const docRef = doc(db, 'incidents', id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error(`Error deleting incident ${sanitizeLog(id)} from Firestore:`, sanitizeLog(error));
    const local = getLocalIncidents();
    const updated = local.filter(inc => inc.id !== id);
    saveLocalIncidents(updated);
    throw error;
  }
};

export { auth, isFirebaseConfigured };

// Abstracted Auth APIs supporting both Real Firebase & Offline Mock Fallback
let mockAuthUser: any = null;
const authCallbacks: Array<(user: any) => void> = [];

export const onAuthChanged = (callback: (user: any) => void) => {
  if (isFirebaseConfigured && auth) {
    return onAuthStateChanged(auth, callback);
  } else {
    // Initialize mock user from localStorage
    try {
      const saved = localStorage.getItem('alertgh_mock_user');
      if (saved) {
        mockAuthUser = JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error loading mock user:', sanitizeLog(e));
    }
    
    callback(mockAuthUser);
    authCallbacks.push(callback);
    
    return () => {
      const idx = authCallbacks.indexOf(callback);
      if (idx > -1) {
        authCallbacks.splice(idx, 1);
      }
    };
  }
};

export const loginWithEmail = async (email: string, password: string): Promise<any> => {
  if (isFirebaseConfigured && auth) {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    return cred.user;
  } else {
    // Validate inputs for realistic experience
    if (!email || !email.includes('@')) {
      throw new Error('Please enter a valid email address.');
    }
    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters long.');
    }
    
    const user = { 
      email, 
      uid: `mock-user-${Date.now()}`,
      displayName: email.split('@')[0]
    };
    mockAuthUser = user;
    localStorage.setItem('alertgh_mock_user', JSON.stringify(user));
    authCallbacks.forEach(cb => cb(user));
    return user;
  }
};

export const registerWithEmail = async (email: string, password: string): Promise<any> => {
  if (isFirebaseConfigured && auth) {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    return cred.user;
  } else {
    if (!email || !email.includes('@')) {
      throw new Error('Please enter a valid email address.');
    }
    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters long.');
    }
    
    const user = { 
      email, 
      uid: `mock-user-${Date.now()}`,
      displayName: email.split('@')[0]
    };
    mockAuthUser = user;
    localStorage.setItem('alertgh_mock_user', JSON.stringify(user));
    authCallbacks.forEach(cb => cb(user));
    return user;
  }
};

export const logoutUser = async (): Promise<void> => {
  if (isFirebaseConfigured && auth) {
    await signOut(auth);
  } else {
    mockAuthUser = null;
    localStorage.removeItem('alertgh_mock_user');
    authCallbacks.forEach(cb => cb(null));
  }
};

