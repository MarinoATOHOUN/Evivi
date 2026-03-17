
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Share2, Bookmark, MapPin, MoreHorizontal, Check, AlertCircle, EyeOff, UserMinus, ChevronLeft, ChevronRight } from 'lucide-react';
import { Recipe } from '../../types/recipe';
import { motion, AnimatePresence } from 'framer-motion';
import { recipeService } from '../../services/recipe.service';

interface RecipeCardProps {
  recipe: Recipe;
  onCommentClick?: () => void;
  onSaveToggle?: (recipeId: string, isSaved: boolean) => void;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, onCommentClick, onSaveToggle }) => {
  const [isCopied, setIsCopied] = useState(false);
  const [isSaved, setIsSaved] = useState(recipe.is_saved || false);
  const [isLiked, setIsLiked] = useState(recipe.is_liked || false);
  const [likesCount, setLikesCount] = useState(recipe.likes_count || 0);
  const [showOptions, setShowOptions] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const recipeUrl = `${window.location.origin}/#/recipe/${recipe.id}`;
    navigator.clipboard.writeText(recipeUrl);

    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isSaving) return;

    setIsSaving(true);
    try {
      const response = await recipeService.toggleSave(recipe.id);
      const newSavedState = response.is_saved;
      setIsSaved(newSavedState);
      onSaveToggle?.(recipe.id, newSavedState);
    } catch (error) {
      console.error('Failed to toggle save:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isLiking) return;

    setIsLiking(true);
    try {
      const response = await recipeService.toggleLike(recipe.id);
      setIsLiked(response.is_liked);
      setLikesCount(response.likes_count);
    } catch (error) {
      console.error('Failed to toggle like:', error);
    } finally {
      setIsLiking(false);
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return `${minutes}m ago`;
  };

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (recipe.images.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % recipe.images.length);
    }
  };

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (recipe.images.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + recipe.images.length) % recipe.images.length);
    }
  };

  const images = recipe.images.length > 0
    ? recipe.images.map(img => img.image)
    : ['https://picsum.photos/seed/recipe-' + recipe.id + '/600/600'];

  return (
    <div className="bg-white rounded-3xl mb-6 overflow-hidden shadow-sm border border-gray-100">
      <div className="p-4 flex items-center justify-between">
        <Link
          to={`/profile/${recipe.author.username}`}
          className="flex items-center gap-3 active:opacity-70 transition-opacity"
          title="View Profile"
        >
          <img
            src={recipe.author.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + recipe.author.username}
            className="w-10 h-10 rounded-full object-cover border border-gray-50"
            alt={recipe.author.username}
          />
          <div>
            <h3 className="font-bold text-sm text-gray-900">@{recipe.author.username}</h3>
            <div className="flex items-center text-[10px] text-gray-400 gap-1">
              <MapPin size={10} />
              <span>{recipe.author.location || 'Kitchen'} • {formatTime(recipe.created_at)}</span>
            </div>
          </div>
        </Link>

        <div className="relative">
          <button
            onClick={() => setShowOptions(!showOptions)}
            className={`p-2 rounded-full transition-colors ${showOptions ? 'bg-gray-100 text-gray-900' : 'text-gray-400'}`}
          >
            <MoreHorizontal size={20} />
          </button>

          <AnimatePresence>
            {showOptions && (
              <>
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setShowOptions(false)}
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  className="absolute right-0 top-12 w-48 bg-white border border-gray-100 rounded-2xl shadow-xl z-30 py-2 overflow-hidden"
                >
                  <button className="w-full text-left px-4 py-3 text-sm font-semibold text-gray-700 flex items-center gap-3 active:bg-gray-50">
                    <EyeOff size={18} className="text-gray-400" />
                    Not interested
                  </button>
                  <button className="w-full text-left px-4 py-3 text-sm font-semibold text-gray-700 flex items-center gap-3 active:bg-gray-50">
                    <UserMinus size={18} className="text-gray-400" />
                    Unfollow
                  </button>
                  <button className="w-full text-left px-4 py-3 text-sm font-semibold text-red-500 flex items-center gap-3 active:bg-gray-50 border-t border-gray-50">
                    <AlertCircle size={18} />
                    Report recipe
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="relative aspect-square bg-gray-100 group">
        <Link to={`/recipe/${recipe.id}`}>
          <div className="relative w-full h-full overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.img
                key={currentImageIndex}
                src={images[currentImageIndex]}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="w-full h-full object-cover"
                alt={`${recipe.title} - image ${currentImageIndex + 1}`}
              />
            </AnimatePresence>
          </div>
        </Link>

        {images.length > 1 && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-between px-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={prevImage}
              className="pointer-events-auto w-8 h-8 rounded-full bg-black/30 backdrop-blur-md text-white flex items-center justify-center active:scale-90 transition-transform"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={nextImage}
              className="pointer-events-auto w-8 h-8 rounded-full bg-black/30 backdrop-blur-md text-white flex items-center justify-center active:scale-90 transition-transform"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}

        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
            {images.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${i === currentImageIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/50'
                  }`}
              />
            ))}
          </div>
        )}

        <div className="absolute top-4 left-4 z-10">
          <div className="bg-black/20 backdrop-blur-md text-white text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-wider">
            {recipe.cooking_time || '30 min'}
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-5">
            <button
              onClick={handleLike}
              disabled={isLiking}
              className="flex items-center gap-1.5 text-gray-700 active:scale-90 transition-transform"
            >
              <span className={`text-xl transition-all ${isLiked ? 'grayscale-0 scale-110' : 'grayscale opacity-70 scale-100'}`}>
                😋
              </span>
              <span className="text-sm font-semibold">
                {likesCount >= 1000 ? `${(likesCount / 1000).toFixed(1)}k` : likesCount}
              </span>
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                onCommentClick?.();
              }}
              className="flex items-center gap-1.5 text-gray-700 active:scale-90 transition-transform"
            >
              <MessageCircle size={22} />
              <span className="text-sm font-semibold">{recipe.comments_count}</span>
            </button>

            <div className="relative">
              <button
                onClick={handleShare}
                className="text-gray-700 active:scale-90 transition-transform flex items-center"
              >
                {isCopied ? <Check size={22} className="text-green-500" /> : <Share2 size={22} />}
              </button>
              <AnimatePresence>
                {isCopied && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-black/80 text-white text-[9px] font-black py-1 px-2 rounded-lg backdrop-blur-sm whitespace-nowrap z-20"
                  >
                    Lien de partage copié
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <button
            onClick={handleBookmark}
            disabled={isSaving}
            className={`transition-all ${isSaving ? 'opacity-50' : 'active:scale-90'}`}
          >
            <Bookmark
              size={22}
              className={`transition-all ${isSaved ? 'fill-[#E85D1A] text-[#E85D1A]' : 'text-gray-700'}`}
            />
          </button>
        </div>

        <div className="mb-4">
          <h2 className="text-lg font-bold text-gray-900 leading-tight">{recipe.title}</h2>
          <p className="text-gray-500 text-xs mt-1 line-clamp-2">{recipe.description}</p>
        </div>

        <Link
          to={`/recipe/${recipe.id}`}
          className="block w-full bg-[#E85D1A] text-white text-center py-3.5 rounded-2xl font-black text-sm shadow-lg shadow-orange-900/10 transform active:scale-[0.98] transition-all uppercase tracking-wider"
        >
          View Full Recipe
        </Link>
      </div>
    </div>
  );
};

export default RecipeCard;
