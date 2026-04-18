import React, { useState } from 'react';
import { Recipe, Ingredient } from '../types';
import { useSettings } from './SettingsContext';
import { db } from '../db';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, Image as ImageIcon, Check, Info, ChefHat } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const CATEGORIES = ['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Dessert', 'Drink'];
const UNITS = ['g', 'kg', 'ml', 'l', 'cup', 'tsp', 'tbsp', 'pcs', 'slice'];

const COMMON_INGREDIENTS = [
  'Sugar', 'Salt', 'Flour', 'Butter', 'Egg', 'Milk', 'Water', 'Oil', 'Onion', 'Garlic', 
  'Chicken', 'Beef', 'Pork', 'Rice', 'Noodles', 'Potato', 'Tomato', 'Lemon', 'Pepper', 
  'Ginger', 'Soy Sauce', 'Chili', 'Spinach', 'Carrot', 'Cheese', 'Cream'
];

const RecipeForm: React.FC<{ initialRecipe?: Recipe; onCancel: () => void; onSuccess: () => void }> = ({ initialRecipe, onCancel, onSuccess }) => {
  const { theme, t } = useSettings();
  const [title, setTitle] = useState(initialRecipe?.title || '');
  const [description, setDescription] = useState(initialRecipe?.description || '');
  const [category, setCategory] = useState(initialRecipe?.category || 'Main');
  const [prepTime, setPrepTime] = useState(initialRecipe?.prepTime || '20 min');
  const [ingredients, setIngredients] = useState<Ingredient[]>(initialRecipe?.ingredients || []);
  const [instructions, setInstructions] = useState<string[]>(initialRecipe?.instructions || ['']);
  const [image, setImage] = useState<string | null>(initialRecipe?.image || null);
  const [servings, setServings] = useState(initialRecipe?.servings || 2);
  const [tags, setTags] = useState<string[]>(initialRecipe?.tags || []);
  const [tagInput, setTagInput] = useState('');

  const handleAddTag = (e?: React.KeyboardEvent) => {
    if (e && e.key !== 'Enter' && e.key !== ',') return;
    if (e) e.preventDefault();
    
    const cleanTag = tagInput.trim().replace(/,/g, '').toLowerCase();
    if (cleanTag && !tags.includes(cleanTag)) {
      setTags([...tags, cleanTag]);
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const handleAddIngredient = () => {
    setIngredients([...ingredients, { id: Math.random().toString(), name: '', amount: 0, unit: 'g' }]);
  };

  const handleUpdateIngredient = (id: string, field: keyof Ingredient, value: any) => {
    setIngredients(prev => prev.map(ing => ing.id === id ? { ...ing, [field]: value } : ing));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!title) return;
    const recipeData = {
      title,
      description,
      category,
      prepTime,
      servings,
      ingredients,
      instructions: instructions.filter(i => i.trim()),
      image: image || undefined,
      createdAt: initialRecipe?.createdAt || Date.now(),
      tags: tags.length > 0 ? tags : [category.toLowerCase()],
    };

    if (initialRecipe?.id) {
      await db.recipes.update(initialRecipe.id, recipeData);
    } else {
      await db.recipes.add(recipeData);
    }
    onSuccess();
  };

  return (
    <div className="space-y-8 pb-32">
      {/* Visual Header */}
      <div className={cn("relative h-64 w-full rounded-3xl overflow-hidden border border-dashed border-current transition-opacity", theme.id === 'frosted' ? 'glass-panel !border-white/20' : 'opacity-40 hover:opacity-100')}>
        {image ? (
          <img src={image} className="w-full h-full object-cover" />
        ) : (
          <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer group">
            <ChefHat className="w-16 h-16 mb-4 opacity-10 group-hover:opacity-40 transition-opacity" strokeWidth={1} />
            <div className="flex flex-col items-center">
              <ImageIcon className="w-6 h-6 mb-2 opacity-30" />
              <span className="text-[10px] uppercase font-bold tracking-widest opacity-40">{initialRecipe ? t.editRecipe : t.addRecipe} Image</span>
            </div>
            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
          </label>
        )}
      </div>

      <div className="space-y-4">
        <input
          placeholder="Title of Recipe"
          className="text-4xl font-black bg-transparent border-none focus:ring-0 w-full placeholder:opacity-20 uppercase tracking-tighter"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          placeholder="Describe your masterpiece..."
          className="w-full bg-transparent border-none focus:ring-0 italic opacity-60 text-lg"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      {/* Tags Section */}
      <section className="space-y-4">
        <div className="flex flex-wrap gap-2 mb-3">
          <AnimatePresence>
            {tags.map(tag => (
              <motion.span
                key={tag}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={() => removeTag(tag)}
                className={cn(
                  "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 cursor-pointer transition-all",
                  theme.accent
                )}
              >
                {tag}
                <X className="w-3 h-3" />
              </motion.span>
            ))}
          </AnimatePresence>
        </div>
        <div className="relative">
          <Plus className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-30" />
          <input
            placeholder="Add tags... (Enter or comma to save)"
            className={cn(
              "w-full pl-10 pr-4 py-3 rounded-xl border bg-transparent focus:outline-none focus:border-opacity-100 transition-all font-bold uppercase text-[10px] tracking-widest",
              theme.border
            )}
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleAddTag}
            onBlur={() => handleAddTag()}
          />
        </div>
      </section>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-[10px] uppercase font-black opacity-40 mb-2 block tracking-widest">Category</label>
          <select
            className={cn("w-full bg-transparent p-3 rounded-xl border border-current border-opacity-20 appearance-none font-bold uppercase text-xs", theme.text)}
            value={category}
            style={{ color: 'inherit' }}
            onChange={(e) => setCategory(e.target.value)}
          >
            {CATEGORIES.map(c => <option key={c} value={c} className="bg-white text-black">{c}</option>)}
          </select>
        </div>
        <div>
          <label className="text-[10px] uppercase font-black opacity-40 mb-2 block tracking-widest">Prep Time</label>
          <input
            className="w-full bg-transparent p-3 rounded-xl border border-current border-opacity-20"
            value={prepTime}
            onChange={(e) => setPrepTime(e.target.value)}
          />
        </div>
        <div>
          <label className="text-[10px] uppercase font-black opacity-40 mb-2 block tracking-widest">Base Servings</label>
          <input
            type="number"
            className="w-full bg-transparent p-3 rounded-xl border border-current border-opacity-20 font-bold"
            value={servings}
            onChange={(e) => setServings(parseInt(e.target.value) || 1)}
          />
        </div>
      </div>

      {/* Ingredients Section */}
      <section className="space-y-6">
        <div className="flex flex-col gap-1 border-b pb-4 border-current border-opacity-10">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-2xl uppercase tracking-tight">{t.ingredients}</h3>
            <button 
              onClick={handleAddIngredient} 
              className={cn("p-2 border rounded-full transition-all flex items-center gap-2 px-4 hover:scale-105 active:scale-95", theme.accent)}
            >
              <Plus className="w-4 h-4" />
              <span className="text-[10px] uppercase font-bold tracking-widest">Add Item</span>
            </button>
          </div>
          <p className="text-[10px] uppercase font-bold opacity-40 tracking-widest">List all components needed for this recipe</p>
        </div>

        <div className="space-y-4">
          <AnimatePresence initial={false}>
            {ingredients.map((ing, idx) => (
              <motion.div 
                key={ing.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={cn(
                  "flex flex-col gap-2 p-5 rounded-3xl border transition-all",
                  theme.id === 'frosted' ? 'glass-panel !border-white/10' : (theme.text.includes('white') ? 'bg-white/5 border-current border-opacity-5' : 'bg-black/5 border-current border-opacity-5')
                )}
              >
                <div className="flex gap-2">
                  <input
                    placeholder="Ingredient Name (e.g. Flour)"
                    list="ingredients-list"
                    className="flex-1 bg-transparent border-b border-current border-opacity-10 p-2 focus:border-opacity-100 outline-none text-lg font-bold"
                    value={ing.name}
                    onChange={(e) => handleUpdateIngredient(ing.id, 'name', e.target.value)}
                  />
                  <button 
                    onClick={() => setIngredients(prev => prev.filter(i => i.id !== ing.id))}
                    className="p-2 text-red-500 opacity-40 hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="flex gap-3 items-center mt-1">
                  <div className="flex-1">
                    <input
                      type="number"
                      placeholder="Qty"
                      className="w-full bg-transparent border-b border-current border-opacity-10 p-2 focus:border-opacity-100 outline-none font-mono"
                      value={isNaN(ing.amount) ? '' : ing.amount}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        handleUpdateIngredient(ing.id, 'amount', isNaN(val) ? 0 : val);
                      }}
                    />
                    <span className="text-[10px] opacity-60 font-bold uppercase block mt-1 tracking-widest">Amount</span>
                  </div>
                  <div className="flex-1">
                    <select
                      className="w-full bg-transparent border-b border-current border-opacity-10 p-2 focus:border-opacity-100 outline-none font-bold uppercase text-xs appearance-none"
                      value={ing.unit}
                      style={{ color: 'inherit' }}
                      onChange={(e) => handleUpdateIngredient(ing.id, 'unit', e.target.value)}
                    >
                      {UNITS.map(u => <option key={u} value={u} className="bg-white text-black">{u}</option>)}
                    </select>
                    <span className="text-[10px] opacity-60 font-bold uppercase block mt-1 tracking-widest">Unit</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {ingredients.length === 0 && (
            <div className="py-8 text-center border-2 border-dashed border-current border-opacity-10 rounded-3xl opacity-50 italic text-sm">
              No ingredients added yet.
            </div>
          )}
        </div>
      </section>

      {/* Instructions */}
      <section className="space-y-6">
        <div className="flex flex-col gap-1 border-b pb-4 border-current border-opacity-10">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-2xl uppercase tracking-tight">{t.instructions}</h3>
            <button
              onClick={() => setInstructions([...instructions, ''])}
              className={cn("p-2 border rounded-full transition-all flex items-center gap-2 px-4 hover:scale-105 active:scale-95", theme.accent)}
            >
              <Plus className="w-4 h-4" />
              <span className="text-[10px] uppercase font-bold tracking-widest">Add Step</span>
            </button>
          </div>
          <p className="text-[10px] uppercase font-bold opacity-40 tracking-widest">Step-by-step preparation guide</p>
        </div>

        <div className="space-y-6">
          <AnimatePresence initial={false}>
            {instructions.map((step, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex gap-4 group"
              >
                <div className="flex flex-col items-center gap-2 shrink-0">
                  <span className="font-black text-5xl opacity-10">{idx + 1}</span>
                  {instructions.length > 1 && (
                    <button 
                      onClick={() => setInstructions(prev => prev.filter((_, i) => i !== idx))}
                      className="p-1 text-red-500 opacity-0 group-hover:opacity-40 hover:!opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <textarea
                    placeholder={`Step ${idx + 1} details...`}
                    className="w-full bg-transparent border border-current border-opacity-10 p-5 rounded-2xl focus:border-opacity-100 outline-none min-h-[120px] text-lg leading-relaxed shadow-sm transition-all focus:shadow-md"
                    value={step}
                    onChange={(e) => {
                      const newSteps = [...instructions];
                      newSteps[idx] = e.target.value;
                      setInstructions(newSteps);
                    }}
                  />
                  <span className="text-[10px] opacity-60 font-bold uppercase tracking-widest">Actionable direction</span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </section>

      {/* Actions */}
      <div className={cn(
        "fixed bottom-0 left-0 right-0 p-6 pt-4 pb-8 flex gap-4 z-50 backdrop-blur-xl border-t transition-all",
        theme.id === 'frosted' ? 'glass-panel !rounded-none !border-white/10' : `${theme.bg} ${theme.border} bg-opacity-90`
      )}>
        <button
          onClick={onCancel}
          className={cn(
            "flex-1 py-4 px-6 rounded-2xl border border-current border-opacity-20 font-bold uppercase tracking-widest text-[10px] transition-all",
            theme.text.includes('white') ? 'hover:bg-white/5' : 'hover:bg-black/5'
          )}
        >
          {t.cancel}
        </button>
        <button
          onClick={handleSubmit}
          className={cn(
            "flex-[2] py-4 px-6 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-2xl relative overflow-hidden group",
            theme.accent
          )}
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
          {t.save}
        </button>
      </div>
    </div>
  );
};

export default RecipeForm;
