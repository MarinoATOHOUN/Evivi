
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Camera, Plus, Minus, Clock, Users, ChevronRight, Check, Trash2, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PageWrapper from '../../components/layout/PageWrapper';

import { recipeService } from '../../services/recipe.service';

const COOKING_TIMES = ["15 mins", "30 mins", "45 mins", "1 hour", "1.5 hours", "2 hours", "3 hours+"];
const SERVING_OPTIONS = ["1", "2", "3", "4", "5", "6", "8", "10+"];

interface Ingredient {
  name: string;
  amount: string;
}

const CreateRecipe: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { name: '', amount: '' },
    { name: '', amount: '' }
  ]);
  const [steps, setSteps] = useState<string[]>(['', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Picker states
  const [isCookingTimePickerOpen, setIsCookingTimePickerOpen] = useState(false);
  const [isServingsPickerOpen, setIsServingsPickerOpen] = useState(false);

  // Selected values
  const [cookingTime, setCookingTime] = useState("45 mins");
  const [servings, setServings] = useState("4");

  // Handlers for Images
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles = Array.from(files);
      setImageFiles(prev => [...prev, ...newFiles]);

      newFiles.forEach((file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImages(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
    setImageFiles(imageFiles.filter((_, i) => i !== index));
  };

  const handlePublish = async () => {
    if (!title.trim()) {
      setError("Please provide a title for your recipe");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const recipeData = {
        title,
        description,
        ingredients: ingredients
          .filter(ing => ing.name.trim() !== '')
          .map((ing, index) => ({
            name: ing.name,
            amount: ing.amount,
            unit: '', // Backend expects this field
            order: index
          })),
        steps: steps
          .filter(step => step.trim() !== '')
          .map((step, index) => ({
            text: step,
            order: index
          })),
        cooking_time: cookingTime,
        servings: servings,
        difficulty: 'medium',
      };

      await recipeService.createRecipe(recipeData, imageFiles);
      navigate('/');
    } catch (err: any) {
      console.error("Publish error detail:", err.response?.data);
      const errorData = err.response?.data;
      if (errorData && typeof errorData === 'object') {
        const messages = Object.keys(errorData).map(key => {
          const val = errorData[key];
          return `${key}: ${Array.isArray(val) ? val.join(', ') : val}`;
        });
        setError(messages.join(' | '));
      } else {
        setError(err.response?.data?.message || err.response?.data?.error || "Failed to publish recipe. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handlers for Ingredients
  const addIngredient = () => setIngredients([...ingredients, { name: '', amount: '' }]);
  const removeIngredient = (index: number) => {
    if (ingredients.length > 1) {
      setIngredients(ingredients.filter((_, i) => i !== index));
    }
  };
  const updateIngredient = (index: number, field: keyof Ingredient, value: string) => {
    const newIngredients = [...ingredients];
    newIngredients[index][field] = value;
    setIngredients(newIngredients);
  };

  // Handlers for Steps
  const addStep = () => setSteps([...steps, '']);
  const removeStep = (index: number) => {
    if (steps.length > 1) {
      setSteps(steps.filter((_, i) => i !== index));
    }
  };
  const updateStep = (index: number, value: string) => {
    const newSteps = [...steps];
    newSteps[index] = value;
    setSteps(newSteps);
  };

  const PickerModal = ({
    isOpen,
    onClose,
    title,
    options,
    selectedValue,
    onSelect
  }: {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    options: string[];
    selectedValue: string;
    onSelect: (val: string) => void;
  }) => (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[150] flex items-end justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="relative w-full max-w-md bg-white rounded-t-[40px] p-6 pb-12 shadow-2xl"
          >
            <div className="w-12 h-1 bg-gray-200 rounded-full mx-auto mb-6" />
            <h3 className="text-xl font-black text-gray-900 mb-6 text-center">{title}</h3>
            <div className="grid grid-cols-2 gap-3">
              {options.map((option) => (
                <button
                  key={option}
                  onClick={() => {
                    onSelect(option);
                    onClose();
                  }}
                  className={`py-4 px-4 rounded-2xl font-bold text-sm transition-all flex items-center justify-between border ${selectedValue === option
                    ? 'bg-[#E85D1A] border-[#E85D1A] text-white shadow-lg shadow-orange-900/10'
                    : 'bg-white border-gray-100 text-gray-600 active:bg-gray-50'
                    }`}
                >
                  {option}
                  {selectedValue === option && <Check size={16} strokeWidth={3} />}
                </button>
              ))}
            </div>
            <button
              onClick={onClose}
              className="w-full mt-6 py-4 bg-gray-100 text-gray-500 font-bold rounded-2xl active:scale-95 transition-transform"
            >
              Cancel
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return (
    <PageWrapper withPadding={false} className="bg-white">
      <header className="px-4 py-4 flex items-center justify-between border-b border-gray-50 sticky top-0 bg-white z-40">
        <button onClick={() => navigate(-1)} className="text-gray-800 active:scale-90 transition-transform"><X size={24} /></button>
        <h1 className="text-lg font-bold">Create New Recipe</h1>
        <button className="text-[#E85D1A] font-semibold active:opacity-70">Drafts</button>
      </header>

      <div className="p-4 space-y-8 pb-32">
        {/* Cover Photo / Image Upload */}
        <div className="space-y-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            multiple
            accept="image/*"
            className="hidden"
          />

          <div
            onClick={() => fileInputRef.current?.click()}
            className="aspect-[16/9] bg-[#F3EBE5] rounded-3xl border-2 border-dashed border-orange-200 flex flex-col items-center justify-center text-center gap-2 active:bg-orange-50/30 transition-colors cursor-pointer group"
          >
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-[#E85D1A] shadow-sm group-active:scale-90 transition-transform">
              <Camera size={24} />
            </div>
            <span className="text-sm font-bold text-gray-800">Add Photos</span>
            <span className="text-[10px] text-gray-400 font-medium">Add one or more images</span>
          </div>

          {/* Previews */}
          {images.length > 0 && (
            <div className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar">
              {images.map((img, i) => (
                <div key={i} className="relative shrink-0 w-28 h-28 rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
                  <img src={img} className="w-full h-full object-cover" alt={`Preview ${i}`} />
                  <button
                    onClick={(e) => { e.stopPropagation(); removeImage(i); }}
                    className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/40 backdrop-blur-md text-white rounded-full flex items-center justify-center active:scale-90 transition-transform"
                  >
                    <X size={14} strokeWidth={3} />
                  </button>
                </div>
              ))}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="shrink-0 w-28 h-28 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-400 bg-gray-50 active:bg-gray-100 transition-colors"
              >
                <Plus size={24} />
              </button>
            </div>
          )}
        </div>

        {/* Title */}
        <div className="space-y-2">
          <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Recipe Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Smoky Jollof Rice with Plantain"
            className="w-full bg-white border border-gray-200 rounded-2xl px-5 py-4 text-[15px] font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-100 transition-all placeholder:text-gray-300 shadow-sm"
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Description</label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Share the history or the secret to this dish..."
            className="w-full bg-white border border-gray-200 rounded-2xl px-5 py-4 text-[15px] font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-100 transition-all placeholder:text-gray-300 shadow-sm resize-none"
          ></textarea>
        </div>

        {/* Ingredients */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Ingredients</h3>
            <span className="text-[10px] font-black text-[#E85D1A] uppercase tracking-wider">{ingredients.length} Items Added</span>
          </div>

          <div className="space-y-3">
            {ingredients.map((ing, i) => (
              <div key={i} className="grid grid-cols-[1fr_80px_40px] gap-2 items-center group">
                <input
                  type="text"
                  value={ing.name}
                  onChange={(e) => updateIngredient(i, 'name', e.target.value)}
                  placeholder="Ingredient"
                  className="bg-white border border-gray-200 rounded-2xl px-4 py-3.5 text-sm font-semibold focus:ring-2 focus:ring-orange-100 focus:outline-none shadow-sm placeholder:text-gray-300 min-w-0"
                />
                <input
                  type="text"
                  value={ing.amount}
                  onChange={(e) => updateIngredient(i, 'amount', e.target.value)}
                  placeholder="Qty"
                  className="bg-white border border-gray-200 rounded-2xl px-2 py-3.5 text-sm font-semibold text-center focus:ring-2 focus:ring-orange-100 focus:outline-none shadow-sm placeholder:text-gray-300 min-w-0"
                />
                <button
                  onClick={() => removeIngredient(i)}
                  className="w-10 h-10 flex items-center justify-center text-gray-300 hover:text-red-500 active:scale-90 transition-all shrink-0"
                >
                  <Minus size={20} />
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={addIngredient}
            className="flex items-center gap-2 bg-orange-50 text-[#E85D1A] px-6 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest active:scale-95 transition-transform border border-orange-100/50"
          >
            <Plus size={16} strokeWidth={3} /> Add Ingredient
          </button>
        </div>

        {/* Steps */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Preparation Steps</h3>
            <span className="text-[10px] font-black text-[#E85D1A] uppercase tracking-wider">{steps.length} Steps</span>
          </div>

          <div className="space-y-6">
            {steps.map((step, i) => (
              <div key={i} className="flex gap-4">
                <div className={`w-10 h-10 shrink-0 rounded-2xl flex items-center justify-center text-xs font-black shadow-lg transition-all ${step.trim().length > 0 ? 'bg-[#E85D1A] text-white shadow-orange-900/10' : 'bg-white border border-gray-100 text-gray-300'
                  }`}>
                  {i + 1}
                </div>
                <div className="flex-1 relative">
                  <textarea
                    value={step}
                    onChange={(e) => updateStep(i, e.target.value)}
                    placeholder="Describe this step..."
                    className="w-full bg-white border border-gray-200 rounded-2xl px-5 py-4 pr-12 text-[15px] font-semibold text-gray-900 focus:ring-2 focus:ring-orange-100 focus:outline-none shadow-sm resize-none min-h-[100px]"
                  />
                  <button
                    onClick={() => removeStep(i)}
                    className="absolute right-3 top-3 text-gray-300 hover:text-red-500 active:scale-90 transition-all"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={addStep}
            className="flex items-center gap-2 bg-orange-50 text-[#E85D1A] px-6 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest active:scale-95 transition-transform border border-orange-100/50"
          >
            <Plus size={16} strokeWidth={3} /> Add Step
          </button>
        </div>

        {/* Details List */}
        <div className="space-y-3 pt-4">
          <button
            onClick={() => setIsCookingTimePickerOpen(true)}
            className="w-full flex items-center justify-between p-5 bg-white border border-gray-100 rounded-3xl shadow-sm active:scale-[0.98] transition-all hover:border-orange-100"
          >
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-[#E85D1A] shrink-0">
                <Clock size={24} />
              </div>
              <div className="text-left">
                <p className="text-[15px] font-black text-gray-900 leading-tight">Cooking Time</p>
                <p className="text-[11px] text-[#E85D1A] font-bold uppercase tracking-tight mt-0.5">Approx. {cookingTime}</p>
              </div>
            </div>
            <ChevronRight size={22} className="text-gray-300" />
          </button>

          <button
            onClick={() => setIsServingsPickerOpen(true)}
            className="w-full flex items-center justify-between p-5 bg-white border border-gray-100 rounded-3xl shadow-sm active:scale-[0.98] transition-all hover:border-orange-100"
          >
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-[#E85D1A] shrink-0">
                <Users size={24} />
              </div>
              <div className="text-left">
                <p className="text-[15px] font-black text-gray-900 leading-tight">Servings</p>
                <p className="text-[11px] text-[#E85D1A] font-bold uppercase tracking-tight mt-0.5">Feeds {servings} people</p>
              </div>
            </div>
            <ChevronRight size={22} className="text-gray-300" />
          </button>
        </div>
      </div>

      {error && (
        <div className="fixed bottom-24 left-4 right-4 z-40 p-4 bg-red-50 text-red-600 rounded-2xl text-[11px] font-black uppercase tracking-widest border border-red-100 shadow-lg animate-shake">
          {error}
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-lg border-t border-gray-100 z-40">
        <button
          onClick={handlePublish}
          disabled={isLoading}
          className={`w-full bg-[#E85D1A] text-white font-black py-3.5 rounded-2xl shadow-xl shadow-orange-900/20 active:scale-[0.98] transition-all text-xs tracking-[0.2em] uppercase ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          {isLoading ? 'Publishing...' : 'Publish Recipe'}
        </button>
      </div>

      {/* Picker Modals */}
      <PickerModal
        isOpen={isCookingTimePickerOpen}
        onClose={() => setIsCookingTimePickerOpen(false)}
        title="Cooking Time"
        options={COOKING_TIMES}
        selectedValue={cookingTime}
        onSelect={setCookingTime}
      />

      <PickerModal
        isOpen={isServingsPickerOpen}
        onClose={() => setIsServingsPickerOpen(false)}
        title="Number of Servings"
        options={SERVING_OPTIONS}
        selectedValue={servings}
        onSelect={setServings}
      />
    </PageWrapper>
  );
};

export default CreateRecipe;
