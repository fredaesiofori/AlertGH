import React, { useState, useEffect, useRef } from 'react';
import { GHANA_REGIONS } from '../data/ghanaData';
import { Incident, IncidentCategory, SeverityLevel } from '../types';
import { Shield, MapPin, Camera, X, Check, ArrowLeft, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

interface ReportFormProps {
  onAddIncident: (incident: Omit<Incident, 'id' | 'reportedAt' | 'verificationScore' | 'upvotes' | 'downvotes' | 'status'>) => void;
  coordinates: { x: number; y: number } | null;
  onClose: () => void;
  selectedRegionName?: string | null;
  isResponderMode?: boolean;
}

const PRESET_HAZARD_PHOTOS = [
  { id: 'flood_accra', label: 'Flooded Road', url: '🌧️ Submerged roads/highways' },
  { id: 'power_kumasi', label: 'Sparking Transformer', url: '⚡ Power lines / blackouts' },
  { id: 'accident_motorway', label: 'Vehicle Crash', url: '🚗 Major traffic collision' },
  { id: 'road_aburi', label: 'Mudslide / Boulders', url: '⛰️ Road blockage / debris' },
  { id: 'fire_tamale', label: 'Bushfire Smoke', url: '🔥 Dry grassland fire' }
];

export default function ReportForm({ onAddIncident, coordinates, onClose, selectedRegionName, isResponderMode = false }: ReportFormProps) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<IncidentCategory>('flooding');
  const [region, setRegion] = useState('Greater Accra');
  const [city, setCity] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<SeverityLevel>('medium');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [reporterName, setReporterName] = useState('');
  const [imagePreset, setImagePreset] = useState<string>('flood_accra');
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Live Camera state & refs
  const [imageSourceType, setImageSourceType] = useState<'preset' | 'camera'>('preset');
  const [customImage, setCustomImage] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Auto-set region if passed from parent
  useEffect(() => {
    if (selectedRegionName) {
      setRegion(selectedRegionName);
    }
  }, [selectedRegionName]);

  // Clean up camera stream on component unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Update video element with live stream when camera goes active
  useEffect(() => {
    if (isCameraActive && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(e => console.warn("Failed to play camera preview:", String(e).replace(/[\r\n]/g, ' ')));
    }
  }, [isCameraActive]);

  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false
      });
      streamRef.current = stream;
      setIsCameraActive(true);
    } catch (err: any) {
      console.error("Camera access error:", String(err).replace(/[\r\n]/g, ' '));
      setCameraError("Camera access denied or unavailable. Please check permissions.");
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        try {
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          setCustomImage(dataUrl);
          stopCamera();
        } catch (e: any) {
          setCameraError("Failed to render camera snapshot: " + e.message);
        }
      }
    }
  };

  const getSelectedCoordinates = () => {
    if (coordinates) return coordinates;
    const regionMeta = GHANA_REGIONS.find(r => r.name === region);
    return regionMeta ? { x: regionMeta.x, y: regionMeta.y } : { x: 50, y: 50 };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !city || !description) return;

    stopCamera();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      onAddIncident({
        title,
        category,
        region,
        city,
        description,
        severity,
        reportedBy: isAnonymous 
          ? (isResponderMode ? 'Verified Emergency Responder' : 'Anonymous Citizen') 
          : (reporterName || (isResponderMode ? 'Authorized Officer' : 'Concerned Citizen')),
        imagePreset: customImage ? undefined : imagePreset,
        customImage: customImage || undefined,
        coordinates: getSelectedCoordinates()
      });

      setFormSubmitted(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    }, 1800);
  };

  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<{ severity: SeverityLevel; reason: string } | null>(null);

  const suggestSeverityWithAI = async () => {
    if (!title.trim() && !description.trim()) return;
    setAiLoading(true);
    setAiSuggestion(null);
    try {
      const { GoogleGenAI } = await import('@google/genai');
      const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.GEMINI_API_KEY });
      const prompt = `You are an emergency severity classifier for Ghana's AlertGH platform.
Given this incident report, respond with ONLY a JSON object like: {"severity":"critical"|"high"|"medium"|"low","reason":"one sentence"}

Category: ${category}
Title: ${title}
Description: ${description}
Location: ${city}, ${region}`;
      const result = await ai.models.generateContent({ model: 'gemini-2.0-flash', contents: prompt });
      const text = result.text?.trim() ?? '';
      const json = JSON.parse(text.replace(/```json|```/g, '').trim());
      if (['critical','high','medium','low'].includes(json.severity)) {
        setAiSuggestion({ severity: json.severity, reason: json.reason });
      }
    } catch (e) {
      console.warn('AI suggestion failed:', e);
    } finally {
      setAiLoading(false);
    }
  };

  const getCategoryIcon = (cat: IncidentCategory) => {
    switch (cat) {
      case 'flooding': return '🌧️';
      case 'fire': return '🔥';
      case 'accident': return '🚗';
      case 'road-closure': return '🚧';
      case 'power-outage': return '⚡';
      case 'medical': return '🚨';
      default: return '⚠️';
    }
  };

  return (
    <div className="bg-white border-[0.5px] border-[#C6C6C8] rounded-2xl p-4 sm:p-6 shadow-xl relative max-w-xl mx-auto" id="emergency-reporting-form-container">
      
      {/* iOS Modal Top Center Grabber bar */}
      <div className="w-10 h-1 bg-[#C6C6C8]/60 rounded-full mx-auto mb-5" />

      {/* Close button */}
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 text-[#8E8E93] hover:text-[#1C1C1E] p-1.5 rounded-full hover:bg-[#F2F2F7] transition-all cursor-pointer w-8 h-8 flex items-center justify-center border-[0.5px] border-[#C6C6C8] bg-white shadow-sm"
        title="Close form"
      >
        <X className="w-4 h-4" />
      </button>

      {formSubmitted ? (
        <div className="text-center py-10 space-y-4">
          <div className="w-14 h-14 bg-[#34C759]/10 border-[0.5px] border-[#34C759]/30 text-[#34C759] rounded-full flex items-center justify-center mx-auto text-xl">
            <Check className="w-7 h-7 stroke-[2.5]" />
          </div>
          <h3 className="text-[20px] font-bold text-[#1C1C1E]">{isResponderMode ? 'Response Logged' : 'Incident Logged'}</h3>
          <p className="text-[15px] text-[#8E8E93] max-w-sm mx-auto leading-relaxed">
            {isResponderMode 
              ? "Your official emergency response and dispatch action has been logged and published to Ghana's live community grid."
              : "Your safety report has been logged and published to Ghana's live community grid."}
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Header */}
          <div className="space-y-1">
            <span className="text-[12px] font-bold text-[#FF3B30] uppercase tracking-wider flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 fill-[#FF3B30]/10" />
              Emergency Response Network
            </span>
            <h2 className="text-[20px] sm:text-[24px] font-bold tracking-tight text-[#1C1C1E]">
              {isResponderMode ? 'Respond to Active Hazard' : 'Report Active Hazard'}
            </h2>
            <p className="text-[13px] sm:text-[14px] text-[#8E8E93]">
              {isResponderMode 
                ? 'Be descriptive. Provide official agency response, dispatch instructions, and rescue updates.'
                : 'Be descriptive. Help rescue agencies and fellow citizens navigate safe passage.'}
            </p>
          </div>

          {/* iOS Segmented Control Stepper */}
          <div className="bg-[#E3E3E8] p-0.5 rounded-lg flex border-[0.5px] border-[#C6C6C8]/40" id="wizard-progress-stepper">
            {[
              { num: 1, label: 'Type' },
              { num: 2, label: 'Area' },
              { num: 3, label: 'Evidence' },
              { num: 4, label: 'Verify' }
            ].map((s) => (
              <button
                key={s.num}
                type="button"
                disabled={s.num > step}
                onClick={() => setStep(s.num)}
                className={`flex-1 py-1.5 rounded-md text-[11px] sm:text-[13px] font-semibold transition-all flex items-center justify-center gap-0.5 sm:gap-1 cursor-pointer ${
                  step === s.num
                    ? 'bg-white text-[#1C1C1E] shadow-sm'
                    : 'text-[#8E8E93] hover:text-[#1C1C1E]'
                }`}
              >
                <span>{s.num}.</span>
                <span>{s.label}</span>
              </button>
            ))}
          </div>

          {/* Wizard step render container */}
          <div className="min-h-[220px]">
            {/* Step 1: Hazard category & severity */}
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="space-y-1.5">
                  <label className="text-[13px] font-semibold text-[#8E8E93] uppercase tracking-wider">Hazard Type</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as IncidentCategory)}
                    className="w-full bg-[#F2F2F7] text-[#1C1C1E] text-[15px] px-3.5 py-3 rounded-lg border-[0.5px] border-[#C6C6C8] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#007AFF] transition cursor-pointer font-medium"
                  >
                    <option value="flooding">🌧️ Flooding / Road Submerged</option>
                    <option value="fire">🔥 Fire / Bushfire / Smoke</option>
                    <option value="accident">🚗 Major Vehicle Crash</option>
                    <option value="road-closure">🚧 Road Closure / Mudslide</option>
                    <option value="power-outage">⚡ ECG Outage / Fallen Transformer</option>
                    <option value="medical">🚨 Community Medical Crisis</option>
                    <option value="other">⚠️ Other Safety Threat</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[13px] font-semibold text-[#8E8E93] uppercase tracking-wider">Severity Level</label>
                    <button
                      type="button"
                      onClick={suggestSeverityWithAI}
                      disabled={aiLoading}
                      className="flex items-center gap-1 text-[11px] font-bold text-purple-600 bg-purple-50 border border-purple-200 px-2.5 py-1 rounded-lg transition hover:bg-purple-100 cursor-pointer disabled:opacity-50"
                    >
                      {aiLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                      AI Suggest
                    </button>
                  </div>
                  {aiSuggestion && (
                    <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider">AI Recommendation</span>
                        <p className="text-[12px] text-purple-900 mt-0.5">{aiSuggestion.reason}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => { setSeverity(aiSuggestion.severity); setAiSuggestion(null); }}
                        className="shrink-0 bg-purple-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg cursor-pointer hover:bg-purple-500"
                      >
                        Apply {aiSuggestion.severity}
                      </button>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-2 text-[14px]">
                    {[
                      { key: 'critical', color: '#FF3B30', label: '🚨 Critical' },
                      { key: 'high', color: '#FF9500', label: '🔥 High' },
                      { key: 'medium', color: '#FFCC00', label: '⚠️ Medium' },
                      { key: 'low', color: '#34C759', label: '✅ Low' }
                    ].map((item) => {
                      const isSelected = severity === item.key;
                      return (
                        <button
                          key={item.key}
                          type="button"
                          onClick={() => setSeverity(item.key as SeverityLevel)}
                          className={`py-3 px-3 rounded-xl border-[0.5px] text-center font-semibold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                            isSelected
                              ? 'bg-white text-[#1C1C1E]'
                              : 'bg-[#F2F2F7] text-[#8E8E93] border-transparent hover:border-[#C6C6C8] hover:text-[#1C1C1E]'
                          }`}
                          style={isSelected ? { borderColor: item.color, boxShadow: `0 0 0 1px ${item.color}` } : {}}
                        >
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Location region and town */}
            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                {coordinates ? (
                  <div className="bg-[#34C759]/10 border-[0.5px] border-[#34C759]/30 p-3 rounded-xl flex items-center gap-2.5 text-[13px] text-[#34C759]">
                    <MapPin className="w-4.5 h-4.5 animate-bounce shrink-0" />
                    <span>
                      Map Pin Registered: <strong className="font-bold">X: {coordinates.x}%, Y: {coordinates.y}%</strong>
                    </span>
                  </div>
                ) : (
                  <div className="bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 p-3 rounded-xl flex items-center gap-2.5 text-[13px] text-slate-500 dark:text-zinc-400 transition-colors">
                    <MapPin className="w-4.5 h-4.5 shrink-0" />
                    <span>
                      Standard region coordinates applied. Click on map directly for precise location pinning.
                    </span>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[13px] font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Ghana Region</label>
                    <select
                      value={region}
                      onChange={(e) => setRegion(e.target.value)}
                      className="w-full bg-slate-100 dark:bg-zinc-900 text-slate-900 dark:text-zinc-50 text-[15px] px-3.5 py-3 rounded-lg border border-slate-200 dark:border-zinc-800 focus:bg-white dark:focus:bg-zinc-805 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition cursor-pointer font-medium"
                    >
                      {GHANA_REGIONS.map((r) => (
                        <option key={r.id} value={r.name}>
                          🇬🇭 {r.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[13px] font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">City / Town / Neighborhood</label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g., East Legon, Adum, Tamale Central"
                      className="w-full bg-slate-100 dark:bg-zinc-900 text-slate-900 dark:text-zinc-50 text-[15px] px-3.5 py-3 rounded-lg border border-slate-200 dark:border-zinc-800 focus:bg-white dark:focus:bg-zinc-805 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition font-semibold placeholder-slate-400 dark:placeholder-zinc-500"
                    />
                    {!city.trim() && (
                      <p className="text-[11px] text-red-500 font-bold">⚠️ Town / neighborhood name is required.</p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3: Description & evidence media */}
            {step === 3 && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="space-y-1.5">
                  <label className="text-[13px] font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Hazard Heading</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Major flood block at Mallam Interchange"
                    className="w-full bg-slate-100 dark:bg-zinc-900 text-slate-900 dark:text-zinc-50 text-[15px] px-3.5 py-3 rounded-lg border border-slate-200 dark:border-zinc-800 focus:bg-white dark:focus:bg-zinc-805 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition font-semibold placeholder-slate-400 dark:placeholder-zinc-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[13px] font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Detailed Guidance</label>
                  <textarea
                    required
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide route detour advice or critical warning notes..."
                    className="w-full bg-slate-100 dark:bg-zinc-900 text-slate-900 dark:text-zinc-50 text-[15px] px-3.5 py-3 rounded-lg border border-slate-200 dark:border-zinc-800 focus:bg-white dark:focus:bg-zinc-805 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition font-medium placeholder-slate-400 dark:placeholder-zinc-500 resize-none"
                  />
                </div>

                {/* Evidence Photo Choice */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 pb-1.5">
                    <span className="text-[12px] font-bold text-slate-900 dark:text-zinc-50 uppercase tracking-wider flex items-center gap-1.5">
                      <Camera className="w-4 h-4 text-emerald-500" />
                      Evidence Image
                    </span>
                    
                    {/* Segmented for Preset vs Camera */}
                    <div className="bg-slate-100 dark:bg-zinc-800 p-0.5 rounded-lg flex border border-slate-200/40 dark:border-zinc-700/40">
                      <button
                        type="button"
                        onClick={() => {
                          setImageSourceType('preset');
                          stopCamera();
                        }}
                        className={`px-3 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                          imageSourceType === 'preset' ? 'bg-white text-[#1C1C1E] shadow-sm' : 'text-[#8E8E93]'
                        }`}
                      >
                        Presets
                      </button>
                      <button
                        type="button"
                        onClick={() => setImageSourceType('camera')}
                        className={`px-3 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                          imageSourceType === 'camera' ? 'bg-white text-[#1C1C1E] shadow-sm' : 'text-[#8E8E93]'
                        }`}
                      >
                        Live Camera
                      </button>
                    </div>
                  </div>

                  {imageSourceType === 'preset' ? (
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                      {PRESET_HAZARD_PHOTOS.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setImagePreset(p.id)}
                          className={`p-2 rounded-xl border-[0.5px] text-left transition-all h-14 flex flex-col justify-between cursor-pointer ${
                            imagePreset === p.id
                              ? 'bg-white border-[#007AFF] ring-1 ring-[#007AFF]'
                              : 'bg-[#F2F2F7] border-transparent hover:border-[#C6C6C8]'
                          }`}
                        >
                          <span className="text-[11px] font-bold text-[#1C1C1E] truncate w-full">{p.label}</span>
                          <span className="text-[9px] text-[#8E8E93] truncate w-full">{p.url}</span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-slate-100 dark:bg-zinc-900 p-3 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-2">
                      {customImage ? (
                        <div className="space-y-2">
                          <div className="relative h-28 w-full bg-slate-900 dark:bg-zinc-950 rounded-lg overflow-hidden border border-slate-200 dark:border-zinc-800 flex items-center justify-center">
                            <img
                              src={customImage}
                              alt="Captured evidence"
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                            <div className="absolute top-2 left-2 bg-[#FF3B30] text-white font-mono font-bold text-[9px] px-2 py-0.5 rounded-full">
                              LIVE CAPTURE
                            </div>
                          </div>
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => { setCustomImage(null); startCamera(); }}
                              className="px-2.5 py-1 text-[11px] font-semibold bg-white border-[0.5px] border-[#C6C6C8] rounded-md text-[#1C1C1E]"
                            >
                              🔄 Retake
                            </button>
                            <button
                              type="button"
                              onClick={() => setCustomImage(null)}
                              className="px-2.5 py-1 text-[11px] font-semibold bg-[#FF3B30]/10 text-[#FF3B30] rounded-md"
                            >
                              🗑️ Delete
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-4 space-y-2">
                          {isCameraActive ? (
                            <div className="space-y-2">
                              <div className="relative h-32 w-full bg-black rounded-lg overflow-hidden border-[0.5px] border-[#C6C6C8]">
                                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                              </div>
                              <div className="flex justify-center gap-2">
                                <button
                                  type="button"
                                  onClick={capturePhoto}
                                  className="bg-[#007AFF] text-white font-bold text-[12px] px-4 py-1.5 rounded-lg"
                                >
                                  Take Photo
                                </button>
                                <button
                                  type="button"
                                  onClick={stopCamera}
                                  className="bg-white border-[0.5px] border-[#C6C6C8] text-[#1C1C1E] text-[12px] px-4 py-1.5 rounded-lg"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <p className="text-[12px] text-[#8E8E93] max-w-xs mx-auto">
                                Enable camera permissions to capture live geo-evidence of the emergency.
                              </p>
                              {cameraError && <p className="text-[11px] text-[#FF3B30]">⚠️ {cameraError}</p>}
                              <button
                                type="button"
                                onClick={startCamera}
                                className="bg-[#007AFF]/10 text-[#007AFF] border-[0.5px] border-[#007AFF]/20 font-bold text-[12px] px-4 py-1.5 rounded-lg"
                              >
                                Activate Camera
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Step 4: Verification summary */}
            {step === 4 && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="bg-slate-100 dark:bg-zinc-900 p-3 rounded-xl border border-slate-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[13px] font-bold text-slate-900 dark:text-zinc-50 block">Identity Control</span>
                    <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                      {isResponderMode ? 'Verified emergency responder badge will be attached.' : 'Anonymous submissions protect your privacy by default.'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={isAnonymous}
                      onChange={(e) => setIsAnonymous(e.target.checked)}
                      className={`w-4.5 h-4.5 ${isResponderMode ? 'accent-blue-500' : 'accent-emerald-500'} cursor-pointer`}
                    />
                    <span className="text-[13px] font-semibold text-slate-900 dark:text-zinc-50">
                      {isResponderMode ? 'Post as Verified Officer' : 'Post Anonymously'}
                    </span>
                  </div>
                </div>

                {!isAnonymous && (
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-[#8E8E93] uppercase tracking-wider">
                      {isResponderMode ? 'Responder Officer Name' : 'Reporter Name'}
                    </label>
                    <input
                      type="text"
                      required
                      value={reporterName}
                      onChange={(e) => setReporterName(e.target.value)}
                      placeholder={isResponderMode ? 'Enter responder / officer name' : 'Enter your full name'}
                      className="w-full bg-[#F2F2F7] text-[#1C1C1E] text-[14px] px-3 py-2 rounded-lg border-[0.5px] border-[#C6C6C8]"
                    />
                  </div>
                )}

                {/* Card Detail Box */}
                <div className="border border-slate-200 dark:border-zinc-800 bg-slate-100/50 dark:bg-zinc-900/50 p-4 rounded-xl space-y-2.5 text-[13px]">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider block">Heading</span>
                      <strong className="text-slate-900 dark:text-zinc-50 font-semibold">{title || 'N/A'}</strong>
                    </div>
                    <div>
                      <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider block">Category</span>
                      <strong className="text-slate-900 dark:text-zinc-50 font-semibold capitalize">{getCategoryIcon(category)} {category}</strong>
                    </div>
                    <div>
                      <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider block">Location</span>
                      <strong className="text-slate-900 dark:text-zinc-50 font-semibold">🇬🇭 {city}, {region}</strong>
                    </div>
                    <div>
                      <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider block">
                        {isResponderMode ? 'Responded By' : 'Reporter'}
                      </span>
                      <strong className="text-slate-900 dark:text-zinc-50 font-semibold text-ellipsis overflow-hidden">
                        {isAnonymous 
                          ? (isResponderMode ? 'Verified Emergency Responder' : 'Anonymous Citizen') 
                          : (reporterName || (isResponderMode ? 'Authorized Officer' : 'Concerned Citizen'))}
                      </strong>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200/60 dark:border-zinc-800/60">
                    <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider block mb-1">Details Summary</span>
                    <p className="text-slate-900 dark:text-zinc-50 leading-normal">{description || 'No description entered.'}</p>
                  </div>
                </div>

                {isSubmitting && (
                  <div className="p-4 bg-[#007AFF]/10 border-[0.5px] border-[#007AFF]/20 rounded-xl text-center space-y-2">
                    <div className="flex items-center justify-center gap-2 text-[#007AFF] font-bold text-[13px]">
                      <Loader2 className="w-4 h-4 animate-spin text-[#007AFF]" />
                      {isResponderMode ? 'Broadcasting official emergency response...' : 'Broadcasting safety broadcast beacon...'}
                    </div>
                    <div className="w-full bg-[#C6C6C8]/40 h-1 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 1.7, ease: "easeInOut" }}
                        className="bg-[#007AFF] h-full"
                      />
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </div>

          {/* Stepper Footer Action Bar */}
          <div className="flex items-center justify-between pt-4 border-t-[0.5px] border-[#C6C6C8]">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                disabled={isSubmitting}
                className="px-4 py-2 text-[14px] font-bold text-[#007AFF] bg-[#007AFF]/10 rounded-lg flex items-center gap-1 cursor-pointer"
                id="wizard-back-button"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-[14px] font-bold text-[#FF3B30] bg-[#FF3B30]/10 rounded-lg cursor-pointer"
                id="wizard-cancel-button"
              >
                Cancel
              </button>
            )}

            {step < 4 ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                disabled={
                  (step === 2 && !city.trim()) ||
                  (step === 3 && (!title.trim() || !description.trim()))
                }
                className={`px-5 py-2.5 text-[14px] font-bold text-white rounded-lg flex items-center gap-1 cursor-pointer transition-all ${
                  ((step === 2 && !city.trim()) || (step === 3 && (!title.trim() || !description.trim())))
                    ? 'bg-[#E3E3E8] text-[#8E8E93] cursor-not-allowed shadow-none'
                    : 'bg-[#007AFF] hover:bg-[#007AFF]/90'
                }`}
                id="wizard-next-button"
              >
                Continue
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting || (!isAnonymous && !reporterName.trim())}
                className={`px-6 py-2.5 text-[14px] font-bold text-white rounded-lg flex items-center gap-1 cursor-pointer transition-all ${
                  (isSubmitting || (!isAnonymous && !reporterName.trim()))
                    ? 'bg-[#E3E3E8] text-[#8E8E93] cursor-not-allowed'
                    : 'bg-[#007AFF] hover:bg-[#007AFF]/90'
                }`}
                id="wizard-submit-button"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Broadcasting...
                  </>
                ) : (
                  isResponderMode ? 'Publish Official Response 🚒' : 'Submit Report 📢'
                )}
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  );
}
