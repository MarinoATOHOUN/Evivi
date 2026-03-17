
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Bookmark } from 'lucide-react';
import PageWrapper from '../../components/layout/PageWrapper';
import RecipeCard from '../../components/recipe/RecipeCard';
import CommentSheet from '../../components/recipe/CommentSheet';
import { Recipe } from '../../types/recipe';
import { recipeService } from '../../services/recipe.service';
import { useAuth } from '../../hooks/useAuth';

const SavedRecipes: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [activeRecipeId, setActiveRecipeId] = useState<string | undefined>();
  const [activeCommentCount, setActiveCommentCount] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    const fetchSavedRecipes = async () => {
      setIsLoading(true);
      try {
        const recipes = await recipeService.getSavedRecipes();
        setSavedRecipes(recipes);
      } catch (error) {
        console.error('Failed to fetch saved recipes:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSavedRecipes();
  }, [isAuthenticated]);

  const handleSaveToggle = (recipeId: string, isSaved: boolean) => {
    // Remove from list if unsaved
    if (!isSaved) {
      setSavedRecipes(prev => prev.filter(r => r.id !== recipeId));
    }
  };

  const openComments = (id: string, count: number) => {
    setActiveRecipeId(id);
    setActiveCommentCount(count);
    setIsCommentsOpen(true);
  };

  return (
    <PageWrapper withPadding={false} className="bg-[#FDF8F5]">
      {/* Header */}
      <header className="px-4 py-6 flex items-center justify-center sticky top-0 bg-[#FDF8F5]/90 backdrop-blur-md z-10 border-b border-gray-50">
        <button
          onClick={() => navigate(-1)}
          className="absolute left-4 p-2 text-gray-900 active:scale-90 transition-transform"
        >
          <ChevronLeft size={28} />
        </button>
        <h1 className="text-xl font-bold text-gray-900">Saved Recipes</h1>
      </header>

      <div className="px-4 py-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-12 h-12 border-4 border-orange-100 border-t-[#E85D1A] rounded-full animate-spin"></div>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Loading saved recipes...</p>
          </div>
        ) : savedRecipes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
            <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center text-[#E85D1A]">
              <Bookmark size={40} />
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900">No saved recipes yet</p>
              <p className="text-sm text-gray-500">Start saving recipes you love!</p>
            </div>
          </div>
        ) : (
          <>
            <p className="text-gray-400 font-medium text-sm mb-6">
              {savedRecipes.length} {savedRecipes.length === 1 ? 'Recipe' : 'Recipes'} collected
            </p>

            <div className="space-y-6">
              {savedRecipes.map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  onCommentClick={() => openComments(recipe.id, recipe.comments_count)}
                  onSaveToggle={handleSaveToggle}
                />
              ))}
            </div>
          </>
        )}
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

export default SavedRecipes;
