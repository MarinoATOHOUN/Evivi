
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, MapPin, Share2, Grid, Bookmark, User as UserIcon, Settings as SettingsIcon } from 'lucide-react';
import PageWrapper from '../../components/layout/PageWrapper';
import RecipeCard from '../../components/recipe/RecipeCard';
import CommentSheet from '../../components/recipe/CommentSheet';
import { Recipe } from '../../types/recipe';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';
import { userService } from '../../services/user.service';

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { username } = useParams<{ username: string }>();
  const { user: currentUser, isAuthenticated } = useAuth();
  const [profileUser, setProfileUser] = useState<any>(null);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [activeTab, setActiveTab] = useState<'grid' | 'bookmark' | 'tagged'>('grid');
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [activeRecipeId, setActiveRecipeId] = useState<string | undefined>();
  const [activeCommentCount, setActiveCommentCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      let user;
      if (username) {
        const userResponse = await api.get(`/users/${username}/`);
        user = userResponse.data;
      } else {
        const userResponse = await api.get('/auth/me/');
        user = userResponse.data;
      }

      setProfileUser(user);

      const recipesResponse = await api.get(`/users/${user.username}/recipes/`);
      const recipesData = recipesResponse.data;
      setRecipes(Array.isArray(recipesData) ? recipesData : []);
    } catch (err) {
      console.error("Failed to fetch profile:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Don't fetch if not authenticated
    if (!isAuthenticated) {
      return;
    }

    fetchProfile();
  }, [username, isAuthenticated]);

  const handleToggleFollow = async () => {
    if (!profileUser) return;
    try {
      await userService.toggleFollow(profileUser.id);
      // Update local state to reflect follow/unfollow and count change
      setProfileUser((prev: any) => ({
        ...prev,
        is_following: !prev.is_following,
        followers_count: prev.is_following ? prev.followers_count - 1 : prev.followers_count + 1
      }));
    } catch (err) {
      console.error("Failed to toggle follow:", err);
    }
  };

  const openComments = (id: string, count: number) => {
    setActiveRecipeId(id);
    setActiveCommentCount(count);
    setIsCommentsOpen(true);
  };

  if (isLoading) {
    return (
      <PageWrapper withPadding={true} className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-orange-100 border-t-[#E85D1A] rounded-full animate-spin"></div>
      </PageWrapper>
    );
  }

  const displayUser = profileUser || currentUser;

  return (
    <PageWrapper withPadding={false} maxWidthClass="max-w-screen-lg" className="bg-[#FDF8F5]">
      {/* Header - Sticky and width constrained */}
      <header className="px-4 py-4 flex items-center justify-between sticky top-0 bg-[#FDF8F5]/80 backdrop-blur-md z-30 border-b border-gray-100">
        <div className="max-w-screen-lg mx-auto w-full flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-800 active:scale-90 transition-transform">
            <ChevronLeft size={28} />
          </button>
          <h1 className="text-base font-bold text-gray-900 tracking-tight">{displayUser?.username}</h1>
          <button
            onClick={() => navigate('/settings')}
            className="p-2 -mr-2 text-gray-800 active:scale-90 transition-transform"
          >
            <SettingsIcon size={24} />
          </button>
        </div>
      </header>

      {/* Profile Info Section */}
      <div className="flex flex-col items-center px-4 pt-8 md:pt-12 text-center max-w-2xl mx-auto">
        {/* Avatar */}
        <div className="relative mb-6">
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-full p-1 bg-orange-100/50">
            <div className="w-full h-full rounded-full overflow-hidden border-4 border-white shadow-md bg-white">
              <img
                src={displayUser?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=" + displayUser?.username}
                className="w-full h-full object-cover"
                alt={displayUser?.username}
              />
            </div>
          </div>
          <div className="absolute bottom-1 right-2 md:bottom-2 md:right-4 w-8 h-8 md:w-10 md:h-10 bg-[#E85D1A] rounded-full border-4 border-[#FDF8F5] flex items-center justify-center shadow-sm">
            <div className="w-3 h-3 bg-white rotate-45 flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-[#E85D1A]"></div>
            </div>
          </div>
        </div>

        {/* User Details */}
        <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-0.5">
          {displayUser?.first_name || displayUser?.last_name
            ? `${displayUser.first_name || ''} ${displayUser.last_name || ''}`.trim()
            : displayUser?.username}
        </h2>
        <span className="text-[#E85D1A] font-bold text-sm md:text-base mb-6">@{displayUser?.username}</span>

        <p className="text-sm md:text-base font-medium text-gray-500 leading-relaxed max-w-[320px] md:max-w-md mb-3">
          {displayUser?.bio || "No bio yet."}
        </p>

        {displayUser?.country && (
          <div className="flex items-center gap-1.5 text-xs md:text-sm text-gray-400 font-bold mb-10">
            <MapPin size={14} className="text-gray-300" />
            <span>{displayUser.country}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex w-full gap-3 mb-10 px-4 max-w-md">
          {currentUser?.id === displayUser?.id ? (
            <button
              onClick={() => navigate('/edit-profile')}
              className="flex-[2] bg-[#E85D1A] text-white font-bold py-4 rounded-2xl shadow-lg shadow-orange-900/10 active:scale-95 transition-transform"
            >
              Edit Profile
            </button>
          ) : (
            <button
              onClick={handleToggleFollow}
              className={`flex-[2] font-bold py-4 rounded-2xl shadow-lg active:scale-95 transition-all ${displayUser?.is_following
                ? 'bg-[#F3EBE5] text-gray-900 shadow-black/5'
                : 'bg-[#E85D1A] text-white shadow-orange-900/10'
                }`}
            >
              {displayUser?.is_following ? 'Following' : 'Follow'}
            </button>
          )}
          <button
            className="flex-1 bg-[#F3EBE5] text-gray-900 font-bold py-4 rounded-2xl active:scale-95 transition-transform"
            onClick={() => displayUser && navigate(`/chat/${displayUser.id}`)}
          >
            Message
          </button>
          <button className="w-14 bg-[#F3EBE5] text-gray-900 flex items-center justify-center rounded-2xl active:scale-95 transition-transform">
            <Share2 size={20} />
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 md:gap-6 w-full mb-12 max-w-xl">
          <div className="bg-white rounded-3xl p-4 md:p-6 shadow-sm border border-gray-100 text-center flex flex-col items-center justify-center">
            <p className="text-xl md:text-2xl font-black text-gray-900">{displayUser?.followers_count || 0}</p>
            <p className="text-[10px] md:text-[11px] font-black text-gray-400 uppercase tracking-widest mt-1">Followers</p>
          </div>
          <div className="bg-white rounded-3xl p-4 md:p-6 shadow-sm border border-gray-100 text-center flex flex-col items-center justify-center">
            <p className="text-xl md:text-2xl font-black text-gray-900">{displayUser?.following_count || 0}</p>
            <p className="text-[10px] md:text-[11px] font-black text-gray-400 uppercase tracking-widest mt-1">Following</p>
          </div>
          <div className="bg-white rounded-3xl p-4 md:p-6 shadow-sm border border-gray-100 text-center flex flex-col items-center justify-center">
            <p className="text-xl md:text-2xl font-black text-gray-900">{displayUser?.recipes_count || 0}</p>
            <p className="text-[10px] md:text-[11px] font-black text-gray-400 uppercase tracking-widest mt-1">Recipes</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-screen-lg mx-auto">
        <div className="flex border-b border-gray-100">
          <button
            onClick={() => setActiveTab('grid')}
            className={`flex-1 py-5 flex justify-center items-center relative transition-colors ${activeTab === 'grid' ? 'text-[#E85D1A]' : 'text-gray-300'}`}
          >
            <Grid size={24} strokeWidth={activeTab === 'grid' ? 2.5 : 2} />
            {activeTab === 'grid' && <div className="absolute bottom-0 w-1/3 h-1 bg-[#E85D1A] rounded-t-full" />}
          </button>
          <button
            onClick={() => setActiveTab('bookmark')}
            className={`flex-1 py-5 flex justify-center items-center relative transition-colors ${activeTab === 'bookmark' ? 'text-[#E85D1A]' : 'text-gray-300'}`}
          >
            <Bookmark size={24} strokeWidth={activeTab === 'bookmark' ? 2.5 : 2} />
            {activeTab === 'bookmark' && <div className="absolute bottom-0 w-1/3 h-1 bg-[#E85D1A] rounded-t-full" />}
          </button>
          <button
            onClick={() => setActiveTab('tagged')}
            className={`flex-1 py-5 flex justify-center items-center relative transition-colors ${activeTab === 'tagged' ? 'text-[#E85D1A]' : 'text-gray-300'}`}
          >
            <UserIcon size={24} strokeWidth={activeTab === 'tagged' ? 2.5 : 2} />
            {activeTab === 'tagged' && <div className="absolute bottom-0 w-1/3 h-1 bg-[#E85D1A] rounded-t-full" />}
          </button>
        </div>

        {/* Profile Feed Content */}
        <div className="max-w-xl mx-auto w-full px-4 pt-8 pb-12">
          {activeTab === 'grid' && (
            <div className="space-y-6">
              {recipes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                  <Grid size={48} strokeWidth={1} className="mb-4 opacity-20" />
                  <p className="font-bold">No recipes yet</p>
                </div>
              ) : (
                recipes.map((recipe) => (
                  <RecipeCard
                    key={recipe.id}
                    recipe={recipe}
                    onCommentClick={() => openComments(recipe.id, recipe.comments_count)}
                  />
                ))
              )}
            </div>
          )}

          {activeTab === 'bookmark' && (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <Bookmark size={48} strokeWidth={1} className="mb-4 opacity-20" />
              <p className="font-bold">No saved recipes yet</p>
            </div>
          )}

          {activeTab === 'tagged' && (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <UserIcon size={48} strokeWidth={1} className="mb-4 opacity-20" />
              <p className="font-bold">No tagged recipes yet</p>
            </div>
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

export default Profile;
