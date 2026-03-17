
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { X, Send, Loader2, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { storyService } from '../../services/story.service';
import { formatDistanceToNow } from 'date-fns';

const STORY_DURATION = 7000; // 7 seconds per story

const StoryView: React.FC = () => {
  const navigate = useNavigate();
  const { username } = useParams<{ username: string }>();
  const [stories, setStories] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const progressTimer = useRef<any>(null);

  useEffect(() => {
    const fetchUserStories = async () => {
      try {
        setIsLoading(true);
        const feed = await storyService.getFeed();
        const group = feed.story_groups.find((g: any) => g.user.username === username);

        if (group) {
          setStories(group.stories);
          setUser(group.user);
        } else {
          navigate('/');
        }
      } catch (err) {
        console.error("Failed to fetch stories", err);
        navigate('/');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserStories();
  }, [username, navigate]);

  useEffect(() => {
    if (stories.length === 0 || isPaused) return;

    const story = stories[currentIndex];
    const duration = story.media_type === 'video' ? 15000 : STORY_DURATION;

    const startTime = Date.now();
    const updateProgress = () => {
      const elapsed = Date.now() - startTime;
      const nextProgress = (elapsed / duration) * 100;

      if (nextProgress >= 100) {
        handleNext();
      } else {
        setProgress(nextProgress);
        progressTimer.current = requestAnimationFrame(updateProgress);
      }
    };

    progressTimer.current = requestAnimationFrame(updateProgress);

    // Mark as viewed
    storyService.markAsViewed(story.id).catch(() => { });

    return () => {
      if (progressTimer.current) cancelAnimationFrame(progressTimer.current);
    };
  }, [currentIndex, stories, isPaused]);

  const handleNext = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setProgress(0);
    } else {
      navigate('/');
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setProgress(0);
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    const x = e.clientX;
    const width = window.innerWidth;
    if (x < width * 0.3) {
      handlePrev();
    } else if (x > width * 0.7) {
      handleNext();
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black z-[110] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-[#E85D1A] animate-spin" />
      </div>
    );
  }

  const currentStory = stories[currentIndex];

  return (
    <div className="fixed inset-0 bg-black z-[110] flex flex-col overflow-hidden select-none touch-none">

      {/* Background Media or Color */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStory.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="absolute inset-0 w-full h-full flex items-center justify-center"
          style={{ backgroundColor: currentStory.media_type === 'text' ? (currentStory.background_color || '#E85D1A') : 'black' }}
          onClick={handleClick}
          onMouseDown={() => setIsPaused(true)}
          onMouseUp={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
        >
          {currentStory.media_type === 'video' && (
            <video
              ref={videoRef}
              src={currentStory.media}
              className="w-full h-full object-cover"
              autoPlay
              playsInline
              muted={false}
              onEnded={handleNext}
            />
          )}

          {currentStory.media_type === 'image' && (
            <img
              src={currentStory.media}
              className="w-full h-full object-cover"
              alt="Story Content"
            />
          )}

          {/* Text Overlay */}
          {(currentStory.caption || currentStory.media_type === 'text') && (
            <div className="absolute inset-0 flex items-center justify-center p-8 pointer-events-none">
              <p
                className={`text-center text-3xl font-black drop-shadow-[0_2px_10px_rgba(0,0,0,0.3)] ${currentStory.font_style === 'bold' ? 'font-extrabold uppercase' :
                    currentStory.font_style === 'script' ? 'font-serif italic' :
                      currentStory.font_style === 'neon' ? 'brightness-125' : 'font-sans'
                  }`}
                style={{ color: currentStory.font_color || '#FFFFFF' }}
              >
                {currentStory.caption}
              </p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Overlays */}
      <div className={`absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 pointer-events-none ${currentStory.media_type === 'text' ? 'opacity-30' : 'opacity-100'}`} />

      {/* Top Controls */}
      <div className="relative z-20 px-4 pt-4">
        {/* Progress Bars */}
        <div className="flex gap-1.5 mb-4">
          {stories.map((_, i) => (
            <div key={i} className="flex-1 h-0.5 bg-white/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-white transition-all duration-30 ease-linear"
                style={{
                  width: i === currentIndex ? `${progress}%` : i < currentIndex ? '100%' : '0%'
                }}
              />
            </div>
          ))}
        </div>

        {/* User Info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border-2 border-white/50 p-0.5 shadow-lg overflow-hidden bg-white/10">
              <img src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username}`} className="w-full h-full rounded-full object-cover" alt="User" />
            </div>
            <div className="text-white drop-shadow-md">
              <h2 className="font-black text-sm leading-tight">@{user?.username}</h2>
              <p className="text-[10px] font-black opacity-90 uppercase tracking-widest">
                {formatDistanceToNow(new Date(currentStory.created_at))} ago
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/')}
            className="w-10 h-10 flex items-center justify-center text-white drop-shadow-md bg-white/10 backdrop-blur-md rounded-full active:scale-90 transition-transform"
          >
            <X size={24} />
          </button>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="mt-auto relative z-20 px-4 pb-8 flex items-center gap-4">
        <div className="flex-1 bg-white/10 backdrop-blur-xl rounded-full border border-white/20 px-6 py-4">
          <input
            type="text"
            placeholder="Send a spicy reply..."
            className="w-full bg-transparent text-white placeholder:text-white/60 focus:outline-none text-sm font-bold"
            onFocus={() => setIsPaused(true)}
            onBlur={() => setIsPaused(false)}
          />
        </div>
        <button
          onClick={() => setIsLiked(!isLiked)}
          className="active:scale-90 transition-transform p-3 bg-white/10 backdrop-blur-md rounded-full border border-white/20"
        >
          <span className={`text-2xl transition-all ${isLiked ? 'grayscale-0 scale-125' : 'grayscale opacity-70 scale-100'}`}>
            😋
          </span>
        </button>
        <button className="active:scale-90 transition-transform p-3 bg-[#E85D1A] rounded-full shadow-lg shadow-orange-900/40">
          <Send size={24} className="text-white ml-0.5" />
        </button>
      </div>
    </div>
  );
};

export default StoryView;
