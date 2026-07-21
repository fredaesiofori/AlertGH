import React, { useState, useMemo, useEffect } from 'react';
import { fetchContactsFromFirestore } from '../firebase';
import { EmergencyContact } from '../types';
import { Search, Phone, Copy, Check, ShieldAlert, HeartPulse, Shield, Flame, Zap, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function EmergencyDirectory() {
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [dialedContact, setDialedContact] = useState<EmergencyContact | null>(null);

  useEffect(() => {
    let active = true;
    const loadContacts = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchContactsFromFirestore();
        if (active) {
          setContacts(data);
        }
      } catch (err: any) {
        if (active) {
          setError(err.message || 'Failed to load emergency contacts from database.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };
    loadContacts();
    return () => {
      active = false;
    };
  }, []);

  // Filter emergency contacts
  const filteredContacts = useMemo(() => {
    return contacts.filter((contact) => {
      const matchesSearch = contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.number.includes(searchQuery) ||
        contact.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = selectedCategory === 'all' || contact.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [contacts, searchQuery, selectedCategory]);


  const handleCopy = (id: string, number: string) => {
    navigator.clipboard.writeText(number);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'ambulance': return <HeartPulse className="w-5 h-5 text-[#34C759]" />;
      case 'fire': return <Flame className="w-5 h-5 text-[#FF3B30]" />;
      case 'police': return <Shield className="w-5 h-5 text-[#007AFF]" />;
      case 'disaster': return <ShieldAlert className="w-5 h-5 text-[#FF9500]" />;
      default: return <Zap className="w-5 h-5 text-[#FFCC00]" />;
    }
  };

  return (
    <div className="glass-panel rounded-3xl p-6 relative overflow-hidden" id="emergency-directory-panel">
      
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/60 dark:border-zinc-800/60 pb-5 mb-5">
        <div>
          <h2 className="text-[20px] font-bold text-slate-900 dark:text-zinc-50 flex items-center gap-2">
            <Phone className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
            National Hotlines Directory
          </h2>
          <p className="text-[14px] text-slate-500 dark:text-zinc-400 mt-0.5">
            Verified emergency numbers for Ghana national assistance and disaster rescue.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search service or agency..."
            className="w-full bg-slate-50 dark:bg-zinc-900 text-slate-900 dark:text-zinc-50 text-[14px] pl-9 pr-3 py-2 rounded-lg border border-slate-200/80 dark:border-zinc-800 focus:bg-white dark:focus:bg-zinc-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition placeholder-slate-400 dark:placeholder-zinc-500 font-medium"
          />
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 dark:text-zinc-500" />
        </div>
      </div>

      {/* Segmented Category Toggles */}
      <div className="flex flex-wrap gap-1.5 mb-6 bg-slate-100 dark:bg-zinc-800 p-0.5 rounded-lg border border-slate-200/60 dark:border-zinc-700/60 self-start" id="directory-category-filters">
        {[
          { id: 'all', label: 'All Hotlines' },
          { id: 'ambulance', label: 'Ambulance' },
          { id: 'fire', label: 'Fire Service' },
          { id: 'police', label: 'Police Force' },
          { id: 'disaster', label: 'NADMO' },
          { id: 'utility', label: 'ECG / Utilities' }
        ].map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3 py-1.5 rounded-md text-[13px] font-semibold transition cursor-pointer select-none ${
              selectedCategory === cat.id
                ? 'bg-white dark:bg-zinc-700 text-slate-900 dark:text-zinc-50 shadow-sm'
                : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 space-y-3" id="contacts-loading">
          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
          <p className="text-sm text-slate-500 dark:text-zinc-400 font-medium">Syncing directory from Firestore...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50/80 dark:bg-red-950/20 border border-red-200/50 dark:border-red-900/40 rounded-2xl p-6 text-center space-y-2" id="contacts-error">
          <ShieldAlert className="w-8 h-8 text-red-500 mx-auto" />
          <h4 className="text-base font-bold text-red-900 dark:text-red-300">Database Connection Failed</h4>
          <p className="text-xs text-red-700 dark:text-red-400">{error}</p>
        </div>
      ) : (
        /* Contacts Card Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" id="emergency-contacts-grid">
          {filteredContacts.map((contact) => (
            <div
              key={contact.id}
              className="bg-slate-50/50 dark:bg-zinc-900/40 border border-slate-200/60 dark:border-zinc-800/80 rounded-xl p-5 flex flex-col justify-between relative shadow-sm hover:bg-white dark:hover:bg-zinc-900 transition-all"
            >
              <div className="space-y-3">
                {/* Responsive Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="p-2 bg-white dark:bg-zinc-800 rounded-lg border border-slate-200/85 dark:border-zinc-700/85 shrink-0">
                      {getCategoryIcon(contact.category)}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-[14px] font-bold text-slate-900 dark:text-zinc-50 truncate" title={contact.name}>{contact.name}</h3>
                      <span className="text-[10px] text-slate-400 dark:text-zinc-500 uppercase font-bold tracking-wider block mt-0.5">{contact.category}</span>
                    </div>
                  </div>

                  {/* Number Pill */}
                  <div className="bg-white dark:bg-zinc-800 border border-slate-200/80 dark:border-zinc-700/80 px-2.5 py-1 rounded-full text-[12px] font-bold text-slate-800 dark:text-zinc-200 self-start sm:self-auto shrink-0 shadow-sm">
                    📞 {contact.number}
                  </div>
                </div>

                <p className="text-[13px] text-slate-500 dark:text-zinc-400 leading-relaxed min-h-[40px]">
                  {contact.description}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-200/60 dark:border-zinc-800/60">
                <button
                  onClick={() => setDialedContact(contact)}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white text-[13px] font-semibold py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Phone className="w-3.5 h-3.5 fill-white" />
                  Speed Dial
                </button>
                
                <button
                  onClick={() => handleCopy(contact.id, contact.number)}
                  className="p-2 bg-white dark:bg-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-750 border border-slate-200 dark:border-zinc-700 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 transition cursor-pointer"
                  title="Copy Hotline"
                >
                  {copiedId === contact.id ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          ))}

          {filteredContacts.length === 0 && (
            <div className="col-span-full text-center py-12 bg-slate-50/40 dark:bg-zinc-900/40 rounded-xl border border-slate-200 dark:border-zinc-800">
              <ShieldAlert className="w-8 h-8 text-slate-400 dark:text-zinc-500 mx-auto mb-2" />
              <h4 className="text-[15px] font-semibold text-slate-900 dark:text-zinc-50">No emergency services match</h4>
              <p className="text-[13px] text-slate-500 dark:text-zinc-400 mt-0.5">Please adjust your search terms or select another Category.</p>
            </div>
          )}
        </div>
      )}

      {/* Simulated Outbound Call Sheet */}
      <AnimatePresence>
        {dialedContact && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 max-w-sm w-full text-center space-y-6 shadow-2xl relative"
            >
              {/* Close Button */}
              <button
                onClick={() => setDialedContact(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 transition cursor-pointer border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-sm"
              >
                <X className="w-4 h-4" />
              </button>
              
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">Outbound Call Simulator</span>
                <h3 className="text-[18px] font-bold text-slate-900 dark:text-zinc-50">{dialedContact.name}</h3>
                <div className="text-[34px] font-bold text-emerald-500 tracking-widest mt-2 font-mono">
                  {dialedContact.number}
                </div>
              </div>

              {/* Pulsing Radar Ring */}
              <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
                <div className="absolute w-16 h-16 rounded-full border border-emerald-500/30 animate-ping" />
                <div className="absolute w-20 h-20 rounded-full border border-emerald-500/10 animate-ping delay-200" />
                <div className="w-12 h-12 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-md">
                  <Phone className="w-5 h-5 fill-white" />
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-zinc-950 p-3.5 rounded-xl border border-slate-200/80 dark:border-zinc-800/80 text-left">
                <p className="text-[12px] text-slate-500 dark:text-zinc-400 leading-relaxed">
                  To contact the rescue crew on a mobile network in Ghana, dial <strong className="text-slate-900 dark:text-zinc-50 font-semibold">{dialedContact.number}</strong> directly on your SIM keypad.
                </p>
              </div>

              <button
                onClick={() => setDialedContact(null)}
                className="w-full bg-red-600 hover:bg-red-500 text-white font-bold text-[14px] py-3 rounded-xl transition cursor-pointer"
              >
                Disconnect Call
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
