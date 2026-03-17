
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Share2, Clock, BarChart, Users, Check, ChevronDown, ChevronUp, Send, ChevronRight } from 'lucide-react';
import PageWrapper from '../../components/layout/PageWrapper';
import CommentSheet from '../../components/recipe/CommentSheet';
import { motion, AnimatePresence } from 'framer-motion';
import { recipeService } from '../../services/recipe.service';
import { Recipe } from '../../types/recipe';
import { useAuth } from '../../hooks/useAuth';

const RecipeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [showAllSteps, setShowAllSteps] = useState(false);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const fetchRecipe = async () => {
      if (!id) return;
      try {
        setIsLoading(true);
        const data = await recipeService.getRecipeById(id);
        setRecipe(data);
        setIsLiked(data.is_liked);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to load recipe");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecipe();
  }, [id]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleToggleLike = async () => {
    if (!recipe) return;
    try {
      const response = await recipeService.toggleLike(recipe.id);
      setIsLiked(response.is_liked);
      setRecipe({
        ...recipe,
        is_liked: response.is_liked,
        likes_count: response.likes_count
      });
    } catch (err) {
      console.error("Failed to toggle like", err);
    }
  };

  const handleSubmitComment = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!recipe || !commentText.trim() || isSubmittingComment) return;

    setIsSubmittingComment(true);
    try {
      await recipeService.addComment(recipe.id, commentText.trim());
      setCommentText('');
      // Refresh recipe to get updated comment count
      const updatedRecipe = await recipeService.getRecipeById(recipe.id);
      setRecipe(updatedRecipe);
    } catch (err) {
      console.error("Failed to add comment", err);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  if (isLoading) {
    return (
      <PageWrapper className="flex items-center justify-center bg-white min-h-screen">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </PageWrapper>
    );
  }

  if (error || !recipe) {
    return (
      <PageWrapper className="flex flex-col items-center justify-center bg-white min-h-screen p-6 text-center">
        <div className="bg-red-50 p-6 rounded-3xl mb-4">
          <p className="text-red-500 font-bold">{error || "Recipe not found"}</p>
        </div>
        <button
          onClick={() => navigate('/')}
          className="bg-orange-500 text-white px-8 py-3 rounded-2xl font-black shadow-lg"
        >
          Go Back Home
        </button>
      </PageWrapper>
    );
  }

  const displayedSteps = showAllSteps ? recipe.steps : recipe.steps.slice(0, 3);
  const images = recipe.images.length > 0
    ? recipe.images.map(img => img.image)
    : ['https://picsum.photos/seed/recipe-' + recipe.id + '/800/800'];

  return (
    <PageWrapper withPadding={false} className="bg-white">
      {/* Visual Header */}
      <div className="relative aspect-square bg-gray-100">
        <AnimatePresence mode="wait">
          <motion.img
            key={currentImageIndex}
            src={images[currentImageIndex]}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full h-full object-cover"
            alt={recipe.title}
          />
        </AnimatePresence>

        {/* Image Indicators */}
        {images.length > 1 && (
          <div className="absolute bottom-24 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentImageIndex(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${i === currentImageIndex ? 'w-6 bg-white' : 'w-1.5 bg-white/50'
                  }`}
              />
            ))}
          </div>
        )}

        {/* Carousel Navigation */}
        {images.length > 1 && (
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-2 z-10 pointer-events-none">
            <button
              onClick={() => setCurrentImageIndex(prev => (prev - 1 + images.length) % images.length)}
              className="w-10 h-10 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center text-white pointer-events-auto active:scale-90 transition-transform"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={() => setCurrentImageIndex(prev => (prev + 1) % images.length)}
              className="w-10 h-10 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center text-white pointer-events-auto active:scale-90 transition-transform"
            >
              <ChevronRight size={24} />
            </button>
          </div>
        )}

        {/* Header Controls */}
        <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start z-10">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 bg-black/30 backdrop-blur-md rounded-full flex items-center justify-center text-white active:scale-90 transition-transform shadow-lg"
          >
            <ChevronLeft size={24} />
          </button>

          <div className="flex gap-2 relative">
            <AnimatePresence>
              {isCopied && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="absolute -bottom-10 right-0 bg-black/80 text-white text-[10px] font-bold py-1.5 px-3 rounded-lg backdrop-blur-sm whitespace-nowrap"
                >
                  Link copied!
                </motion.div>
              )}
            </AnimatePresence>

            <button
              onClick={handleShare}
              className="w-10 h-10 bg-black/30 backdrop-blur-md rounded-full flex items-center justify-center text-white active:scale-90 transition-transform shadow-lg"
            >
              {isCopied ? <Check size={20} /> : <Share2 size={20} />}
            </button>

            <button
              onClick={handleToggleLike}
              className="w-10 h-10 bg-black/30 backdrop-blur-md rounded-full flex items-center justify-center text-white active:scale-90 transition-transform shadow-lg overflow-hidden"
            >
              <span className={`text-xl transition-all ${isLiked ? 'grayscale-0 scale-125' : 'grayscale scale-100'}`}>
                😋
              </span>
            </button>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 via-black/40 to-transparent">
          {recipe.categories?.length > 0 && (
            <span className="bg-[#E85D1A] text-white text-[10px] font-black uppercase px-2 py-1 rounded mb-3 inline-block tracking-wider">
              {recipe.categories[0].name}
            </span>
          )}
          <h1 className="text-3xl font-black text-white leading-[1.1] tracking-tight">{recipe.title}</h1>
        </div>
      </div>

      <div className="p-6 space-y-10 pb-32">
        {/* Author Section */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img src={recipe.author.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + recipe.author.username} className="w-14 h-14 rounded-full border-2 border-white shadow-md object-cover" alt={recipe.author.username} />
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#E85D1A] rounded-full border-2 border-white flex items-center justify-center">
                <Check size={10} className="text-white" strokeWidth={4} />
              </div>
            </div>
            <div>
              <h3 className="font-black text-[15px] text-gray-900">@{recipe.author.username}</h3>
              <p className="text-xs text-gray-400 font-bold tracking-tight">{recipe.author.followers_count} followers</p>
            </div>
          </div>
          <button className="bg-[#E85D1A] text-white px-8 py-3 rounded-2xl font-black text-sm shadow-lg shadow-orange-900/10 active:scale-95 transition-transform">
            Follow
          </button>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-[#FDF8F5] p-4 rounded-3xl flex flex-col items-center gap-1.5 border border-orange-100/50 shadow-sm">
            <Clock size={20} className="text-[#E85D1A]" />
            <span className="text-[11px] font-black text-gray-700 tracking-tight">{recipe.cooking_time || '--'}</span>
          </div>
          <div className="bg-[#FDF8F5] p-4 rounded-3xl flex flex-col items-center gap-1.5 border border-orange-100/50 shadow-sm">
            <BarChart size={20} className="text-[#E85D1A]" />
            <span className="text-[11px] font-black text-gray-700 tracking-tight capitalize">{recipe.difficulty}</span>
          </div>
          <div className="bg-[#FDF8F5] p-4 rounded-3xl flex flex-col items-center gap-1.5 border border-orange-100/50 shadow-sm">
            <Users size={20} className="text-[#E85D1A]" />
            <span className="text-[11px] font-black text-gray-700 tracking-tight">{recipe.servings || '0'} servings</span>
          </div>
        </div>

        {/* Story */}
        <div className="bg-orange-50/30 p-5 rounded-[32px] border border-orange-100/20">
          <h3 className="text-[11px] font-black text-[#E85D1A] uppercase tracking-[0.2em] mb-3">The Story</h3>
          <p className="text-sm leading-relaxed text-gray-600 font-medium">
            {recipe.description}
          </p>
        </div>

        {/* Ingredients */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-lg font-black text-gray-900">Ingredients</h3>
            <span className="bg-[#E85D1A]/10 text-[#E85D1A] px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">{recipe.ingredients.length} items</span>
          </div>
          <div className="space-y-3">
            {recipe.ingredients.length === 0 ? (
              <div className="p-5 bg-gray-50 border border-gray-100 rounded-2xl text-sm text-gray-500 font-semibold">
                No ingredients provided for this recipe yet.
              </div>
            ) : (
              recipe.ingredients.map((ing, i) => (
                <div key={ing.id || i} className="flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-2xl shadow-sm group active:bg-orange-50 transition-colors">
                  <div className="relative">
                    <input type="checkbox" className="peer appearance-none w-6 h-6 rounded-lg border-2 border-gray-200 checked:bg-[#E85D1A] checked:border-[#E85D1A] transition-all cursor-pointer" />
                    <Check className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" size={14} strokeWidth={4} />
                  </div>
                  <span className="text-[14px] font-bold text-gray-700">
                    {ing.amount} {ing.unit} {ing.name}
                  </span>
                </div>
              ))
            )}
          </div>
          {recipe.ingredients.length > 0 && (
            <button className="w-full py-5 bg-orange-50 text-[#E85D1A] font-black rounded-2xl text-[12px] uppercase tracking-[0.15em] active:scale-[0.98] transition-all mt-2">
              Add all to shopping list
            </button>
          )}
        </div>

        {/* Steps */}
        <div className="space-y-6">
          <h3 className="text-lg font-black text-gray-900 px-1">Preparation Steps</h3>
          <div className="space-y-8 relative">
            <AnimatePresence initial={false}>
              {recipe.steps.length === 0 ? (
                <motion.div
                  key="no-steps"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="p-5 bg-gray-50 border border-gray-100 rounded-2xl text-sm text-gray-500 font-semibold"
                >
                  No preparation steps provided for this recipe yet.
                </motion.div>
              ) : (
                displayedSteps.map((step, i) => (
                  <motion.div
                    key={step.id || i}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="flex gap-5 overflow-hidden"
                  >
                    <div className="w-10 h-10 shrink-0 bg-[#E85D1A] text-white rounded-2xl flex items-center justify-center text-sm font-black shadow-lg shadow-orange-900/10">
                      {i + 1}
                    </div>
                    <div className="space-y-1.5 flex-1 pt-0.5 pb-2">
                      <p className="text-[13px] text-gray-500 leading-relaxed font-medium">{step.text}</p>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>

          {recipe.steps.length > 3 && (
            <button
              onClick={() => setShowAllSteps(!showAllSteps)}
              className="w-full py-5 bg-gray-50 text-gray-800 font-black rounded-2xl border border-gray-100 active:scale-[0.98] transition-all text-xs uppercase tracking-widest mt-4 flex items-center justify-center gap-2"
            >
              {showAllSteps ? "Show Less" : "View Full Steps"}
              {showAllSteps ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          )}
        </div>

        {/* Comments Section */}
        <div className="pt-8 space-y-6 border-t border-gray-50">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-lg font-black text-gray-900">Comments</h3>
            <button
              onClick={() => setIsCommentsOpen(true)}
              className="text-[#E85D1A] text-[11px] font-black uppercase tracking-widest bg-orange-50 px-4 py-2 rounded-full active:scale-95 transition-transform"
            >
              View All ({recipe.comments_count})
            </button>
          </div>

          {/* Quick Comment Input */}
          <form onSubmit={handleSubmitComment} className="flex items-center gap-3 py-2">
            <div className="w-10 h-10 rounded-full bg-gray-100 shrink-0 border border-gray-200 overflow-hidden shadow-sm">
              <img
                src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username || 'User'}`}
                className="w-full h-full object-cover"
                alt="My Profile"
              />
            </div>
            <div className="flex-1 relative">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Share your thoughts..."
                disabled={isSubmittingComment}
                className="w-full bg-white border border-gray-200 rounded-full py-4 pl-6 pr-14 text-[14px] font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-100 transition-all shadow-sm disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!commentText.trim() || isSubmittingComment}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 w-10 h-10 bg-orange-600 text-white rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={18} fill="currentColor" className="ml-0.5" />
              </button>
            </div>
          </form>
        </div>
      </div>

      <CommentSheet
        isOpen={isCommentsOpen}
        onClose={() => setIsCommentsOpen(false)}
        commentCount={recipe.comments_count}
        recipeId={recipe.id}
      />
    </PageWrapper>
  );
};

export default RecipeDetail;
