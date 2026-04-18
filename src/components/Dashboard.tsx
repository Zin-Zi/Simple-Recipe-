import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { useSettings } from './SettingsContext';
import { Search, Filter, Plus, Clock, ChevronRight, ChefHat, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const Dashboard: React.FC<{ onAdd: () => void; onView: (id: number) => void }> = ({ onAdd, onView }) => {
  const { theme, t, settings } = useSettings();
  const recipes = useLiveQuery(() => db.recipes.toArray());

  const [search, setSearch] = useState('');
  const [sortBy, setBy] = useState<'title' | 'createdAt' | 'prepTime'>('createdAt');
  const [sortOrder, setOrder] = useState<'asc' | 'desc'>('desc');
  const [showSort, setShowSort] = useState(false);
  const [activeTags, setActiveTags] = useState<string[]>(['all']);

  // Extract all unique tags
  const allTags = Array.from(new Set(recipes?.flatMap(r => r.tags) || [])).sort();

  // Helper to parse prepTime like "20 min" or "1 hr" into minutes
  const parseTime = (time: string) => {
    const num = parseInt(time.replace(/\D/g, '')) || 0;
    if (time.toLowerCase().includes('hr') || time.toLowerCase().includes('hour')) return num * 60;
    return num;
  };

  const filteredRecipes = recipes?.filter(r => {
    const matchesSearch = r.title.toLowerCase().includes(search.toLowerCase()) ||
                         r.category.toLowerCase().includes(search.toLowerCase());
    
    const matchesTags = activeTags.includes('all') || 
                        activeTags.some(tag => r.tags?.includes(tag));
                        
    return matchesSearch && matchesTags;
  }).sort((a, b) => {
    let result = 0;
    if (sortBy === 'title') result = a.title.localeCompare(b.title);
    else if (sortBy === 'createdAt') result = a.createdAt - b.createdAt;
    else if (sortBy === 'prepTime') result = parseTime(a.prepTime) - parseTime(b.prepTime);
    
    return sortOrder === 'asc' ? result : -result;
  });

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 opacity-40" />
          <input
            type="text"
            placeholder={t.search}
            className={cn(
              "w-full pl-10 pr-4 py-4 rounded-2xl border bg-transparent focus:outline-none focus:ring-1 focus:ring-current transition-all",
              theme.id === 'frosted' ? 'glass-panel !border-white/10' : theme.border
            )}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="relative">
          <button
            onClick={() => setShowSort(!showSort)}
            className={cn(
              "p-4 rounded-2xl border transition-all flex items-center justify-center aspect-square",
              theme.id === 'frosted' ? 'glass-panel !border-white/10' : theme.border,
              showSort ? theme.accent : "opacity-60"
            )}
          >
            <ArrowUpDown className="w-5 h-5" />
          </button>
          
          <AnimatePresence>
            {showSort && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                className={cn(
                  "absolute right-0 top-full mt-2 w-48 p-2 rounded-2xl border shadow-2xl z-[100]",
                  theme.id === 'frosted' ? 'glass-panel !border-white/20 backdrop-blur-2xl' : `${theme.bg} ${theme.border}`
                )}
              >
                {[
                  { label: 'Title', value: 'title' },
                  { label: 'Date', value: 'createdAt' },
                  { label: 'Time', value: 'prepTime' }
                ].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      if (sortBy === opt.value) setOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                      else { setBy(opt.value as any); setOrder('asc'); }
                      setShowSort(false);
                    }}
                    className={cn(
                      "w-full text-left p-3 rounded-xl flex items-center justify-between text-[11px] font-bold uppercase tracking-widest",
                      sortBy === opt.value ? theme.accent : "hover:bg-current hover:bg-opacity-5"
                    )}
                  >
                    {opt.label}
                    {sortBy === opt.value && (
                      sortOrder === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                    )}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Tag Filter Pills */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {['all', ...allTags].map(tag => (
          <button
            key={tag}
            onClick={() => {
              if (tag === 'all') setActiveTags(['all']);
              else {
                const newTags = activeTags.includes(tag) 
                  ? activeTags.filter(t => t !== tag)
                  : [...activeTags.filter(t => t !== 'all'), tag];
                setActiveTags(newTags.length === 0 ? ['all'] : newTags);
              }
            }}
            className={cn(
              "whitespace-nowrap px-6 py-2 rounded-full border text-[10px] uppercase font-bold tracking-widest transition-all",
              theme.border,
              activeTags.includes(tag) ? theme.accent : "bg-transparent opacity-60"
            )}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Recipe Grid */}
      <div className="grid gap-4">
        {filteredRecipes?.map((recipe, idx) => (
          <motion.div
            key={recipe.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            onClick={() => recipe.id && onView(recipe.id)}
            className={cn(
              "group relative flex items-center gap-4 p-3 rounded-2xl border cursor-pointer hover:shadow-xl transition-all",
              theme.id === 'frosted' ? 'glass-panel !border-white/10' : theme.border
            )}
          >
            <div className="w-20 h-20 rounded-xl bg-current bg-opacity-5 overflow-hidden border border-current border-opacity-10 shrink-0 select-none">
              {recipe.image ? (
                <img src={recipe.image} alt={recipe.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center opacity-20">
                  <ChefHat className="w-8 h-8" strokeWidth={1.5} />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-bold truncate text-lg tracking-tight uppercase">{recipe.title}</h4>
              <div className="flex items-center gap-3 mt-1 text-[10px] uppercase font-bold opacity-50 tracking-widest">
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {recipe.prepTime}</span>
                <span>•</span>
                <span>{recipe.category}</span>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 opacity-30 group-hover:opacity-100 transition-opacity" />
          </motion.div>
        ))}

        {filteredRecipes?.length === 0 && (
          <div className="text-center py-12 opacity-40">
            <Plus className="w-12 h-12 mx-auto mb-4 border-2 rounded-full p-2" />
            <p className="uppercase tracking-widest font-bold text-xs">Start your collection</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
