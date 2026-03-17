
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, SlidersHorizontal, Bookmark } from 'lucide-react';
import PageWrapper from '../../components/layout/PageWrapper';
import { recipeService } from '../../services/recipe.service';
import { Recipe } from '../../types/recipe';
import { useAuth } from '../../hooks/useAuth';

const CATEGORIES = ["West African", "Spicy", "Vegan", "Grills", "Breakfast", "Seafood"];

const Discover: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [activeCategory, setActiveCategory] = useState("West African");
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    const fetchRecipes = async () => {
      setIsLoading(true);
      try {
        // Fetch global feed recipes
        const data = await recipeService.getFeed('global');
        setRecipes(data);
      } catch (error) {
        console.error('Failed to fetch recipes:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecipes();
  }, [isAuthenticated]);

  const handleSaveRecipe = async (e: React.MouseEvent, recipeId: string) => {
    e.stopPropagation();
    try {
      await recipeService.toggleSave(recipeId);
      // Update the recipe in the list
      const updatedRecipes = await recipeService.getFeed('global');
      setRecipes(updatedRecipes);
    } catch (error) {
      console.error('Failed to save recipe:', error);
    }
  };

  // Filter recipes based on search query
  const filteredRecipes = recipes.filter(recipe =>
    recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    recipe.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Assign random heights for masonry layout
  const heights = ['h-64', 'h-80', 'h-56', 'h-72'];
  const recipesWithHeights = filteredRecipes.map((recipe, index) => ({
    ...recipe,
    height: heights[index % heights.length]
  }));

  return (
    <PageWrapper withPadding={false} className="bg-[#FDF8F5]">
      {/* Header */}
      <header className="px-6 pt-8 pb-4 flex items-center justify-between">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Discovery</h1>
        <button
          onClick={() => navigate('/notifications')}
          className="p-2.5 rounded-full bg-white shadow-sm text-gray-800 active:scale-90 transition-transform"
        >
          <Bell size={24} />
        </button>
      </header>

      {/* Search Bar Section */}
      <div className="px-6 flex gap-3 mb-8">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search recipes, ingredients..."
            className="w-full bg-[#F3EBE5] border-none rounded-2xl py-4 pl-12 pr-4 text-sm font-medium focus:ring-2 focus:ring-orange-200 focus:outline-none placeholder:text-gray-400"
          />
        </div>
        <button className="bg-[#E85D1A] w-14 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-orange-900/10 active:scale-95 transition-transform">
          <SlidersHorizontal size={24} />
        </button>
      </div>

      {/* Categories */}
      <div className="mb-10">
        <h2 className="px-6 text-xl font-black text-gray-900 mb-4">Trending Categories</h2>
        <div className="flex gap-3 overflow-x-auto px-6 hide-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`shrink-0 px-6 py-3 rounded-2xl text-sm font-bold transition-all ${activeCategory === cat
                ? 'bg-[#E85D1A] text-white shadow-md shadow-orange-900/10'
                : 'bg-[#F3EBE5] text-gray-600'
                }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Featured Feed */}
      <div className="px-6 pb-32">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-black text-gray-900">Featured Feed</h2>
          <button
            onClick={() => navigate('/')}
            className="text-sm font-black text-[#E85D1A]"
          >
            See All
          </button>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-12 h-12 border-4 border-orange-100 border-t-[#E85D1A] rounded-full animate-spin"></div>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Loading recipes...</p>
          </div>
        ) : recipesWithHeights.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
            <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center text-[#E85D1A]">
              <Search size={40} />
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900">No recipes found</p>
              <p className="text-sm text-gray-500">Try a different search term</p>
            </div>
          </div>
        ) : (
          <div className="columns-2 gap-4 space-y-4">
            {recipesWithHeights.map((recipe) => (
              <div
                key={recipe.id}
                onClick={() => navigate(`/recipe/${recipe.id}`)}
                className={`relative ${recipe.height} rounded-3xl overflow-hidden shadow-sm group active:scale-[0.98] transition-all`}
              >
                <img
                  src={recipe.images[0]?.image || `https://picsum.photos/seed/recipe-${recipe.id}/400/600`}
                  className="w-full h-full object-cover"
                  alt={recipe.title}
                  loading="lazy"
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                {/* Bookmark */}
                <button
                  className="absolute top-3 right-3 w-8 h-8 bg-black/20 backdrop-blur-md rounded-full flex items-center justify-center text-white active:scale-90"
                  onClick={(e) => handleSaveRecipe(e, recipe.id)}
                >
                  <Bookmark
                    size={16}
                    className={recipe.is_saved ? 'fill-white' : ''}
                  />
                </button>

                {/* Text Info */}
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <h3 className="font-black text-sm mb-1 leading-tight">{recipe.title}</h3>
                  <div className="flex items-center gap-2 opacity-80">
                    <div className="w-4 h-4 rounded-full overflow-hidden border border-white/20">
                      <img
                        src={recipe.author.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${recipe.author.username}`}
                        className="w-full h-full object-cover"
                        alt={recipe.author.username}
                      />
                    </div>
                    <span className="text-[10px] font-bold">@{recipe.author.username}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageWrapper>
  );
};

export default Discover;
