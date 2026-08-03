export function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch (error) {
    console.warn(`Unable to read storage for ${key}:`, error);
    return fallback;
  }
}

export function writeStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`Unable to write storage for ${key}:`, error);
  }
}

export interface ReportDraftValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export interface ResponderSummary {
  total: number;
  active: number;
  investigating: number;
  resolved: number;
  flagged: number;
  verified: number;
  pendingReview: number;
}

export function getResponderSummary(incidents: Array<{ status?: string; moderationStatus?: string; reviewStatus?: string }>): ResponderSummary {
  const total = incidents.length;
  const active = incidents.filter((incident) => incident.status === 'active').length;
  const investigating = incidents.filter((incident) => incident.status === 'investigating').length;
  const resolved = incidents.filter((incident) => incident.status === 'resolved').length;
  const flagged = incidents.filter((incident) => incident.moderationStatus && incident.moderationStatus !== 'clean').length;
  const verified = incidents.filter((incident) => incident.reviewStatus === 'verified').length;
  const pendingReview = incidents.filter((incident) => incident.reviewStatus === 'pending' || !incident.reviewStatus).length;

  return {
    total,
    active,
    investigating,
    resolved,
    flagged,
    verified,
    pendingReview,
  };
}

import { IncidentStatus, SeverityLevel } from './types';

export function buildResponderIncidentUpdate(params: {
  status?: IncidentStatus;
  officialSeverity?: SeverityLevel;
  reviewStatus?: 'pending' | 'verified' | 'dismissed';
  reviewReason?: string;
  internalNotes?: string;
  assignedAgency?: string;
}) {
  return {
    ...(params.status ? { status: params.status } : {}),
    ...(params.officialSeverity ? { officialSeverity: params.officialSeverity } : {}),
    ...(params.reviewStatus ? { reviewStatus: params.reviewStatus } : {}),
    ...(params.reviewReason ? { reviewReason: params.reviewReason } : {}),
    ...(params.internalNotes ? { internalNotes: params.internalNotes } : {}),
    ...(params.assignedAgency ? { assignedAgency: params.assignedAgency } : {}),
  };
}

export function getOfficialSeverity(params: { severity?: SeverityLevel; officialSeverity?: SeverityLevel }) {
  return params.officialSeverity || params.severity || 'medium';
}

export function validateReportDraft(params: {
  title: string;
  city: string;
  description: string;
  reporterName: string;
  isAnonymous: boolean;
}): ReportDraftValidationResult {
  const errors: Record<string, string> = {};

  const title = params.title.trim();
  const city = params.city.trim();
  const description = params.description.trim();
  const reporterName = params.reporterName.trim();

  if (!title) {
    errors.title = 'A hazard title is required.';
  } else if (title.length > 200) {
    errors.title = 'The title must be 200 characters or fewer.';
  }

  if (!city) {
    errors.city = 'A city or neighborhood is required.';
  }

  if (!description) {
    errors.description = 'Please add a short description of the hazard.';
  } else if (description.length > 2000) {
    errors.description = 'The description must be 2000 characters or fewer.';
  }

  if (!params.isAnonymous && !reporterName) {
    errors.reporterName = 'Please enter your name if you are not submitting anonymously.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function formatTimeAgo(dateInput: string | Date): string {
  try {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    if (isNaN(date.getTime())) {
      return '';
    }
    
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (seconds < 0) {
      if (Math.abs(seconds) < 120) {
        return 'just now';
      }
      return 'just now';
    }
    
    if (seconds < 60) {
      return 'just now';
    }
    
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) {
      return `${minutes} min${minutes > 1 ? 's' : ''} ago`;
    }
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    }
    
    const days = Math.floor(hours / 24);
    if (days < 30) {
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
    
    const months = Math.floor(days / 30);
    if (months < 12) {
      return `${months} month${months > 1 ? 's' : ''} ago`;
    }
    
    const years = Math.floor(months / 12);
    return `${years} year${years > 1 ? 's' : ''} ago`;
  } catch (error) {
    console.error('Error formatting time ago:', error);
    return '';
  }
}
