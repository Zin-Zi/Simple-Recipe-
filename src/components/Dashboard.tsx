import React, { useState, useEffect, useRef } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { useSettings } from './SettingsContext';
import { Search, Filter, Plus, Clock, ChevronRight, ChefHat, ArrowUpDown, ArrowUp, ArrowDown, Play, Pause, Square, Heart, Minus, ChevronUp, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const RecipeCard: React.FC<{ 
  recipe: any; 
  isRunning: boolean; 
  onView: (id: number) => void;
  onStart: (id: number) => void;
  onStop: () => void;
  onToggleFavorite: (id: number) => void;
  idx: number;
}> = ({ recipe, isRunning, onView, onStart, onStop, onToggleFavorite, idx }) => {
  const { theme } = useSettings();
  
  const [timeLeft, setTimeLeft] = useState(() => {
    if (!recipe.prepTime) return 20 * 60;
    const num = parseInt(recipe.prepTime.replace(/\D/g, '')) || 20;
    const isHr = recipe.prepTime.toLowerCase().includes('hr') || recipe.prepTime.toLowerCase().includes('hour');
    return (isHr ? num * 60 : num) * 60;
  });
  const [isActive, setIsActive] = useState(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRunning && isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, isActive, timeLeft]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ 
        scale: 1.02, 
        y: -4,
        transition: { type: 'spring', stiffness: 300, damping: 20 }
      }}
      transition={{ delay: idx * 0.05 }}
      onClick={() => recipe.id && onView(recipe.id)}
      className={cn(
        "group relative flex items-start gap-4 p-4 rounded-[2rem] border transition-all duration-500",
        isRunning 
          ? "glass-panel sunlight-shimmer !border-white/20 shadow-2xl z-20 items-center" 
          : cn("cursor-pointer hover:shadow-2xl hover:border-current/10", theme.id === 'frosted' ? 'glass-panel !border-white/10' : theme.border)
      )}
    >
      <div className={cn(
        "w-20 h-20 rounded-2xl overflow-hidden border border-current border-opacity-10 shrink-0 select-none transition-all",
        theme.text.includes('white') ? 'bg-white/5' : 'bg-black/5',
        isRunning && "shadow-inner border-white/20",
        !isRunning && "group-hover:scale-105 group-hover:-rotate-2 duration-500"
      )}>
        {recipe.image ? (
          <img src={recipe.image} alt={recipe.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
        ) : (
          <div className="w-full h-full flex items-center justify-center opacity-20">
            <ChefHat className="w-8 h-8" strokeWidth={1.5} />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0 pt-1 flex flex-col justify-center min-h-[5rem]">
        <div className="flex items-center gap-2">
          <h4 className={cn(
            "font-bold truncate tracking-tight uppercase transition-all line-clamp-1",
            isRunning ? "text-white" : ""
          )}>
            {recipe.title}
          </h4>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(recipe.id!);
            }}
            className={cn(
              "p-1.5 rounded-full transition-all shrink-0 ml-auto",
              recipe.isFavorite ? "text-red-500 scale-110" : isRunning ? "text-white/40" : "opacity-30",
              theme.text.includes('white') ? 'hover:bg-white/10' : 'hover:bg-black/10'
            )}
          >
            <Heart className={cn("w-4 h-4", recipe.isFavorite && "fill-current")} />
          </button>
        </div>
        
        <div className={cn(
          "flex items-center gap-3 mt-1 text-[10px] uppercase font-bold tracking-widest transition-all",
          isRunning ? "text-white/60" : "opacity-50"
        )}>
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {recipe.prepTime}</span>
          <span>•</span>
          <span className="truncate">{recipe.category}</span>
        </div>

        {/* Quick View Expansion */}
        {!isRunning && (
          <div className="grid grid-rows-[0fr] group-hover:grid-rows-[1fr] transition-[grid-template-rows] duration-500 ease-in-out">
            <div className="overflow-hidden">
              <div className="opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 ease-out delay-[50ms]">
                <p className="text-xs opacity-70 mt-3 line-clamp-2 leading-relaxed">
                  {recipe.description || 'No description provided.'}
                </p>
                <div className="flex items-center gap-3 mt-3">
                  <span className="text-[9px] uppercase tracking-widest font-bold opacity-40">
                    {recipe.ingredients?.length || 0} Ingredients
                  </span>
                  <span className="w-1 h-1 rounded-full bg-current opacity-20"></span>
                  <span className="text-[9px] uppercase tracking-widest font-bold opacity-40">
                    {recipe.instructions?.length || 0} Steps
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {isRunning && (
          <motion.div 
            initial={{ opacity: 0, x: 20, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.8 }}
            className="relative z-[10] flex items-center gap-2 bg-black/50 backdrop-blur-xl p-2 pl-4 rounded-full border border-white/30 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col border-r border-white/10 pr-2 mr-2">
              <span className="text-[6px] font-black uppercase tracking-[0.2em] text-white/40 leading-none">Cooking</span>
              <div className="flex items-center gap-1 mt-1">
                <button 
                  onClick={(e) => { e.stopPropagation(); setTimeLeft(Math.max(0, timeLeft - 60)); }}
                  className="w-4 h-4 flex flex-col items-center justify-center rounded bg-white/5 hover:bg-white/20 active:scale-90 transition-all text-white/50 hover:text-white"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <div className="text-lg font-mono font-black text-white timer-digit leading-none w-14 text-center">
                  {formatTime(timeLeft)}
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); setTimeLeft(timeLeft + 60); }}
                  className="w-4 h-4 flex flex-col items-center justify-center rounded bg-white/5 hover:bg-white/20 active:scale-90 transition-all text-white/50 hover:text-white"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>
            
            <div className="flex gap-1">
              <button 
                onClick={(e) => { e.stopPropagation(); setIsActive(!isActive); }}
                className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center shadow-lg active:scale-90 transition-all inner-glow"
              >
                {isActive ? <Pause className="w-3.5 h-3.5 fill-black" /> : <Play className="w-3.5 h-3.5 fill-black" />}
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); onStop(); }}
                className="w-8 h-8 rounded-full bg-white/10 border border-white/10 flex items-center justify-center hover:bg-white/20 transition-all"
              >
                <Square className="w-3.5 h-3.5 text-white fill-white/20" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!isRunning && (
        <div className="flex items-center gap-2">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onStart(recipe.id!);
            }}
            className={cn(
              "p-2 rounded-full transition-all opacity-40 group-hover:opacity-100",
              theme.text.includes('white') ? 'bg-white/10 hover:bg-white/20' : 'bg-black/5 hover:bg-black/10'
            )}
            title="Start Timer"
          >
            <Play className="w-4 h-4" />
          </button>
          <ChevronRight className="w-5 h-5 opacity-30 group-hover:opacity-100 transition-opacity" />
        </div>
      )}
    </motion.div>
  );
};

const Dashboard: React.FC<{ onAdd: () => void; onView: (id: number) => void }> = ({ onAdd, onView }) => {
  const { theme, t, settings } = useSettings();
  const recipes = useLiveQuery(() => db.recipes.toArray());

  const [search, setSearch] = useState('');
  const [sortBy, setBy] = useState<'title' | 'createdAt' | 'prepTime'>('createdAt');
  const [sortOrder, setOrder] = useState<'asc' | 'desc'>('desc');
  const [showSort, setShowSort] = useState(false);
  const [activeTags, setActiveTags] = useState<string[]>(['all']);
  const [runningRecipeId, setRunningRecipeId] = useState<number | null>(null);

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
    
    const isFavFilter = activeTags.includes('favorites');
    const matchesFav = !isFavFilter || r.isFavorite;

    const tagFilters = activeTags.filter(t => t !== 'all' && t !== 'favorites');
    const matchesTags = tagFilters.length === 0 || 
                        tagFilters.some(tag => r.tags?.includes(tag) || r.category?.toLowerCase() === tag.toLowerCase());
                        
    return matchesSearch && matchesTags && matchesFav;
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
                      "w-full text-left p-3 rounded-xl flex items-center justify-between text-[11px] font-bold uppercase tracking-widest transition-colors",
                      sortBy === opt.value ? theme.accent : (theme.text.includes('white') ? 'hover:bg-white/5' : 'hover:bg-black/5')
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
        {['all', 'favorites', ...allTags].map(tag => (
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
              "whitespace-nowrap px-6 py-2 rounded-full border text-[10px] uppercase font-bold tracking-widest transition-all gap-2 flex items-center",
              theme.border,
              activeTags.includes(tag) ? theme.accent : "bg-transparent opacity-60"
            )}
          >
            {tag === 'favorites' && <Heart className={cn("w-3 h-3", activeTags.includes('favorites') && "fill-current")} />}
            {tag}
          </button>
        ))}
      </div>

      {/* Recipe Grid */}
      <div className="grid gap-4">
        {filteredRecipes?.map((recipe, idx) => (
          <RecipeCard
            key={recipe.id}
            recipe={recipe}
            idx={idx}
            isRunning={runningRecipeId === recipe.id}
            onView={onView}
            onStart={setRunningRecipeId}
            onStop={() => setRunningRecipeId(null)}
            onToggleFavorite={(id) => {
              const r = recipes?.find(rec => rec.id === id);
              if (r) db.recipes.update(id, { isFavorite: !r.isFavorite });
            }}
          />
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
