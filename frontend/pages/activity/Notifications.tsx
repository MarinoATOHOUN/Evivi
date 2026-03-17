import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft, Settings, MessageCircle, UserPlus, Heart,
  AtSign, Flame, Sparkles, Filter, CheckCircle2
} from 'lucide-react';
import PageWrapper from '../../components/layout/PageWrapper';
import api from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';

interface Actor {
  id: string;
  username: string;
  avatar: string | null;
}

interface NotificationData {
  id: number;
  actor: {
    id: string;
    username: string;
    avatar: string | null;
  };
  notification_type: 'follow' | 'recipe_like' | 'recipe_comment' | 'story_view' | 'story_reaction' | 'mention' | 'system';
  message: string | null;
  extra_data: {
    other_actors?: Array<{ id: string; username: string; avatar: string | null }>;
    preview_image?: string;
    target_title?: string;
    comment_text?: string;
  };
  target_recipe?: {
    id: string;
    title: string;
  };
  is_read: boolean;
  created_at: string;
}

const NotificationItem: React.FC<{ notification: NotificationData }> = ({ notification }) => {
  const navigate = useNavigate();
  const othersCount = notification.extra_data?.other_actors?.length || 0;

  const getIcon = () => {
    switch (notification.notification_type) {
      case 'follow': return <UserPlus size={10} className="text-white" />;
      case 'recipe_like': return <Heart size={10} className="text-white fill-white" />;
      case 'recipe_comment': return <MessageCircle size={10} className="text-white" />;
      case 'mention': return <AtSign size={10} className="text-white" />;
      case 'story_view': return <Flame size={10} className="text-white fill-white" />;
      case 'story_reaction': return <Sparkles size={10} className="text-white" />;
      default: return <Heart size={10} className="text-white" />;
    }
  };

  const getBadgeColor = () => {
    switch (notification.notification_type) {
      case 'follow': return 'bg-blue-500';
      case 'recipe_like': return 'bg-[#E85D1A]';
      case 'recipe_comment': return 'bg-green-500';
      case 'mention': return 'bg-purple-500';
      case 'story_view': return 'bg-orange-400';
      default: return 'bg-gray-500';
    }
  };

  const getMessage = () => {
    const actorName = notification.actor.username;
    const othersText = othersCount > 0 ? ` and ${othersCount} others` : '';
    const targetTitle = notification.extra_data?.target_title || notification.target_recipe?.title;

    switch (notification.notification_type) {
      case 'follow': return `${othersCount > 0 ? ' started following you' : ' started following you'}`;
      case 'recipe_like': return ` loved your recipe ${targetTitle ? `"${targetTitle}"` : ''}`;
      case 'recipe_comment': return ` commented on ${targetTitle ? `"${targetTitle}"` : 'your recipe'}`;
      case 'mention': return ` mentioned you in a moments`;
      case 'story_view': return ` viewed your kitchen moments`;
      case 'story_reaction': return ` reacted to your moments`;
      default: return ` interacting with you`;
    }
  };

  const handleNavigate = () => {
    if (notification.notification_type === 'follow' && !othersCount) {
      navigate(`/profile/${notification.actor.username}`);
    } else if (notification.target_recipe) {
      navigate(`/recipe/${notification.target_recipe.id}`);
    }
  };

  const timeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d`;
    if (hours > 0) return `${hours}h`;
    if (minutes > 0) return `${minutes}m`;
    return 'now';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={handleNavigate}
      className={`flex items-center gap-4 py-4 group active:bg-orange-50/50 transition-all px-3 rounded-[24px] cursor-pointer ${!notification.is_read ? 'bg-white shadow-sm ring-1 ring-orange-100/50' : ''}`}
    >
      <div className="relative shrink-0">
        <div className="flex -space-x-3">
          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-sm ring-2 ring-orange-50/20">
            <img
              src={notification.actor.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${notification.actor.username}`}
              className="w-full h-full object-cover"
              alt={notification.actor.username}
            />
          </div>
          {othersCount > 0 && (
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-sm bg-gray-50 flex items-center justify-center">
              <span className="text-[10px] font-black text-gray-400">+{othersCount}</span>
            </div>
          )}
        </div>
        <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center border-2 border-white shadow-sm ${getBadgeColor()} z-10`}>
          {getIcon()}
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-[14px] text-gray-700 leading-snug">
          <span className="font-black text-gray-900">
            {notification.actor.username}
            {othersCount > 0 && ` & ${othersCount} others`}
          </span>
          <span className="ml-1 text-gray-500 font-medium">{getMessage()}</span>
        </p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-[11px] text-[#E85D1A] font-black uppercase tracking-widest">{timeAgo(notification.created_at)}</span>
          {!notification.is_read && <div className="w-1.5 h-1.5 bg-[#E85D1A] rounded-full" />}
        </div>
      </div>

      {notification.extra_data?.preview_image && (
        <div className="w-14 h-14 rounded-2xl overflow-hidden border border-gray-100 shrink-0 shadow-sm transition-transform group-hover:scale-105">
          <img
            src={notification.extra_data.preview_image}
            className="w-full h-full object-cover"
            alt="Preview"
          />
        </div>
      )}
    </motion.div>
  );
};

const Notifications: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications/');
      setNotifications(response.data.results || response.data);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      // Mark as read delay to allow user to see unread status for a moment
      const timer = setTimeout(() => {
        api.post('/notifications/mark_all_read/').catch(() => { });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated]);

  const groups = useMemo(() => {
    const today: NotificationData[] = [];
    const yesterday: NotificationData[] = [];
    const earlier: NotificationData[] = [];

    const now = new Date();
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);

    const filtered = filter === 'unread' ? notifications.filter(n => !n.is_read) : notifications;

    filtered.forEach(notif => {
      const date = new Date(notif.created_at);
      if (date.toDateString() === now.toDateString()) {
        today.push(notif);
      } else if (date.toDateString() === yesterdayDate.toDateString()) {
        yesterday.push(notif);
      } else {
        earlier.push(notif);
      }
    });

    return { today, yesterday, earlier };
  }, [notifications, filter]);

  return (
    <PageWrapper withPadding={false} className="bg-[#FDF8F5] min-h-screen">
      {/* Premium Header */}
      <header className="sticky top-0 z-50 bg-[#FDF8F5]/90 backdrop-blur-xl px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center bg-white rounded-2xl shadow-sm text-gray-900 active:scale-90 transition-transform border border-gray-100">
            <ChevronLeft size={24} />
          </button>
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight leading-none">Activity</h1>
            <p className="text-[10px] font-black text-[#E85D1A] uppercase tracking-[0.2em] mt-1">Updates from kitchen</p>
          </div>
        </div>
        <button className="w-10 h-10 flex items-center justify-center bg-white rounded-2xl shadow-sm text-gray-900 active:scale-90 transition-transform border border-gray-100">
          <Settings size={20} />
        </button>
      </header>

      {/* Filters */}
      <div className="px-6 flex gap-2 mb-4 overflow-x-auto hide-scrollbar">
        <button
          onClick={() => setFilter('all')}
          className={`px-6 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${filter === 'all' ? 'bg-[#E85D1A] text-white shadow-lg shadow-orange-900/10' : 'bg-white text-gray-500 border border-gray-100'}`}
        >
          All Activities
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-6 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${filter === 'unread' ? 'bg-[#E85D1A] text-white shadow-lg shadow-orange-900/10' : 'bg-white text-gray-500 border border-gray-100'}`}
        >
          Unread
        </button>
      </div>

      <div className="px-5 pb-32">
        {isLoading ? (
          <div className="space-y-4 pt-10">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="flex gap-4 animate-pulse px-3 py-4 bg-white/50 rounded-3xl border border-white">
                <div className="w-12 h-12 bg-gray-100 rounded-full" />
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-4 bg-gray-100 rounded w-3/4" />
                  <div className="h-2 bg-gray-100 rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center gap-6">
            <div className="w-24 h-24 bg-white rounded-[40px] shadow-xl shadow-orange-100/50 flex items-center justify-center text-[#E85D1A] border-2 border-orange-50 relative">
              <Sparkles size={48} />
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-orange-500 rounded-full border-4 border-white animate-bounce" />
            </div>
            <div>
              <p className="text-xl font-black text-gray-900">Spices are settling...</p>
              <p className="text-sm text-gray-500 font-medium px-10">Your culinary interactions will appear here once the heat turns up!</p>
            </div>
            <button
              onClick={() => navigate('/discover')}
              className="bg-[#E85D1A] text-white px-8 py-4 rounded-3xl font-black text-sm shadow-xl shadow-orange-900/20 active:scale-95 transition-all mt-4"
            >
              Start Discovery
            </button>
          </div>
        ) : (
          <div className="mt-2 space-y-8">
            {Object.entries(groups).map(([key, list]) => list.length > 0 && (
              <div key={key} className="space-y-3">
                <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.3em] px-3">{key}</h3>
                <div className="space-y-2">
                  <AnimatePresence>
                    {list.map(notif => (
                      <NotificationItem key={notif.id} notification={notif} />
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            ))}

            {filter === 'unread' && notifications.filter(n => !n.is_read).length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center gap-4 opacity-60">
                <CheckCircle2 size={48} className="text-green-500" />
                <p className="text-sm font-black text-gray-900">You're all caught up!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </PageWrapper>
  );
};

export default Notifications;
