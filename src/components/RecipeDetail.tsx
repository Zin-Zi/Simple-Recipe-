import React, { useState } from 'react';
import { Recipe } from '../types';
import { useSettings } from './SettingsContext';
import { db } from '../db';
import { motion, AnimatePresence } from 'motion/react';
import { Edit2, Share2, FileDown, Trash2, Printer, Scale, History, User, ChevronRight, ChefHat, AlertTriangle, Plus, Minus, CheckCircle2 } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const RecipeDetail: React.FC<{ recipe: Recipe; onBack: () => void; onDelete: () => void; onEdit: () => void }> = ({ recipe, onBack, onDelete, onEdit }) => {
  const { theme, t } = useSettings();
  const [servings, setServings] = useState(recipe.servings || 2);
  const [completedSteps, setCompletedSteps] = useState<number[]>(recipe.completedSteps || []);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const baseServings = recipe.servings || 2;
  const scale = servings / baseServings;

  const toggleStep = (idx: number) => {
    const newSteps = completedSteps.includes(idx)
      ? completedSteps.filter(s => s !== idx)
      : [...completedSteps, idx];
    setCompletedSteps(newSteps);
    if (recipe.id) {
      db.recipes.update(recipe.id, { completedSteps: newSteps });
    }
  };

  const handleExportPdf = () => {
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.text(recipe.title, 10, 20);
    doc.setFontSize(14);
    doc.text(recipe.description, 10, 30);

    doc.setFontSize(18);
    doc.text("Ingredients", 10, 50);
    recipe.ingredients.forEach((ing, i) => {
      doc.setFontSize(12);
      doc.text(`${ing.name}: ${ing.amount * scale} ${ing.unit}`, 15, 60 + (i * 10));
    });

    doc.setFontSize(18);
    doc.text("Instructions", 10, 100 + (recipe.ingredients.length * 10));
    recipe.instructions.forEach((ins, i) => {
      doc.setFontSize(10);
      doc.text(`${i + 1}. ${ins}`, 15, 110 + (recipe.ingredients.length * 10) + (i * 10), { maxWidth: 180 });
    });

    doc.save(`${recipe.title}.pdf`);
  };

  const handleExportTxt = () => {
    const text = `
${recipe.title}
${recipe.description}

Ingredients:
${recipe.ingredients.map(ing => `- ${ing.name}: ${ing.amount * scale} ${ing.unit}`).join('\n')}

Instructions:
${recipe.instructions.map((ins, i) => `${i + 1}. ${ins}`).join('\n')}
    `;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${recipe.title}.txt`;
    a.click();
  };

  return (
    <div className="space-y-8 pb-32">
      <div className={cn(
        "relative aspect-video rounded-3xl overflow-hidden border border-current border-opacity-10",
        theme.text.includes('white') ? 'bg-white/5' : 'bg-black/5'
      )}>
        {recipe.image ? (
          <img src={recipe.image} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center opacity-10 select-none">
            <ChefHat className="w-32 h-32" strokeWidth={1} />
          </div>
        )}
        {/* Quick Actions Overlay */}
        <div className="absolute top-4 right-4 flex gap-2">
          <button onClick={onEdit} className="p-3 bg-white/80 backdrop-blur text-black rounded-full shadow-lg hover:scale-110 transition-transform">
            <Edit2 className="w-5 h-5" />
          </button>
          <button onClick={handleExportPdf} className="p-3 bg-white/80 backdrop-blur text-black rounded-full shadow-lg hover:scale-110 transition-transform">
            <FileDown className="w-5 h-5" />
          </button>
          <button onClick={() => setShowDeleteConfirm(true)} className="p-3 bg-red-500/80 backdrop-blur text-white rounded-full shadow-lg hover:scale-110 transition-transform">
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/40 backdrop-blur-xl">
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
                <h2 className="text-2xl font-black uppercase tracking-tight">Delete Recipe?</h2>
                <p className="text-sm opacity-60 leading-relaxed font-medium">
                  "{recipe.title}" will be permanently removed.
                </p>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className={cn(
                    "flex-1 py-4 border border-current border-opacity-10 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all",
                    theme.text.includes('white') ? 'hover:bg-white/5' : 'hover:bg-black/5'
                  )}
                >
                  Cancel
                </button>
                <button
                  onClick={onDelete}
                  className="flex-1 py-4 bg-red-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-red-600/30 hover:bg-red-700 transition-all"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="space-y-4">
        <h2 className="text-5xl font-black uppercase tracking-tighter leading-none">{recipe.title}</h2>
        <div className="flex gap-4 text-[11px] font-bold uppercase tracking-[0.2em] opacity-50">
          <span>{recipe.category}</span>
          <span>•</span>
          <span>{recipe.prepTime}</span>
        </div>
        <p className="italic opacity-70 text-lg leading-relaxed">{recipe.description}</p>
      </div>

      <hr className={cn("border-t", theme.border)} />

      {/* Scaling Controls (Auto-Scaler) */}
      <section className={cn(
        "p-4 md:p-5 rounded-3xl border relative flex flex-col sm:flex-row sm:items-center justify-between gap-4",
        theme.id === 'frosted' ? 'glass-panel !border-white/10' : (theme.text.includes('white') ? 'bg-white/5 border-current border-opacity-5' : 'bg-black/5 border-current border-opacity-5')
      )}>
        <div className="flex items-center gap-3 shrink-0">
          <Scale className="w-5 h-5 opacity-40 hidden sm:block" />
          <div className="space-y-0.5">
            <h3 className="font-black text-sm uppercase tracking-tight leading-none">Auto-Scaler</h3>
            <p className="text-[8px] uppercase font-bold opacity-50 tracking-widest leading-none">Adjust portions</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex flex-1 sm:flex-none border border-current border-opacity-20 rounded-lg overflow-hidden text-[10px] font-bold uppercase">
            {[1, 0.5, 0.33, 0.25].map((s) => {
              const isActive = Math.abs((servings / baseServings) - s) < 0.01;
              return (
                <button
                  key={s}
                  onClick={() => setServings(baseServings * s)}
                  className={cn(
                    "flex-1 sm:w-11 py-1.5 transition-colors text-center",
                    isActive ? theme.accent : (theme.text.includes('white') ? 'hover:bg-white/5' : 'hover:bg-black/5')
                  )}
                >
                  {s === 1 ? '1x' : s === 0.5 ? '1/2' : s === 0.33 ? '1/3' : '1/4'}
                </button>
              );
            })}
          </div>

          <div className="hidden sm:block w-px h-6 bg-current opacity-10"></div>

          <div className={cn(
            "flex items-center gap-1 rounded-xl p-1 border border-current border-opacity-5 shrink-0",
            theme.text.includes('white') ? 'bg-white/5' : 'bg-black/5'
          )}>
            <button 
              onClick={() => setServings(Math.max(0.25, servings - 1))}
              className={cn(
                "w-7 h-7 rounded-lg flex items-center justify-center transition-all active:scale-90",
                theme.text.includes('white') ? 'hover:bg-white/10' : 'hover:bg-black/10'
              )}
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <div className="text-center min-w-[32px]">
              <div className="text-sm font-black leading-none">{Number.isInteger(servings) ? servings : servings.toFixed(1)}</div>
            </div>
            <button 
              onClick={() => setServings(servings + 1)}
              className={cn(
                "w-7 h-7 rounded-lg flex items-center justify-center transition-all active:scale-90",
                theme.text.includes('white') ? 'hover:bg-white/10' : 'hover:bg-black/10'
              )}
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* Ingredients */}
      <section>
        <h3 className="font-black text-2xl uppercase tracking-tight mb-6">{t.ingredients}</h3>
        <div className="grid gap-3">
          {recipe.ingredients.map((ing) => (
            <div 
              key={ing.id} 
              className={cn(
                "flex justify-between items-center p-5 rounded-[2rem] border transition-all",
                theme.id === 'frosted' ? 'glass-panel !border-white/10' : (theme.text.includes('white') ? 'bg-white/5 border-current border-opacity-5' : 'bg-black/5 border-current border-opacity-5')
              )}
            >
              <span className="font-bold opacity-90 text-sm tracking-tight">{ing.name}</span>
              <span className={cn(
                "font-mono text-[10px] px-3 py-1.5 rounded-xl font-black shadow-sm uppercase tracking-widest",
                theme.id === 'frosted' ? 'bg-white text-black' : theme.accent
              )}>
                {(ing.amount * scale).toFixed(ing.amount * scale % 1 === 0 ? 0 : 2)} {ing.unit}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3 className="font-black text-2xl uppercase tracking-tight mb-6">{t.instructions}</h3>
        <div className="space-y-6">
          {recipe.instructions.map((step, idx) => (
            <button 
              key={idx} 
              onClick={() => toggleStep(idx)}
              className={cn(
                "flex gap-6 w-full text-left p-6 rounded-[2.5rem] border transition-all relative group",
                completedSteps.includes(idx) 
                  ? "bg-green-500/10 border-green-500/20 opacity-40 shadow-inner" 
                  : theme.id === 'frosted' ? 'glass-panel !border-white/10' : (theme.text.includes('white') ? 'bg-white/5 border-current border-opacity-5' : 'bg-black/5 border-current border-opacity-5')
              )}
            >
              <div className={cn(
                "w-12 h-12 rounded-full border-2 flex items-center justify-center shrink-0 font-black text-xs transition-all",
                completedSteps.includes(idx) 
                  ? "bg-green-500 border-green-500 text-white" 
                  : "border-current border-opacity-20 group-hover:border-opacity-100"
              )}>
                {completedSteps.includes(idx) ? <CheckCircle2 className="w-6 h-6" /> : idx + 1}
              </div>
              <p className={cn(
                "text-lg leading-relaxed flex-1 pt-1 transition-all",
                completedSteps.includes(idx) ? "line-through" : ""
              )}>
                {step}
              </p>
            </button>
          ))}
        </div>
      </section>

      <div className="pt-12 text-center opacity-30 text-[10px] font-bold uppercase tracking-widest">
        End of Recipe
      </div>
    </div>
  );
};

export default RecipeDetail;
