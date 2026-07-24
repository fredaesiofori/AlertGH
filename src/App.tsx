import React, { useState, useEffect } from 'react';
import { Incident, IncidentCategory, SeverityLevel, IncidentStatus, NotificationPreference, PushNotification } from './types';
import { GHANA_REGIONS, INITIAL_INCIDENTS } from './data/ghanaData';
import {
  subscribeToIncidents,
  addIncidentToFirestore,
  updateIncidentInFirestore,
  deleteIncidentFromFirestore,
  isFirebaseConfigured,
} from './firebase';
import { useAuth } from './hooks/useAuth';
import { useNotifications } from './hooks/useNotifications';
import GhanaMap from './components/GhanaMap';
import { formatTimeAgo } from './utils';
import DashboardStats from './components/DashboardStats';
import ReportForm from './components/ReportForm';
import EmergencyDirectory from './components/EmergencyDirectory';
import { Shield, Plus, Filter, Info, MapPin, Eye, Clock, ThumbsUp, ThumbsDown, CheckCircle, Flame, AlertTriangle, Radio, Server, ShieldAlert, HeartPulse, RefreshCw, Bell, BellOff, Trash2, Settings, Volume2, VolumeX, Share2, Map, BarChart3, Phone, Sun, Moon, X, HelpCircle, Loader2, PlusCircle, Edit3, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ghanaSunsetFlags from './assets/images/ghana_sunset_flags_1784416661446.jpg';
import ghanaSplatterLight from './assets/images/ghana_splatter_light_1784499115451.jpg';
import ghanaSplatterDark from './assets/images/ghana_splatter_dark_1784499129257.jpg';
import ghanaAvatarFreda from './assets/images/ghana_avatar_freda_1784589591824.jpg';
import { Onboarding } from './components/Onboarding';
import { ResponderOnboarding } from './components/ResponderOnboarding';

// Full-color high-fidelity representation of the original Ghana Coat of Arms
const GhanaCoatOfArms = () => (
  <svg
    viewBox="0 0 400 350"
    className="w-18 h-16 sm:w-20 sm:h-18 transition-all duration-300 hover:scale-105 filter drop-shadow-sm select-none"
    aria-hidden="true"
  >
    {/* Definitions for Gradients, Shadows, Filters */}
    <defs>
      {/* Sky Blue background for shield quarters */}
      <linearGradient id="shieldBlue" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#38BDF8" />
        <stop offset="100%" stopColor="#0284C7" />
      </linearGradient>
      {/* Gold/Yellow for Eagles, Lion, Scroll */}
      <linearGradient id="ghanaGold" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#FCD34D" />
        <stop offset="100%" stopColor="#D97706" />
      </linearGradient>
      {/* Eagle Wing gradient */}
      <linearGradient id="eagleGold" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFE082" />
        <stop offset="70%" stopColor="#FBBF24" />
        <stop offset="100%" stopColor="#B45309" />
      </linearGradient>
      {/* Banner/Scroll gold */}
      <linearGradient id="scrollGold" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#FFF275" />
        <stop offset="100%" stopColor="#E0A900" />
      </linearGradient>
      {/* Green Cross */}
      <linearGradient id="crossGreen" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#10B981" />
        <stop offset="100%" stopColor="#047857" />
      </linearGradient>
    </defs>

    {/* GRASS GROUND (Behind) */}
    <path d="M 100,265 C 130,250 270,250 300,265 C 270,280 130,280 100,265 Z" fill="#047857" opacity="0.85" />
    <path d="M 120,265 L 125,245 L 132,266 M 150,263 L 153,240 L 160,264 M 240,264 L 247,241 L 253,263 M 275,266 L 278,245 L 285,266" stroke="#065F46" strokeWidth="2.5" strokeLinecap="round" />

    {/* EAGLES (Supporting left and right) */}
    
    {/* LEFT EAGLE */}
    <g id="left-eagle">
      {/* Left Eagle Body */}
      <path d="M 115,260 C 115,220 120,180 130,150 C 135,140 145,140 145,155 C 145,180 135,220 132,260 Z" fill="url(#eagleGold)" stroke="#78350F" strokeWidth="1" />
      {/* Left Eagle Head turned Right */}
      <path d="M 130,150 C 130,135 142,128 148,135 C 153,139 146,145 145,155 Z" fill="url(#eagleGold)" stroke="#78350F" strokeWidth="1" />
      {/* Beak */}
      <path d="M 148,135 L 154,138 L 147,141 Z" fill="#D97706" stroke="#78350F" strokeWidth="0.8" />
      {/* Eye */}
      <circle cx="143" cy="136" r="1.5" fill="#000000" />
      {/* Wing Left (Spread out and up) */}
      <path d="M 115,220 C 80,210 50,170 35,110 C 60,110 85,130 110,165 C 105,185 110,205 115,220 Z" fill="url(#eagleGold)" stroke="#78350F" strokeWidth="1.2" />
      {/* Feather details inside left wing */}
      <path d="M 50,135 Q 75,145 95,175 M 65,155 Q 85,165 105,190 M 80,180 Q 95,185 110,205" stroke="#92400E" strokeWidth="1" strokeLinecap="round" opacity="0.7" />
      {/* Collar (Red-Gold-Green) with black star */}
      <path d="M 132,152 Q 138,154 144,150" stroke="#EF4444" strokeWidth="2.5" fill="none" />
      <path d="M 133,154 Q 139,156 145,152" stroke="#FBBF24" strokeWidth="2.5" fill="none" />
      <path d="M 134,156 Q 140,158 146,154" stroke="#10B981" strokeWidth="2.5" fill="none" />
      {/* Hanging Black Star */}
      <polygon points="144,158 146,162 150,162 147,165 148,169 144,167 140,169 141,165 138,162 142,162" fill="#000" stroke="#FBBF24" strokeWidth="0.5" />
      {/* Claws/Legs */}
      <path d="M 120,260 L 118,272 M 126,260 L 126,273 M 132,260 L 134,271" stroke="#451A03" strokeWidth="2" strokeLinecap="round" />
    </g>

    {/* RIGHT EAGLE */}
    <g id="right-eagle">
      {/* Right Eagle Body */}
      <path d="M 285,260 C 285,220 280,180 270,150 C 265,140 255,140 255,155 C 255,180 265,220 268,260 Z" fill="url(#eagleGold)" stroke="#78350F" strokeWidth="1" />
      {/* Right Eagle Head turned Left */}
      <path d="M 270,150 C 270,135 258,128 252,135 C 247,139 254,145 255,155 Z" fill="url(#eagleGold)" stroke="#78350F" strokeWidth="1" />
      {/* Beak */}
      <path d="M 252,135 L 246,138 L 253,141 Z" fill="#D97706" stroke="#78350F" strokeWidth="0.8" />
      {/* Eye */}
      <circle cx="257" cy="136" r="1.5" fill="#000000" />
      {/* Wing Right (Spread out and up) */}
      <path d="M 285,220 C 320,210 350,170 365,110 C 340,110 315,130 290,165 C 295,185 290,205 285,220 Z" fill="url(#eagleGold)" stroke="#78350F" strokeWidth="1.2" />
      {/* Feather details inside right wing */}
      <path d="M 350,135 Q 325,145 305,175 M 335,155 Q 315,165 295,190 M 320,180 Q 305,185 290,205" stroke="#92400E" strokeWidth="1" strokeLinecap="round" opacity="0.7" />
      {/* Collar (Red-Gold-Green) with black star */}
      <path d="M 268,152 Q 262,154 256,150" stroke="#EF4444" strokeWidth="2.5" fill="none" />
      <path d="M 267,154 Q 261,156 255,152" stroke="#FBBF24" strokeWidth="2.5" fill="none" />
      <path d="M 266,156 Q 260,158 254,154" stroke="#10B981" strokeWidth="2.5" fill="none" />
      {/* Hanging Black Star */}
      <polygon points="256,158 254,162 250,162 253,165 252,169 256,167 260,169 259,165 262,162 258,162" fill="#000" stroke="#FBBF24" strokeWidth="0.5" />
      {/* Claws/Legs */}
      <path d="M 280,260 L 282,272 M 274,260 L 274,273 M 268,260 L 266,271" stroke="#451A03" strokeWidth="2" strokeLinecap="round" />
    </g>

    {/* SHIELD (Centerpiece) */}
    <g id="shield">
      {/* Shield Base Shape */}
      <path d="M 150,130 Q 150,225 200,250 Q 250,225 250,130 Z" fill="url(#shieldBlue)" stroke="#F59E0B" strokeWidth="3" />
      <path d="M 150,130 Q 150,225 200,250 Q 250,225 250,130 Z" fill="none" stroke="#78350F" strokeWidth="1" />

      {/* Central Cross (Green with Gold borders) */}
      {/* Horizontal Cross bar */}
      <rect x="149" y="178" width="102" height="14" fill="url(#crossGreen)" stroke="#FBBF24" strokeWidth="1.2" />
      {/* Vertical Cross bar */}
      <rect x="193" y="129" width="14" height="122" fill="url(#crossGreen)" stroke="#FBBF24" strokeWidth="1.2" />
      
      {/* Clean up cross junctions visually */}
      <rect x="193.6" y="178.6" width="12.8" height="12.8" fill="url(#crossGreen)" />

      {/* Quarter 1 (Top Left): Sword and Sceptre (crossed) */}
      <g transform="translate(155, 137)">
        {/* Ceremonial Sword */}
        <line x1="4" y1="28" x2="26" y2="6" stroke="#FBBF24" strokeWidth="2.2" strokeLinecap="round" />
        <circle cx="4" cy="28" r="2.5" fill="#B45309" stroke="#FBBF24" strokeWidth="0.8" />
        <line x1="8" y1="24" x2="6" y2="26" stroke="#78350F" strokeWidth="1" />
        {/* Sceptre */}
        <line x1="26" y1="28" x2="4" y2="6" stroke="#FBBF24" strokeWidth="2.2" strokeLinecap="round" />
        <circle cx="26" cy="28" r="2.5" fill="#B45309" stroke="#FBBF24" strokeWidth="0.8" />
        <circle cx="4" cy="6" r="2" fill="#FCD34D" />
      </g>

      {/* Quarter 2 (Top Right): Osu Castle on the sea */}
      <g transform="translate(208, 138)">
        {/* Sea waves */}
        <path d="M 2,28 Q 8,25 15,28 T 28,28 T 40,28" stroke="#1E40AF" strokeWidth="1.5" fill="none" />
        <path d="M 2,32 Q 8,29 15,32 T 28,32 T 40,32" stroke="#FFFFFF" strokeWidth="1" fill="none" />
        {/* Castle body */}
        <rect x="8" y="12" width="24" height="13" fill="#FFFFFF" stroke="#1E3A8A" strokeWidth="1" />
        {/* Castle towers */}
        <rect x="6" y="4" width="6" height="8" fill="#FFFFFF" stroke="#1E3A8A" strokeWidth="1" />
        <rect x="28" y="4" width="6" height="8" fill="#FFFFFF" stroke="#1E3A8A" strokeWidth="1" />
        <rect x="17" y="8" width="6" height="4" fill="#FFFFFF" stroke="#1E3A8A" strokeWidth="1" />
        {/* Castle windows & doors */}
        <rect x="19" y="19" width="3" height="6" fill="#EF4444" />
        <rect x="10" y="15" width="2" height="3" fill="#1E3A8A" />
        <rect x="28" y="15" width="2" height="3" fill="#1E3A8A" />
      </g>

      {/* Quarter 3 (Bottom Left): Cocoa Tree */}
      <g transform="translate(156, 196)">
        {/* Cocoa tree canopy */}
        <ellipse cx="18" cy="15" rx="12" ry="10" fill="#047857" stroke="#022C22" strokeWidth="0.8" />
        <circle cx="12" cy="12" r="6" fill="#059669" />
        <circle cx="23" cy="13" r="7" fill="#059669" />
        {/* Tree Trunk */}
        <path d="M 17,23 L 17,38 M 19,23 L 19,38" stroke="#78350F" strokeWidth="2.2" strokeLinecap="round" />
        {/* Little Cacao Pods (Yellow/Orange dots) */}
        <circle cx="14" cy="18" r="1.5" fill="#F59E0B" />
        <circle cx="21" cy="19" r="1.5" fill="#D97706" />
        <circle cx="17" cy="15" r="1.5" fill="#FBBF24" />
      </g>

      {/* Quarter 4 (Bottom Right): Mining Shaft/Derrick */}
      <g transform="translate(208, 196)">
        {/* Derrick structure */}
        <line x1="8" y1="36" x2="16" y2="8" stroke="#1F2937" strokeWidth="1.8" />
        <line x1="24" y1="36" x2="16" y2="8" stroke="#1F2937" strokeWidth="1.8" />
        <line x1="16" y1="8" x2="16" y2="36" stroke="#1F2937" strokeWidth="1" />
        {/* Cross braces */}
        <line x1="10" y1="28" x2="22" y2="28" stroke="#1F2937" strokeWidth="1" />
        <line x1="12" y1="18" x2="20" y2="18" stroke="#1F2937" strokeWidth="1" />
        <line x1="10" y1="28" x2="20" y2="18" stroke="#1F2937" strokeWidth="0.8" />
        <line x1="22" y1="28" x2="12" y2="18" stroke="#1F2937" strokeWidth="0.8" />
        {/* Small Engine House (Red) */}
        <rect x="23" y="26" width="10" height="10" fill="#EF4444" stroke="#7F1D1D" strokeWidth="0.8" />
        <polygon points="21,26 28,21 35,26" fill="#7F1D1D" />
      </g>

      {/* Walking Gold Lion in the center of the cross */}
      <g transform="translate(191, 179.5)">
        {/* Gold lion passant guardant */}
        <path d="M 3,6 C 4,4 7,3 10,4 C 11,3 13,3 14,5 C 16,5 17,6 16,8 C 15,9 12,9 11,8 C 9,9 6,8 5,9 Z" fill="#FCD34D" stroke="#92400E" strokeWidth="0.5" />
        {/* Legs */}
        <line x1="5" y1="8" x2="4" y2="12" stroke="#FCD34D" strokeWidth="1.2" strokeLinecap="round" />
        <line x1="8" y1="8" x2="8" y2="12" stroke="#FCD34D" strokeWidth="1.2" strokeLinecap="round" />
        <line x1="12" y1="8" x2="11" y2="12" stroke="#FCD34D" strokeWidth="1.2" strokeLinecap="round" />
        <line x1="15" y1="8" x2="16" y2="12" stroke="#FCD34D" strokeWidth="1.2" strokeLinecap="round" />
        {/* Tail */}
        <path d="M 4,6 Q 1,3 3,1" fill="none" stroke="#FCD34D" strokeWidth="1" strokeLinecap="round" />
        {/* Head/Mane */}
        <circle cx="15.5" cy="5.5" r="2.2" fill="#F59E0B" />
        <circle cx="15.5" cy="5.5" r="1.5" fill="#FCD34D" />
      </g>
    </g>

    {/* CREST (Black Star on Torse above the shield) */}
    <g id="crest">
      {/* Wreath / Torse (Red, Gold, Green rolls) */}
      <g transform="translate(164, 114)">
        {/* Alternating color blocks for twisted wreath */}
        <rect x="0" y="0" width="12" height="7" rx="2" fill="#D21034" stroke="#7F1D1D" strokeWidth="0.5" />
        <rect x="12" y="0" width="12" height="7" rx="2" fill="#FCD34D" stroke="#92400E" strokeWidth="0.5" />
        <rect x="24" y="0" width="12" height="7" rx="2" fill="#006B3F" stroke="#064E3B" strokeWidth="0.5" />
        <rect x="36" y="0" width="12" height="7" rx="2" fill="#D21034" stroke="#7F1D1D" strokeWidth="0.5" />
        <rect x="48" y="0" width="12" height="7" rx="2" fill="#FCD34D" stroke="#92400E" strokeWidth="0.5" />
        <rect x="60" y="0" width="12" height="7" rx="2" fill="#006B3F" stroke="#064E3B" strokeWidth="0.5" />
      </g>

      {/* Prominent Black Star with fine Gold outline */}
      <g transform="translate(200, 78) scale(2.4)">
        <polygon 
          points="0,-10 2.8,-3 9.5,-3 4,1 6,8 0,3.8 -6,8 -4,1 -9.5,-3 -2.8,-3" 
          fill="#000000" 
          stroke="#FCD34D" 
          strokeWidth="0.6" 
          strokeLinejoin="miter" 
        />
      </g>
    </g>

    {/* BANNER / SCROLL (Freedom and Justice) */}
    <g id="banner" transform="translate(0, 5)">
      {/* Scroll Background folds */}
      {/* Left Back fold */}
      <path d="M 85,275 L 105,295 L 125,280 Z" fill="#B45309" stroke="#78350F" strokeWidth="1" />
      {/* Right Back fold */}
      <path d="M 315,275 L 295,295 L 275,280 Z" fill="#B45309" stroke="#78350F" strokeWidth="1" />

      {/* Main Banner Ribbon body */}
      {/* Left section: FREEDOM */}
      <path d="M 70,292 C 100,272 150,282 170,300 C 170,314 150,302 110,318 C 80,318 70,304 70,292 Z" fill="url(#scrollGold)" stroke="#78350F" strokeWidth="1.2" />
      {/* Center hanging section: AND */}
      <path d="M 165,301 C 185,312 215,312 235,301 C 235,316 215,332 185,328 C 170,320 165,311 165,301 Z" fill="url(#scrollGold)" stroke="#78350F" strokeWidth="1.2" />
      {/* Right section: JUSTICE */}
      <path d="M 330,292 C 300,272 250,282 230,300 C 230,314 250,302 290,318 C 320,318 330,304 330,292 Z" fill="url(#scrollGold)" stroke="#78350F" strokeWidth="1.2" />

      {/* Red Banner Text */}
      {/* Left Text */}
      <path id="leftTextPath" d="M 75,304 Q 115,285 160,305" fill="none" />
      <text fontFamily="sans-serif" fontSize="11" fontWeight="800" fill="#D21034" letterSpacing="1.2">
        <textPath href="#leftTextPath" startOffset="50%" textAnchor="middle">
          FREEDOM
        </textPath>
      </text>

      {/* Center Text */}
      <path id="centerTextPath" d="M 165,312 Q 200,326 235,312" fill="none" />
      <text fontFamily="sans-serif" fontSize="8" fontWeight="800" fill="#D21034" letterSpacing="0.8">
        <textPath href="#centerTextPath" startOffset="50%" textAnchor="middle">
          AND
        </textPath>
      </text>

      {/* Right Text */}
      <path id="rightTextPath" d="M 240,305 Q 285,285 325,304" fill="none" />
      <text fontFamily="sans-serif" fontSize="11" fontWeight="800" fill="#D21034" letterSpacing="1.2">
        <textPath href="#rightTextPath" startOffset="50%" textAnchor="middle">
          JUSTICE
        </textPath>
      </text>
    </g>
  </svg>
);

// High-fidelity redesign of the "AlertGH" brand logo featuring the wrapping Ghana flag & beacon
const AlertGhLogo = ({ hasActiveEmergency = false }: { hasActiveEmergency?: boolean }) => (
  <motion.div
    whileHover={{
      scale: [1, 1.05, 1],
      boxShadow: [
        "0 0 4px rgba(16, 185, 129, 0.1)",
        "0 0 14px rgba(239, 68, 68, 0.4)",   // Red glow
        "0 0 14px rgba(245, 158, 11, 0.4)",   // Gold glow
        "0 0 14px rgba(16, 185, 129, 0.4)",   // Emerald/Green glow
        "0 0 4px rgba(16, 185, 129, 0.1)"
      ],
      transition: {
        duration: 2.0,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }}
    className={`w-11 h-11 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200/90 dark:border-zinc-800/90 hover:border-emerald-500 dark:hover:border-emerald-400 flex items-center justify-center relative shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer ${
      hasActiveEmergency ? 'logo-emergency-heartbeat' : ''
    }`}
    id="app-branded-logo"
    aria-label="AlertGH Dashboard"
    role="button"
  >
    {/* Prominent Emergency Beacon indicator / Notification LED */}
    <div className="absolute -top-1 -right-1 w-3.5 h-3.5 flex items-center justify-center z-10">
      <span className="absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75 animate-ping" />
      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600 border border-white dark:border-zinc-900 shadow-sm" />
    </div>

    {/* Elegant vector flag wraps around the text */}
    <svg
      viewBox="0 0 100 100"
      className="w-9 h-9"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="flagRed" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#EF4444" />
          <stop offset="100%" stopColor="#DC2626" />
        </linearGradient>
        <linearGradient id="flagGold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>
        <linearGradient id="flagGreen" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
      </defs>

      {/* Flag swooshes elegantly wrapping behind and around */}
      {/* Top red ribbon arc */}
      <path
        d="M 12 36 C 28 16, 72 16, 88 36"
        stroke="url(#flagRed)"
        strokeWidth="6"
        strokeLinecap="round"
      />

      {/* Middle gold ribbon arc */}
      <path
        d="M 8 50 C 26 30, 74 30, 92 50"
        stroke="url(#flagGold)"
        strokeWidth="6"
        strokeLinecap="round"
      />

      {/* Bottom green ribbon arc */}
      <path
        d="M 12 64 C 28 84, 72 84, 88 64"
        stroke="url(#flagGreen)"
        strokeWidth="6"
        strokeLinecap="round"
      />

      {/* Perfectly placed black star inside the gold sector / ribbon overlap */}
      <g transform="translate(50, 19) scale(0.85)">
        <polygon
          points="0,-8 2.4,-2.4 8.2,-2.4 3.5,1 5.3,6.8 0,3.3 -5.3,6.8 -3.5,1 -8.2,-2.4 -2.4,-2.4"
          fill="#111827"
          className="dark:fill-white transition-colors duration-300"
        />
      </g>

      {/* Strong Apple-inspired geometric "GH" text focal point */}
      <text
        x="50"
        y="62"
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="26"
        fontWeight="900"
        fontFamily="system-ui, -apple-system, sans-serif"
        fill="currentColor"
        className="text-slate-950 dark:text-zinc-50 font-black tracking-tight"
      >
        GH
      </text>
    </svg>
  </motion.div>
);

const getEmergencyServiceForCategory = (category: string) => {
  switch (category) {
    case 'fire':
      return { name: 'Ghana National Fire Service', number: '192', icon: '🚒' };
    case 'accident':
    case 'medical':
      return { name: 'National Ambulance Service', number: '193', icon: '🚑' };
    case 'flooding':
      return { name: 'NADMO Headquarters', number: '0302772535', icon: '🌊' };
    case 'power-outage':
      return { name: 'Electricity Company of Ghana (ECG)', number: '0302611611', icon: '⚡' };
    case 'road-closure':
    case 'other':
    default:
      return { name: 'Ghana Police Service (Emergency)', number: '191', icon: '🚨' };
  }
};

const DISPATCH_TEMPLATES = [
  { label: '🌊 Flood relief advice', text: 'NADMO is actively distributing life jackets and emergency relief. Residents are strongly advised to seek high ground, keep away from open drain channels, and disconnect electrical mains.' },
  { label: '🔥 Fire escape steps', text: 'GNFS is currently combatting the fire. Residents must evacuate immediately, disconnect cylinder gas valves, keep roads clear for fire tenders, and stay low to avoid smoke.' },
  { label: '🚑 NAS dispatch info', text: 'National Ambulance Service is dispatched with paramedics. Please yield clear passage to the emergency ambulance, clear the crowd, and keep the patient hydrated if conscious.' },
  { label: '⚡ ECG safety warning', text: 'ECG emergency crews are actively isolating local transformers to prevent secondary hazards. Avoid touching fallen utility cables or wet metallic poles.' }
];

export default function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('alertgh_theme');
    if (saved === 'dark' || saved === 'light') return saved;
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
    return 'light';
  });

  useEffect(() => {
    localStorage.setItem('alertgh_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const [activeTab, setActiveTab] = useState<'map' | 'analytics' | 'hotlines'>('map');
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [showIncidentModal, setShowIncidentModal] = useState(false);
  const [showLightbox, setShowLightbox] = useState(false);
  const [lightboxZoom, setLightboxZoom] = useState(1);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showNotifCenter, setShowNotifCenter] = useState(false);
  const [clickedCoords, setClickedCoords] = useState<{ x: number; y: number } | null>(null);

  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // iOS-style browser navigation stack sync
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      const state = event.state;
      if (!state || state.type === 'base') {
        setShowIncidentModal(false);
        setShowReportModal(false);
        setShowNotifCenter(false);
        setShowLightbox(false);
        return;
      }

      // Sync React state based on history state
      setShowIncidentModal(state.type === 'incident');
      setShowReportModal(state.type === 'report');
      setShowNotifCenter(state.type === 'notifCenter');
      setShowLightbox(state.type === 'lightbox');

      if (state.type === 'incident' && state.incidentId) {
        const found = incidents.find(i => i.id === state.incidentId);
        if (found) setSelectedIncident(found);
      }
    };

    window.addEventListener('popstate', handlePopState);
    
    // Set initial base state
    if (!window.history.state) {
      window.history.replaceState({ type: 'base', tab: activeTab }, '');
    }

    return () => window.removeEventListener('popstate', handlePopState);
  }, [incidents, activeTab]);

  // Unified modal openers which push states onto history stack
  const openIncidentModal = (inc: Incident) => {
    setSelectedIncident(inc);
    setShowIncidentModal(true);
    window.history.pushState({ type: 'incident', incidentId: inc.id }, '');
  };

  const openReportModal = (coords?: { x: number; y: number }) => {
    if (coords) setClickedCoords(coords);
    setShowReportModal(true);
    window.history.pushState({ type: 'report' }, '');
  };

  const openNotifCenter = () => {
    setShowNotifCenter(true);
    window.history.pushState({ type: 'notifCenter' }, '');
  };

  const openLightbox = () => {
    setShowLightbox(true);
    window.history.pushState({ type: 'lightbox' }, '');
  };

  const closeActiveModalOrView = () => {
    window.history.back();
  };

  // Keyboard support for dismissable lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showLightbox) {
          closeActiveModalOrView();
          setLightboxZoom(1);
        } else if (showIncidentModal || showReportModal || showNotifCenter) {
          closeActiveModalOrView();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showLightbox, showIncidentModal, showReportModal, showNotifCenter]);
  
  // Sharing Feedback State
  const [shareCopied, setShareCopied] = useState(false);

  // First-time onboarding state
  const [showOnboarding, setShowOnboarding] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('alertgh_onboarding_seen');
      return saved !== 'true';
    } catch {
      return true;
    }
  });
  const [onboardingStep, setOnboardingStep] = useState<number>(1);

  const handleCloseOnboarding = () => {
    try {
      localStorage.setItem('alertgh_onboarding_seen', 'true');
    } catch (e) {}
    setShowOnboarding(false);
  };

  // First-time responder onboarding state
  const [showResponderOnboarding, setShowResponderOnboarding] = useState<boolean>(false);
  const [responderOnboardingStep, setResponderOnboardingStep] = useState<number>(1);

  const handleCloseResponderOnboarding = () => {
    try {
      localStorage.setItem('alertgh_responder_onboarding_seen', 'true');
    } catch (e) {}
    setShowResponderOnboarding(false);
  };
  
  // Responder (Admin) Mode State
  const [isResponderMode, setIsResponderMode] = useState(false);
  const [isGuestResponder, setIsGuestResponder] = useState(false);

  useEffect(() => {
    if (isResponderMode) {
      try {
        const saved = localStorage.getItem('alertgh_responder_onboarding_seen');
        if (saved !== 'true') {
          setResponderOnboardingStep(1);
          setShowResponderOnboarding(true);
        }
      } catch {
        setResponderOnboardingStep(1);
        setShowResponderOnboarding(true);
      }
    } else {
      setShowResponderOnboarding(false);
    }
  }, [isResponderMode]);

  const [responderNotes, setResponderNotes] = useState('');
  const [responderStatus, setResponderStatus] = useState<IncidentStatus>('active');
  const [showOfficialUpdateModal, setShowOfficialUpdateModal] = useState(false);
  const [selectedSeverity, setSelectedSeverity] = useState<SeverityLevel>('medium');

  // Firebase Auth and DB Sync State
  const { firebaseUser, loginWithEmail, registerWithEmail, logoutUser } = useAuth();
  const {
    notifPref, setNotifPref,
    notifications, setNotifications,
    activeToast, setActiveToast,
    isMuted, setIsMuted,
    triggerPushNotification,
  } = useNotifications();

  const [dbLoading, setDbLoading] = useState(true);
  const [dbError, setDbError] = useState<string | null>(null);

  // Auth Form State
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  // Broadcast feed keyword search
  const [feedSearch, setFeedSearch] = useState('');

  // User Votes persistence
  const [userVotes, setUserVotes] = useState<Record<string, 'up' | 'down'>>(() => {
    try {
      const saved = localStorage.getItem('alertgh_user_votes');
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  });

  useEffect(() => {
    localStorage.setItem('alertgh_user_votes', JSON.stringify(userVotes));
  }, [userVotes]);

  // Sync guest responder off when real user signs in
  useEffect(() => {
    if (firebaseUser) setIsGuestResponder(false);
  }, [firebaseUser]);

  // Real-time Firestore subscription
  useEffect(() => {
    setDbLoading(true);
    setDbError(null);
    const unsubscribe = subscribeToIncidents((fetchedIncidents) => {
      setIncidents(fetchedIncidents);
      setDbLoading(false);
      // Deep-link: check URL for incident id on first load
      const params = new URLSearchParams(window.location.search);
      const urlIncidentId = params.get('incident');
      if (urlIncidentId) {
        const found = fetchedIncidents.find(inc => inc.id === urlIncidentId);
        if (found) { setSelectedIncident(found); setActiveTab('map'); }
      }
    });
    return () => unsubscribe();
  }, []);

  // Synchronize selectedIncident with URL parameters
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (selectedIncident) {
      params.set('incident', selectedIncident.id);
    } else {
      params.delete('incident');
    }
    const newRelativePathQuery = window.location.pathname + (params.toString() ? '?' + params.toString() : '');
    window.history.replaceState(null, '', newRelativePathQuery);
  }, [selectedIncident]);

  // Smoothly scroll the Ghanaian Broadcast Feed when selectedIncident changes
  useEffect(() => {
    if (selectedIncident) {
      const timer = setTimeout(() => {
        const element = document.getElementById(`feed-item-${selectedIncident.id}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }, 120);
      return () => clearTimeout(timer);
    }
  }, [selectedIncident]);

  const handleShare = (incidentId: string) => {
    const url = `${window.location.origin}${window.location.pathname}?incident=${incidentId}`;
    navigator.clipboard.writeText(url).then(() => {
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    }).catch((err) => {
      console.error('Failed to copy text: ', String(err).replace(/[\r\n]/g, ' '));
    });
  };

  // Save incidents to localStorage on modify
  const saveIncidents = (updated: Incident[]) => {
    setIncidents(updated);
    localStorage.setItem('alertgh_incidents', JSON.stringify(updated));
  };

  // Synthesize dynamic chime sound — moved to useNotifications hook

  // Simulation generator for background events
  const handleSimulateBackgroundEvent = async (type: 'new' | 'update_resolved' | 'update_notes') => {
    // List of possible simulation configs
    const simulations = [
      {
        region: 'Ashanti',
        city: 'Kumasi Adum',
        title: 'Gas Outbreak near Kejetia Market',
        category: 'fire' as const,
        severity: 'high' as const,
        description: 'Smell of cooking gas reported near the main lorry terminal. GNFS dispatch dispatched.'
      },
      {
        region: 'Greater Accra',
        city: 'Tema Community 1',
        title: 'Flash Flooding on Harbour Expressway',
        category: 'flooding' as const,
        severity: 'critical' as const,
        description: 'Tidal waves and heavy rain overflowed drains. Traffic halted.'
      },
      {
        region: 'Volta',
        city: 'Hohoe',
        title: 'Landslide Blocks Hohoe Highway',
        category: 'road-closure' as const,
        description: 'Hills yielded mud onto roads near Tsito. One lane blocked.',
        severity: 'medium' as const
      },
      {
        region: 'Northern',
        city: 'Savelugu',
        title: 'ECG Grid Substation Outage',
        category: 'power-outage' as const,
        severity: 'high' as const,
        description: 'Sudden failure in primary transmission transformer. Emergency repairs started.'
      }
    ];

    // Pick one at random
    const config = simulations[Math.floor(Math.random() * simulations.length)];
    
    if (type === 'new') {
      try {
        const simData = {
          title: config.title,
          category: config.category,
          region: config.region,
          city: config.city,
          description: config.description,
          severity: config.severity,
          reportedBy: 'Simulated Citizen Bot',
          imagePreset: config.category === 'flooding' ? 'flood_accra' : config.category === 'fire' ? 'fire_tamale' : 'road_aburi',
          coordinates: GHANA_REGIONS.find(r => r.name === config.region) || { x: 50, y: 50 }
        };
        const newInc = await addIncidentToFirestore(simData);
        setIncidents(prev => [newInc, ...prev]);
        triggerPushNotification('new_incident', newInc);
      } catch (e) {
        console.error('Error simulating new incident:', e);
      }
    } else if (type === 'update_resolved') {
      // Find an active incident to resolve
      const activeIncs = incidents.filter(i => i.status !== 'resolved');
      if (activeIncs.length === 0) {
        return;
      }
      const chosen = activeIncs[0];
      try {
        await updateIncidentInFirestore(chosen.id, {
          status: 'resolved' as const,
          officialNotes: 'Situation resolved and area cleared by municipal services.'
        });
        
        const updated = incidents.map(i => {
          if (i.id === chosen.id) {
            return {
              ...i,
              status: 'resolved' as const,
              officialNotes: 'Situation resolved and area cleared by municipal services.'
            };
          }
          return i;
        });
        setIncidents(updated);
        
        const resolvedInc = updated.find(i => i.id === chosen.id)!;
        if (selectedIncident?.id === chosen.id) {
          setSelectedIncident(resolvedInc);
        }
        
        triggerPushNotification(
          'status_update',
          resolvedInc,
          `🔄 RESOLVED: ${resolvedInc.title}`,
          `Good news! The emergency in ${resolvedInc.city} has been fully resolved and marked safe.`
        );
      } catch (e) {
        console.error('Error simulating resolved incident:', e);
      }
    } else if (type === 'update_notes') {
      // Find an active incident to update notes
      const activeIncs = incidents.filter(i => i.status !== 'resolved');
      if (activeIncs.length === 0) {
        return;
      }
      const chosen = activeIncs[0];
      try {
        await updateIncidentInFirestore(chosen.id, {
          officialNotes: `NADMO is distributing relief items. Water levels dropping by 20cm/hr. Safe corridor opened.`
        });
        
        const updated = incidents.map(i => {
          if (i.id === chosen.id) {
            return {
              ...i,
              officialNotes: `NADMO is distributing relief items. Water levels dropping by 20cm/hr. Safe corridor opened.`
            };
          }
          return i;
        });
        setIncidents(updated);
        
        const updatedInc = updated.find(i => i.id === chosen.id)!;
        if (selectedIncident?.id === chosen.id) {
          setSelectedIncident(updatedInc);
        }
        
        triggerPushNotification(
          'info_update',
          updatedInc,
          `ℹ️ Information Updated: ${updatedInc.title}`,
          `Emergency workers have added an update: "NADMO is distributing relief items... Safe corridor opened."`
        );
      } catch (e) {
        console.error('Error simulating info update:', e);
      }
    }
  };

  // Create an incident
  const handleAddIncident = async (newIncidentData: Omit<Incident, 'id' | 'reportedAt' | 'verificationScore' | 'upvotes' | 'downvotes' | 'status'>) => {
    try {
      const newInc = await addIncidentToFirestore(newIncidentData);
      // onSnapshot will update incidents list automatically; manually add for local fallback
      setIncidents(prev => prev.some(i => i.id === newInc.id) ? prev : [newInc, ...prev]);
      triggerPushNotification('new_incident', newInc);
    } catch (err: any) {
      console.error('Failed to create incident:', err);
      alert(err.message || 'Failed to report incident. Please check your connection and try again.');
    }
  };

  // Vote / Verify an incident (only one vote per user, can be toggled or retracted)
  const handleVerifyVote = async (id: string, type: 'up' | 'down') => {
    const currentVote = userVotes[id];
    let upDiff = 0;
    let downDiff = 0;
    const newUserVotes = { ...userVotes };

    if (currentVote === type) {
      // Retract/cancel the vote
      if (type === 'up') {
        upDiff = -1;
      } else {
        downDiff = -1;
      }
      delete newUserVotes[id];
    } else if (!currentVote) {
      // First time voting
      if (type === 'up') {
        upDiff = 1;
      } else {
        downDiff = 1;
      }
      newUserVotes[id] = type;
    } else {
      // Switching vote
      if (type === 'up') {
        upDiff = 1;
        downDiff = -1;
      } else {
        upDiff = -1;
        downDiff = 1;
      }
      newUserVotes[id] = type;
    }

    const incidentToUpdate = incidents.find(inc => inc.id === id);
    if (!incidentToUpdate) return;

    const up = Math.max(0, incidentToUpdate.upvotes + upDiff);
    const down = Math.max(0, incidentToUpdate.downvotes + downDiff);
    const score = up - down;

    setUserVotes(newUserVotes);

    // Update state optimistically
    const updated = incidents.map(inc => {
      if (inc.id === id) {
        return {
          ...inc,
          upvotes: up,
          downvotes: down,
          verificationScore: score
        };
      }
      return inc;
    });
    setIncidents(updated);

    const current = updated.find(i => i.id === id);
    if (current) setSelectedIncident(current);

    try {
      await updateIncidentInFirestore(id, {
        upvotes: up,
        downvotes: down,
        verificationScore: score
      });
    } catch (err) {
      console.error('Failed to save vote to database:', err);
      // Revert state
      setUserVotes(userVotes);
      setIncidents(incidents);
      setSelectedIncident(selectedIncident);
    }
  };

  // Responder actions (Update status, severity & Official notes)
  const handleResponderUpdateSubmit = async (e: React.FormEvent, id: string) => {
    e.preventDefault();
    const oldIncident = incidents.find(inc => inc.id === id);
    if (!oldIncident) return;

    const updatedIncident = {
      ...oldIncident,
      status: responderStatus,
      severity: selectedSeverity,
      officialNotes: responderNotes || oldIncident.officialNotes
    };

    // Update state optimistically
    const updated = incidents.map(inc => inc.id === id ? updatedIncident : inc);
    setIncidents(updated);
    setSelectedIncident(updatedIncident);

    try {
      await updateIncidentInFirestore(id, {
        status: responderStatus,
        severity: selectedSeverity,
        officialNotes: responderNotes || oldIncident.officialNotes
      });

      // Determine what changed
      const statusChanged = oldIncident.status !== updatedIncident.status;
      const severityChanged = oldIncident.severity !== updatedIncident.severity;
      const notesChanged = responderNotes && oldIncident.officialNotes !== updatedIncident.officialNotes;
      
      if (severityChanged) {
        triggerPushNotification(
          'status_update',
          updatedIncident,
          `⚠️ SEVERITY UPDATED: ${updatedIncident.title}`,
          `Incident severity was updated to [${updatedIncident.severity.toUpperCase()}] in ${updatedIncident.city}, ${updatedIncident.region}.`
        );
      } else if (statusChanged) {
        triggerPushNotification(
          'status_update',
          updatedIncident,
          `🔄 Status Resolved/Updated: ${updatedIncident.title}`,
          `Emergency status updated to [${updatedIncident.status.toUpperCase()}] in ${updatedIncident.city}, ${updatedIncident.region}.`
        );
      } else if (notesChanged) {
        triggerPushNotification(
          'info_update',
          updatedIncident,
          `ℹ️ Information Updated: ${updatedIncident.title}`,
          `Official dispatch details have been added: "${responderNotes.substring(0, 60)}..."`
        );
      }
      setResponderNotes('');
      setShowOfficialUpdateModal(false);
      if (window.history.state?.type === 'officialUpdate') {
        window.history.back();
      }
    } catch (err: any) {
      console.error('Failed to save responder update:', err);
      // Revert state
      setIncidents(incidents);
      setSelectedIncident(oldIncident);
      alert('Failed to update incident. Ensure you are logged in as an authorized responder.');
    }
  };

  // Responder actions (Mark Resolved instantly)
  const handleMarkResolved = async (id: string) => {
    if (!checkResponderAuth()) return;
    const oldIncident = incidents.find(inc => inc.id === id);
    if (!oldIncident) return;

    const isCurrentlyResolved = oldIncident.status === 'resolved';
    const newStatus: IncidentStatus = isCurrentlyResolved ? 'active' : 'resolved';

    const updatedIncident = {
      ...oldIncident,
      status: newStatus,
      officialNotes: isCurrentlyResolved ? oldIncident.officialNotes : 'Situation resolved and marked safe by official responders.'
    };

    // Update state optimistically
    const updated = incidents.map(inc => inc.id === id ? updatedIncident : inc);
    setIncidents(updated);
    setSelectedIncident(updatedIncident);

    try {
      await updateIncidentInFirestore(id, {
        status: newStatus,
        officialNotes: isCurrentlyResolved ? oldIncident.officialNotes : 'Situation resolved and marked safe by official responders.'
      });

      triggerPushNotification(
        'status_update',
        updatedIncident,
        isCurrentlyResolved ? `🔄 Status Reopened: ${updatedIncident.title}` : `✅ RESOLVED: ${updatedIncident.title}`,
        isCurrentlyResolved
          ? `Emergency in ${updatedIncident.city} has been reopened for monitoring.`
          : `Emergency in ${updatedIncident.city} has been fully resolved and marked safe by official responders.`
      );
    } catch (err: any) {
      console.error('Failed to mark resolved:', err);
      // Revert state
      setIncidents(incidents);
      setSelectedIncident(oldIncident);
    }
  };

  // Responder actions (Delete/Moderate/Dismiss response to keep community feed clean)
  const handleFlagIncident = async (id: string, flagType: 'flagged_spam' | 'flagged_duplicate' | 'flagged_fraudulent' | 'clean') => {
    if (!checkResponderAuth()) return;
    const oldIncident = incidents.find(inc => inc.id === id);
    if (!oldIncident) return;

    const updatedIncident = {
      ...oldIncident,
      moderationStatus: flagType
    };

    // Update state optimistically
    const updated = incidents.map(inc => inc.id === id ? updatedIncident : inc);
    setIncidents(updated);
    setSelectedIncident(updatedIncident);

    try {
      await updateIncidentInFirestore(id, {
        moderationStatus: flagType
      });
      
      let message = "";
      if (flagType === 'clean') {
        message = "Marked response as clean / verified.";
      } else {
        message = `Flagged response as ${flagType.replace('flagged_', '')}.`;
      }
      
      triggerPushNotification(
        'info_update',
        updatedIncident,
        '🛡️ Response Moderated',
        `Authorized responder has moderated this response: ${message}`
      );
    } catch (err: any) {
      console.error('Failed to flag/moderate response:', err);
      setIncidents(incidents);
      setSelectedIncident(oldIncident);
      alert('Failed to save moderation flags: ' + (err.message || err));
    }
  };

  const handleDeleteIncident = async (id: string) => {
    if (!checkResponderAuth()) return;
    if (!window.confirm("🛡️ RESPONDER MODERATION: Are you sure you want to dismiss and permanently remove this response to keep the community feed free from spam or inaccurate responses? This cannot be undone.")) {
      return;
    }
    try {
      setDbLoading(true);
      await deleteIncidentFromFirestore(id);
      setIncidents(prev => prev.filter(inc => inc.id !== id));
      if (selectedIncident?.id === id) {
        setSelectedIncident(null);
      }
      triggerPushNotification(
        'info_update',
        null as any,
        '🛡️ Response Moderated',
        `An active incident response has been officially reviewed and permanently dismissed/deleted by authorized emergency services to prevent misinformation.`
      );
    } catch (err: any) {
      console.error('Failed to moderate/delete response:', err);
      alert('Failed to delete response: ' + (err.message || err));
    } finally {
      setDbLoading(false);
    }
  };

  const checkResponderAuth = () => {
    if (!firebaseUser && isGuestResponder) {
      setAuthMode('signin');
      setAuthError('You must sign in with an authorized responder account to perform this action.');
      setShowAuthModal(true);
      window.history.pushState({ type: 'auth' }, '');
      return false;
    }
    return true;
  };

  // Handle Sign-In or Sign-Up via Firebase Auth wrapper
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);
    try {
      if (authMode === 'signin') {
        await loginWithEmail(authEmail, authPassword);
      } else {
        await registerWithEmail(authEmail, authPassword);
      }
      setIsResponderMode(true);
      setAuthEmail('');
      setAuthPassword('');
      setAuthError(null);
      setShowAuthModal(false);
      if (window.history.state?.type === 'auth') {
        window.history.back();
      }
    } catch (err: any) {
      console.error('Authentication process failed:', err);
      setAuthError(err.message || 'Authentication failed. Please check credentials.');
    } finally {
      setAuthLoading(false);
    }
  };

  // Reset demo defaults
  const handleResetData = () => {
    saveIncidents(INITIAL_INCIDENTS);
    setSelectedIncident(null);
    setSelectedRegion(null);
  };

  const handleReportFromMap = (coords?: { x: number; y: number } | null) => {
    if (coords) setClickedCoords(coords);
    setShowReportModal(true);
  };

  const getSeverityStyle = (severity: SeverityLevel) => {
    switch (severity) {
      case 'critical': return 'bg-red-50 text-red-700 border border-red-200/60 shadow-sm';
      case 'high': return 'bg-amber-50 text-amber-700 border border-amber-200/60 shadow-sm';
      case 'medium': return 'bg-yellow-50 text-yellow-700 border border-yellow-200/60 shadow-sm';
      default: return 'bg-blue-50 text-blue-700 border border-blue-200/60 shadow-sm';
    }
  };

  const getStatusStyle = (status: IncidentStatus) => {
    switch (status) {
      case 'resolved': return 'bg-emerald-50 text-emerald-700 border border-emerald-200/60 shadow-sm';
      case 'investigating': return 'bg-yellow-50 text-yellow-700 border border-yellow-200/60 shadow-sm';
      default: return 'bg-red-50 text-red-700 border border-red-200/60 shadow-sm animate-pulse';
    }
  };

  const getCategoryIcon = (category: IncidentCategory) => {
    switch (category) {
      case 'flooding': return '🌧️';
      case 'fire': return '🔥';
      case 'accident': return '🚗';
      case 'road-closure': return '🚧';
      case 'power-outage': return '⚡';
      case 'medical': return '🚨';
      default: return '⚠️';
    }
  };

  if (dbLoading && incidents.length === 0) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6" id="db-initial-loader">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-6 max-w-sm"
        >
          <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-[3px] border-zinc-800 border-t-emerald-500 animate-spin" />
            <Shield className="w-8 h-8 text-emerald-500" />
          </div>
          <div className="space-y-2">
            <h2 className="text-base font-bold text-zinc-100">Connecting to AlertGhana</h2>
            <p className="text-[12px] text-zinc-400 leading-relaxed">Syncing live emergency reports and critical dispatch records from Google Firestore...</p>
          </div>
        </motion.div>
      </div>
    );
  }

  const visibleIncidents = isResponderMode 
    ? incidents 
    : incidents.filter(i => !i.moderationStatus || i.moderationStatus === 'clean');

  return (
    <div className="min-h-screen bg-[#f5f5f7] dark:bg-zinc-950 text-slate-800 dark:text-zinc-200 font-sans selection:bg-emerald-500 selection:text-slate-900 transition-colors duration-300 relative overflow-x-hidden pb-24" id="alertgh-main-root">
      
      {/* Persistent Responder Mode Top-Of-Screen Banner */}
      {isResponderMode && (
        <div className="bg-gradient-to-r from-blue-700 via-indigo-750 to-blue-800 text-white text-[11px] font-bold py-2 px-4 text-center tracking-wider flex items-center justify-center gap-2 relative z-50 shadow-md">
          <span className="inline-block w-2 h-2 rounded-full bg-white animate-ping" />
          <span>🛡️ AUTHORIZED DISPATCH CONSOLE ACTIVE &bull; VERIFIED ADVISORY DISPATCH ENGINE &bull; ALL ACTIONS AUDITED</span>
        </div>
      )}
      
      {/* Deep Ambient Background Glows representing the Ghanaian Sunset & Patriotic Spirit */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-red-500/5 dark:bg-red-600/5 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-500/5 dark:bg-amber-500/5 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-1/3 left-1/3 w-[600px] h-[600px] bg-emerald-500/5 dark:bg-emerald-600/5 rounded-full blur-[140px] pointer-events-none z-0" />

      {/* Top-Left Modern Corner Frame (Ghana Colors Gradient Line + Star Accent) */}
      <div className="fixed top-2 left-2 w-12 h-12 pointer-events-none z-50 select-none">
        <div className="absolute top-0 left-0 w-full h-[2.5px] bg-gradient-to-r from-red-500 via-amber-400 to-emerald-500" />
        <div className="absolute top-0 left-0 w-[2.5px] h-full bg-gradient-to-b from-red-500 via-amber-400 to-emerald-500" />
        <span className="absolute top-1 left-2 text-[10px] text-slate-500 dark:text-zinc-400 font-mono font-bold tracking-tight">★</span>
      </div>

      {/* Top-Right Modern Corner Frame (Ghana Colors Gradient Line + Flag Accent) */}
      <div className="fixed top-2 right-2 w-12 h-12 pointer-events-none z-50 select-none">
        <div className="absolute top-0 right-0 w-full h-[2.5px] bg-gradient-to-l from-emerald-500 via-amber-400 to-red-500" />
        <div className="absolute top-0 right-0 w-[2.5px] h-full bg-gradient-to-b from-red-500 via-amber-400 to-emerald-500" />
        <span className="absolute top-1 right-2 text-[10px] text-slate-500 dark:text-zinc-400 font-mono font-bold">🇬🇭</span>
      </div>

      {/* Bottom-Left Modern Corner Frame (Ghana Colors Gradient Line + Star Accent) */}
      <div className="fixed bottom-2 left-2 w-12 h-12 pointer-events-none z-50 select-none">
        <div className="absolute bottom-0 left-0 w-full h-[2.5px] bg-gradient-to-r from-red-500 via-amber-400 to-emerald-500" />
        <div className="absolute bottom-0 left-0 w-[2.5px] h-full bg-gradient-to-t from-red-500 via-amber-400 to-emerald-500" />
        <span className="absolute bottom-1.5 left-2 text-[10px] text-slate-500 dark:text-zinc-400 font-mono font-bold tracking-tight">★</span>
      </div>

      {/* Bottom-Right Modern Corner Frame (Ghana Colors Gradient Line + Flag Accent) */}
      <div className="fixed bottom-2 right-2 w-12 h-12 pointer-events-none z-50 select-none">
        <div className="absolute bottom-0 right-0 w-full h-[2.5px] bg-gradient-to-l from-emerald-500 via-amber-400 to-red-500" />
        <div className="absolute bottom-0 right-0 w-[2.5px] h-full bg-gradient-to-t from-red-500 via-amber-400 to-emerald-500" />
        <span className="absolute bottom-1.5 right-2 text-[10px] text-slate-500 dark:text-zinc-400 font-mono font-bold">🇬🇭</span>
      </div>

      {/* Dynamic Header Banner with Glows */}
      <header className="border-b border-slate-200/80 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md sticky top-0 z-40 shadow-[0_1px_2px_rgba(0,0,0,0.01)] transition-colors duration-300">
        {dbError && (
          <div className="bg-amber-500/10 dark:bg-amber-500/5 border-b border-amber-500/20 text-amber-800 dark:text-amber-400 text-xs px-4 py-2 text-center flex items-center justify-center gap-1.5 font-medium transition-colors">
            <ShieldAlert className="w-4 h-4 text-amber-500" />
            <span>Database Connection Offline: {dbError} (LocalStorage Cache Sync Active)</span>
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-[3px] bg-gradient-to-r from-emerald-500 via-amber-500 to-red-500 opacity-80" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          
          {/* Logo Brand / Ghana Symbol */}
          <div className="flex items-center gap-3">
            <AlertGhLogo hasActiveEmergency={notifications.some(n => !n.read && (n.severity === 'critical' || n.severity === 'high'))} />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-display font-semibold tracking-tight text-slate-900 dark:text-zinc-50 transition-colors duration-300">AlertGH</h1>
                {isResponderMode ? (
                  isGuestResponder ? (
                    <span className="text-[10px] font-mono font-bold bg-amber-500/10 border border-amber-500 text-amber-700 dark:text-amber-450 px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 transition-colors duration-300">
                      <Shield className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                      GUEST DISPATCH MONITOR
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono font-bold bg-blue-500/10 border border-blue-500 text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 transition-colors duration-300 animate-pulse">
                      <Shield className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                      AUTHORIZED DISPATCH
                    </span>
                  )
                ) : (
                  <span className="text-[10px] font-mono font-bold bg-emerald-50/10 border border-emerald-500/20 text-emerald-750 dark:text-emerald-400 px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 transition-colors duration-300">
                    <Radio className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                    LIVE ALERT SYSTEM
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium transition-colors duration-300">Ghanaian Citizen-Driven Emergency Grid</p>
            </div>
          </div>

          {/* Navigation links & Mode selection */}
          <div className="flex flex-wrap items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
            
            {/* Quick Navigation Tabs */}
            <nav className="hidden md:flex items-center gap-1.5 bg-[#eef0f3] dark:bg-zinc-850 p-1 rounded-full border border-slate-200/60 dark:border-zinc-700/60 relative transition-colors duration-300" id="main-navigation-navbar">
              {[
                { id: 'map', label: 'Map', icon: Map, color: 'text-blue-600 dark:text-blue-400' },
                { id: 'analytics', label: 'Analytics', icon: BarChart3, color: 'text-indigo-600 dark:text-indigo-400' },
                { id: 'hotlines', label: 'Directory', icon: Phone, color: 'text-emerald-600 dark:text-emerald-400' }
              ].map((tab) => {
                const isActive = activeTab === tab.id;
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as 'map' | 'analytics' | 'hotlines')}
                    className={`relative px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 flex items-center gap-1.5 cursor-pointer select-none active:scale-95 ${
                      isActive
                        ? 'bg-white dark:bg-zinc-700 text-slate-900 dark:text-zinc-50 shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-slate-200/30 dark:border-zinc-600/30 font-bold'
                        : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200 hover:bg-white/40 dark:hover:bg-zinc-700/40'
                    }`}
                  >
                    <IconComponent className={`w-3.5 h-3.5 transition-transform duration-300 ${isActive ? `${tab.color} scale-110` : 'text-slate-400 dark:text-zinc-500'}`} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>

            <div className="h-6 w-px bg-slate-200 dark:bg-zinc-800 hidden md:block transition-colors duration-300" />

            {/* Responder Toggle Controls */}
            <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2.5 w-full sm:w-auto">
              {firebaseUser && (
                <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-zinc-400 font-medium">
                  <span className="truncate max-w-[120px] font-semibold text-emerald-600 dark:text-emerald-400">
                    {firebaseUser.email.split('@')[0]}
                  </span>
                  <button
                    onClick={async () => {
                      try {
                        await logoutUser();
                        setIsGuestResponder(false);
                        setIsResponderMode(false);
                      } catch (e) {
                        console.error('Logout failed:', e);
                      }
                    }}
                    className="underline hover:text-red-500 transition cursor-pointer"
                    title={`Logged in as ${firebaseUser.email}. Click to sign out.`}
                  >
                    Sign Out
                  </button>
                  <span className="text-slate-300 dark:text-zinc-700">|</span>
                </div>
              )}

              {isResponderMode && isGuestResponder && (
                <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-zinc-400 font-medium">
                  <span className="font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded-md text-[10px]">
                    GUEST
                  </span>
                  <button
                    onClick={() => {
                      setAuthMode('signin');
                      setAuthError(null);
                      setShowAuthModal(true);
                      window.history.pushState({ type: 'auth' }, '');
                    }}
                    className="underline hover:text-blue-500 transition cursor-pointer text-[11px] font-bold"
                    title="Logged in as guest with view-only responder access. Click to sign in."
                  >
                    Responder Login
                  </button>
                  <span className="text-slate-300 dark:text-zinc-700">|</span>
                </div>
              )}

              <button
                onClick={() => {
                  if (firebaseUser) {
                    setIsResponderMode(!isResponderMode);
                  } else {
                    if (!isResponderMode) {
                      setAuthMode('signin');
                      setAuthError(null);
                      setShowAuthModal(true);
                      window.history.pushState({ type: 'auth' }, '');
                    } else {
                      setIsResponderMode(false);
                      setIsGuestResponder(false);
                    }
                  }
                }}
                className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all duration-300 flex items-center gap-2.5 cursor-pointer select-none ${
                  isResponderMode
                    ? isGuestResponder
                      ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/60 text-amber-700 dark:text-amber-400 font-bold shadow-sm'
                      : 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900/60 text-blue-700 dark:text-blue-400 font-bold shadow-sm'
                    : 'bg-white dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200 hover:border-slate-300 dark:hover:border-zinc-600 shadow-sm'
                }`}
              >
                <Shield className={`w-3.5 h-3.5 transition-transform duration-300 ${isResponderMode ? 'scale-110 text-blue-500 dark:text-blue-400' : 'text-slate-400 dark:text-zinc-500'}`} />
                <span className="min-w-[110px] text-left">
                  {isResponderMode ? (isGuestResponder ? '🚒 RESPONDER (GUEST)' : '🚒 RESPONDER ACTIVE') : '👤 CITIZEN MODE'}
                </span>
                
                {/* Inline Toggle Switch */}
                <div className={`w-7 h-4 rounded-full p-0.5 transition-colors duration-300 flex items-center ${
                  isResponderMode ? isGuestResponder ? 'bg-amber-500 dark:bg-amber-600' : 'bg-blue-500 dark:bg-blue-600' : 'bg-slate-200 dark:bg-zinc-700'
                }`}>
                  <div className={`w-3 h-3 rounded-full bg-white shadow-sm transition-transform duration-300 transform ${
                    isResponderMode ? 'translate-x-3' : 'translate-x-0'
                  }`} />
                </div>
              </button>

              {/* Action Buttons Group */}
              <div className="flex items-center gap-2">
                {/* Notification Bell Button */}
                <button
                  onClick={openNotifCenter}
                  className={`p-2 rounded-xl border relative transition-all duration-300 flex items-center justify-center cursor-pointer ${
                    showNotifCenter
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/60 text-emerald-700 dark:text-emerald-400'
                      : 'bg-white dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-500 dark:text-zinc-400 hover:text-slate-850 dark:hover:text-zinc-200 hover:border-slate-300 dark:hover:border-zinc-600 shadow-sm'
                  }`}
                  title="Push Notification Settings & Alerts"
                  id="header-notification-bell-btn"
                >
                  {notifPref.isSubscribed ? (
                    <Bell className={`w-4 h-4 ${notifications.some(n => !n.read) ? 'animate-bounce text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-zinc-400'}`} />
                  ) : (
                    <BellOff className="w-4 h-4 text-slate-400 dark:text-zinc-500" />
                  )}
                  {notifications.some(n => !n.read) && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-pulse">
                      {notifications.filter(n => !n.read).length}
                    </span>
                  )}
                </button>

                <button
                  onClick={handleResetData}
                  className="p-2 bg-white dark:bg-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-700 text-slate-400 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-200 rounded-xl border border-slate-200 dark:border-zinc-700 hover:border-slate-300 dark:hover:border-zinc-600 transition-all duration-300 cursor-pointer shadow-sm"
                  title="Reset Database to Defaults"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>

                <button
                  onClick={() => {
                    if (isResponderMode) {
                      setResponderOnboardingStep(1);
                      setShowResponderOnboarding(true);
                    } else {
                      setOnboardingStep(1);
                      setShowOnboarding(true);
                    }
                  }}
                  className="p-2 bg-white dark:bg-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-700 text-slate-400 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-200 rounded-xl border border-slate-200 dark:border-zinc-700 hover:border-slate-300 dark:hover:border-zinc-600 transition-all duration-300 cursor-pointer shadow-sm"
                  title="Replay Walkthrough Tutorial"
                >
                  <HelpCircle className="w-4 h-4" />
                </button>

                <div className="h-6 w-px bg-slate-200 dark:bg-zinc-800 transition-colors duration-300 hidden sm:block" />

                {/* Theme Toggle Switch */}
                <div 
                  className="relative flex items-center bg-[#eef0f3] dark:bg-zinc-850 p-0.5 rounded-full border border-slate-200 dark:border-zinc-700 cursor-pointer select-none h-8 w-15"
                  onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                  title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
                >
                  <div className="flex items-center gap-0.5 relative w-full">
                    {/* Sliding Pill */}
                    <motion.div
                      className="absolute top-0 bottom-0 w-7 h-7 bg-white dark:bg-zinc-700 rounded-full shadow-[0_2px_4px_rgba(0,0,0,0.15)]"
                      animate={{
                        x: theme === 'light' ? 0 : 28
                      }}
                      transition={{ type: "spring", stiffness: 350, damping: 25 }}
                    />
                    <div className={`relative z-10 p-1.5 rounded-full transition-colors duration-300 flex items-center justify-center w-7 h-7 ${theme === 'light' ? 'text-amber-500' : 'text-slate-400 dark:text-zinc-500'}`}>
                      <Sun className="w-3.5 h-3.5" />
                    </div>
                    <div className={`relative z-10 p-1.5 rounded-full transition-colors duration-300 flex items-center justify-center w-7 h-7 ${theme === 'dark' ? 'text-indigo-400' : 'text-slate-500 dark:text-zinc-400'}`}>
                      <Moon className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12 space-y-6">
        
        {/* Elegant Hero Section with Ghana Flag Watercolor Splatter background */}
        <div className="relative rounded-[32px] overflow-hidden min-h-[220px] sm:min-h-[240px] md:min-h-[280px] w-full mb-6 border border-slate-200/40 dark:border-zinc-800/40 shadow-md flex flex-col justify-between transition-all duration-300 group">
          {/* Full-bleed background image - switches automatically on theme toggle */}
          <img 
            src={theme === 'light' ? ghanaSplatterLight : ghanaSplatterDark} 
            alt="Ghana Flag Watercolor Splatter Background" 
            className="absolute inset-0 w-full h-full object-cover object-[65%_center] select-none pointer-events-none transition-all duration-500"
            referrerPolicy="no-referrer"
          />

          {/* Top Edge Subtle Gradient Scrim (for badge legibility) */}
          <div className="absolute inset-x-0 top-0 h-[28%] bg-gradient-to-b from-black/45 dark:from-black/65 to-transparent pointer-events-none" />

          {/* Bottom Third Subtle Gradient Scrim (for text legibility) */}
          <div className="absolute inset-x-0 bottom-0 h-[48%] bg-gradient-to-t from-black/80 dark:from-black/90 via-black/40 dark:via-black/50 to-transparent pointer-events-none" />

          {/* Badge top-left */}
          <div className="relative z-10 p-5 md:p-6 self-start">
            <div className="flex items-center gap-1.5 bg-black/40 dark:bg-black/50 backdrop-blur-md border border-white/20 rounded-full px-2.5 py-1 w-fit animate-fade-in shadow-sm select-none">
              <span className="text-xs">🇬🇭</span>
              <span className="text-[10px] md:text-[11px] font-bold text-white uppercase tracking-wide">
                National Safety Platform of Ghana
              </span>
            </div>
          </div>

          {/* Text in the lower portion where the scrim provides contrast */}
          <div className="relative z-10 p-5 md:p-6 text-left max-w-xl md:max-w-2xl select-text">
            <h1 className="text-2xl sm:text-3xl md:text-[34px] font-bold tracking-tight text-white leading-tight drop-shadow-sm">
              {activeTab === 'map' ? 'Ghana Emergency Map' : activeTab === 'analytics' ? 'Analytics Insights' : 'Emergency Directory'}
            </h1>
            <p className="text-xs sm:text-sm md:text-[15px] text-slate-100 dark:text-zinc-200 font-medium mt-1 leading-relaxed drop-shadow-sm">
              {activeTab === 'map' ? 'Citizen-reported safety hazards and live floods across Ghana' :
               activeTab === 'analytics' ? 'Real-time hazard breakdown and statistical emergency metrics' :
               'National emergency lines, NADMO offices, and public utility helpdesks'}
            </p>
          </div>
        </div>
        
        {/* Render Tab Contents */}
        {activeTab === 'map' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left side: Interactive Map Dashboard */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Report Emergency Trigger Card */}
              {!isResponderMode && (
                <div className="glass-panel border-slate-200/60 rounded-3xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-50 text-red-600 dark:bg-red-950/25 dark:text-red-400 rounded-xl border border-slate-150 dark:border-zinc-800/60 flex items-center justify-center text-lg shadow-sm">
                      📢
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-800 dark:text-zinc-200">Witnessed a safety outbreak or flood?</h3>
                      <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">Your reports are posted anonymously. Aid rescue units immediately.</p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleReportFromMap(null)}
                    className="w-full sm:w-auto bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 shadow-[0_4px_16px_rgba(220,38,38,0.35)] text-white px-6 py-3 rounded-full font-bold text-xs tracking-wide transition-all duration-300 hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Plus className="w-4 h-4 stroke-[3]" />
                    REPORT EMERGENCY
                  </button>
                </div>
              )}

              {/* Map Component */}
              <GhanaMap
                incidents={visibleIncidents}
                selectedIncident={selectedIncident}
                onSelectIncident={(inc) => {
                  setSelectedIncident(inc);
                  if (inc) {
                    setShowIncidentModal(true);
                  }
                }}
                selectedRegion={selectedRegion}
                onSelectRegion={(region) => {
                  setSelectedRegion(region);
                }}
                onReportIncidentClick={handleReportFromMap}
              />
            </div>

            {/* Right side: Detailed Incident Feed / Detail focus side panel */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Focused Incident Detail Card */}
              <AnimatePresence mode="wait">
                {selectedIncident ? (
                  <motion.div
                    key={selectedIncident.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="glass-panel border-slate-200/60 rounded-3xl p-6 shadow-md relative overflow-hidden"
                    id="incident-selected-card"
                  >
                    <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-red-500 via-amber-500 to-green-500" />
                    
                    {/* Header Details */}
                    <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-4 mb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{getCategoryIcon(selectedIncident.category)}</span>
                        <div>
                          <h4 className="text-xs font-semibold text-slate-700 capitalize">{selectedIncident.category}</h4>
                          <span className="text-[9.5px] text-slate-400 font-mono mt-0.5 block">{selectedIncident.id}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleShare(selectedIncident.id)}
                          className={`text-[10.5px] font-semibold px-2.5 py-1.5 rounded-xl transition flex items-center gap-1 border cursor-pointer shadow-sm ${
                            shareCopied
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                              : 'bg-white border-slate-200 hover:border-slate-350 text-slate-600 hover:text-slate-800'
                          }`}
                        >
                          <Share2 className="w-3 h-3" />
                          {shareCopied ? 'COPIED!' : 'SHARE'}
                        </button>
                        <button
                          onClick={() => setSelectedIncident(null)}
                          className="text-[10.5px] font-semibold text-slate-500 hover:text-slate-800 bg-white border border-slate-200 hover:border-slate-300 px-2.5 py-1.5 rounded-xl transition cursor-pointer shadow-sm"
                        >
                          CLOSE
                        </button>
                      </div>
                    </div>

                    {/* Meta Indicators */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${getSeverityStyle(selectedIncident.severity)}`}>
                        {selectedIncident.severity}
                      </span>
                      <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${getStatusStyle(selectedIncident.status)}`}>
                        {selectedIncident.status}
                      </span>
                      <span className="text-[10px] font-mono bg-slate-50 border border-slate-200/80 text-slate-500 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-red-400" /> {selectedIncident.city}, {selectedIncident.region}
                      </span>
                      <span className="text-[10px] font-mono bg-slate-50 border border-slate-200/80 text-slate-500 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" /> {formatTimeAgo(selectedIncident.reportedAt)}
                      </span>
                    </div>

                    {/* Image Attachment Preset Graphic Placeholder */}
                    <div 
                      onClick={() => setShowLightbox(true)}
                      className="h-44 w-full bg-slate-100 rounded-2xl mb-4 border border-slate-200/60 flex items-center justify-center relative overflow-hidden cursor-zoom-in group/img transition-all duration-300 hover:border-emerald-500/50"
                      title="Click to expand image"
                    >
                      {selectedIncident.customImage ? (
                        <img
                          src={selectedIncident.customImage}
                          alt={selectedIncident.title}
                          className="absolute inset-0 w-full h-full object-cover z-0 transition-transform duration-500 group-hover/img:scale-105"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="absolute text-center text-slate-400 font-mono text-[9px] select-none p-4 z-0 transition-transform duration-500 group-hover/img:scale-105">
                          📁 SCENARIO IMAGE ATTACHED<br />
                          [alertgh-assets-prod/{selectedIncident.imagePreset}.jpg]
                        </div>
                      )}
                      
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />

                      {/* Overlaid Expand Guidance indicator */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity duration-300 z-15 flex items-center justify-center">
                        <span className="text-white text-[10px] font-semibold bg-slate-900/80 px-2.5 py-1 rounded-full flex items-center gap-1.5 border border-white/20 backdrop-blur-sm">
                          <Eye className="w-3 h-3" /> EXPAND EVIDENCE
                        </span>
                      </div>

                      {/* Overlaid descriptive title card */}
                      <div className="absolute bottom-3 left-3 right-3 z-20">
                        <span className="text-[10px] font-mono font-bold text-emerald-300 flex items-center gap-1 mb-0.5">
                          <CheckCircle className="w-3 h-3 fill-emerald-500 stroke-emerald-900" /> {selectedIncident.customImage ? "LIVE FIELD PHOTO EVIDENCE" : "VERIFIED EVIDENCE SOURCE"}
                        </span>
                        <h5 className="text-xs font-bold text-white truncate">{selectedIncident.title}</h5>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {/* Description Text block */}
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Citizen Description</span>
                        <p className="text-xs text-slate-600 leading-relaxed bg-[#f5f5f7] p-3 rounded-2xl border border-slate-200/50">
                          {selectedIncident.description}
                        </p>
                      </div>

                      {/* Reporter Info */}
                      <div className="flex items-center justify-between text-[10px] font-mono bg-slate-50 p-2 rounded-xl border border-slate-200/50">
                        <span className="text-slate-400">{isResponderMode ? 'Responded By:' : 'Reported By:'}</span>
                        <span className="text-slate-600 font-bold">{selectedIncident.reportedBy}</span>
                      </div>

                      {/* Official Response Notes Block (if present) */}
                      {selectedIncident.officialNotes && (
                        <div className={`p-4 rounded-2xl border-l-4 ${
                          isResponderMode 
                            ? 'bg-blue-500/5 dark:bg-blue-500/10 border-blue-500 text-blue-900 dark:text-blue-200' 
                            : 'bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-500 text-emerald-900 dark:text-emerald-200'
                        } space-y-2 relative overflow-hidden shadow-sm`}>
                          <div className="flex items-center justify-between gap-2">
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                              isResponderMode ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300' : 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300'
                            } flex items-center gap-1.5`}>
                              🛡️ OFFICIAL AGENCY ADVISORY
                            </span>
                            <span className="text-[9px] font-mono opacity-60">Verified Dispatch</span>
                          </div>
                          <p className="text-xs leading-relaxed italic font-medium">
                            "{selectedIncident.officialNotes}"
                          </p>
                        </div>
                      )}

                      {/* Community Verification Progress Voting target */}
                      <div className="border-t border-slate-100 pt-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">COMMUNITY TRUTH VOTE</span>
                          <span className={`text-[10px] font-semibold ${
                            selectedIncident.verificationScore > 15 ? 'text-emerald-600' :
                            selectedIncident.verificationScore >= 5 ? 'text-amber-600' : 'text-slate-400'
                          }`}>
                            {selectedIncident.verificationScore > 15 ? 'Highly Verified (Genuine)' :
                             selectedIncident.verificationScore >= 5 ? 'Community Verified' : 'Awaiting Trust Threshold'}
                          </span>
                        </div>

                        {/* Custom Vote Progress Bar */}
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden flex">
                          <div
                            style={{ width: `${Math.max(10, Math.min(90, (selectedIncident.upvotes / (selectedIncident.upvotes + selectedIncident.downvotes || 1)) * 100))}%` }}
                            className="bg-emerald-500 h-full rounded-l-full"
                          />
                          <div className="bg-red-400 h-full flex-1 rounded-r-full" />
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleVerifyVote(selectedIncident.id, 'up')}
                            className={`flex-1 text-xs font-semibold py-2 rounded-xl border transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm ${
                              userVotes[selectedIncident.id] === 'up'
                                ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600'
                                : 'bg-white hover:bg-[#f5f5f7] dark:bg-zinc-800 text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 border-slate-200 dark:border-zinc-700 hover:border-slate-300 dark:hover:border-zinc-650'
                            }`}
                          >
                            <ThumbsUp className={`w-3.5 h-3.5 ${userVotes[selectedIncident.id] === 'up' ? 'fill-white' : ''}`} />
                            GENUINE ({selectedIncident.upvotes})
                          </button>
                          
                          <button
                            onClick={() => handleVerifyVote(selectedIncident.id, 'down')}
                            className={`flex-1 text-xs font-semibold py-2 rounded-xl border transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm ${
                              userVotes[selectedIncident.id] === 'down'
                                ? 'bg-red-600 hover:bg-red-700 text-white border-red-600'
                                : 'bg-white hover:bg-[#f5f5f7] dark:bg-zinc-800 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 border-slate-200 dark:border-zinc-700 hover:border-slate-300 dark:hover:border-zinc-650'
                            }`}
                          >
                            <ThumbsDown className={`w-3.5 h-3.5 ${userVotes[selectedIncident.id] === 'down' ? 'fill-white' : ''}`} />
                            DISPUTE / FALSE ({selectedIncident.downvotes})
                          </button>
                        </div>
                      </div>

                      {/* Responder controls center (visible if responder mode is active) */}
                      {isResponderMode && (
                        <div className="border-t border-slate-150 dark:border-zinc-800 pt-4 space-y-4">
                          <span className="text-[10px] font-mono font-bold text-blue-600 dark:text-blue-450 uppercase tracking-wider block flex items-center gap-1.5">
                            🛡️ RESPONDER ACTION CENTER
                          </span>

                          <div className="grid grid-cols-2 gap-2">
                            {/* Add Official Update Button */}
                            <button
                              onClick={() => {
                                if (!checkResponderAuth()) return;
                                setResponderStatus(selectedIncident.status);
                                setResponderNotes(selectedIncident.officialNotes || '');
                                setSelectedSeverity(selectedIncident.severity);
                                setShowOfficialUpdateModal(true);
                                window.history.pushState({ type: 'officialUpdate' }, '');
                              }}
                              className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-3 px-4 rounded-xl transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/10"
                            >
                              <PlusCircle className="w-4 h-4" />
                              Add Official Update
                            </button>

                            {/* Mark Resolved Button */}
                            <button
                              onClick={() => handleMarkResolved(selectedIncident.id)}
                              className={`font-bold text-xs py-3 px-4 rounded-xl transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 shadow-sm border ${
                                selectedIncident.status === 'resolved'
                                  ? 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-350 dark:hover:bg-zinc-700'
                                  : 'bg-emerald-600 border-emerald-600 text-white hover:bg-emerald-500 shadow-emerald-500/10'
                              }`}
                            >
                              <CheckCircle className="w-4 h-4" />
                              {selectedIncident.status === 'resolved' ? 'Mark Active' : 'Mark Resolved'}
                            </button>
                          </div>

                          {/* Spam/Duplicate/Fraudulent Flags Block */}
                          <div className="bg-slate-50 dark:bg-zinc-900/40 border border-slate-200/60 dark:border-zinc-800/80 p-4 rounded-2xl space-y-3">
                            <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider block flex items-center gap-1.5">
                              🛡️ REPORT CLASSIFICATION FLAGS
                            </span>
                            <p className="text-[10px] text-slate-500 dark:text-zinc-400 leading-normal">
                              Flag untrustworthy reports to hide them from the public citizen network.
                            </p>

                            <div className="grid grid-cols-3 gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleFlagIncident(selectedIncident.id, selectedIncident.moderationStatus === 'flagged_spam' ? 'clean' : 'flagged_spam')}
                                className={`text-[10px] font-bold py-2 px-1 rounded-xl transition-all border cursor-pointer text-center ${
                                  selectedIncident.moderationStatus === 'flagged_spam'
                                    ? 'bg-amber-600 border-amber-600 text-white shadow-sm'
                                    : 'bg-white hover:bg-slate-100 border-slate-200 dark:bg-zinc-900 dark:border-zinc-800 dark:hover:bg-zinc-850 text-amber-600 dark:text-amber-400 hover:border-amber-500/30'
                                }`}
                              >
                                {selectedIncident.moderationStatus === 'flagged_spam' ? 'Spam ✓' : 'Spam'}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleFlagIncident(selectedIncident.id, selectedIncident.moderationStatus === 'flagged_duplicate' ? 'clean' : 'flagged_duplicate')}
                                className={`text-[10px] font-bold py-2 px-1 rounded-xl transition-all border cursor-pointer text-center ${
                                  selectedIncident.moderationStatus === 'flagged_duplicate'
                                    ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                                    : 'bg-white hover:bg-slate-100 border-slate-200 dark:bg-zinc-900 dark:border-zinc-800 dark:hover:bg-zinc-850 text-blue-600 dark:text-blue-400 hover:border-blue-500/30'
                                }`}
                              >
                                {selectedIncident.moderationStatus === 'flagged_duplicate' ? 'Duplicate ✓' : 'Duplicate'}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleFlagIncident(selectedIncident.id, selectedIncident.moderationStatus === 'flagged_fraudulent' ? 'clean' : 'flagged_fraudulent')}
                                className={`text-[10px] font-bold py-2 px-1 rounded-xl transition-all border cursor-pointer text-center ${
                                  selectedIncident.moderationStatus === 'flagged_fraudulent'
                                    ? 'bg-red-600 border-red-600 text-white shadow-sm'
                                    : 'bg-white hover:bg-slate-100 border-slate-200 dark:bg-zinc-900 dark:border-zinc-800 dark:hover:bg-zinc-850 text-red-600 dark:text-red-400 hover:border-red-500/30'
                                }`}
                              >
                                {selectedIncident.moderationStatus === 'flagged_fraudulent' ? 'Fraud ✓' : 'Fraud'}
                              </button>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleDeleteIncident(selectedIncident.id)}
                              className="w-full bg-red-600/5 hover:bg-red-600/15 text-red-600 dark:text-red-400 font-bold text-[10.5px] py-2 rounded-xl transition-all duration-200 cursor-pointer border border-red-600/10 flex items-center justify-center gap-1.5"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Dismiss & Permanently Delete
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ) : (
                  <div className="glass-panel border-slate-200/60 rounded-3xl p-6 text-center py-16 space-y-4 shadow-sm hidden lg:block">
                    <div className="w-12 h-12 bg-slate-50 border border-slate-200 text-slate-400 rounded-full flex items-center justify-center mx-auto text-lg shadow-sm">
                      🗺️
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-800">No active incident selected</h4>
                      <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto leading-normal">
                        Click on any pulsing pin marker on the Ghana interactive map canvas to inspect emergency details, vote, or post updates.
                      </p>
                    </div>
                  </div>
                )}
              </AnimatePresence>

              {/* Feed of other recent active cases in the country */}
              <div className="glass-panel border-slate-200/60 rounded-3xl p-5 space-y-4 shadow-sm">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider block">Ghanaian Broadcast Feed</span>
                  <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    LIVE
                  </span>
                </div>
                {/* Keyword search */}
                <input
                  type="text"
                  value={feedSearch}
                  onChange={e => setFeedSearch(e.target.value)}
                  placeholder="Search incidents..."
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1.5 custom-scrollbar" id="ghanaian-broadcast-feed-container">
                  {visibleIncidents
                    .filter(inc =>
                      !feedSearch.trim() ||
                      inc.title.toLowerCase().includes(feedSearch.toLowerCase()) ||
                      inc.city.toLowerCase().includes(feedSearch.toLowerCase()) ||
                      inc.region.toLowerCase().includes(feedSearch.toLowerCase()) ||
                      inc.category.toLowerCase().includes(feedSearch.toLowerCase())
                    )
                    .map((inc) => (
                    <button
                      key={inc.id}
                      id={`feed-item-${inc.id}`}
                      onClick={() => {
                        setSelectedIncident(inc);
                        setShowIncidentModal(true);
                      }}
                      className={`w-full text-left p-2.5 rounded-2xl border transition flex items-start gap-3 group cursor-pointer ${
                        selectedIncident?.id === inc.id
                          ? isResponderMode
                            ? 'bg-white dark:bg-zinc-900 border-blue-500/40 dark:border-blue-500/60 text-slate-900 dark:text-zinc-100 shadow-sm'
                            : 'bg-white dark:bg-zinc-900 border-emerald-500/40 dark:border-emerald-500/60 text-slate-900 dark:text-zinc-100 shadow-sm'
                          : 'bg-white/60 dark:bg-zinc-900/40 border-slate-200/60 dark:border-zinc-800/60 text-slate-600 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-800 hover:border-slate-300 dark:hover:border-zinc-750 hover:shadow-sm'
                      }`}
                    >
                      <span className={`text-lg bg-slate-50 dark:bg-zinc-800 border border-slate-200/60 dark:border-zinc-700/60 p-1.5 rounded-xl transition ${
                        isResponderMode
                          ? 'group-hover:border-blue-500/20 dark:group-hover:border-blue-500/30'
                          : 'group-hover:border-emerald-500/20 dark:group-hover:border-emerald-500/30'
                      }`}>{getCategoryIcon(inc.category)}</span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between text-[10px] font-mono">
                          <span className="text-slate-400 dark:text-zinc-500 flex items-center gap-1 flex-wrap">
                            <span>{inc.city}</span>
                            <span className="text-slate-300 dark:text-zinc-750">•</span>
                            <span className="text-slate-500 dark:text-zinc-400 font-semibold flex items-center gap-0.5">
                              <Clock className="w-2.5 h-2.5" />
                              {formatTimeAgo(inc.reportedAt)}
                            </span>
                          </span>
                          <span className={`capitalize font-bold ${
                            inc.severity === 'critical' ? 'text-red-600 dark:text-red-400' :
                            inc.severity === 'high' ? 'text-amber-600 dark:text-amber-400' : 'text-slate-500 dark:text-zinc-400'
                          }`}>{inc.severity}</span>
                        </div>
                        <h5 className={`text-[11.5px] font-bold text-slate-800 dark:text-zinc-200 mt-1 truncate transition ${
                          isResponderMode
                            ? 'group-hover:text-blue-600 dark:group-hover:text-blue-400'
                            : 'group-hover:text-emerald-600 dark:group-hover:text-emerald-400'
                        }`}>{inc.title}</h5>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <DashboardStats
            incidents={visibleIncidents}
            onSelectIncident={(inc) => {
              setSelectedIncident(inc);
              setActiveTab('map');
            }}
          />
        )}

        {activeTab === 'hotlines' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8">
              <EmergencyDirectory />
            </div>
            <div className="lg:col-span-4 space-y-6">
              {/* Safety & Preparedness Guidelines Card */}
              <div className="glass-panel border-slate-200/60 rounded-3xl p-5 space-y-4 shadow-sm" id="safety-guidelines-panel">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-emerald-500" />
                  <span className="text-xs font-mono font-bold text-slate-900 dark:text-zinc-100 uppercase tracking-wider">
                    Safety & Preparedness
                  </span>
                </div>
                <p className="text-[11.5px] text-slate-700 dark:text-zinc-300 leading-normal">
                  Essential protocols compiled by the National Disaster Management Organisation (NADMO) for key hazards in Ghana.
                </p>
                
                <div className="space-y-3 pt-1">
                  <div className="flex gap-3 items-start p-3 rounded-2xl bg-blue-50/80 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30">
                    <span className="text-base shrink-0">🌧️</span>
                    <div className="space-y-0.5">
                      <h6 className="text-xs font-bold text-blue-900 dark:text-blue-300">Heavy Flooding & Rains</h6>
                      <p className="text-[10.5px] text-slate-700 dark:text-zinc-300 leading-relaxed">
                        Stay off roads during torrential rain. Disconnect electronic appliances, move to high ground, and monitor local weather frequencies.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3 items-start p-3 rounded-2xl bg-red-50/80 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30">
                    <span className="text-base shrink-0">🔥</span>
                    <div className="space-y-0.5">
                      <h6 className="text-xs font-bold text-red-900 dark:text-red-300">Domestic & Bush Fires</h6>
                      <p className="text-[10.5px] text-slate-700 dark:text-zinc-300 leading-relaxed">
                        Isolate the area immediately. Crawl low to avoid smoke inhalation. Do not throw water on electrical fires—use dry sand or an extinguisher. Call 192.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3 items-start p-3 rounded-2xl bg-amber-50/80 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30">
                    <span className="text-base shrink-0">🩹</span>
                    <div className="space-y-0.5">
                      <h6 className="text-xs font-bold text-amber-900 dark:text-amber-300">Medical Emergency</h6>
                      <p className="text-[10.5px] text-slate-700 dark:text-zinc-300 leading-relaxed">
                        Administer basic first aid if qualified. Clear paths for emergency responders. Keep local water sources clean during cholera or viral warnings.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Dynamic Detailed Incident Popup Modal */}
      <AnimatePresence>
        {showIncidentModal && selectedIncident && (
          <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            {/* Click backdrop to close */}
            <div className="absolute inset-0" onClick={() => setShowIncidentModal(false)} />
            
            <motion.div
              initial={{ scale: 0.95, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 15, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              drag="y"
              dragConstraints={{ top: 0, bottom: 300 }}
              dragElastic={{ top: 0.1, bottom: 0.5 }}
              onDragEnd={(event, info) => {
                if (info.offset.y > 100 || info.velocity.y > 300) {
                  setShowIncidentModal(false);
                }
              }}
              className="max-w-2xl w-full max-h-[90vh] overflow-y-auto rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800 shadow-2xl relative z-10 custom-scrollbar touch-pan-x"
            >
              {/* Top gradient strip */}
              <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-red-500 via-amber-500 to-green-500" />
              
              {/* Mobile swipe down to dismiss handle */}
              <div className="w-12 h-1 bg-slate-300 dark:bg-zinc-700 rounded-full mx-auto mt-3 -mb-1 block md:hidden opacity-80" />
              
              {/* Absolute Close Button */}
              <button
                onClick={() => setShowIncidentModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 dark:text-zinc-500 dark:hover:text-zinc-200 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 transition-all duration-200 cursor-pointer z-20 w-10 h-10 flex items-center justify-center border border-slate-200 dark:border-zinc-700 bg-white/90 dark:bg-zinc-900/90 shadow-sm"
                title="Close overlay"
              >
                <X className="w-4.5 h-4.5" />
              </button>
              
              <div className="p-6 md:p-8 space-y-6">
                {/* Header Details */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-zinc-800 pb-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-2xl bg-slate-100 dark:bg-zinc-800/50 p-2.5 rounded-2xl border border-slate-200/50 dark:border-zinc-700/50 shrink-0">
                      {getCategoryIcon(selectedIncident.category)}
                    </span>
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-slate-850 dark:text-zinc-100 capitalize truncate">
                        {selectedIncident.category} Outbreak
                      </h4>
                      <span className="text-[10px] text-slate-400 dark:text-zinc-550 font-mono mt-0.5 block truncate">
                        {selectedIncident.id}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => handleShare(selectedIncident.id)}
                      className={`text-xs font-semibold px-3 py-2 rounded-xl transition flex items-center justify-center gap-1.5 border cursor-pointer shadow-sm flex-1 sm:flex-initial ${
                        shareCopied
                          ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                          : 'bg-white dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 hover:border-slate-350 dark:hover:border-zinc-600 text-slate-600 dark:text-zinc-300 hover:text-slate-800 dark:hover:text-zinc-100'
                      }`}
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      {shareCopied ? 'COPIED!' : 'SHARE'}
                    </button>
                    <button
                      onClick={() => setShowIncidentModal(false)}
                      className="text-xs font-bold text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-100 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 hover:border-slate-350 dark:hover:border-zinc-600 px-3.5 py-2 rounded-xl transition cursor-pointer shadow-sm flex-1 sm:flex-initial"
                    >
                      CLOSE
                    </button>
                  </div>
                </div>

                {/* Meta Indicators */}
                <div className="flex flex-wrap gap-2">
                  <span className={`text-[10px] font-semibold uppercase px-2.5 py-1 rounded-full ${getSeverityStyle(selectedIncident.severity)}`}>
                    {selectedIncident.severity}
                  </span>
                  <span className={`text-[10px] font-semibold uppercase px-2.5 py-1 rounded-full ${getStatusStyle(selectedIncident.status)}`}>
                    {selectedIncident.status}
                  </span>
                  <span className="text-[10px] font-mono bg-slate-50 dark:bg-zinc-800/40 border border-slate-200/80 dark:border-zinc-850 text-slate-500 dark:text-zinc-400 px-2.5 py-1 rounded-full flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-red-400" /> {selectedIncident.city}, {selectedIncident.region}
                  </span>
                  <span className="text-[10px] font-mono bg-slate-50 dark:bg-zinc-800/40 border border-slate-200/80 dark:border-zinc-850 text-slate-500 dark:text-zinc-400 px-2.5 py-1 rounded-full flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-550" /> {formatTimeAgo(selectedIncident.reportedAt)}
                  </span>
                </div>

                {/* Image Attachment Preset Graphic Placeholder */}
                <div 
                  onClick={() => setShowLightbox(true)}
                  className="h-56 md:h-64 w-full bg-slate-100 dark:bg-zinc-800 rounded-2xl border border-slate-200/60 dark:border-zinc-855 flex items-center justify-center relative overflow-hidden cursor-zoom-in group/img transition-all duration-300 hover:border-emerald-500/50"
                  title="Click to expand image"
                >
                  {selectedIncident.customImage ? (
                    <img
                      src={selectedIncident.customImage}
                      alt={selectedIncident.title}
                      className="absolute inset-0 w-full h-full object-cover z-0 transition-transform duration-500 group-hover/img:scale-105"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="absolute text-center text-slate-400 dark:text-zinc-500 font-mono text-[10px] select-none p-4 z-0 transition-transform duration-500 group-hover/img:scale-105">
                      📁 SCENARIO IMAGE ATTACHED<br />
                      [alertgh-assets-prod/{selectedIncident.imagePreset}.jpg]
                    </div>
                  )}
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent z-10" />

                  {/* Overlaid Expand Guidance indicator */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity duration-300 z-15 flex items-center justify-center">
                    <span className="text-white text-xs font-semibold bg-slate-900/80 px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-white/20 backdrop-blur-sm">
                      <Eye className="w-3.5 h-3.5" /> CLICK TO EXPAND PHOTO
                    </span>
                  </div>

                  {/* Overlaid descriptive title card */}
                  <div className="absolute bottom-4 left-4 right-4 z-20">
                    <span className="text-[10px] font-mono font-bold text-emerald-300 flex items-center gap-1 mb-1">
                      <CheckCircle className="w-3.5 h-3.5 fill-emerald-500 stroke-emerald-900" /> {selectedIncident.customImage ? "LIVE FIELD PHOTO EVIDENCE" : "VERIFIED EVIDENCE SOURCE"}
                    </span>
                    <h5 className="text-sm font-bold text-white leading-snug">{selectedIncident.title}</h5>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Description Text block */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-mono font-bold text-slate-400 dark:text-zinc-550 uppercase tracking-wider block">Citizen Description</span>
                    <p className="text-xs text-slate-600 dark:text-zinc-350 leading-relaxed bg-[#f5f5f7] dark:bg-zinc-950 p-4 rounded-2xl border border-slate-200/50 dark:border-zinc-800/40">
                      {selectedIncident.description}
                    </p>
                  </div>

                  {/* Reporter Info */}
                  <div className="flex items-center justify-between text-[10px] font-mono bg-slate-50 dark:bg-zinc-800/50 p-3 rounded-xl border border-slate-200/50 dark:border-zinc-800/50">
                    <span className="text-slate-400 dark:text-zinc-500">{isResponderMode ? 'Responded By:' : 'Reported By:'}</span>
                    <span className="text-slate-600 dark:text-zinc-300 font-bold">{selectedIncident.reportedBy}</span>
                  </div>

                  {/* Quick Dial Emergency Assistance Card */}
                  {(() => {
                    const service = getEmergencyServiceForCategory(selectedIncident.category);
                    return (
                      <div className="bg-red-50/80 dark:bg-red-950/20 border border-red-200/50 dark:border-red-900/40 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm" id="incident-quick-dial-box">
                        <div className="flex items-center gap-3 min-w-0 self-start sm:self-auto">
                          <span className="text-2xl shrink-0 p-1.5 bg-red-150 dark:bg-red-900/30 rounded-xl" id="incident-quick-dial-icon">{service.icon}</span>
                          <div className="min-w-0">
                            <h5 className="text-[11px] font-bold text-red-900 dark:text-red-300 uppercase tracking-wider">Associated Dispatch Service</h5>
                            <p className="text-xs text-red-700 dark:text-red-400 font-bold truncate mt-0.5">{service.name}</p>
                            <span className="text-[10px] text-slate-400 dark:text-zinc-550 block mt-0.5">Launches native phone dialer with number pre-filled</span>
                          </div>
                        </div>
                        <a
                          href={`tel:${service.number}`}
                          className="w-full sm:w-auto bg-red-600 hover:bg-red-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 shadow-md active:scale-95 cursor-pointer shrink-0"
                          id="incident-quick-dial-btn"
                        >
                          <Phone className="w-3.5 h-3.5 fill-white" />
                          QUICK DIAL ({service.number})
                        </a>
                      </div>
                    );
                  })()}

                  {/* Official Response Notes Block (if present) */}
                  {selectedIncident.officialNotes && (
                    <div className={`p-4 rounded-2xl border-l-4 ${
                      isResponderMode 
                        ? 'bg-blue-500/5 dark:bg-blue-500/10 border-blue-500 text-blue-900 dark:text-blue-200' 
                        : 'bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-500 text-emerald-900 dark:text-emerald-200'
                    } space-y-2 relative overflow-hidden shadow-sm`}>
                      <div className="flex items-center justify-between gap-2">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                          isResponderMode ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300' : 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300'
                        } flex items-center gap-1.5`}>
                          🛡️ OFFICIAL AGENCY ADVISORY
                        </span>
                        <span className="text-[9px] font-mono opacity-60">Verified Dispatch</span>
                      </div>
                      <p className="text-xs leading-relaxed italic font-medium">
                        "{selectedIncident.officialNotes}"
                      </p>
                    </div>
                  )}

                  {/* Community Verification Progress Voting target */}
                  <div className="border-t border-slate-100 dark:border-zinc-800 pt-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">COMMUNITY TRUTH VOTE</span>
                      <span className={`text-[10px] font-semibold ${
                        selectedIncident.verificationScore > 15 ? 'text-emerald-600 dark:text-emerald-400' :
                        selectedIncident.verificationScore >= 5 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400'
                      }`}>
                        {selectedIncident.verificationScore > 15 ? 'Highly Verified (Genuine)' :
                         selectedIncident.verificationScore >= 5 ? 'Community Verified' : 'Awaiting Trust Threshold'}
                      </span>
                    </div>

                    {/* Custom Vote Progress Bar */}
                    <div className="h-2 w-full bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden flex">
                      <div
                        style={{ width: `${Math.max(10, Math.min(90, (selectedIncident.upvotes / (selectedIncident.upvotes + selectedIncident.downvotes || 1)) * 100))}%` }}
                        className="bg-emerald-500 h-full rounded-l-full"
                      />
                      <div className="bg-red-400 h-full flex-1 rounded-r-full" />
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-col sm:flex-row gap-2">
                      <button
                        onClick={() => handleVerifyVote(selectedIncident.id, 'up')}
                        className={`flex-1 text-xs font-semibold py-2.5 rounded-xl border transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm ${
                          userVotes[selectedIncident.id] === 'up'
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600'
                            : 'bg-white hover:bg-[#f5f5f7] dark:bg-zinc-800 text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 border-slate-200 dark:border-zinc-700 hover:border-slate-350 dark:hover:border-zinc-650'
                        }`}
                      >
                        <ThumbsUp className={`w-3.5 h-3.5 ${userVotes[selectedIncident.id] === 'up' ? 'fill-white' : ''}`} />
                        GENUINE ({selectedIncident.upvotes})
                      </button>
                      
                      <button
                        onClick={() => handleVerifyVote(selectedIncident.id, 'down')}
                        className={`flex-1 text-xs font-semibold py-2.5 rounded-xl border transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm ${
                          userVotes[selectedIncident.id] === 'down'
                            ? 'bg-red-600 hover:bg-red-700 text-white border-red-600'
                            : 'bg-white hover:bg-[#f5f5f7] dark:bg-zinc-800 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 border-slate-200 dark:border-zinc-700 hover:border-slate-350 dark:hover:border-zinc-650'
                        }`}
                      >
                        <ThumbsDown className={`w-3.5 h-3.5 ${userVotes[selectedIncident.id] === 'down' ? 'fill-white' : ''}`} />
                        DISPUTE / FALSE ({selectedIncident.downvotes})
                      </button>
                    </div>
                  </div>

                  {/* Responder controls center (visible if responder mode is active) */}
                  {isResponderMode && (
                    <div className="border-t border-slate-150 dark:border-zinc-800 pt-4 space-y-4">
                      <span className="text-[10px] font-mono font-bold text-blue-600 dark:text-blue-450 uppercase tracking-wider block flex items-center gap-1.5">
                        🛡️ RESPONDER ACTION CENTER
                      </span>

                      <div className="grid grid-cols-2 gap-2">
                        {/* Add Official Update Button */}
                        <button
                          onClick={() => {
                            if (!checkResponderAuth()) return;
                            setResponderStatus(selectedIncident.status);
                            setResponderNotes(selectedIncident.officialNotes || '');
                            setSelectedSeverity(selectedIncident.severity);
                            setShowOfficialUpdateModal(true);
                            window.history.pushState({ type: 'officialUpdate' }, '');
                          }}
                          className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-3 px-4 rounded-xl transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/10"
                        >
                          <PlusCircle className="w-4 h-4" />
                          Add Official Update
                        </button>

                        {/* Mark Resolved Button */}
                        <button
                          onClick={() => handleMarkResolved(selectedIncident.id)}
                          className={`font-bold text-xs py-3 px-4 rounded-xl transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 shadow-sm border ${
                            selectedIncident.status === 'resolved'
                              ? 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-350 dark:hover:bg-zinc-700'
                              : 'bg-emerald-600 border-emerald-600 text-white hover:bg-emerald-500 shadow-emerald-500/10'
                          }`}
                        >
                          <CheckCircle className="w-4 h-4" />
                          {selectedIncident.status === 'resolved' ? 'Mark Active' : 'Mark Resolved'}
                        </button>
                      </div>

                      {/* Spam/Duplicate/Fraudulent Flags Block */}
                      <div className="bg-slate-50 dark:bg-zinc-950 border border-slate-200/60 dark:border-zinc-800 p-4 rounded-2xl space-y-3">
                        <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider block flex items-center gap-1.5">
                          🛡️ REPORT CLASSIFICATION FLAGS
                        </span>
                        <p className="text-[10px] text-slate-500 dark:text-zinc-400 leading-normal">
                          Flag untrustworthy reports to hide them from the public citizen network.
                        </p>

                        <div className="grid grid-cols-3 gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleFlagIncident(selectedIncident.id, selectedIncident.moderationStatus === 'flagged_spam' ? 'clean' : 'flagged_spam')}
                            className={`text-[10px] font-bold py-2 px-1 rounded-xl transition-all border cursor-pointer text-center ${
                              selectedIncident.moderationStatus === 'flagged_spam'
                                ? 'bg-amber-600 border-amber-600 text-white shadow-sm'
                                : 'bg-white hover:bg-slate-100 border-slate-200 dark:bg-zinc-900 dark:border-zinc-850 dark:hover:bg-zinc-800 text-amber-600 dark:text-amber-400 hover:border-amber-500/30'
                            }`}
                          >
                            {selectedIncident.moderationStatus === 'flagged_spam' ? 'Spam ✓' : 'Spam'}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleFlagIncident(selectedIncident.id, selectedIncident.moderationStatus === 'flagged_duplicate' ? 'clean' : 'flagged_duplicate')}
                            className={`text-[10px] font-bold py-2 px-1 rounded-xl transition-all border cursor-pointer text-center ${
                              selectedIncident.moderationStatus === 'flagged_duplicate'
                                ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                                : 'bg-white hover:bg-slate-100 border-slate-200 dark:bg-zinc-900 dark:border-zinc-850 dark:hover:bg-zinc-800 text-blue-600 dark:text-blue-400 hover:border-blue-500/30'
                            }`}
                          >
                            {selectedIncident.moderationStatus === 'flagged_duplicate' ? 'Duplicate ✓' : 'Duplicate'}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleFlagIncident(selectedIncident.id, selectedIncident.moderationStatus === 'flagged_fraudulent' ? 'clean' : 'flagged_fraudulent')}
                            className={`text-[10px] font-bold py-2 px-1 rounded-xl transition-all border cursor-pointer text-center ${
                              selectedIncident.moderationStatus === 'flagged_fraudulent'
                                ? 'bg-red-600 border-red-600 text-white shadow-sm'
                                : 'bg-white hover:bg-slate-100 border-slate-200 dark:bg-zinc-900 dark:border-zinc-850 dark:hover:bg-zinc-800 text-red-600 dark:text-red-400 hover:border-red-500/30'
                            }`}
                          >
                            {selectedIncident.moderationStatus === 'flagged_fraudulent' ? 'Fraud ✓' : 'Fraud'}
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDeleteIncident(selectedIncident.id)}
                          className="w-full bg-red-600/5 hover:bg-red-600/15 text-red-600 dark:text-red-400 font-bold text-xs py-2 rounded-xl transition cursor-pointer border border-red-600/10 flex items-center justify-center gap-1.5"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Dismiss & Permanently Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Anonymous Report Submission Dialog Modal */}
      <AnimatePresence>
        {showReportModal && (
          <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="max-w-2xl w-full max-h-[90vh] overflow-y-auto rounded-3xl"
            >
              <ReportForm
                coordinates={clickedCoords}
                selectedRegionName={selectedRegion}
                onClose={() => {
                  setShowReportModal(false);
                  setClickedCoords(null);
                }}
                onAddIncident={(data) => {
                  handleAddIncident(data);
                  setShowReportModal(false);
                  setClickedCoords(null);
                }}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Official Dispatch Update Modal */}
      <AnimatePresence>
        {showOfficialUpdateModal && selectedIncident && (
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.95, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 15, opacity: 0 }}
              transition={{ type: 'spring', duration: 0.4 }}
              className="max-w-lg w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden"
              id="official-update-modal"
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={closeActiveModalOrView}
                className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 dark:text-zinc-500 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-slate-700 dark:hover:text-zinc-200 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center text-xl border border-blue-100 dark:border-blue-900/30 shadow-sm">
                  🛡️
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-zinc-100 font-sans tracking-tight">Add Official Dispatch Update</h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">Publish official details, change hazard severity, or adjust active status.</p>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-zinc-950/50 p-4 rounded-2xl border border-slate-200/50 dark:border-zinc-800/60 mb-5">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-zinc-200">{selectedIncident.title}</h4>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-450 mt-0.5">{selectedIncident.city}, {selectedIncident.region}</p>
                  </div>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md ${
                    selectedIncident.severity === 'critical' ? 'bg-red-50 text-red-600 border border-red-100 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/30' :
                    selectedIncident.severity === 'high' ? 'bg-amber-50 text-amber-600 border border-amber-100 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30' :
                    selectedIncident.severity === 'medium' ? 'bg-blue-50 text-blue-600 border border-blue-100 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/30' :
                    'bg-slate-50 text-slate-600 border border-slate-150 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700/60'
                  } uppercase`}>
                    {selectedIncident.severity}
                  </span>
                </div>
              </div>

              <form onSubmit={(e) => handleResponderUpdateSubmit(e, selectedIncident.id)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {/* Status update */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 dark:text-zinc-350">Advisory Status</label>
                    <select
                      value={responderStatus}
                      onChange={(e) => setResponderStatus(e.target.value as IncidentStatus)}
                      className="w-full bg-slate-50 dark:bg-zinc-950 text-xs text-slate-700 dark:text-zinc-300 p-3 rounded-xl border border-slate-200 dark:border-zinc-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 cursor-pointer shadow-sm transition-all"
                    >
                      <option value="active">🔴 Active Outbreak</option>
                      <option value="investigating">🟡 Investigating</option>
                      <option value="resolved">🟢 Resolved / Safe</option>
                    </select>
                  </div>

                  {/* Severity level */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 dark:text-zinc-350">Adjust Threat Level</label>
                    <select
                      value={selectedSeverity}
                      onChange={(e) => setSelectedSeverity(e.target.value as SeverityLevel)}
                      className="w-full bg-slate-50 dark:bg-zinc-950 text-xs text-slate-700 dark:text-zinc-300 p-3 rounded-xl border border-slate-200 dark:border-zinc-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 cursor-pointer shadow-sm transition-all"
                    >
                      <option value="critical">🚨 Critical threat</option>
                      <option value="high">🟠 High risk</option>
                      <option value="medium">🔵 Medium risk</option>
                      <option value="low">⚪ Low risk</option>
                    </select>
                  </div>
                </div>

                {/* Dispatch Notes */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-slate-600 dark:text-zinc-350">Official Survival Advisory</label>
                    <span className="text-[10px] text-slate-400 dark:text-zinc-500">Preset Survival Templates</span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mb-2 max-h-24 overflow-y-auto p-1 bg-slate-50 dark:bg-zinc-950 rounded-xl border border-slate-100 dark:border-zinc-850">
                    {DISPATCH_TEMPLATES.map((tpl, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setResponderNotes(tpl.text)}
                        className="text-[10px] bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-700 border border-slate-200/80 dark:border-zinc-700 px-2.5 py-1 rounded-lg transition-all cursor-pointer font-medium hover:border-blue-500/55 hover:text-blue-600 dark:hover:text-blue-400"
                      >
                        {tpl.label}
                      </button>
                    ))}
                  </div>

                  <textarea
                    value={responderNotes}
                    onChange={(e) => setResponderNotes(e.target.value)}
                    placeholder="Provide actionable rescue guidance, survival instructions, or evacuation shelter routes..."
                    rows={4}
                    className="w-full bg-slate-50 dark:bg-zinc-950 text-xs text-slate-700 dark:text-zinc-300 p-3.5 rounded-2xl border border-slate-200 dark:border-zinc-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 resize-none shadow-sm transition-all h-24"
                    required
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={closeActiveModalOrView}
                    className="flex-1 border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-850 font-bold text-xs py-3 rounded-xl transition duration-200 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-3 rounded-xl transition duration-200 cursor-pointer shadow-lg shadow-blue-500/20"
                  >
                    Publish Official Advisory
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Firebase Authorized Responder Modal */}
      <AnimatePresence>
        {showAuthModal && (
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.95, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 15, opacity: 0 }}
              transition={{ type: 'spring', duration: 0.4 }}
              className="max-w-md w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden"
              id="responder-auth-modal"
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={closeActiveModalOrView}
                className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 dark:text-zinc-500 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-slate-700 dark:hover:text-zinc-200 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Title Section */}
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-red-50 dark:bg-red-950/30 rounded-xl border border-red-100 dark:border-red-900/50">
                  <Shield className="w-6 h-6 text-red-500" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-zinc-50 leading-snug">Responder Access Portal</h3>
                  <span className="text-[11px] text-slate-400 dark:text-zinc-500 uppercase font-bold tracking-wider block mt-0.5">Responder Sign In</span>
                </div>
              </div>

              {/* Segmented Mode Toggles */}
              <div className="flex bg-slate-100 dark:bg-zinc-800 p-1 rounded-xl mb-6">
                <button
                  type="button"
                  onClick={() => { setAuthMode('signin'); setAuthError(null); }}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                    authMode === 'signin'
                      ? 'bg-white dark:bg-zinc-700 text-slate-900 dark:text-zinc-50 shadow-sm font-semibold'
                      : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => { setAuthMode('signup'); setAuthError(null); }}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                    authMode === 'signup'
                      ? 'bg-white dark:bg-zinc-700 text-slate-900 dark:text-zinc-50 shadow-sm font-semibold'
                      : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200'
                  }`}
                >
                  Create Account
                </button>
              </div>

              {/* Description */}
              <p className="text-[13px] text-slate-500 dark:text-zinc-400 leading-relaxed mb-6">
                {authMode === 'signin' 
                  ? 'Sign in with your authorized emergency responder credentials to access official resolution controls, logs, and dispatch tools.'
                  : 'Register a new responder account to submit verified official agency responses and log dispatch operations.'}
              </p>

              {/* Connection Status Label */}
              <div className="mb-6 p-2.5 rounded-lg bg-slate-50 dark:bg-zinc-950/50 border border-slate-100 dark:border-zinc-800/80 flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isFirebaseConfigured ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                <span className="text-[11px] font-bold text-slate-600 dark:text-zinc-400 tracking-wide uppercase">
                  {isFirebaseConfigured ? '🟢 Real-Time Firebase Sync Enabled' : '🟡 Sandbox Testing: Mock Authentication Active'}
                </span>
              </div>

              {/* Auth Form */}
              <form onSubmit={handleAuthSubmit} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="responder@emergency.gov.gh"
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-zinc-900 text-slate-900 dark:text-zinc-50 text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 focus:bg-white dark:focus:bg-zinc-800 focus:outline-none focus:ring-1 focus:ring-red-500 transition placeholder-slate-400 dark:placeholder-zinc-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-1.5">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-zinc-900 text-slate-900 dark:text-zinc-50 text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 focus:bg-white dark:focus:bg-zinc-800 focus:outline-none focus:ring-1 focus:ring-red-500 transition placeholder-slate-400 dark:placeholder-zinc-500 font-medium"
                  />
                </div>

                {/* Error Box */}
                {authError && (
                  <div className="bg-red-50 dark:bg-red-950/20 border border-red-200/50 dark:border-red-900/40 rounded-xl p-3.5 flex gap-2.5">
                    <ShieldAlert className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-red-900 dark:text-red-300">Authentication Failed</h4>
                      <p className="text-[11px] text-red-700 dark:text-red-400 mt-0.5 leading-relaxed">{authError}</p>
                    </div>
                  </div>
                )}

                {/* Submit Action */}
                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full bg-red-600 hover:bg-red-500 disabled:bg-red-800/50 text-white text-[13px] font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-md mt-6"
                >
                  {authLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                  ) : (
                    <Shield className="w-4 h-4" />
                  )}
                  {authMode === 'signin' ? 'Access Control Cabin' : 'Authorize New Profile'}
                </button>
              </form>

              <div className="relative my-4 flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200/80 dark:border-zinc-800/80" />
                </div>
                <span className="relative bg-white dark:bg-zinc-900 px-3 text-[10px] uppercase font-bold text-slate-400 dark:text-zinc-500 tracking-wider">
                  Or continue as view-only
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsGuestResponder(true);
                  setIsResponderMode(true);
                  setShowAuthModal(false);
                  if (window.history.state?.type === 'auth') {
                    window.history.back();
                  }
                }}
                className="w-full bg-slate-100 hover:bg-slate-200/80 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-slate-700 dark:text-zinc-200 text-[13px] font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-sm border border-slate-200/20 dark:border-zinc-800/30"
              >
                <User className="w-4 h-4 text-slate-500 dark:text-zinc-400" />
                Access as Guest Responder
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Sliding Notification Center Panel */}
      <AnimatePresence>
        {showNotifCenter && (
          <>
            {/* Backdrop for click out */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-950/30 backdrop-blur-xs z-45"
              onClick={() => setShowNotifCenter(false)}
            />
            
            {/* Side Drawer Content */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              drag="x"
              dragConstraints={{ left: 0, right: 384 }}
              dragElastic={{ left: 0.05, right: 0.5 }}
              onDragEnd={(event, info) => {
                if (info.offset.x > 100 || info.velocity.x > 300) {
                  setShowNotifCenter(false);
                }
              }}
              className="fixed top-0 right-0 h-full w-full sm:w-96 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border-l border-slate-200/80 dark:border-zinc-800/80 shadow-2xl z-50 flex flex-col overflow-hidden touch-pan-y"
              id="notification-center-drawer"
            >
              {/* Left Edge Drag indicator for mobile */}
              <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1.5 h-12 bg-slate-300/80 dark:bg-zinc-700/80 rounded-full block sm:hidden opacity-60 pointer-events-none" />
              {/* Header */}
              <div className="p-5 border-b border-slate-200/60 bg-white/80 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-emerald-500" />
                  <div>
                    <h2 className="text-sm font-semibold text-slate-800">NOTIFICATIONS PORTAL</h2>
                    <p className="text-[10px] text-slate-500">Opt-in and Area Geofence Settings</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className="p-2 bg-slate-50 dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 border border-slate-200 dark:border-zinc-750 text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-100 transition cursor-pointer w-10 h-10 flex items-center justify-center rounded-xl shadow-sm"
                    title={isMuted ? "Unmute Alert Chime" : "Mute Alert Chime"}
                  >
                    {isMuted ? <VolumeX className="w-4 h-4 text-red-500" /> : <Volume2 className="w-4 h-4 text-emerald-500" />}
                  </button>
                  <button
                    onClick={() => setShowNotifCenter(false)}
                    className="p-2 bg-slate-50 dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 border border-slate-200 dark:border-zinc-750 text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-100 transition cursor-pointer w-10 h-10 flex items-center justify-center rounded-xl shadow-sm"
                    title="Close notifications"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar">
                
                {/* 1. Subscription Preference Switch */}
                <div className="bg-[#f5f5f7] p-4 rounded-2xl border border-slate-200/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10.5px] font-semibold text-slate-800 uppercase block">Push Alerts Engine</span>
                      <p className="text-[10px] text-slate-500 mt-0.5">Toggle push notifications subscription</p>
                    </div>
                    <button
                      onClick={() => {
                        const nextVal = !notifPref.isSubscribed;
                        setNotifPref(prev => ({ ...prev, isSubscribed: nextVal }));
                      }}
                      className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 focus:outline-none flex cursor-pointer ${
                        notifPref.isSubscribed ? 'bg-emerald-500 justify-end' : 'bg-slate-300 justify-start'
                      }`}
                    >
                      <span className="w-4 h-4 rounded-full bg-white shadow-md" />
                    </button>
                  </div>

                  {notifPref.isSubscribed ? (
                    <div className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1.5 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-100">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                      Opt-In Active. Ready to receive push alerts.
                    </div>
                  ) : (
                    <div className="text-[10px] text-slate-500 font-semibold flex items-center gap-1.5 bg-slate-100 px-2.5 py-1.5 rounded-lg border border-slate-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                      Opt-Out Active. Silent mode.
                    </div>
                  )}
                </div>

                {/* 2. Geographical Location Area Target (Geofence) */}
                <div className={`space-y-2 transition ${notifPref.isSubscribed ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                  <span className="text-[10.5px] font-semibold text-slate-700 uppercase tracking-wider block">📍 Current Geographical Area</span>
                  <p className="text-[10px] text-slate-500 leading-normal">
                    You will only receive push alerts matching this geographical region. Perfect for simulated locality testing.
                  </p>
                  
                  <select
                    value={notifPref.geofence}
                    onChange={(e) => {
                      const val = e.target.value;
                      setNotifPref(prev => ({ ...prev, geofence: val }));
                    }}
                    className="w-full bg-[#f5f5f7] text-xs text-slate-700 p-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:outline-none cursor-pointer"
                  >
                    <option value="all">🌍 Nationwide (All of Ghana)</option>
                    {GHANA_REGIONS.map(reg => (
                      <option key={reg.id} value={reg.name}>🇬🇭 {reg.name}</option>
                    ))}
                  </select>
                </div>

                {/* 3. Severity & Hazard Categories Subscriptions */}
                <div className={`space-y-4 transition ${notifPref.isSubscribed ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                  
                  {/* Severities selection */}
                  <div className="space-y-2">
                    <span className="text-[10.5px] font-semibold text-slate-700 uppercase tracking-wider block">🚨 Severity Outbreaks Filter</span>
                    <div className="grid grid-cols-2 gap-1.5">
                      {(['critical', 'high', 'medium', 'low'] as SeverityLevel[]).map(sev => {
                        const isChecked = notifPref.severities.includes(sev);
                        return (
                          <button
                            key={sev}
                            onClick={() => {
                              const updated = isChecked
                                ? notifPref.severities.filter(s => s !== sev)
                                : [...notifPref.severities, sev];
                              setNotifPref(prev => ({ ...prev, severities: updated }));
                            }}
                            className={`py-1.5 px-2 rounded-lg border text-[10.5px] transition text-left flex items-center justify-between cursor-pointer ${
                              isChecked
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-700 font-bold'
                                : 'bg-white border-slate-200 text-slate-400'
                            }`}
                          >
                            <span className="capitalize">{sev}</span>
                            <span className={`w-1.5 h-1.5 rounded-full ${isChecked ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Hazard categories selection */}
                  <div className="space-y-2">
                    <span className="text-[10.5px] font-semibold text-slate-700 uppercase tracking-wider block">🔥 Hazard Category Filters</span>
                    <div className="grid grid-cols-2 gap-1.5">
                      {(['flooding', 'fire', 'accident', 'road-closure', 'power-outage', 'medical', 'other'] as IncidentCategory[]).map(cat => {
                        const isChecked = notifPref.categories.includes(cat);
                        const icons = {
                          flooding: '🌧️',
                          fire: '🔥',
                          accident: '🚗',
                          'road-closure': '🚧',
                          'power-outage': '⚡',
                          medical: '🚨',
                          other: '⚠️'
                        };
                        return (
                          <button
                            key={cat}
                            onClick={() => {
                              const updated = isChecked
                                ? notifPref.categories.filter(c => c !== cat)
                                : [...notifPref.categories, cat];
                              setNotifPref(prev => ({ ...prev, categories: updated }));
                            }}
                            className={`py-1.5 px-2 rounded-lg border text-[10px] transition text-left flex items-center justify-between cursor-pointer ${
                              isChecked
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-700 font-bold'
                                : 'bg-white border-slate-200 text-slate-400'
                            }`}
                          >
                            <span className="truncate">{icons[cat]} {cat}</span>
                            <span className={`w-1.5 h-1.5 rounded-full ${isChecked ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* 4. Trigger Simulation Controls */}
                <div className="bg-[#f5f5f7] p-4 rounded-2xl border border-slate-200/60 space-y-3">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
                    <Settings className="w-3.5 h-3.5 text-emerald-500" />
                    <span>ALERTS ROUTING SIMULATOR</span>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-normal">
                    Trigger live mock events in different regions to test if they route to your inbox based on your subscribed geographical filters above.
                  </p>
                  
                  <div className="grid grid-cols-1 gap-1.5">
                    <button
                      onClick={() => handleSimulateBackgroundEvent('new')}
                      className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-semibold text-[10px] py-1.5 rounded-lg transition cursor-pointer shadow-sm"
                    >
                      🚀 Simulate Peer Incident Broadcast
                    </button>
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        onClick={() => handleSimulateBackgroundEvent('update_resolved')}
                        className="bg-white border border-slate-200 hover:border-slate-300 text-slate-600 font-semibold text-[9.5px] py-1.5 rounded-lg transition cursor-pointer"
                      >
                        🔄 Simulate Resolution
                      </button>
                      <button
                        onClick={() => handleSimulateBackgroundEvent('update_notes')}
                        className="bg-white border border-slate-200 hover:border-slate-300 text-slate-600 font-semibold text-[9.5px] py-1.5 rounded-lg transition cursor-pointer"
                      >
                        ℹ️ Simulate Notes Update
                      </button>
                    </div>
                  </div>
                </div>

                {/* 5. Notifications History Inbox List */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10.5px] font-semibold text-slate-700 uppercase tracking-wider block">📬 Notifications History Inbox</span>
                    {notifications.length > 0 && (
                      <button
                        onClick={() => {
                          setNotifications([]);
                        }}
                        className="text-[9.5px] font-semibold text-red-600 hover:text-red-500 flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" /> Clear Inbox
                      </button>
                    )}
                  </div>

                  {notifications.length === 0 ? (
                    <div className="bg-[#f5f5f7] border border-slate-200/60 p-6 rounded-2xl text-center space-y-1.5">
                      <p className="text-xs font-bold text-slate-500">Your Inbox is Empty</p>
                      <p className="text-[10px] text-slate-400 max-w-[200px] mx-auto leading-normal">
                        No push alerts received yet. Adjust subscriptions or trigger the simulator above to see them live!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                      {notifications.map(notif => {
                        const getSeverityDot = (sev: SeverityLevel) => {
                          switch (sev) {
                            case 'critical': return 'bg-red-500';
                            case 'high': return 'bg-amber-500';
                            case 'medium': return 'bg-yellow-400';
                            default: return 'bg-blue-450';
                          }
                        };
                        return (
                          <div
                            key={notif.id}
                            className={`p-3 rounded-2xl border text-left space-y-1.5 relative transition ${
                              notif.read ? 'bg-slate-50 border-slate-200/60 text-slate-400' : 'bg-white border-emerald-500/20 text-slate-700 shadow-sm'
                            }`}
                          >
                            {/* Read / Unread Status Indicator */}
                            {!notif.read && (
                              <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            )}
                            
                            <div className="flex items-start gap-2.5">
                              <span className={`w-2 h-2 rounded-full mt-1.5 ${getSeverityDot(notif.severity)}`} />
                              <div className="min-w-0 flex-1">
                                <h4 className="text-[11.5px] font-bold leading-tight">{notif.title}</h4>
                                <p className="text-[10.5px] text-slate-500 mt-1 leading-relaxed">{notif.message}</p>
                              </div>
                            </div>

                            <div className="flex items-center justify-between text-[9px] font-mono border-t border-slate-100 pt-2 text-slate-400">
                              <span>{new Date(notif.timestamp).toLocaleTimeString()}</span>
                              <div className="flex items-center gap-2 font-semibold">
                                {!notif.read && (
                                  <button
                                    onClick={() => {
                                      setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n));
                                    }}
                                    className="text-emerald-600 hover:text-emerald-500 cursor-pointer"
                                  >
                                    Mark read
                                  </button>
                                )}
                                {notif.incidentId && (
                                  <button
                                    onClick={() => {
                                      // Find incident and focus
                                      const inc = incidents.find(i => i.id === notif.incidentId);
                                      if (inc) {
                                        setSelectedIncident(inc);
                                        // Focus region too
                                        setSelectedRegion(inc.region);
                                        // Switch tab to map
                                        setActiveTab('map');
                                        // Close sidebar
                                        setShowNotifCenter(false);
                                        // Mark as read
                                        setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n));
                                      }
                                    }}
                                    className="text-emerald-600 hover:text-emerald-500 flex items-center gap-0.5 cursor-pointer"
                                  >
                                    View on Map
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Live Push Notification Popup Toast Overlay */}
      <AnimatePresence>
        {activeToast && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-24 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-sm w-auto bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xl z-50 overflow-hidden cursor-pointer"
            onClick={() => {
              // Click toast to inspect incident
              if (activeToast.incidentId) {
                const inc = incidents.find(i => i.id === activeToast.incidentId);
                if (inc) {
                  setSelectedIncident(inc);
                  setSelectedRegion(inc.region);
                  setActiveTab('map');
                }
              }
              // Mark read
              setNotifications(prev => prev.map(n => n.id === activeToast.id ? { ...n, read: true } : n));
              // Dismiss toast
              setActiveToast(null);
            }}
          >
            {/* Top decorative glow */}
            <div className="absolute top-0 inset-x-0 h-1 bg-emerald-500" />
            
            <div className="flex items-start gap-3">
              <div className="p-2 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-xl relative">
                <Bell className="w-4 h-4 animate-bounce" />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-ping" />
              </div>
              
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-emerald-600 tracking-widest uppercase">GEOFENCED PUSH ALERT</span>
                  <span className="text-[9px] text-slate-400 font-mono">Just Now</span>
                </div>
                <h4 className="text-xs font-semibold text-slate-800 mt-1 leading-snug">{activeToast.title}</h4>
                <p className="text-[10.5px] text-slate-500 mt-1 leading-normal">{activeToast.message}</p>
                <div className="mt-2 text-[9px] text-slate-400 font-mono flex items-center justify-between">
                  <span>Click to view details on map</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveToast(null);
                    }}
                    className="text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lightbox Fullscreen Hazard Evidence Inspection Modal */}
      <AnimatePresence>
        {showLightbox && selectedIncident && (
          <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center z-[60] p-4 select-none">
            {/* Click backdrop to close */}
            <div 
              className="absolute inset-0 cursor-zoom-out" 
              onClick={() => {
                setShowLightbox(false);
                setLightboxZoom(1);
              }} 
            />
            
            {/* Top Navigation Toolbar */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-20 pointer-events-none">
              <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800/80 rounded-2xl px-4 py-2.5 flex items-center gap-3 shadow-lg">
                <span className="text-xl shrink-0">{getCategoryIcon(selectedIncident.category)}</span>
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">{selectedIncident.category} INSPECTION</h3>
                  <p className="text-[10px] text-slate-400 font-mono">{selectedIncident.id}</p>
                </div>
              </div>

              {/* Zoom Controls & Close Button */}
              <div className="flex items-center gap-2 pointer-events-auto">
                <div className="flex bg-slate-900/90 backdrop-blur-md border border-slate-800/80 rounded-2xl p-1 gap-1 shadow-lg">
                  <button
                    onClick={() => setLightboxZoom(prev => Math.max(1, prev - 0.25))}
                    disabled={lightboxZoom <= 1}
                    className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer font-bold text-lg"
                    title="Zoom Out"
                  >
                    −
                  </button>
                  <span className="text-[10px] font-mono font-bold text-slate-300 w-12 flex items-center justify-center">
                    {Math.round(lightboxZoom * 100)}%
                  </span>
                  <button
                    onClick={() => setLightboxZoom(prev => Math.min(3, prev + 0.25))}
                    disabled={lightboxZoom >= 3}
                    className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer font-bold text-lg"
                    title="Zoom In"
                  >
                    +
                  </button>
                  <button
                    onClick={() => setLightboxZoom(1)}
                    disabled={lightboxZoom === 1}
                    className="px-2.5 text-[10.5px] font-bold text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Reset Zoom"
                  >
                    RESET
                  </button>
                </div>

                <button
                  onClick={() => {
                    setShowLightbox(false);
                    setLightboxZoom(1);
                  }}
                  className="w-10 h-10 rounded-2xl bg-red-600 hover:bg-red-500 text-white flex items-center justify-center transition-all duration-200 cursor-pointer shadow-lg active:scale-95 border border-red-500/30"
                  title="Close inspection overlay (Esc)"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Main Center Media Canvas Wrapper */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.25 }}
              className="relative max-w-4xl w-full max-h-[70vh] flex items-center justify-center z-10"
            >
              {selectedIncident.customImage ? (
                <div className="relative overflow-auto max-w-full max-h-[65vh] rounded-3xl border border-slate-800 shadow-2xl bg-slate-900 flex items-center justify-center custom-scrollbar">
                  <img
                    src={selectedIncident.customImage}
                    alt={selectedIncident.title}
                    style={{ transform: `scale(${lightboxZoom})`, cursor: lightboxZoom > 1 ? 'grab' : 'zoom-in' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setLightboxZoom(prev => prev === 1 ? 2 : 1);
                    }}
                    className="max-w-full max-h-[60vh] object-contain rounded-2xl transition-transform duration-300 ease-out"
                    referrerPolicy="no-referrer"
                  />
                </div>
              ) : (
                <div 
                  onClick={(e) => e.stopPropagation()}
                  className="w-full max-w-md p-8 rounded-3xl border border-slate-800 bg-slate-900/90 text-center space-y-6 shadow-2xl relative"
                  style={{ transform: `scale(${lightboxZoom})`, transition: 'transform 0.3s ease-out' }}
                >
                  <div className="absolute top-4 left-4 flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  </div>
                  
                  <div className="w-16 h-16 rounded-2xl bg-slate-800/80 border border-slate-700/50 flex items-center justify-center mx-auto text-3xl animate-pulse">
                    📁
                  </div>

                  <div className="space-y-2">
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full uppercase tracking-wider font-bold">
                      VERIFIED EVIDENCE SOURCE
                    </span>
                    <h4 className="text-sm font-bold text-slate-100">{selectedIncident.title}</h4>
                    <p className="text-xs text-slate-400 font-mono bg-slate-950/80 px-3 py-2 rounded-xl border border-slate-800 inline-block">
                      [alertgh-assets-prod/{selectedIncident.imagePreset}.jpg]
                    </p>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
                    This hazard incident was verified via preset emergency logs. No user-uploaded media files were attached during this anonymous report.
                  </p>
                </div>
              )}
            </motion.div>

            {/* Bottom Status Information Overlay Bar */}
            <div className="absolute bottom-6 left-4 right-4 md:max-w-2xl md:mx-auto bg-slate-900/95 border border-slate-800/80 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 z-20 shadow-xl">
              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className={`text-[9.5px] font-bold uppercase px-2 py-0.5 rounded-full ${getSeverityStyle(selectedIncident.severity)}`}>
                    {selectedIncident.severity}
                  </span>
                  <span className="text-xs font-bold text-slate-200 truncate">{selectedIncident.city}, {selectedIncident.region}</span>
                </div>
                <h4 className="text-xs text-slate-400 truncate">{selectedIncident.title}</h4>
              </div>

              <div className="text-[10px] font-mono text-slate-400 flex items-center gap-1.5 shrink-0 bg-slate-950 px-2.5 py-1.5 rounded-xl border border-slate-800">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span>Click image or buttons to zoom</span>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Dramatic & Useful Emergency Operations Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-900 bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400 mt-8 py-12 relative overflow-hidden shadow-2xl transition-colors duration-300">
        {/* Ambient warning background glows and sunset flag illustration backdrop */}
        <div className="absolute inset-0 z-0 select-none pointer-events-none overflow-hidden opacity-15 dark:opacity-75 transition-opacity duration-300">
          <img 
            src={ghanaSunsetFlags} 
            alt="Ghanaian Sunset Flags Backdrop" 
            className="w-full h-full object-cover object-bottom scale-105"
            referrerPolicy="no-referrer"
          />
          {/* Advanced overlay masks to blend the 16:9 banner seamlessly into the deep footer */}
          <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-slate-950 via-white/20 dark:via-slate-950/20 to-white dark:to-slate-950" />
          <div className="absolute inset-0 bg-gradient-to-r from-white dark:from-slate-950 via-white/50 dark:via-slate-950/50 to-white dark:to-slate-950" />
        </div>

        {/* Ambient warning background glow */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-600/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 md:px-8 space-y-8 relative z-10">
          
          {/* Top Row: Heartbeat Indicator & Warning Banner */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center border-b border-slate-200 dark:border-slate-900 pb-8">
            <div className="md:col-span-5 text-left space-y-2">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
                </span>
                <span className="text-[10px] font-mono uppercase font-bold tracking-widest text-red-500">
                  CRITICAL BROADCAST TRANSMISSION MODE
                </span>
              </div>
              <h3 className="text-sm font-display font-semibold text-slate-800 dark:text-slate-100 uppercase tracking-tight">
                Simulated Emergency Operations Center
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm">
                This dashboard functions as a community-driven safety training matrix. All active hazard entries, weather outbreaks, and regional incident reports are simulated inside your local sandbox.
              </p>
            </div>
            
            <div className="md:col-span-7 bg-red-50/80 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 p-4 rounded-2xl text-left space-y-1.5">
              <span className="text-[10px] font-mono font-bold text-red-600 dark:text-red-400 flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5 animate-bounce" /> OFFICIAL WARNING DISCLOSURE
              </span>
              <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-normal">
                If you are currently experiencing a <strong className="text-slate-900 dark:text-white">real life hazard, medical crisis, or security threat</strong> anywhere in Ghana, do not wait for dispatch alerts. Access the community hotlines below or dial the toll-free emergency dispatch channels directly.
              </p>
            </div>
          </div>

          {/* Middle Row: Dynamic Stats Grid & Live System Indicators */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 py-2 text-left">
            {activeTab === 'map' && (
              <>
                <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-900/85 p-4 rounded-2xl space-y-1">
                  <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">NATIONAL ALERT GRID</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-lg font-bold font-mono text-slate-900 dark:text-white">
                      {incidents.filter(i => i.status === 'active').length}
                    </span>
                    <span className="text-[10px] text-red-600 dark:text-red-400 font-semibold uppercase">Active Outbreaks</span>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-relaxed">
                    Emergency responses currently dispatching or isolated.
                  </p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-900/85 p-4 rounded-2xl space-y-1">
                  <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">PENDING VERIFICATION</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-lg font-bold font-mono text-amber-600 dark:text-amber-400">
                      {incidents.filter(i => i.status === 'investigating').length}
                    </span>
                    <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold uppercase">Pending Status</span>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-relaxed">
                    Reporters deploying ground sensors or awaiting local consensus.
                  </p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-900/85 p-4 rounded-2xl space-y-1">
                  <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">COMMUNITY INTEGRITY MATRIX</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400">
                      {incidents.length > 0 ? (
                        (incidents.reduce((acc, i) => acc + (i.upvotes > i.downvotes ? 1 : 0), 0) / incidents.length * 100).toFixed(0)
                      ) : 0}%
                    </span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold uppercase">Consensus Score</span>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-relaxed">
                    Proportion of active reports marked genuine by citizen votes.
                  </p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-900/85 p-4 rounded-2xl space-y-1">
                  <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">SIMULATOR STATE</span>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                    ONLINE & ROUTING
                  </div>
                  <p className="text-[10px] text-slate-500 leading-relaxed mt-1">
                    Vite engine & dynamic client-side state machine running locally.
                  </p>
                </div>
              </>
            )}

            {activeTab === 'analytics' && (
              <>
                <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-900/85 p-4 rounded-2xl space-y-1">
                  <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">TOTAL REPORTS THIS MONTH</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-lg font-bold font-mono text-slate-900 dark:text-white">
                      {incidents.length + 24}
                    </span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold uppercase">Cumulative</span>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-relaxed">
                    Total citizen safety and regional alerts received.
                  </p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-900/85 p-4 rounded-2xl space-y-1">
                  <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">AVERAGE RESPONSE TIME</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-lg font-bold font-mono text-slate-900 dark:text-white">
                      18.5m
                    </span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold uppercase">Optimal</span>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-relaxed">
                    Mean dispatch notification and ground-truth validation delay.
                  </p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-900/85 p-4 rounded-2xl space-y-1">
                  <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">MOST AFFECTED REGION</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-lg font-bold font-mono text-slate-900 dark:text-white">
                      Accra
                    </span>
                    <span className="text-[10px] text-red-600 dark:text-red-400 font-semibold uppercase">High Alert</span>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-relaxed">
                    Region with the highest concentration of active outbreaks.
                  </p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-900/85 p-4 rounded-2xl space-y-1">
                  <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">WEEK-OVER-WEEK CHANGE</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-lg font-bold font-mono text-slate-900 dark:text-white">
                      -12.4%
                    </span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold uppercase">Declining</span>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-relaxed">
                    Outbreak registration rate compared to preceding week.
                  </p>
                </div>
              </>
            )}

            {activeTab === 'hotlines' && (
              <>
                <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-900/85 p-4 rounded-2xl space-y-1">
                  <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">TOTAL EMERGENCY CONTACTS</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-lg font-bold font-mono text-slate-900 dark:text-white">
                      42
                    </span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold uppercase">Verified</span>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-relaxed">
                    Total regional NADMO, police, health and utility numbers.
                  </p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-900/85 p-4 rounded-2xl space-y-1">
                  <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">SERVICES ONLINE NOW</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-lg font-bold font-mono text-slate-900 dark:text-white">
                      100%
                    </span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold uppercase">Active</span>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-relaxed">
                    Emergency helpline channels currently monitoring.
                  </p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-900/85 p-4 rounded-2xl space-y-1">
                  <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">FASTEST RESPONSE CATEGORY</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-lg font-bold font-mono text-slate-900 dark:text-white">
                      Medical
                    </span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold uppercase">Excellent</span>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-relaxed">
                    Emergency service type with shortest dispatch confirmation time.
                  </p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-900/85 p-4 rounded-2xl space-y-1">
                  <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">RECENTLY ADDED CONTACTS</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-lg font-bold font-mono text-slate-900 dark:text-white">
                      3 New
                    </span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold uppercase">This Week</span>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-relaxed">
                    Fresh community contacts integrated into the directory.
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Quick Action Emergency Contacts Grid - ONLY in directory (hotlines) tab */}
          {activeTab === 'hotlines' && (
            <div className="border-t border-slate-200 dark:border-slate-900 pt-8 text-left space-y-4">
              <h4 className="text-[10px] font-mono font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
                📞 IMMEDIATE TOLL-FREE DISPATCH HOTLINES
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <a 
                  href="tel:112"
                  className="group flex items-center justify-between p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/10 border border-red-100 dark:border-red-900/20 hover:border-red-500/50 transition cursor-pointer"
                >
                  <div>
                    <span className="text-[10px] text-red-600 dark:text-red-400 block font-bold font-mono">NATIONAL EMERGENCY</span>
                    <span className="text-xs text-slate-900 dark:text-white font-mono font-bold">112 / 999</span>
                  </div>
                    <Phone className="w-4 h-4 text-red-500 group-hover:scale-110 transition-transform" />
                </a>

                <a 
                  href="tel:191"
                  className="group flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-850 hover:border-blue-500/40 transition cursor-pointer"
                >
                  <div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-mono">GHANA POLICE SERVICE</span>
                    <span className="text-xs text-slate-900 dark:text-white font-mono font-bold">191</span>
                  </div>
                  <Phone className="w-4 h-4 text-blue-500 dark:text-blue-400 group-hover:scale-110 transition-transform" />
                </a>

                <a 
                  href="tel:192"
                  className="group flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-850 hover:border-amber-500/40 transition cursor-pointer"
                >
                  <div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-mono">NATIONAL FIRE SERVICE</span>
                    <span className="text-xs text-slate-900 dark:text-white font-mono font-bold">192</span>
                  </div>
                  <Phone className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" />
                </a>

                <a 
                  href="tel:193"
                  className="group flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-850 hover:border-emerald-500/40 transition cursor-pointer"
                >
                  <div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-mono">AMBULANCE / SERVICE</span>
                    <span className="text-xs text-slate-900 dark:text-white font-mono font-bold">193</span>
                  </div>
                  <Phone className="w-4 h-4 text-emerald-500 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
                </a>
              </div>
            </div>
          )}

          {/* Bottom Copyright & Built for Ghana Signoff */}
          <div className="border-t border-slate-200 dark:border-slate-900/60 pt-6 flex flex-col md:flex-row items-center justify-between gap-6 text-[10px] text-slate-500">
            <div className="flex items-center gap-3.5">
              <GhanaCoatOfArms />
              <div>
                <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-300">
                  <span>Republic of Ghana Emergency Grid</span> 🇬🇭
                </div>
                <div className="mt-0.5 text-slate-500 dark:text-slate-400">Official Citizen Safety Initiative & Response Network</div>
              </div>
            </div>
            <div className="flex flex-col sm:items-end gap-1 font-mono text-[9.5px] text-center sm:text-right">
              <div>© 2026 AlertGH Network. All systems operational.</div>
              <div className="text-slate-500 dark:text-zinc-600">Freedom and Justice • Public Information Channel</div>
            </div>
          </div>

          {/* Freda Creations Credit Line with Ghana Flag Avatar */}
          <div className="border-t border-slate-100 dark:border-zinc-900/40 mt-6 pt-6 flex items-center justify-center gap-2.5 text-[12px] text-slate-500 dark:text-zinc-400">
            <img
              src={ghanaAvatarFreda}
              alt="Freda Creations Ghana Avatar"
              referrerPolicy="no-referrer"
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-slate-200/50 dark:border-zinc-800/50 shadow-sm"
            />
            <span className="font-medium">
              Made with <span className="text-red-500 dark:text-red-400 select-none">❤️</span> by <span className="font-semibold text-slate-700 dark:text-zinc-300">Freda Creations</span>
            </span>
          </div>

        </div>
      </footer>

      {/* Sticky Bottom Tab Bar - Responsive Dual Mode */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/85 dark:bg-zinc-950/85 backdrop-blur-md border-t border-slate-200/80 dark:border-zinc-800/80 h-16 z-40 flex items-center justify-around px-4 pb-[env(safe-area-inset-bottom,4px)] transition-colors duration-300">
        {[
          { id: 'map', label: 'Map', icon: Map },
          { id: 'analytics', label: 'Analytics', icon: BarChart3 },
          { id: 'hotlines', label: 'Directory', icon: Phone }
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          const IconComponent = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as 'map' | 'analytics' | 'hotlines');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex flex-col items-center justify-center flex-1 h-full py-1 cursor-pointer select-none active:scale-95 transition-all"
              style={{ minHeight: '44px', minWidth: '44px' }}
            >
              <IconComponent className={`w-6 h-6 mb-0.5 transition-transform ${isActive ? 'text-emerald-500 dark:text-emerald-400 scale-105' : 'text-slate-400 dark:text-zinc-500'}`} />
              <span className={`text-[10px] tracking-tight ${isActive ? 'text-emerald-500 dark:text-emerald-400 font-semibold' : 'text-slate-400 dark:text-zinc-500'}`}>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* First-Time User Onboarding Experience Walkthrough */}
      <Onboarding
        isOpen={showOnboarding}
        onClose={handleCloseOnboarding}
        step={onboardingStep}
        setStep={setOnboardingStep}
        theme={theme}
      />

      {/* Responder Mode Onboarding Walkthrough */}
      <ResponderOnboarding
        isOpen={showResponderOnboarding}
        onClose={handleCloseResponderOnboarding}
        step={responderOnboardingStep}
        setStep={setResponderOnboardingStep}
        isGuestResponder={isGuestResponder}
      />
    </div>
  );
}

