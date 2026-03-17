
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Plus, Check } from 'lucide-react';
import PageWrapper from '../../components/layout/PageWrapper';
import { motion, AnimatePresence } from 'framer-motion';
import { userService } from '../../services/user.service';

const Recommendations: React.FC = () => {
  const navigate = useNavigate();
  const [recommendedChefs, setRecommendedChefs] = useState<any[]>([]);
  const [followedChefs, setFollowedChefs] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      setIsLoading(true);
      try {
        const data = await userService.getRecommendations();
        setRecommendedChefs(data);
      } catch (err) {
        console.error("Failed to fetch recommendations:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

  const toggleFollow = async (userId: string) => {
    try {
      await userService.toggleFollow(userId);
      // As requested: the user must no longer see those he already follows on the list
      setRecommendedChefs(prev => prev.filter(chef => chef.id !== userId));
    } catch (err) {
      console.error("Failed to toggle follow:", err);
    }
  };

  return (
    <PageWrapper withPadding={false} className="bg-[#FDF8F5]">
      {/* Header */}
      <header className="px-4 py-6 flex items-center justify-between sticky top-0 bg-[#FDF8F5]/80 backdrop-blur-md z-30 border-b border-gray-100/50">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 text-gray-800 active:scale-90 transition-transform"
        >
          <ChevronLeft size={28} />
        </button>
        <h1 className="text-xl font-black text-gray-900 tracking-tight">All Recommendations</h1>
        <div className="w-10" /> {/* Spacer */}
      </header>

      <div className="p-6">
        <p className="text-gray-400 font-black text-[10px] uppercase tracking-[0.2em] mb-8 ml-1 text-center">
          Top African Chefs to follow
        </p>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-12 h-12 border-4 border-orange-100 border-t-[#E85D1A] rounded-full animate-spin"></div>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Finding chefs...</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {recommendedChefs.map((chef) => {
              const isFollowed = followedChefs.has(chef.id);
              const colorIndex = chef.id.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0) % 4;
              const chefColor = ['#F9A825', '#388E3C', '#1976D2', '#E85D1A'][colorIndex];

              return (
                <div
                  key={chef.id}
                  onClick={() => navigate(`/profile/${chef.username}`)}
                  style={{ backgroundColor: chefColor }}
                  className="aspect-[3/4] rounded-[40px] relative overflow-hidden shadow-sm flex flex-col items-center justify-end p-5 group cursor-pointer transform active:scale-95 transition-transform"
                >
                  {/* Profile photo covering the whole block */}
                  <img
                    src={chef.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${chef.username}`}
                    className="absolute inset-0 w-full h-full object-cover"
                    alt={chef.username}
                  />

                  {/* Gradient overlay for contrast */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                  {/* Plus icon at top right */}
                  <motion.button
                    animate={{
                      backgroundColor: isFollowed ? '#124E4C' : '#E85D1A',
                      scale: isFollowed ? 1.1 : 1
                    }}
                    onClick={(e) => { e.stopPropagation(); toggleFollow(chef.id); }}
                    className="absolute top-4 right-4 w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-white shadow-sm z-10 active:scale-90 transition-all"
                  >
                    <AnimatePresence mode="wait">
                      {isFollowed ? (
                        <motion.div
                          key="check"
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.5 }}
                        >
                          <Check size={14} strokeWidth={4} />
                        </motion.div>
                      ) : (
                        <motion.div
                          key="plus"
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.5 }}
                        >
                          <Plus size={16} strokeWidth={3} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.button>

                  <div className="relative z-10 w-full flex flex-col items-center">
                    <h3 className="font-black text-[14px] text-white mb-3 whitespace-nowrap overflow-hidden text-ellipsis w-full text-center drop-shadow-md">
                      @{chef.username}
                    </h3>

                    <button
                      onClick={(e) => { e.stopPropagation(); toggleFollow(chef.id); }}
                      className={`w-full text-[10px] font-black py-2.5 rounded-2xl shadow-lg transition-all active:opacity-90 ${isFollowed
                        ? 'bg-white/90 text-[#124E4C] shadow-black/10'
                        : 'bg-[#E85D1A] text-white shadow-orange-900/20'
                        }`}
                    >
                      {isFollowed ? 'Following' : 'Follow'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <div className="h-24" /> {/* Bottom spacer for navbar */}
    </PageWrapper>
  );
};

export default Recommendations;
