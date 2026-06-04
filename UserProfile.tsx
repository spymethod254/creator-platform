import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, ShieldCheck, Mail, Phone, 
  Briefcase, Heart, ThumbsUp, MessageCircle, ExternalLink 
} from 'lucide-react';

export default function UserProfile() {
  const navigate = useNavigate();
  const { profileId } = useParams();
  
  const currentUserId = localStorage.getItem('userId') || '1';
  const targetProfileId = profileId || currentUserId;

  const [creator, setCreator] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState('posts');
  const [loading, setLoading] = useState(true);

    useEffect(() => {
    const fetchProfileData = async () => {
      try {
        // 1. Fetch real user row details from the database
        const userRes = await fetch(`http://localhost:5000/api/users/${targetProfileId}`);
        const userData = await userRes.json();

        if (!userRes.ok) throw new Error(userData.error);

        // 2. Fetch follow statistics metrics
        const statsRes = await fetch(`http://localhost:5000/api/creators/${targetProfileId}/follow-stats`);
        const statsData = await statsRes.json();

        // Combine database records seamlessly
        setCreator({
          user_id: userData.user_id,
          username: userData.username,
          email: userData.email,
          phone_number: userData.phone_number || 'No number linked',
          profile_picture_url: 'https://unsplash.com',
          work_status: userData.work_status || 'Available',
          relationship_status: userData.relationship_status || 'Private',
          totalFollowers: statsData.totalFollowers || 0,
          totalFollowing: statsData.totalFollowing || 0
        });

        setLoading(false);
      } catch (err) {
        console.error('Error mounting profile details:', err);
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [targetProfileId, currentUserId]);

  const handleFollowActionToggle = async () => {
    if (!creator) return;
    try {
      const response = await fetch('http://localhost:5000/api/creators/follow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          followerId: Number(currentUserId),
          followingId: creator.user_id
        })
      });

      if (response.ok) {
        const data = await response.json();
        setIsFollowing(data.following);
        
        setCreator(prev => {
          if (!prev) return null;
          const currentCount = prev.totalFollowers || 0;
          const updatedCount = data.following ? currentCount + 1 : Math.max(0, currentCount - 1);
          return { ...prev, totalFollowers: updatedCount };
        });
      }
    } catch (err) {
      console.error('Failed to execute account follow matrix toggle:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-400 flex items-center justify-center font-mono">
        Loading Profile...
      </div>
    );
  }

  if (!creator) {
    return (
      <div className="min-h-screen bg-slate-900 text-rose-400 flex items-center justify-center font-bold">
        Profile record missing.
      </div>
    );
  }

  const isProfileOwner = currentUserId.toString() === creator.user_id.toString();

  const followButtonClass = isFollowing 
    ? 'text-xs font-bold px-4 py-2 rounded-xl transition shadow-sm bg-slate-700 text-slate-300' 
    : 'text-xs font-bold px-4 py-2 rounded-xl transition shadow-sm bg-indigo-500 text-white hover:bg-indigo-600';

  const feedTabClass = activeTab === 'posts'
    ? 'pb-3 px-4 border-b-2 transition border-indigo-500 text-indigo-400'
    : 'pb-3 px-4 border-b-2 transition border-transparent text-slate-400 hover:text-slate-200';

  const aboutTabClass = activeTab === 'about'
    ? 'pb-3 px-4 border-b-2 transition border-indigo-500 text-indigo-400'
    : 'pb-3 px-4 border-b-2 transition border-transparent text-slate-400 hover:text-slate-200';
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans pb-12">
      <header className="bg-slate-800 border-b border-slate-700 px-4 py-3 sticky top-0 z-50 flex items-center gap-3">
        <button type="button" onClick={() => navigate(-1)} className="text-slate-400 hover:text-white transition">
          <ArrowLeft size={20} />
        </button>
        <div className="flex items-center gap-1.5">
          <h2 className="font-bold text-sm">{creator.username}</h2>
          <ShieldCheck size={16} className="text-indigo-400" />
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 pt-6">
        <div className="flex flex-col sm:flex-row items-center gap-5 bg-slate-800 p-6 rounded-2xl border border-slate-700/80 shadow-md">
          <div className="relative shadow-lg">
            <img src={creator.profile_picture_url} alt="Avatar" className="w-24 h-24 rounded-full object-cover border-4 border-indigo-500"/>
            <span className="absolute bottom-1 right-1 w-3 h-3 bg-green-500 border-2 border-slate-800 rounded-full"></span>
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-xl font-black text-white">{creator.username}</h1>
            <div className="flex items-center justify-center sm:justify-start gap-4 my-2 text-xs text-slate-400">
              <div><span className="font-bold text-indigo-400">{creator.totalFollowers}</span> Followers</div>
              <div><span className="font-bold text-indigo-400">{creator.totalFollowing}</span> Following</div>
            </div>
            <div className="mt-3 flex gap-2 justify-center sm:justify-start">
              {!isProfileOwner && (
                <button type="button" onClick={handleFollowActionToggle} className={followButtonClass}>
                  {isFollowing ? '✓ Following' : 'Follow'}
                </button>
              )}
              <button type="button" onClick={() => navigate('/chat')} className="bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-bold px-4 py-2 rounded-xl transition shadow-sm">
                {isProfileOwner ? 'Manage Settings' : 'Message'}
              </button>
            </div>
          </div>
        </div>

        <div className="flex border-b border-slate-800 mt-6 text-sm font-bold">
          <button type="button" onClick={() => setActiveTab('posts')} className={feedTabClass}>Feed Updates</button>
          <button type="button" onClick={() => setActiveTab('about')} className={aboutTabClass}>About Matrix</button>
        </div>

        <div className="mt-5">
          {activeTab === 'posts' && (
            <div className="space-y-4">
              <article className="bg-slate-800 rounded-2xl border border-slate-700 p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-2 text-xs text-slate-400">
                  <span className="font-bold text-slate-200">{creator.username}</span> • <span>Just Now</span>
                </div>
                <p className="text-sm text-slate-300 mb-3">Setting up my new camera gear layout for tomorrow's live stream setup.</p>
                <div className="flex gap-4 text-xs text-slate-500 font-semibold">
                  <button type="button" className="flex items-center gap-1 hover:text-indigo-400 transition"><ThumbsUp size={14}/> 0 Likes</button>
                  <button type="button" className="flex items-center gap-1 hover:text-indigo-400 transition"><MessageCircle size={14}/> 0 Comments</button>
                </div>
              </article>
            </div>
          )}

          {activeTab === 'about' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-800 rounded-2xl border border-slate-700 p-4 shadow-sm">
                <h3 className="text-xs font-bold text-slate-400 uppercase mb-3 tracking-wider">Social Channels</h3>
                <div className="space-y-2">
                  <a href="https://tiktok.com" target="_blank" rel="noreferrer" className="flex justify-between p-2.5 bg-slate-700/40 hover:bg-slate-700/70 rounded-xl text-xs transition">
                    <span className="font-bold text-slate-200">TikTok</span>
                    <span className="text-slate-400 flex items-center gap-1">@alex_tech <ExternalLink size={12}/></span>
                  </a>
                  <a href="https://instagram.com" target="_blank" rel="noreferrer" className="flex justify-between p-2.5 bg-slate-700/40 hover:bg-slate-700/70 rounded-xl text-xs transition">
                    <span className="font-bold text-slate-200">Instagram</span>
                    <span className="text-slate-400 flex items-center gap-1">@alex_tech_visuals <ExternalLink size={12}/></span>
                  </a>
                </div>
              </div>

              <div className="bg-slate-800 rounded-2xl border border-slate-700 p-4 space-y-4 shadow-sm">
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase mb-2 tracking-wider">Status Metrics</h3>
                  <div className="space-y-1.5 text-xs text-slate-300">
                    <div className="flex items-center gap-2"><Briefcase size={14} className="text-slate-500"/> <span>Work: {creator.work_status}</span></div>
                    <div className="flex items-center gap-2"><Heart size={14} className="text-slate-500"/> <span>Status: {creator.relationship_status}</span></div>
                  </div>
                </div>

                {isProfileOwner ? (
                  <div className="border-t border-slate-700 pt-3">
                    <h3 className="text-xs font-bold text-amber-400 uppercase mb-2 tracking-wider">Private Details</h3>
                    <div className="space-y-2 text-xs font-mono">
                      <div className="flex items-center gap-2 p-2 bg-slate-900 rounded-xl border border-slate-800"><Mail size={14} className="text-slate-500"/> <span>{creator.email}</span></div>
                      <div className="flex items-center gap-2 p-2 bg-slate-900 rounded-xl border border-slate-800"><Phone size={14} className="text-slate-500"/> <span>{creator.phone_number}</span></div>
                    </div>
                  </div>
                ) : (
                  <div className="border-t border-slate-700/60 pt-3 text-center text-xs text-slate-500 italic">
                    🔒 Private details are locked.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
