
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Feed from '../pages/feed/Feed';
import RecipeDetail from '../pages/recipe/RecipeDetail';
import CreateRecipe from '../pages/create/CreateRecipe';
import CreateStory from '../pages/create/CreateStory';
import StoryView from '../pages/feed/StoryView';
import Notifications from '../pages/activity/Notifications';
import Profile from '../pages/profile/Profile';
import EditProfile from '../pages/profile/EditProfile';
import Settings from '../pages/profile/Settings';
import SavedRecipes from '../pages/profile/SavedRecipes';
import Discover from '../pages/discover/Discover';
import Recommendations from '../pages/discover/Recommendations';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import About from '../pages/support/About';
import Terms from '../pages/support/Terms';
import HelpCenter from '../pages/support/HelpCenter';
import ProtectedRoute from '../components/auth/ProtectedRoute';

const AppRouter: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected Routes */}
      <Route path="/" element={<ProtectedRoute><Feed /></ProtectedRoute>} />
      <Route path="/recipe/:id" element={<ProtectedRoute><RecipeDetail /></ProtectedRoute>} />
      <Route path="/create" element={<ProtectedRoute><CreateRecipe /></ProtectedRoute>} />
      <Route path="/create-story" element={<ProtectedRoute><CreateStory /></ProtectedRoute>} />
      <Route path="/story/:username" element={<ProtectedRoute><StoryView /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/profile/:username" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/edit-profile" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
      <Route path="/profile/saved" element={<ProtectedRoute><SavedRecipes /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      <Route path="/discover" element={<ProtectedRoute><Discover /></ProtectedRoute>} />
      <Route path="/recommendations" element={<ProtectedRoute><Recommendations /></ProtectedRoute>} />
      <Route path="/activity" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
      <Route path="/about" element={<ProtectedRoute><About /></ProtectedRoute>} />
      <Route path="/terms" element={<ProtectedRoute><Terms /></ProtectedRoute>} />
      <Route path="/help" element={<ProtectedRoute><HelpCenter /></ProtectedRoute>} />
    </Routes>
  );
};

export default AppRouter;