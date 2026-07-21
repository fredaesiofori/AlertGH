import React, { useState, useMemo } from 'react';
import { GHANA_REGIONS, GhanaRegion } from '../data/ghanaData';
import { Incident, IncidentCategory, SeverityLevel } from '../types';
import { MapPin, Filter, Eye, AlertTriangle, Flame, ShieldAlert, Zap, Compass, RefreshCw, Clock, Maximize2, Minimize2, Plus, Minus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatTimeAgo } from '../utils';

interface GhanaMapProps {
  incidents: Incident[];
  selectedIncident: Incident | null;
  onSelectIncident: (incident: Incident | null) => void;
  onSelectRegion: (regionName: string | null) => void;
  selectedRegion: string | null;
  onReportIncidentClick?: (coordinates?: { x: number; y: number }) => void;
  isResponderMode?: boolean;
}

// Map polygon data aligned as a beautiful vector puzzle of Ghana's 16 regions
const SVG_REGIONS = [
  { id: 'upper-west', points: '100,80 220,80 220,180 130,180 100,150' },
  { id: 'upper-east', points: '220,80 340,80 340,150 220,150' },
  { id: 'north-east', points: '340,90 440,90 440,180 340,180' },
  { id: 'savannah', points: '80,180 250,180 250,300 150,340 80,300' },
  { id: 'northern', points: '250,150 440,180 440,300 340,300 250,300' },
  { id: 'bono', points: '80,300 220,300 220,400 80,400' },
  { id: 'bono-east', points: '220,300 340,300 340,400 220,400' },
  { id: 'oti', points: '340,300 420,300 420,470 340,420' },
  { id: 'ahafo', points: '80,400 200,400 200,460 80,460' },
  { id: 'ashanti', points: '200,400 320,400 320,510 200,510' },
  { id: 'eastern', points: '320,400 380,420 380,550 280,550 280,510' },
  { id: 'volta', points: '380,420 440,430 430,600 380,550' },
  { id: 'western-north', points: '80,460 200,460 200,550 120,550 80,520' },
  { id: 'western', points: '80,520 160,550 160,650 80,630' },
  { id: 'central', points: '160,550 280,550 270,640 160,650' },
  { id: 'greater-accra', points: '280,550 380,550 360,610 270,640' }
];

const CATEGORIES: { value: IncidentCategory | 'all'; label: string; emoji: string; colorClass: string; activeColor: string }[] = [
  { value: 'all', label: 'All Hazards', emoji: '🌍', colorClass: 'border-slate-200 dark:border-zinc-850 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300', activeColor: 'bg-emerald-600 border-emerald-600 dark:bg-emerald-500 dark:border-emerald-500 text-white font-semibold' },
  { value: 'flooding', label: 'Flooding', emoji: '🌧️', colorClass: 'border-blue-200/60 dark:border-blue-900/30 hover:bg-blue-50 dark:hover:bg-blue-950/20 text-blue-700 dark:text-blue-450', activeColor: 'bg-blue-600 border-blue-600 text-white font-semibold' },
  { value: 'fire', label: 'Fire Outbreaks', emoji: '🔥', colorClass: 'border-red-200/60 dark:border-red-900/30 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-700 dark:text-red-400', activeColor: 'bg-red-600 border-red-600 text-white font-semibold' },
  { value: 'accident', label: 'Accidents', emoji: '🚗', colorClass: 'border-amber-200/60 dark:border-amber-900/30 hover:bg-amber-50 dark:hover:bg-amber-950/20 text-amber-700 dark:text-amber-400', activeColor: 'bg-amber-600 border-amber-600 text-white font-semibold' },
  { value: 'road-closure', label: 'Road Closures', emoji: '🚧', colorClass: 'border-slate-200/60 dark:border-zinc-850 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300', activeColor: 'bg-slate-700 border-slate-700 text-white font-semibold' },
  { value: 'power-outage', label: 'Power Outages', emoji: '⚡', colorClass: 'border-yellow-200/60 dark:border-yellow-900/30 hover:bg-yellow-50 dark:hover:bg-yellow-950/20 text-yellow-800 dark:text-yellow-450', activeColor: 'bg-yellow-500 border-yellow-500 text-slate-950 font-semibold' },
  { value: 'medical', label: 'Medical', emoji: '🚨', colorClass: 'border-emerald-200/60 dark:border-emerald-900/30 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 text-emerald-700 dark:text-emerald-450', activeColor: 'bg-emerald-600 border-emerald-600 text-white font-semibold' },
];

const SEVERITIES: { value: SeverityLevel | 'all'; label: string; colorClass: string; activeColor: string }[] = [
  { value: 'all', label: 'All Severities', colorClass: 'border-slate-200 dark:border-zinc-850 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300', activeColor: 'bg-emerald-600 border-emerald-600 dark:bg-emerald-500 dark:border-emerald-500 text-white font-semibold' },
  { value: 'critical', label: '🔴 Critical', colorClass: 'border-red-200/60 dark:border-red-900/30 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-600 dark:text-red-400', activeColor: 'bg-red-600 border-red-600 text-white font-semibold' },
  { value: 'high', label: '🔥 High', colorClass: 'border-amber-200/60 dark:border-amber-900/30 hover:bg-amber-50 dark:hover:bg-amber-950/20 text-amber-650 dark:text-amber-400', activeColor: 'bg-amber-500 border-amber-500 text-white font-semibold' },
  { value: 'medium', label: '⚡ Medium', colorClass: 'border-yellow-200/60 dark:border-yellow-900/30 hover:bg-yellow-50 dark:hover:bg-yellow-950/20 text-yellow-600 dark:text-yellow-400', activeColor: 'bg-yellow-400 border-yellow-400 text-slate-950 font-semibold' },
  { value: 'low', label: '💡 Low', colorClass: 'border-blue-200/60 dark:border-blue-900/30 hover:bg-blue-50 dark:hover:bg-blue-950/20 text-blue-600 dark:text-blue-450', activeColor: 'bg-blue-500 border-blue-500 text-white font-semibold' },
];

export default function GhanaMap({
  incidents,
  selectedIncident,
  onSelectIncident,
  onSelectRegion,
  selectedRegion,
  onReportIncidentClick,
  isResponderMode = false
}: GhanaMapProps) {
  const [hoveredRegion, setHoveredRegion] = useState<GhanaRegion | null>(null);
  const [hoveredIncident, setHoveredIncident] = useState<Incident | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<IncidentCategory | 'all'>('all');
  const [severityFilter, setSeverityFilter] = useState<SeverityLevel | 'all'>('all');
  const [showCoordinatesOnMap, setShowCoordinatesOnMap] = useState(false);
  const [tempPin, setTempPin] = useState<{ x: number; y: number } | null>(null);
  const [isMapFullscreen, setIsMapFullscreen] = useState(false);
  const [isRegionsExpandedOnMobile, setIsRegionsExpandedOnMobile] = useState(false);

  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const viewBoxWidth = 500 / zoom;
  const viewBoxHeight = 700 / zoom;

  const maxPanX = Math.max(0, 500 - viewBoxWidth);
  const maxPanY = Math.max(0, 700 - viewBoxHeight);

  const clampedPanX = Math.max(0, Math.min(pan.x, maxPanX));
  const clampedPanY = Math.max(0, Math.min(pan.y, maxPanY));

  const getScreenX = (coordX: number) => {
    return (((coordX / 100) * 500 - clampedPanX) / viewBoxWidth) * 100;
  };

  const getScreenY = (coordY: number) => {
    return (((coordY / 100) * 700 - clampedPanY) / viewBoxHeight) * 100;
  };

  const isCoordInViewport = (coordX: number, coordY: number) => {
    const sx = getScreenX(coordX);
    const sy = getScreenY(coordY);
    return sx >= 0 && sx <= 100 && sy >= 0 && sy <= 100;
  };

  const handleZoomIn = () => {
    setZoom(prev => {
      const next = Math.min(4, prev + 0.5);
      const newW = 500 / next;
      const newH = 700 / next;
      setPan({
        x: 250 - newW / 2,
        y: 350 - newH / 2
      });
      return next;
    });
  };

  const handleZoomOut = () => {
    setZoom(prev => {
      const next = Math.max(1, prev - 0.5);
      if (next === 1) {
        setPan({ x: 0, y: 0 });
      } else {
        const newW = 500 / next;
        const newH = 700 / next;
        setPan({
          x: 250 - newW / 2,
          y: 350 - newH / 2
        });
      }
      return next;
    });
  };

  const handleResetZoom = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || zoom === 1) return;
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    
    const svgContainer = document.getElementById('ghana-svg-map-canvas');
    if (svgContainer) {
      const rect = svgContainer.getBoundingClientRect();
      const scaleX = 500 / rect.width;
      const scaleY = 700 / rect.height;
      
      setPan(prev => ({
        x: prev.x - dx * scaleX,
        y: prev.y - dy * scaleY
      }));
    }
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (zoom > 1 && e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || zoom === 1 || e.touches.length !== 1) return;
    const dx = e.touches[0].clientX - dragStart.x;
    const dy = e.touches[0].clientY - dragStart.y;
    
    const svgContainer = document.getElementById('ghana-svg-map-canvas');
    if (svgContainer) {
      const rect = svgContainer.getBoundingClientRect();
      const scaleX = 500 / rect.width;
      const scaleY = 700 / rect.height;
      
      setPan(prev => ({
        x: prev.x - dx * scaleX,
        y: prev.y - dy * scaleY
      }));
    }
    setDragStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
  };

  React.useEffect(() => {
    if (isMapFullscreen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMapFullscreen]);

  // Filter incidents to show on map
  const filteredIncidents = useMemo(() => {
    return incidents.filter(inc => {
      const matchesCategory = categoryFilter === 'all' || inc.category === categoryFilter;
      const matchesSeverity = severityFilter === 'all' || inc.severity === severityFilter;
      const matchesRegion = !selectedRegion || inc.region.toLowerCase() === selectedRegion.toLowerCase();
      return matchesCategory && matchesSeverity && matchesRegion;
    });
  }, [incidents, categoryFilter, severityFilter, selectedRegion]);

  // Aggregate active incident counts per region
  const regionIncidentCounts = useMemo(() => {
    const counts: { [regionName: string]: number } = {};
    incidents.forEach(inc => {
      if (inc.status !== 'resolved') {
        counts[inc.region] = (counts[inc.region] || 0) + 1;
      }
    });
    return counts;
  }, [incidents]);

  const [showAllRegions, setShowAllRegions] = useState(false);

  // Sort regions: active incidents count > 0 first (descending by count), then alphabetical fallback
  const sortedRegions = useMemo(() => {
    return [...GHANA_REGIONS].sort((a, b) => {
      const countA = regionIncidentCounts[a.name] || 0;
      const countB = regionIncidentCounts[b.name] || 0;
      if (countA !== countB) {
        return countB - countA;
      }
      return a.name.localeCompare(b.name);
    });
  }, [regionIncidentCounts]);

  // Display active incident regions first; show at least 5 initially, show more on request
  const visibleRegions = useMemo(() => {
    if (showAllRegions) {
      return sortedRegions;
    }
    const active = sortedRegions.filter(r => (regionIncidentCounts[r.name] || 0) > 0);
    if (active.length < 5) {
      const defaultSet = sortedRegions.slice(0, 5);
      const combined = Array.from(new Set([...active, ...defaultSet]));
      return combined.slice(0, 5);
    }
    return active;
  }, [sortedRegions, regionIncidentCounts, showAllRegions]);

  // Counts of total incidents matching the currently active severity filter and region
  const categoryFilteredCounts = useMemo(() => {
    const counts: { [cat: string]: number } = {};
    incidents.forEach(inc => {
      const matchesSeverity = severityFilter === 'all' || inc.severity === severityFilter;
      const matchesRegion = !selectedRegion || inc.region.toLowerCase() === selectedRegion.toLowerCase();
      if (matchesSeverity && matchesRegion) {
        counts[inc.category] = (counts[inc.category] || 0) + 1;
      }
    });
    return counts;
  }, [incidents, severityFilter, selectedRegion]);

  // Counts of total incidents matching the currently active category filter and region
  const severityFilteredCounts = useMemo(() => {
    const counts: { [sev: string]: number } = {};
    incidents.forEach(inc => {
      const matchesCategory = categoryFilter === 'all' || inc.category === categoryFilter;
      const matchesRegion = !selectedRegion || inc.region.toLowerCase() === selectedRegion.toLowerCase();
      if (matchesCategory && matchesRegion) {
        counts[inc.severity] = (counts[inc.severity] || 0) + 1;
      }
    });
    return counts;
  }, [incidents, categoryFilter, selectedRegion]);

  const getCategoryColor = (category: IncidentCategory) => {
    switch (category) {
      case 'flooding': return 'bg-blue-500 border-blue-400 text-blue-100';
      case 'fire': return 'bg-red-500 border-red-400 text-red-100';
      case 'accident': return 'bg-amber-600 border-amber-400 text-amber-100';
      case 'road-closure': return 'bg-slate-600 border-slate-400 text-slate-100';
      case 'power-outage': return 'bg-yellow-500 border-yellow-300 text-yellow-900';
      case 'medical': return 'bg-emerald-500 border-emerald-400 text-emerald-100';
      default: return 'bg-purple-500 border-purple-400 text-purple-100';
    }
  };

  const getSeverityIcon = (severity: SeverityLevel) => {
    switch (severity) {
      case 'critical': return <ShieldAlert className="w-4 h-4 animate-bounce" />;
      case 'high': return <AlertTriangle className="w-4 h-4" />;
      case 'medium': return <Zap className="w-4 h-4" />;
      default: return <MapPin className="w-4 h-4" />;
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

  const handleMapClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (isDragging || isResponderMode) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickXPercent = (e.clientX - rect.left) / rect.width;
    const clickYPercent = (e.clientY - rect.top) / rect.height;

    const svgX = clampedPanX + clickXPercent * viewBoxWidth;
    const svgY = clampedPanY + clickYPercent * viewBoxHeight;

    const x = Math.round((svgX / 500) * 100);
    const y = Math.round((svgY / 700) * 100);
    
    setTempPin({ x, y });
    setTimeout(() => {
      if (onReportIncidentClick) {
        onReportIncidentClick({ x, y });
      }
      setTempPin(null);
    }, 800);
  };

  return (
    <div 
      className={`transition-all duration-300 ${
        isMapFullscreen 
          ? 'fixed inset-0 z-40 bg-slate-50 dark:bg-zinc-950 p-4 md:p-8 flex flex-col h-screen w-screen overflow-y-auto' 
          : 'glass-panel dark:bg-zinc-900/40 dark:border-zinc-800/80 shadow-sm rounded-3xl p-6 relative overflow-hidden'
      }`} 
      id="ghana-interactive-map-panel"
    >
      {/* Soft Glow Effects */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-slate-200/60 dark:border-zinc-800/60 pb-5">
        <div>
          <h2 className="text-xl font-display font-semibold text-slate-900 dark:text-zinc-50 flex items-center gap-2">
            <Compass className={`w-5 h-5 ${isResponderMode ? 'text-blue-500 dark:text-blue-400' : 'text-emerald-500 dark:text-emerald-400'}`} />
            Ghana Real-Time Incident Map {isMapFullscreen && <span className={`text-xs ${isResponderMode ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400' : 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'} px-2.5 py-1 rounded-full font-mono uppercase font-bold tracking-wider`}>Full-Screen Mode</span>}
          </h2>
          <p className="text-sm text-slate-500 dark:text-zinc-400">
            {isResponderMode ? 'Select a region or click an incident pin on the map to investigate and update details.' : 'Click on the map to pinpoint a report or select a region to filter.'}
          </p>
        </div>

        {/* Real-time Status Counter and Reset Action */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 dark:bg-zinc-850 rounded-full text-[11px] font-mono text-slate-500 dark:text-zinc-400 border border-slate-200/50 dark:border-zinc-800/80">
            <span className={`w-2 h-2 rounded-full ${isResponderMode ? 'bg-blue-500' : 'bg-emerald-500'} animate-pulse`} />
            <span>{filteredIncidents.length} of {incidents.length} Events Displayed</span>
          </div>
          {(categoryFilter !== 'all' || severityFilter !== 'all' || selectedRegion) && (
            <button
              onClick={() => {
                setCategoryFilter('all');
                setSeverityFilter('all');
                onSelectRegion(null);
              }}
              className="text-[11px] font-semibold text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-350 bg-red-50 hover:bg-red-100 dark:bg-red-950/10 dark:hover:bg-red-950/25 px-3 py-1.5 rounded-full border border-red-100 dark:border-red-900/30 transition duration-150 cursor-pointer flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              Clear Filters
            </button>
          )}

          {/* Fullscreen Toggle Buttons */}
          {isMapFullscreen ? (
            <button
              type="button"
              onClick={() => setIsMapFullscreen(false)}
              className="text-[11px] font-semibold text-slate-700 hover:text-slate-900 dark:text-zinc-350 dark:hover:text-zinc-100 bg-white hover:bg-slate-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 px-3.5 py-1.5 rounded-full border border-slate-200 dark:border-zinc-700 hover:border-slate-350 dark:hover:border-zinc-650 transition duration-150 cursor-pointer flex items-center gap-1.5 shadow-sm"
              title="Exit Full-screen"
            >
              <Minimize2 className="w-3.5 h-3.5" />
              Exit Fullscreen
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsMapFullscreen(true)}
              className={`text-[11px] font-semibold ${
                isResponderMode
                  ? 'text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/20 border-blue-100 dark:border-blue-900/30 hover:border-blue-250 dark:hover:border-blue-800/60'
                  : 'text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/20 px-3.5 py-1.5 rounded-full border border-emerald-100 dark:border-emerald-900/30 hover:border-emerald-250 dark:hover:border-emerald-800/60'
              } transition duration-150 cursor-pointer flex items-center gap-1.5 shadow-sm`}
              title="Expand to Full-screen"
            >
              <Maximize2 className={`w-3.5 h-3.5 ${isResponderMode ? 'text-blue-500 dark:text-blue-400' : 'text-emerald-500 dark:text-emerald-400'}`} />
              Full-screen Map
            </button>
          )}
        </div>
      </div>

      {/* Visual Dynamic Filtering Dashboard */}
      <div className="w-full bg-white/40 dark:bg-zinc-900/30 backdrop-blur-sm border border-slate-200/60 dark:border-zinc-800/60 rounded-2xl p-4 mb-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.02)] transition duration-200">
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-1.5">
            <Filter className={`w-4 h-4 ${isResponderMode ? 'text-blue-500 dark:text-blue-400' : 'text-emerald-500 dark:text-emerald-400'}`} />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300">
              Interactive Filter Console
            </h3>
          </div>
          {selectedRegion && (
            <div className={`text-[10px] ${isResponderMode ? 'bg-blue-50/80 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400 border border-blue-100/60 dark:border-blue-900/30' : 'bg-emerald-50/80 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-100/60 dark:border-emerald-900/30'} px-2 py-0.5 rounded-md font-semibold`}>
              Region Filter Active: {selectedRegion}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Hazards Grid (8 columns) */}
          <div className="lg:col-span-8 space-y-1.5">
            <span className="text-[10px] font-mono font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wide block">
              Toggle Incident Category
            </span>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map((cat) => {
                const isActive = categoryFilter === cat.value;
                const count = cat.value === 'all'
                  ? incidents.filter(i => (severityFilter === 'all' || i.severity === severityFilter) && (!selectedRegion || i.region.toLowerCase() === selectedRegion.toLowerCase())).length
                  : (categoryFilteredCounts[cat.value] || 0);

                return (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setCategoryFilter(isActive ? 'all' : cat.value)}
                    className={`text-[11px] px-2.5 py-1.5 rounded-xl border flex items-center gap-1.5 transition-all duration-200 cursor-pointer ${
                      isActive
                        ? cat.activeColor + ' shadow-sm scale-[1.02]'
                        : cat.colorClass + ' bg-white/60 dark:bg-zinc-900/20'
                    }`}
                  >
                    <span className="text-sm select-none">{cat.emoji}</span>
                    <span className="font-semibold">{cat.label}</span>
                    <span className={`text-[9.5px] font-bold font-mono px-1.5 py-0.5 rounded-md ${
                      isActive 
                        ? 'bg-black/20 text-white' 
                        : 'bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Severity Levels (4 columns) */}
          <div className="lg:col-span-4 space-y-1.5">
            <span className="text-[10px] font-mono font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wide block">
              Toggle Threat Severity
            </span>
            <div className="flex flex-wrap gap-1.5">
              {SEVERITIES.map((sev) => {
                const isActive = severityFilter === sev.value;
                const count = sev.value === 'all'
                  ? incidents.filter(i => (categoryFilter === 'all' || i.category === categoryFilter) && (!selectedRegion || i.region.toLowerCase() === selectedRegion.toLowerCase())).length
                  : (severityFilteredCounts[sev.value] || 0);

                return (
                  <button
                    key={sev.value}
                    type="button"
                    onClick={() => setSeverityFilter(isActive ? 'all' : sev.value)}
                    className={`text-[11px] px-2.5 py-1.5 rounded-xl border flex items-center gap-1.5 transition-all duration-200 cursor-pointer ${
                      isActive
                        ? sev.activeColor + ' shadow-sm scale-[1.02]'
                        : sev.colorClass + ' bg-white/60 dark:bg-zinc-900/20'
                    }`}
                  >
                    <span className="font-semibold">{sev.label}</span>
                    <span className={`text-[9.5px] font-bold font-mono px-1.5 py-0.5 rounded-md ${
                      isActive 
                        ? 'bg-black/20 text-white' 
                        : 'bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className={`grid grid-cols-1 ${isMapFullscreen ? 'grid-cols-1 flex-1' : 'lg:grid-cols-12'} gap-6 items-start w-full`}>
        {/* Region Side Picker */}
        {!isMapFullscreen && (
          <div className="lg:col-span-4 space-y-4 w-full">
            {/* Mobile Accordion Toggle */}
            <button
              type="button"
              onClick={() => setIsRegionsExpandedOnMobile(!isRegionsExpandedOnMobile)}
              className="lg:hidden w-full flex items-center justify-between p-3.5 bg-slate-100 dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 text-xs font-bold text-slate-700 dark:text-zinc-200 transition shadow-sm cursor-pointer"
            >
              <span className="flex items-center gap-2">
                📍 {selectedRegion ? `Active: ${selectedRegion}` : 'Filter by Region / Sector'}
              </span>
              <span className="text-slate-500 dark:text-zinc-400 font-mono text-[10px]">
                {isRegionsExpandedOnMobile ? 'Collapse ▴' : 'Expand (16 Sectors) ▾'}
              </span>
            </button>

            {/* Region container collapsible list */}
            <div className={`space-y-4 max-h-[480px] lg:max-h-[580px] overflow-y-auto pr-2 custom-scrollbar ${isRegionsExpandedOnMobile ? 'block' : 'hidden lg:block'}`}>
              <div className="bg-slate-100/50 dark:bg-zinc-950/40 p-3.5 rounded-2xl border border-slate-200/50 dark:border-zinc-800/40">
                <span className="text-[10px] text-slate-400 dark:text-zinc-500 uppercase font-mono tracking-wider block mb-2 font-bold">Ghana Sectors</span>
                <div className="grid grid-cols-2 gap-1.5 text-xs">
                  <button
                    onClick={() => onSelectRegion(null)}
                    className={`py-1.5 px-2.5 rounded-lg text-left transition text-[11px] cursor-pointer ${!selectedRegion ? 'bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/20 dark:border-emerald-500/40 text-emerald-700 dark:text-emerald-400 font-semibold shadow-sm' : 'hover:bg-white dark:hover:bg-zinc-800 text-slate-500 dark:text-zinc-400'}`}
                  >
                    🌍 Whole Country
                  </button>
                  <button
                    onClick={() => onSelectRegion('Greater Accra')}
                    className={`py-1.5 px-2.5 rounded-lg text-left transition text-[11px] cursor-pointer ${selectedRegion === 'Greater Accra' ? 'bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/20 dark:border-emerald-500/40 text-emerald-700 dark:text-emerald-400 font-semibold shadow-sm' : 'hover:bg-white dark:hover:bg-zinc-800 text-slate-500 dark:text-zinc-400'}`}
                  >
                    🏢 Greater Accra
                  </button>
                  <button
                    onClick={() => onSelectRegion('Ashanti')}
                    className={`py-1.5 px-2.5 rounded-lg text-left transition text-[11px] cursor-pointer ${selectedRegion === 'Ashanti' ? 'bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/20 dark:border-emerald-500/40 text-emerald-700 dark:text-emerald-400 font-semibold shadow-sm' : 'hover:bg-white dark:hover:bg-zinc-800 text-slate-500 dark:text-zinc-400'}`}
                  >
                    🌲 Ashanti Belt
                  </button>
                  <button
                    onClick={() => onSelectRegion('Northern')}
                    className={`py-1.5 px-2.5 rounded-lg text-left transition text-[11px] cursor-pointer ${selectedRegion === 'Northern' ? 'bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/20 dark:border-emerald-500/40 text-emerald-700 dark:text-emerald-400 font-semibold shadow-sm' : 'hover:bg-white dark:hover:bg-zinc-800 text-slate-500 dark:text-zinc-400'}`}
                  >
                    🦁 Northern Sector
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] text-slate-400 dark:text-zinc-500 uppercase font-mono tracking-wider block px-1 font-bold">Active Counts by Region</span>
                {visibleRegions.map((region) => {
                  const count = regionIncidentCounts[region.name] || 0;
                  const isSelected = selectedRegion === region.name;
                  return (
                    <button
                      key={region.id}
                      onClick={() => onSelectRegion(isSelected ? null : region.name)}
                      className={`w-full flex items-center justify-between p-3 rounded-2xl border transition text-left group cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-500/10 dark:bg-emerald-500/20 border-emerald-500/30 dark:border-emerald-500/40 text-emerald-700 dark:text-emerald-400 shadow-sm'
                          : 'bg-white/80 dark:bg-zinc-900/60 border-slate-200/60 dark:border-zinc-800/80 text-slate-700 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-900 hover:border-slate-300 dark:hover:border-zinc-700 shadow-[0_1px_2px_rgba(0,0,0,0.01)]'
                      }`}
                    >
                      <div>
                        <div className="text-xs font-semibold flex items-center gap-1.5">
                          <span className={`w-1.5 h-1.5 rounded-full transition-colors ${isSelected ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-zinc-700 group-hover:bg-emerald-400 dark:group-hover:bg-emerald-400'}`} />
                          {region.name}
                        </div>
                        <div className="text-[10px] text-slate-400 dark:text-zinc-500 font-mono mt-0.5">Capital: {region.capital}</div>
                      </div>
                      
                      {count > 0 ? (
                        <span className="text-[10px] font-mono font-bold bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                          {count} {count === 1 ? 'alert' : 'alerts'}
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono text-slate-400 dark:text-zinc-500">0 alerts</span>
                      )}
                    </button>
                  );
                })}

                {sortedRegions.length > visibleRegions.length && !showAllRegions && (
                  <button
                    type="button"
                    onClick={() => setShowAllRegions(true)}
                    className="w-full py-2.5 px-4 mt-2 bg-slate-50 hover:bg-slate-100 dark:bg-zinc-900/40 dark:hover:bg-zinc-900/80 text-emerald-600 dark:text-emerald-450 text-[11px] font-bold rounded-2xl border border-slate-200/50 dark:border-zinc-800/50 transition cursor-pointer flex items-center justify-center gap-1 shadow-[0_1px_2px_rgba(0,0,0,0.01)]"
                  >
                    Show More ({sortedRegions.length - visibleRegions.length} Regions) ▾
                  </button>
                )}
                {showAllRegions && (
                  <button
                    type="button"
                    onClick={() => setShowAllRegions(false)}
                    className="w-full py-2.5 px-4 mt-2 bg-slate-50 hover:bg-slate-100 dark:bg-zinc-900/40 dark:hover:bg-zinc-900/80 text-slate-500 dark:text-zinc-400 text-[11px] font-bold rounded-2xl border border-slate-200/50 dark:border-zinc-800/50 transition cursor-pointer flex items-center justify-center gap-1 shadow-[0_1px_2px_rgba(0,0,0,0.01)]"
                  >
                    Show Less ▴
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* SVG Vector Interactive Map */}
        <div className={`${isMapFullscreen ? 'col-span-12 w-full flex-1 min-h-[60vh] lg:min-h-[80vh]' : 'lg:col-span-8 w-full'} flex flex-col items-center justify-center relative bg-slate-50/80 dark:bg-zinc-950/40 rounded-3xl border border-slate-200/60 dark:border-zinc-800/60 p-2.5 sm:p-4 min-h-[380px] sm:min-h-[480px] shadow-[inset_0_1px_3px_rgba(0,0,0,0.02)] select-none transition-colors duration-300`}>

          {/* Floating Exit Button for Fullscreen */}
          {isMapFullscreen && (
            <button
              type="button"
              onClick={() => setIsMapFullscreen(false)}
              className="absolute top-4 left-4 bg-slate-900/95 dark:bg-zinc-800/95 hover:bg-red-600 dark:hover:bg-red-600 text-white font-semibold text-xs py-2 px-3.5 rounded-xl border border-slate-700 dark:border-zinc-700 hover:border-red-500 dark:hover:border-red-500 flex items-center gap-1.5 cursor-pointer shadow-lg z-30 transition-all duration-200"
            >
              <Minimize2 className="w-3.5 h-3.5" />
              Exit Full-Screen Map
            </button>
          )}

          {/* Compass Rose Asset */}
          <div className="absolute top-4 right-4 bg-white/90 dark:bg-zinc-900/90 border border-slate-200/80 dark:border-zinc-800/80 p-2.5 rounded-xl text-slate-500 dark:text-zinc-400 text-[10px] font-mono flex flex-col items-center shadow-sm">
            <span className="text-emerald-500 dark:text-emerald-400 font-bold mb-1">N</span>
            <div className="w-6 h-6 border border-dashed border-slate-300 dark:border-zinc-700 rounded-full flex items-center justify-center relative">
              <div className="absolute w-3 h-px bg-emerald-500 dark:bg-emerald-400 transform rotate-90" />
              <div className="absolute w-1.5 h-1.5 bg-white dark:bg-zinc-900 rounded-full border border-emerald-500 dark:border-emerald-400" />
            </div>
            <span className="mt-1 font-semibold text-[9px] tracking-wider text-slate-400 dark:text-zinc-500">ALERT-GH</span>
          </div>

          {/* Guide Overlay */}
          <div className="absolute bottom-4 left-4 flex flex-col gap-1.5 text-[10px] font-mono text-slate-500 dark:text-zinc-400 pointer-events-none bg-white/90 dark:bg-zinc-900/90 p-3 rounded-2xl border border-slate-200/60 dark:border-zinc-800/80 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500" /> <span className="font-sans font-medium text-slate-600 dark:text-zinc-300">Flooding</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500" /> <span className="font-sans font-medium text-slate-600 dark:text-zinc-300">Fire</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-600" /> <span className="font-sans font-medium text-slate-600 dark:text-zinc-300">Accident</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-yellow-400" /> <span className="font-sans font-medium text-slate-600 dark:text-zinc-300">Power</span>
            </div>
          </div>

          {/* Actual SVG Map Container */}
          <div className="relative w-full max-w-[420px] aspect-[5/7]">
            <svg
              viewBox={`${clampedPanX} ${clampedPanY} ${viewBoxWidth} ${viewBoxHeight}`}
              className={`w-full h-full select-none ${zoom > 1 ? 'cursor-grab active:cursor-grabbing' : 'cursor-crosshair'}`}
              onClick={handleMapClick}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUpOrLeave}
              onMouseLeave={handleMouseUpOrLeave}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleMouseUpOrLeave}
              id="ghana-svg-map-canvas"
            >
              {/* Ambient Background Grid */}
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" className="stroke-slate-900/[0.08] dark:stroke-zinc-100/[0.06]" strokeWidth="1" />
              </pattern>
              <rect width="100%" height="100%" fill="url(#grid)" />

              {/* Gulf of Guinea Label */}
              <text x="250" y="680" className="fill-slate-600/40 dark:fill-zinc-400/30" fontSize="11" fontFamily="monospace" textAnchor="middle" letterSpacing="4">
                ATLANTIC OCEAN (GULF OF GUINEA)
              </text>

              {/* Neighbor countries labels */}
              <text x="35" y="240" className="fill-slate-600/20 dark:fill-zinc-400/15" fontSize="10" fontFamily="monospace" textAnchor="middle" transform="rotate(-90 35 240)" letterSpacing="3">
                CÔTE D'IVOIRE
              </text>
              <text x="250" y="35" className="fill-slate-600/20 dark:fill-zinc-400/15" fontSize="10" fontFamily="monospace" textAnchor="middle" letterSpacing="3">
                BURKINA FASO
              </text>
              <text x="465" y="240" className="fill-slate-600/20 dark:fill-zinc-400/15" fontSize="10" fontFamily="monospace" textAnchor="middle" transform="rotate(90 465 240)" letterSpacing="3">
                TOGO
              </text>

              {/* Render 16 Ghana Regions */}
              <g id="ghana-regions-group">
                {SVG_REGIONS.map((svgRegion) => {
                  const regionMeta = GHANA_REGIONS.find(r => r.id === svgRegion.id);
                  if (!regionMeta) return null;

                  const activeCount = regionIncidentCounts[regionMeta.name] || 0;
                  const isSelected = selectedRegion === regionMeta.name;
                  const isHovered = hoveredRegion?.id === svgRegion.id;

                  // Color coding region based on incident volume
                  let fill = undefined;
                  let stroke = undefined;
                  let defaultClasses = "";

                  if (isSelected) {
                    fill = 'rgba(16, 185, 129, 0.12)'; // Emerald tint
                    stroke = 'rgba(16, 185, 129, 0.8)'; // Strong Emerald
                  } else if (isHovered) {
                    fill = 'rgba(16, 185, 129, 0.06)';
                    stroke = 'rgba(16, 185, 129, 0.4)';
                  } else if (activeCount > 0) {
                    // If has active critical incident, tint red, else orange/amber
                    const hasCritical = incidents.some(i => i.region === regionMeta.name && i.severity === 'critical' && i.status !== 'resolved');
                    if (hasCritical) {
                      fill = 'rgba(239, 68, 68, 0.06)';
                      stroke = 'rgba(239, 68, 68, 0.4)';
                    } else {
                      fill = 'rgba(245, 158, 11, 0.04)';
                      stroke = 'rgba(245, 158, 11, 0.3)';
                    }
                  } else {
                    defaultClasses = "fill-slate-100/70 dark:fill-zinc-800/40 stroke-slate-300/70 dark:stroke-zinc-700/50";
                  }

                  return (
                    <polygon
                      key={svgRegion.id}
                      points={svgRegion.points}
                      fill={fill}
                      stroke={stroke}
                      strokeWidth={isSelected ? '2.5' : '1.2'}
                      className={`transition-all duration-300 ease-out cursor-pointer hover:fill-emerald-500/5 dark:hover:fill-emerald-400/5 hover:stroke-emerald-500/40 dark:hover:stroke-emerald-400/40 ${defaultClasses}`}
                      onMouseEnter={() => setHoveredRegion(regionMeta)}
                      onMouseLeave={() => setHoveredRegion(null)}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectRegion(isSelected ? null : regionMeta.name);
                      }}
                    />
                  );
                })}
              </g>

              {/* Render Region Name Labels directly on map */}
              {GHANA_REGIONS.map((region) => {
                const activeCount = regionIncidentCounts[region.name] || 0;
                const isSelected = selectedRegion === region.name;
                
                // Scale coordinates to SVG dimension (500x700)
                const px = (region.x / 100) * 500;
                const py = (region.y / 100) * 700;

                return (
                  <g key={`label-${region.id}`} className="pointer-events-none select-none">
                    <text
                      x={px}
                      y={py - 8}
                      fill={isSelected ? '#10b981' : '#94a3b8'}
                      fontSize="9.5"
                      fontWeight={isSelected ? 'bold' : 'normal'}
                      fontFamily="sans-serif"
                      textAnchor="middle"
                      className="transition-colors duration-200"
                    >
                      {region.code}
                    </text>
                    {activeCount > 0 && (
                      <circle
                        cx={px}
                        cy={py + 3}
                        r="4"
                        className="fill-red-500 animate-ping"
                        style={{ transformOrigin: `${px}px ${py + 3}px` }}
                      />
                    )}
                  </g>
                );
              })}

              {/* Draw Pulsing Incident Pins */}
              {filteredIncidents.map((incident) => {
                if (incident.status === 'resolved') return null;

                // Scale coordinate percentage values to 500x700
                const xPos = (incident.coordinates.x / 100) * 500;
                const yPos = (incident.coordinates.y / 100) * 700;
                const isSelected = selectedIncident?.id === incident.id;

                return (
                  <g
                    key={`pin-${incident.id}`}
                    className="cursor-pointer group/pin"
                    onMouseEnter={() => setHoveredIncident(incident)}
                    onMouseLeave={() => setHoveredIncident(null)}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectIncident(isSelected ? null : incident);
                      setHoveredIncident(null);
                    }}
                  >
                    {/* Glowing halo ring */}
                    <circle
                      cx={xPos}
                      cy={yPos}
                      r={isSelected ? "14" : "10"}
                      className={`fill-none stroke-2 animate-pulse ${
                        incident.severity === 'critical' ? 'stroke-red-500/60' : 'stroke-amber-500/50'
                    }`}
                    />
                    {/* Outer Pin Body */}
                    <circle
                      cx={xPos}
                      cy={yPos}
                      r={isSelected ? "8" : "6.5"}
                      className={`stroke-slate-900 stroke-1 ${
                        incident.severity === 'critical' ? 'fill-red-500' :
                        incident.severity === 'high' ? 'fill-amber-500' :
                        incident.severity === 'medium' ? 'fill-yellow-400' : 'fill-blue-500'
                      } transition-all duration-200`}
                    />
                    {/* Micro Core Dot */}
                    <circle
                      cx={xPos}
                      cy={yPos}
                      r="2.5"
                      className="fill-white"
                    />
                  </g>
                );
              })}

              {/* Click-to-place reporting preview helper */}
              {tempPin && (
                <g className="animate-bounce">
                  <circle
                    cx={(tempPin.x / 100) * 500}
                    cy={(tempPin.y / 100) * 700}
                    r="15"
                    className="fill-emerald-500/20 stroke-emerald-500 stroke-2"
                  />
                  <circle
                    cx={(tempPin.x / 100) * 500}
                    cy={(tempPin.y / 100) * 700}
                    r="5"
                    className="fill-emerald-400"
                  />
                </g>
              )}
            </svg>

            {/* Hover Tooltip showing quick summary (title and severity) */}
            <AnimatePresence>
              {hoveredIncident && (!selectedIncident || selectedIncident.id !== hoveredIncident.id) && isCoordInViewport(hoveredIncident.coordinates.x, hoveredIncident.coordinates.y) && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 5 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 5 }}
                  className="absolute z-40 bg-slate-900/95 dark:bg-zinc-950/95 text-white p-3 rounded-2xl shadow-xl w-56 pointer-events-none border border-slate-800 dark:border-zinc-800 flex flex-col gap-1.5"
                  style={{
                    left: `${getScreenX(hoveredIncident.coordinates.x)}%`,
                    top: `${getScreenY(hoveredIncident.coordinates.y)}%`,
                    transform: 'translate(-50%, -115%)', // Centered above the pin!
                  }}
                >
                  {/* Small decorative indicator arrow pointing down */}
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-0 h-0 border-x-[6px] border-x-transparent border-t-[6px] border-t-slate-900/95 dark:border-t-zinc-950/95" />

                  <div className="flex items-center justify-between gap-2 border-b border-slate-800 dark:border-zinc-800 pb-1.5">
                    <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                      {getCategoryIcon(hoveredIncident.category)} {hoveredIncident.category.replace('-', ' ')}
                    </span>
                    <span className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded ${
                      hoveredIncident.severity === 'critical' ? 'bg-red-500 text-white' :
                      hoveredIncident.severity === 'high' ? 'bg-amber-500 text-slate-950' :
                      hoveredIncident.severity === 'medium' ? 'bg-yellow-400 text-slate-950' :
                      'bg-blue-500 text-white'
                    }`}>
                      {hoveredIncident.severity}
                    </span>
                  </div>
                  
                  <div className="space-y-1">
                    <h5 className="text-[11px] font-bold leading-normal text-slate-100 line-clamp-2">
                      {hoveredIncident.title}
                    </h5>
                    <p className="text-[9px] text-slate-400 font-mono flex items-center gap-1">
                      📍 {hoveredIncident.city}, {hoveredIncident.region}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Absolute positioned Map Popup for Selected Incident */}
            <AnimatePresence>
              {selectedIncident && isCoordInViewport(selectedIncident.coordinates.x, selectedIncident.coordinates.y) && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 10 }}
                  className="absolute z-30 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border border-slate-200/90 dark:border-zinc-800/90 p-3.5 rounded-2xl shadow-xl w-64 pointer-events-auto"
                  style={{
                    left: `${getScreenX(selectedIncident.coordinates.x)}%`,
                    top: `${getScreenY(selectedIncident.coordinates.y)}%`,
                    transform: 'translate(-50%, -105%)', // Centered above the pin!
                  }}
                >
                  {/* Decorative notch pointing down */}
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-0 h-0 border-x-[8px] border-x-transparent border-t-[8px] border-t-white/95 dark:border-t-zinc-900/95" />

                  {/* Header info */}
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 font-mono tracking-wider uppercase">
                      {getCategoryIcon(selectedIncident.category)} {selectedIncident.category.replace('-', ' ')}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectIncident(null);
                      }}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 text-xs font-bold leading-none p-0.5 rounded transition cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Incident Title */}
                  <h4 className="text-[12px] font-bold text-slate-900 dark:text-zinc-50 leading-snug mb-2 line-clamp-2">
                    {selectedIncident.title}
                  </h4>

                  {/* Meta Details: Location & Time Ago */}
                  <div className="space-y-1 text-[10px] text-slate-500 dark:text-zinc-400 mb-2.5 font-sans">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-red-400" />
                      <span className="truncate font-medium">{selectedIncident.city}, {selectedIncident.region}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400 dark:text-zinc-500" />
                      <span className="font-semibold text-slate-600 dark:text-zinc-300">{formatTimeAgo(selectedIncident.reportedAt)}</span>
                    </div>
                  </div>

                  {/* Badges & Actions */}
                  <div className="flex items-center justify-between gap-1.5 border-t border-slate-100 dark:border-zinc-800/80 pt-2">
                    <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-md ${
                      selectedIncident.severity === 'critical' ? 'bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 border border-red-100 dark:border-red-900/30' :
                      selectedIncident.severity === 'high' ? 'bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-450 border border-amber-100 dark:border-amber-900/30' :
                      selectedIncident.severity === 'medium' ? 'bg-yellow-50 dark:bg-yellow-950/20 text-yellow-700 dark:text-yellow-400 border border-yellow-100 dark:border-yellow-900/30' :
                      'bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400 border border-blue-100 dark:border-blue-900/30'
                    }`}>
                      {selectedIncident.severity}
                    </span>
                    
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Scroll or signal focus to the main detail card
                        const detailCard = document.getElementById('incident-selected-card');
                        if (detailCard) {
                          detailCard.scrollIntoView({ behavior: 'smooth' });
                        }
                      }}
                      className="text-[9.5px] font-bold text-emerald-600 dark:text-emerald-450 hover:text-emerald-700 dark:hover:text-emerald-350 flex items-center gap-0.5 cursor-pointer"
                    >
                      <span>inspect</span>
                      <span>→</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Custom Zoom Control Buttons for Mobile & Desktop Accessibility */}
            <div className="absolute bottom-4 right-4 flex flex-col gap-1.5 z-30">
              <button
                type="button"
                onClick={handleZoomIn}
                className="w-10 h-10 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-800 rounded-xl flex items-center justify-center text-slate-600 dark:text-zinc-300 shadow-md transition hover:scale-105 active:scale-95 cursor-pointer animate-fade-in"
                title="Zoom In"
              >
                <Plus className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={handleZoomOut}
                className="w-10 h-10 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-800 rounded-xl flex items-center justify-center text-slate-600 dark:text-zinc-300 shadow-md transition hover:scale-105 active:scale-95 cursor-pointer"
                title="Zoom Out"
              >
                <Minus className="w-5 h-5" />
              </button>
              {zoom > 1 && (
                <button
                  type="button"
                  onClick={handleResetZoom}
                  className="w-10 h-10 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-950/60 border border-emerald-100/40 dark:border-emerald-900/30 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-md transition hover:scale-105 active:scale-95 cursor-pointer text-[10px] font-mono font-bold"
                  title="Reset Zoom"
                >
                  FIT
                </button>
              )}
            </div>
          </div>

          {/* Floating Hover Region Details Tooltip */}
          <AnimatePresence>
            {hoveredRegion && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                className="absolute top-4 left-4 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border border-slate-200/85 dark:border-zinc-800/85 p-4 rounded-2xl shadow-lg w-60 pointer-events-none z-10"
              >
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-2 mb-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-zinc-50">{hoveredRegion.name}</span>
                  <span className="text-[10px] font-mono bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md text-emerald-700 dark:text-emerald-400 font-semibold">{hoveredRegion.code}</span>
                </div>
                <div className="text-[11px] text-slate-600 dark:text-zinc-300 mb-2">Capital: <strong className="text-slate-900 dark:text-zinc-50">{hoveredRegion.capital}</strong></div>
                <div className="text-[10.5px] text-slate-400 dark:text-zinc-500 italic mb-2 leading-relaxed">{hoveredRegion.description}</div>
                <div className="flex items-center justify-between text-[10px] font-mono bg-slate-50 dark:bg-zinc-950/40 p-2 rounded-xl border border-slate-100 dark:border-zinc-800">
                  <span className="text-slate-500 dark:text-zinc-400 font-medium">Active alerts:</span>
                  <span className={`font-bold ${regionIncidentCounts[hoveredRegion.name] > 0 ? 'text-red-600 animate-pulse' : 'text-slate-400 dark:text-zinc-500'}`}>
                    {regionIncidentCounts[hoveredRegion.name] || 0}
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Quick Tip Bar */}
          <div className="mt-4 text-center text-[11px] text-slate-400 dark:text-zinc-500 border-t border-slate-200/60 dark:border-zinc-800/60 pt-3 w-full">
            💡 <strong className="text-slate-500 dark:text-zinc-400">Pro-Tip:</strong> Selecting a region or clicking a coordinate on the canvas directly autofills the reports form!
          </div>
        </div>
      </div>
    </div>
  );
}
