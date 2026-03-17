import React, { useState, useEffect } from 'react';
import { Bell, User as UserIcon, Plus, Search, Settings, Check, Utensils, UserPlus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper';
import RecipeCard from '../../components/recipe/RecipeCard';
import CommentSheet from '../../components/recipe/CommentSheet';
import { Recipe } from '../../types/recipe';
import { motion, AnimatePresence } from 'framer-motion';
import { recipeService } from '../../services/recipe.service';
import api from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { userService } from '../../services/user.service';

const Feed: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user: currentUser } = useAuth();
  const [tab, setTab] = useState<'global' | 'following'>('global');
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [storyGroups, setStoryGroups] = useState<any[]>([]);
  const [recommendedChefs, setRecommendedChefs] = useState<any[]>([]);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [activeRecipeId, setActiveRecipeId] = useState<string | undefined>();
  const [activeCommentCount, setActiveCommentCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRecommendations = async () => {
    try {
      const recommendations = await userService.getRecommendations();
      setRecommendedChefs(recommendations);
    } catch (err) {
      console.error("Failed to fetch recommendations:", err);
    }
  };

  useEffect(() => {
    // Don't fetch if not authenticated
    if (!isAuthenticated) {
      return;
    }

    const fetchFeed = async () => {
      setIsLoading(true);
      try {
        const recipeData = await recipeService.getFeed(tab);
        setRecipes(recipeData);

        // Fetch stories
        const storyResponse = await api.get('/stories/feed/');
        setStoryGroups(storyResponse.data?.story_groups || []);

        // Fetch recommendations
        await fetchRecommendations();
      } catch (err) {
        console.error("Failed to fetch feed:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeed();
  }, [tab, isAuthenticated]);

  const openComments = (id: string, count: number) => {
    setActiveRecipeId(id);
    setActiveCommentCount(count);
    setIsCommentsOpen(true);
  };

  const toggleFollow = async (userId: string) => {
    try {
      await userService.toggleFollow(userId);
      // Remove followed user from recommendations immediately
      setRecommendedChefs(prev => prev.filter(chef => chef.id !== userId));

      // Optionally refresh the whole list to get a new person if one was filtered out
      if (recommendedChefs.length <= 1) {
        fetchRecommendations();
      }
    } catch (err) {
      console.error("Failed to toggle follow:", err);
    }
  };

  const handleShareInvite = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Join me on Évivi!',
        text: 'Come discover and share amazing African recipes on Évivi.',
        url: window.location.origin
      }).catch(console.error);
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(`Join me on Évivi! ${window.location.origin}`);
      alert("Invite link copied to clipboard!");
    }
  };

  return (
    <PageWrapper withPadding={false} className="bg-[#FDF8F5]">
      {/* Header */}
      <header className="px-4 py-4 flex items-center justify-between sticky top-0 bg-[#FDF8F5]/90 backdrop-blur-md z-30 border-b border-gray-50/50">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-[#E85D1A] rounded-xl flex items-center justify-center rotate-45 shadow-lg shadow-orange-500/20">
            <div className="w-4 h-4 bg-white -rotate-45 rounded-sm"></div>
          </div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight ml-1">Évivi</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/discover')}
            className="p-2.5 rounded-full bg-white border border-gray-100 shadow-sm text-gray-600 active:scale-90 transition-transform"
          >
            <Search size={20} />
          </button>
          <button
            onClick={() => navigate('/activity')}
            className="relative p-2.5 rounded-full bg-white border border-gray-100 shadow-sm text-gray-600 active:scale-90 transition-transform"
          >
            <Bell size={20} />
            <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-[#E85D1A] rounded-full border-2 border-white"></span>
          </button>
          <button
            onClick={() => navigate('/settings')}
            className="p-2.5 rounded-full bg-white border border-gray-100 shadow-sm text-gray-600 active:scale-90 transition-transform"
          >
            <Settings size={20} />
          </button>
          <button
            onClick={() => navigate('/profile')}
            className="w-11 h-11 rounded-full border-2 border-white shadow-md active:scale-95 transition-transform overflow-hidden ml-1"
          >
            <img src={currentUser?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=Kwame"} className="w-full h-full object-cover" alt="My Profile" />
          </button>
        </div>
      </header>

      {/* Kitchen Bites (New Stories Design) */}
      <div className="px-4 mt-4 mb-2 flex items-center justify-between">
        <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Kitchen Moments</h2>
        <span className="w-1.5 h-1.5 bg-[#E85D1A] rounded-full animate-pulse"></span>
      </div>
      <div className="flex gap-3 overflow-x-auto px-4 py-2 hide-scrollbar">
        {/* Add Story Card */}
        <Link
          to="/create-story"
          className="shrink-0 w-24 h-36 rounded-3xl border-2 border-dashed border-orange-200 bg-orange-50/30 flex flex-col items-center justify-center gap-2 group active:scale-95 transition-transform"
        >
          <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center text-[#E85D1A] shadow-sm group-hover:scale-110 transition-transform">
            <Plus size={20} strokeWidth={3} />
          </div>
          <span className="text-[9px] font-black text-[#E85D1A] uppercase tracking-wider">Add Bite</span>
        </Link>

        {/* Bite Cards */}
        {storyGroups.map((group, i) => (
          <button
            key={group.user.id}
            onClick={() => navigate(`/story/${group.user.username}`)}
            className="relative shrink-0 w-24 h-36 rounded-3xl overflow-hidden shadow-sm group active:scale-95 transition-transform"
          >
            {/* Background Media or Color */}
            {group.stories[0]?.media_type === 'text' ? (
              <div
                className="w-full h-full flex items-center justify-center p-2 text-center"
                style={{ backgroundColor: group.stories[0]?.background_color || '#E85D1A' }}
              >
                <p className="text-[7px] font-black text-white leading-tight line-clamp-4 uppercase">
                  {group.stories[0]?.caption}
                </p>
              </div>
            ) : (
              <img src={group.stories[0]?.media} className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-700" alt={group.user.username} />
            )}

            {/* Overlay Gradient */}
            <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent ${group.has_unseen ? 'border-2 border-[#E85D1A]' : ''} rounded-3xl`} />

            {/* Chef Badge */}
            <div className="absolute top-2 left-2 w-7 h-7 rounded-xl border border-white/40 overflow-hidden shadow-md">
              <img src={group.user.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + group.user.username} className="w-full h-full object-cover" alt={group.user.username} />
            </div>

            {/* Dish Info */}
            <div className="absolute bottom-3 left-2 right-2 text-left">
              <p className="text-[10px] font-black text-white leading-tight">
                @{group.user.username}
              </p>
            </div>
          </button>
        ))}
      </div>

      {/* Tabs */}
      <div className="px-4 py-6">
        <div className="bg-[#F3EBE5] rounded-2xl p-1.5 flex shadow-inner">
          <button
            onClick={() => setTab('global')}
            className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${tab === 'global' ? 'bg-white shadow-md text-gray-900 scale-[1.02]' : 'text-gray-500'}`}
          >
            Global
          </button>
          <button
            onClick={() => setTab('following')}
            className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${tab === 'following' ? 'bg-white shadow-md text-gray-900 scale-[1.02]' : 'text-gray-500'}`}
          >
            Following
          </button>
        </div>
      </div>

      {/* List */}
      <div className="px-4 pb-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-12 h-12 border-4 border-orange-100 border-t-[#E85D1A] rounded-full animate-spin"></div>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Loading flavors...</p>
          </div>
        ) : recipes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
            <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center text-[#E85D1A]">
              <Utensils size={40} />
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900">No recipes yet</p>
              <p className="text-sm text-gray-500">Be the first to share a culinary masterpiece!</p>
            </div>
          </div>
        ) : (
          recipes.map(recipe => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              onCommentClick={() => openComments(recipe.id, recipe.comments_count)}
            />
          ))
        )}
      </div>

      {/* Recommended Chefs Section */}
      <div className="pb-24 mt-4">
        <div className="px-6 mb-6 flex items-center justify-between">
          <h2 className="text-xl font-black text-gray-900 tracking-tight">Recommended Chefs</h2>
          {recommendedChefs.length > 0 && (
            <button
              onClick={() => navigate('/recommendations')}
              className="text-[11px] font-black text-[#E85D1A] uppercase tracking-widest bg-orange-50 px-3 py-1.5 rounded-full active:scale-95 transition-transform"
            >
              See All
            </button>
          )}
        </div>

        <div className="flex gap-4 overflow-x-auto px-4 hide-scrollbar pb-6">
          {recommendedChefs.length > 0 ? (
            recommendedChefs.map((chef) => {
              const colorIndex = chef.id.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0) % 4;
              const chefColor = ['#F9A825', '#388E3C', '#1976D2', '#E85D1A'][colorIndex];

              return (
                <div
                  key={chef.id}
                  onClick={() => navigate(`/profile/${chef.username}`)}
                  className="shrink-0 w-[160px] aspect-[3/4] rounded-[40px] relative overflow-hidden shadow-sm flex flex-col items-center justify-end p-5 group cursor-pointer transform active:scale-95 transition-transform"
                  style={{ backgroundColor: chefColor }}
                >
                  {/* Profile photo covering the whole block */}
                  <img
                    src={chef.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${chef.username}`}
                    className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-105"
                    alt={chef.username}
                  />

                  {/* Gradient overlay for contrast */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                  {/* Follow Button at top right */}
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => { e.stopPropagation(); toggleFollow(chef.id); }}
                    className="absolute top-4 right-4 w-7 h-7 rounded-full border-2 border-white flex items-center justify-center bg-[#E85D1A] text-white shadow-sm z-10"
                  >
                    <Plus size={16} strokeWidth={3} />
                  </motion.button>

                  <div className="relative z-10 w-full flex flex-col items-center">
                    <h3 className="font-black text-[14px] text-white mb-3 whitespace-nowrap overflow-hidden text-ellipsis w-full text-center drop-shadow-md">
                      @{chef.username}
                    </h3>

                    <button
                      onClick={(e) => { e.stopPropagation(); toggleFollow(chef.id); }}
                      className="w-full text-[10px] font-black py-2.5 rounded-2xl shadow-lg bg-[#E85D1A] text-white shadow-orange-900/20 active:opacity-90 transition-all font-black uppercase tracking-wider"
                    >
                      Follow
                    </button>
                  </div>
                </div>
              );
            })
          ) : !isLoading && (
            /* Invite Friends State */
            <button
              onClick={handleShareInvite}
              className="w-full mx-2 py-8 bg-orange-50 border-2 border-dashed border-orange-200 rounded-[40px] flex flex-col items-center justify-center gap-4 group active:scale-[0.98] transition-all"
            >
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-[#E85D1A] shadow-md group-hover:scale-110 transition-transform">
                <UserPlus size={28} />
              </div>
              <div className="text-center px-4">
                <p className="font-black text-gray-900 text-sm mb-1 uppercase tracking-tight">Invite your friends</p>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider opacity-60">Help grow the Evivi community!</p>
              </div>
            </button>
          )}
        </div>
      </div>

      <CommentSheet
        isOpen={isCommentsOpen}
        onClose={() => setIsCommentsOpen(false)}
        commentCount={activeCommentCount}
        recipeId={activeRecipeId}
      />
    </PageWrapper>
  );
};

export default Feed;
