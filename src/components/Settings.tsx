import React, { useState } from 'react';
import { useSettings } from './SettingsContext';
import { THEMES, LANGUAGES } from '../constants';
import { updateSetting, db } from '../db';
import { motion } from 'motion/react';
import { Moon, Sun, Monitor, Languages, Type, Bell, User, Scale, Trash2, AlertTriangle, X } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { AnimatePresence } from 'motion/react';

import Dexie from 'dexie';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const Settings: React.FC = () => {
  const { settings, updateSetting: setContextSetting, theme, t } = useSettings();
  const [showConfirm, setShowConfirm] = useState(false);

  const clearAllData = async () => {
    try {
      // Close existing connections first
      db.close();
      
      // Nuke option: Delete the entire database file
      await Dexie.delete('ChefScribeDB');
      window.location.reload();
    } catch (err) {
      console.error("Manual delete failed:", err);
      // Fallback for isolated clear if file delete fails
      try {
        await db.recipes.clear();
        await db.settings.clear();
        window.location.reload();
      } catch (fallbackErr) {
        // Final fallback: just nuke localStorage and reload
        localStorage.clear();
        window.location.reload();
      }
    }
  };

  return (
    <div className="space-y-10 pb-32">
      {/* Custom Confirmation Modal */}
      <AnimatePresence>
        {showConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/40 backdrop-blur-xl transition-all">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className={cn(
                "w-full max-w-sm p-10 rounded-[2.5rem] border shadow-2xl space-y-8 text-center",
                theme.id === 'frosted' ? 'glass-panel !border-white/10' : `${theme.bg} ${theme.border}`
              )}
            >
              <div className="w-20 h-20 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <AlertTriangle className="w-10 h-10" />
              </div>
              <div className="space-y-3">
                <h2 className="text-2xl font-black uppercase tracking-tight">Wipe All Data?</h2>
                <p className="text-sm opacity-60 leading-relaxed font-medium">
                  This will permanently erase all local recipes and settings. This action cannot be undone.
                </p>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 py-4 border border-current border-opacity-10 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-current hover:bg-opacity-5 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={clearAllData}
                  className="flex-1 py-4 bg-red-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-red-600/30 hover:bg-red-700 transition-all"
                >
                  Confirm
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Theme Picker */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <Sun className="w-5 h-5" />
          <h3 className="font-black uppercase tracking-tight text-sm">{t.theme}</h3>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {Object.values(THEMES).map(tOpt => (
            <button
              key={tOpt.id}
              onClick={() => setContextSetting('themeId', tOpt.id)}
              className={cn(
                "p-4 rounded-2xl border text-[10px] font-bold uppercase tracking-widest text-left transition-all",
                tOpt.bg,
                tOpt.text,
                settings.themeId === tOpt.id ? "ring-2 ring-current ring-offset-2 scale-[1.02]" : "opacity-70 border-current border-opacity-20"
              )}
            >
              {tOpt.name}
            </button>
          ))}
        </div>
      </section>

      {/* Language Picker */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <Languages className="w-5 h-5" />
          <h3 className="font-black uppercase tracking-tight text-sm">{t.language}</h3>
        </div>
        <div className="flex gap-3">
          {Object.entries(LANGUAGES).map(([key, lang]) => (
            <button
              key={key}
              onClick={() => setContextSetting('language', key)}
              className={cn(
                "flex-1 p-4 rounded-2xl border text-sm font-bold transition-all",
                settings.language === key ? theme.accent : "border-current border-opacity-10 hover:border-opacity-100"
              )}
            >
              {lang.name}
            </button>
          ))}
        </div>
      </section>

      {/* Font Size */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <Type className="w-5 h-5" />
          <h3 className="font-black uppercase tracking-tight text-sm">{t.fontSize}</h3>
        </div>
        <div className="flex border border-current border-opacity-10 rounded-2xl overflow-hidden">
          {['small', 'medium', 'large'].map(size => (
            <button
              key={size}
              onClick={() => setContextSetting('fontSize', size)}
              className={cn(
                "flex-1 p-4 text-[10px] uppercase font-bold tracking-widest transition-all",
                settings.fontSize === size ? theme.accent : "hover:bg-current hover:bg-opacity-5"
              )}
            >
              {size}
            </button>
          ))}
        </div>
      </section>

      {/* Danger Zone */}
      <section>
        <button
          onClick={() => setShowConfirm(true)}
          className="w-full p-4 border border-red-500/20 text-red-500 rounded-2xl flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all"
        >
          <Trash2 className="w-4 h-4" />
          Destroy Local Data
        </button>
      </section>
    </div>
  );
};

export default Settings;
