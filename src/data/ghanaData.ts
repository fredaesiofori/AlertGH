import { Incident, EmergencyContact } from '../types';

export interface GhanaRegion {
  id: string;
  name: string;
  capital: string;
  code: string;
  x: number; // Percentage from left of SVG map (0-100)
  y: number; // Percentage from top of SVG map (0-100)
  description: string;
  svgPath?: string; // We'll construct standard polished nodes, but this keeps it clean
}

export const GHANA_REGIONS: GhanaRegion[] = [
  { id: 'greater-accra', name: 'Greater Accra', capital: 'Accra', code: 'GA', x: 74, y: 88, description: 'Capital region, high density, prone to urban flooding' },
  { id: 'ashanti', name: 'Ashanti', capital: 'Kumasi', code: 'AS', x: 48, y: 70, description: 'Central commercial belt, heavy traffic and market fires' },
  { id: 'northern', name: 'Northern', capital: 'Tamale', code: 'NO', x: 55, y: 36, description: 'Largest landmass, prone to seasonal dry winds and bushfires' },
  { id: 'western', name: 'Western', capital: 'Sekondi-Takoradi', code: 'WE', x: 28, y: 91, description: 'Coastal oil and industrial zone, heavy seasonal rains' },
  { id: 'central', name: 'Central', capital: 'Cape Coast', code: 'CE', x: 50, y: 90, description: 'Historic educational hub, coastal road closures' },
  { id: 'eastern', name: 'Eastern', capital: 'Koforidua', code: 'EA', x: 67, y: 78, description: 'Mountainous terrain, risk of mudslides and road accidents' },
  { id: 'volta', name: 'Volta', capital: 'Ho', code: 'VO', x: 81, y: 76, description: 'Border region near Volta lake, river flooding issues' },
  { id: 'upper-east', name: 'Upper East', capital: 'Bolgatanga', code: 'UE', x: 60, y: 12, description: 'Arid north-eastern border, water scarcity and heatwaves' },
  { id: 'upper-west', name: 'Upper West', capital: 'Wa', code: 'UW', x: 24, y: 18, description: 'North-western agricultural hub, seasonal storm damage' },
  { id: 'bono', name: 'Bono', capital: 'Sunyani', code: 'BO', x: 30, y: 60, description: 'Western timber zone, risk of road incidents' },
  { id: 'bono-east', name: 'Bono East', capital: 'Techiman', code: 'BE', x: 48, y: 56, description: 'Major transit corridor, heavy truck traffic' },
  { id: 'ahafo', name: 'Ahafo', capital: 'Goaso', code: 'AH', x: 28, y: 68, description: 'Forest belt, localized bushfires and water issues' },
  { id: 'savannah', name: 'Savannah', capital: 'Damongo', code: 'SA', x: 34, y: 38, description: 'Expansive game reserves, localized seasonal flooding' },
  { id: 'north-east', name: 'North East', capital: 'Nalerigu', code: 'NE', x: 66, y: 22, description: 'Hilly terrain, risk of seasonal storm blockages' },
  { id: 'oti', name: 'Oti', capital: 'Dambai', code: 'OT', x: 78, y: 58, description: 'Volta lake basin, water transport accidents' },
  { id: 'western-north', name: 'Western North', capital: 'Sefwi Wiawso', code: 'WN', x: 22, y: 80, description: 'Rainforest mining hub, landslide and road block risks' }
];

export const INITIAL_INCIDENTS: Incident[] = [
  {
    id: 'inc-1',
    title: 'Severe Flooding at Kwame Nkrumah Circle Interchange',
    category: 'flooding',
    region: 'Greater Accra',
    city: 'Accra Central',
    description: 'Heavy continuous rains have caused the Odaw river to overflow. The Circle interchange and underpass are completely flooded. Multiple vehicles are submerged. Avoid this route entirely and use the Kanda or Achimota bypasses.',
    severity: 'critical',
    reportedAt: '2026-07-17T15:30:00-07:00',
    reportedBy: 'Kofi Mensah',
    verificationScore: 24,
    upvotes: 26,
    downvotes: 2,
    status: 'active',
    imagePreset: 'flood_accra',
    coordinates: { x: 74, y: 88 }
  },
  {
    id: 'inc-2',
    title: 'Transformer Explosion & Outage in Adum Market',
    category: 'power-outage',
    region: 'Ashanti',
    city: 'Kumasi Adum',
    description: 'A major ECG power transformer exploded near the Adum Post Office, plunging the entire market and surrounding commercial structures into absolute darkness. Highly loud blast heard. ECG officials have been notified.',
    severity: 'medium',
    reportedAt: '2026-07-17T17:15:00-07:00',
    reportedBy: 'Ama Serwaa',
    verificationScore: 12,
    upvotes: 13,
    downvotes: 1,
    status: 'investigating',
    imagePreset: 'power_kumasi',
    coordinates: { x: 48, y: 70 }
  },
  {
    id: 'inc-3',
    title: 'Multi-car Collision on Accra-Tema Motorway',
    category: 'accident',
    region: 'Greater Accra',
    city: 'Motorway (Near Toll Booth)',
    description: 'A collision involving a commercial Sprinter bus and two private SUVs has blocked both Accra-bound lanes. Multiple casualties reported. Emergency responders, National Ambulance Service, and police are currently on scene. Extremely heavy gridlock backing up to Ashaiman.',
    severity: 'critical',
    reportedAt: '2026-07-17T16:45:00-07:00',
    reportedBy: 'Anonymous Citizen',
    verificationScore: 19,
    upvotes: 19,
    downvotes: 0,
    status: 'active',
    imagePreset: 'accident_motorway',
    coordinates: { x: 76, y: 86 }
  },
  {
    id: 'inc-4',
    title: 'Mudslide Blocks Aburi Mountain Road',
    category: 'road-closure',
    region: 'Eastern',
    city: 'Aburi Hill (Peduase)',
    description: 'Following heavy downpours, a localized mudslide has deposited large boulders and mud onto the climbing lane near Peduase Lodge. The road is dangerously slippery. One lane is closed, causing slow traffic. Heavy-duty clearing equipment is required.',
    severity: 'high',
    reportedAt: '2026-07-17T14:10:00-07:00',
    reportedBy: 'Kwame Boateng',
    verificationScore: 15,
    upvotes: 16,
    downvotes: 1,
    status: 'active',
    imagePreset: 'road_aburi',
    coordinates: { x: 67, y: 78 }
  },
  {
    id: 'inc-5',
    title: 'Controlled Bushfire Extinguished near Tamale Bypass',
    category: 'fire',
    region: 'Northern',
    city: 'Tamale North',
    description: 'A localized farm bushfire spread rapidly toward the residential bypass due to strong dry winds. Ghana National Fire Service deployed 2 fire trucks and successfully contained the outbreak. No casualties or building damages. Road is now clear.',
    severity: 'low',
    reportedAt: '2026-07-17T11:00:00-07:00',
    reportedBy: 'Sulemana Alidu',
    verificationScore: 8,
    upvotes: 10,
    downvotes: 2,
    status: 'resolved',
    officialNotes: 'GNFS Fire Tender 4 and 11 successfully extinguished the blaze. Site monitored for hot spots. Deemed safe at 12:45.',
    imagePreset: 'fire_tamale',
    coordinates: { x: 55, y: 36 }
  }
];

export const EMERGENCY_CONTACTS: EmergencyContact[] = [
  {
    id: 'contact-1',
    name: 'National Ambulance Service',
    number: '193',
    category: 'ambulance',
    description: 'Ghana standard medical emergency toll-free helpline. Quickest medical dispatch.'
  },
  {
    id: 'contact-2',
    name: 'Ghana National Fire Service',
    number: '192',
    category: 'fire',
    description: 'Report fires, gas leaks, structural collapses, and accident extractions nationwide.'
  },
  {
    id: 'contact-3',
    name: 'Ghana Police Service (Emergency)',
    number: '191',
    category: 'police',
    description: 'Toll-free police emergency response. Also accessible on 18555 (crime fighters).'
  },
  {
    id: 'contact-4',
    name: 'NADMO Headquarters',
    number: '030 277 2535',
    category: 'disaster',
    description: 'National Disaster Management Organisation. Handles flooding, earthquake response, and relief coordination.'
  },
  {
    id: 'contact-5',
    name: 'Electricity Company of Ghana (ECG)',
    number: '030 261 1611',
    category: 'utility',
    description: 'Report blackouts, spark poles, fallen lines, or transformer issues (Southern zone).'
  },
  {
    id: 'contact-6',
    name: 'Ghana Water Company Limited (GWCL)',
    number: '0800 40000',
    category: 'utility',
    description: 'Toll-free. Report major burst mains, water leaks, and municipal water interruptions.'
  },
  {
    id: 'contact-7',
    name: 'National COVID-19/Health Helpline',
    number: '112',
    category: 'health',
    description: 'General national emergency central hub, routes to Police, Fire, and Ambulance.'
  }
];
