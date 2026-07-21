export type IncidentCategory = 'flooding' | 'fire' | 'accident' | 'road-closure' | 'power-outage' | 'medical' | 'other';

export type SeverityLevel = 'critical' | 'high' | 'medium' | 'low';

export type IncidentStatus = 'active' | 'investigating' | 'resolved';

export interface Incident {
  id: string;
  title: string;
  category: IncidentCategory;
  region: string;
  city: string;
  description: string;
  severity: SeverityLevel;
  reportedAt: string;
  reportedBy: string;
  verificationScore: number;
  upvotes: number;
  downvotes: number;
  status: IncidentStatus;
  officialNotes?: string;
  imagePreset?: string;
  customImage?: string;
  coordinates: { x: number; y: number }; // Percentage position on the custom SVG map (0-100)
  moderationStatus?: 'flagged_spam' | 'flagged_duplicate' | 'flagged_fraudulent' | 'clean';
}

export interface EmergencyContact {
  id: string;
  name: string;
  number: string;
  category: 'ambulance' | 'fire' | 'police' | 'disaster' | 'utility' | 'health';
  description: string;
}



export interface NotificationPreference {
  isSubscribed: boolean;
  geofence: string; // 'all' or a specific region name
  severities: SeverityLevel[];
  categories: IncidentCategory[];
}

export interface PushNotification {
  id: string;
  title: string;
  message: string;
  incidentId?: string;
  timestamp: string;
  read: boolean;
  type: 'new_incident' | 'status_update' | 'info_update';
  severity: SeverityLevel;
}

