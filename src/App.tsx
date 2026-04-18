import React, { useState, useEffect, useCallback } from 'react';
import { SettingsProvider, useSettings } from './components/SettingsContext';
import Splash from './components/Splash';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import RecipeForm from './components/RecipeForm';
import RecipeDetail from './components/RecipeDetail';
import Settings from './components/Settings';
import { db } from './db';
import { Recipe } from './types';
import { LayoutDashboard, Book, Settings as SettingsIcon, Plus, Info, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLiveQuery } from 'dexie-react-hooks';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type View = 'splash' | 'dashboard' | 'form' | 'detail' | 'settings';

const AppContent: React.FC = () => {
  const [view, setView] = useState<View>('splash');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [backPressCount, setBackPressCount] = useState(0);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const { theme, t } = useSettings();

  const selectedRecipe = useLiveQuery(
    () => (selectedId ? db.recipes.get(selectedId) : undefined),
    [selectedId]
  );

  // Handle Hardware Back Button Logic (Mocked via Browser History)
  const handleBack = useCallback(() => {
    if (view === 'dashboard') {
      if (backPressCount === 0) {
        setBackPressCount(1);
        setTimeout(() => setBackPressCount(0), 2000);
      } else {
        setShowExitDialog(true);
      }
    } else {
      setView('dashboard');
      setSelectedId(null);
    }
  }, [view, backPressCount]);

  useEffect(() => {
    const onPopState = (e: PopStateEvent) => {
      e.preventDefault();
      handleBack();
    };
    window.history.pushState(null, '', window.location.pathname);
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [handleBack]);

  if (view === 'splash') {
    return <Splash onComplete={() => setView('dashboard')} />;
  }

  return (
    <div className={cn("flex flex-col min-h-screen select-none transition-colors duration-500", theme.bg, theme.text, theme.font)}>
      <AnimatePresence mode="popLayout">
        <motion.div
          key={view + (selectedId || '')}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="flex-1 flex flex-col overflow-hidden"
        >
          {view === 'dashboard' && (
            <Layout title={t.dashboard}>
              <Dashboard onAdd={() => { setSelectedId(null); setView('form'); }} onView={(id) => { setSelectedId(id); setView('detail'); }} />
            </Layout>
          )}

          {view === 'form' && (
            <Layout title={selectedRecipe ? t.editRecipe : t.addRecipe} onBack={() => { setView('dashboard'); setSelectedId(null); }}>
              <RecipeForm 
                initialRecipe={selectedRecipe}
                onCancel={() => { setView('dashboard'); setSelectedId(null); }} 
                onSuccess={() => { setView('dashboard'); setSelectedId(null); }} 
              />
            </Layout>
          )}

          {view === 'detail' && selectedRecipe && (
            <Layout title="" onBack={() => setView('dashboard')}>
              <RecipeDetail
                recipe={selectedRecipe}
                onBack={() => setView('dashboard')}
                onEdit={() => setView('form')}
                onDelete={async () => {
                  await db.recipes.delete(selectedId!);
                  setView('dashboard');
                }}
              />
            </Layout>
          )}

          {view === 'settings' && (
            <Layout title={t.settings} onBack={() => setView('dashboard')}>
              <Settings />
            </Layout>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Bottom Nav */}
      {view === 'dashboard' && (
        <nav className={`fixed bottom-0 left-0 right-0 p-4 border-t ${theme.border} ${theme.id === 'frosted' ? 'glass-panel !border-white/10' : 'backdrop-blur-xl bg-opacity-70'} flex justify-around items-center z-30`}>
          <button onClick={() => setView('dashboard')} className="flex flex-col items-center gap-1">
            <LayoutDashboard className="w-5 h-5" />
            <span className="text-[10px] font-bold uppercase tracking-widest">{t.dashboard}</span>
          </button>
          <div className="w-12 h-12 bg-current rounded-full flex items-center justify-center -mt-8 shadow-xl border-4 border-white dark:border-black" onClick={() => setView('form')}>
            <Plus className="w-6 h-6 invert" />
          </div>
          <button onClick={() => setView('settings')} className="flex flex-col items-center gap-1 opacity-50">
            <SettingsIcon className="w-5 h-5" />
            <span className="text-[10px] font-bold uppercase tracking-widest">{t.settings}</span>
          </button>
        </nav>
      )}

      {/* Exit Dialog */}
      <AnimatePresence>
        {showExitDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-6 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className={`w-full max-w-sm p-8 rounded-3xl ${theme.id === 'frosted' ? 'glass-panel !border-white/20' : theme.bg} ${theme.text} shadow-2xl space-y-6 text-center border ${theme.border}`}
            >
              <Info className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <h2 className="text-xl font-bold uppercase tracking-tight">{t.exitConfirm}</h2>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowExitDialog(false)}
                  className="flex-1 py-4 border rounded-2xl font-bold uppercase tracking-widest text-xs"
                >
                  {t.no}
                </button>
                <button
                  onClick={() => window.close()}
                  className={`flex-1 py-4 rounded-2xl font-bold uppercase tracking-widest text-xs ${theme.accent}`}
                >
                  {t.yes}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast Prompt for Back Tap */}
      <AnimatePresence>
        {backPressCount === 1 && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-black text-white px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest z-[150] shadow-2xl"
          >
            {t.backToExit}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function App() {
  return (
    <SettingsProvider>
      <AppContent />
    </SettingsProvider>
  );
}
