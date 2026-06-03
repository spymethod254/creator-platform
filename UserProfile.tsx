import React, { useState } from 'react';
import { 
  ArrowLeft, Grid, Link2, ShieldCheck, Mail, Phone, 
  Briefcase, Heart, Check, ThumbsUp, MessageCircle, ExternalLink 
} from 'lucide-react';

export default function UserProfile() {
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState<'posts' | 'about'>('posts');

  const creatorData = {
    username: "Alex_TechCreator",
    fullName: "Alex Rivera",
    profilePicture: "https://unsplash.com",
    totalFollowers: "14.2K",
    totalFollowing: "382",
    workStatus: "Freelance",
    relationshipStatus: "Single",
    privateEmail: "alex.rivera.creations@gmail.com",
    privatePhone: "+1 (555) 234-5678",
    socialLinks: [
      { platform: "TikTok", handle: "@alex_tech", url: "https://tiktok.com" },
      { platform: "Instagram", handle: "@alex_tech_visuals", url: "https://instagram.com" },
      { platform: "YouTube", handle: "Alex Tech Reviews", url: "https://youtube.com" }
    ],
    posts: [
      { id: 1, content: "Setting up my new camera gear layout for tomorrow's live stream setup.", likes: 142, comments: 28, time: "2 hours ago" }
    ]
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans pb-12">
      {/* HEADER BAR */}
      <header className="bg-slate-800 border-b border-slate-700 px-4 py-3 sticky top-0 z-50 flex items-center gap-3">
        <button className="text-slate-400 hover:text-white"><ArrowLeft size={20} /></button>
        <div className="flex items-center gap-1.5">
          <h2 className="font-bold text-sm">{creatorData.username}</h2>
          <ShieldCheck size={16} className="text-indigo-400" />
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 pt-6">
        {/* HERO CARD */}
        <div className="flex flex-col sm:flex-row items-center gap-5 bg-slate-800 p-6 rounded-2xl border border-slate-700/80 shadow-md">
          <div className="relative">
            <img src={creatorData.profilePicture} alt="Avatar" className="w-24 h-24 rounded-full object-cover border-4 border-indigo-500"/>
            <span className="absolute bottom-1 right-1 w-3 h-3 bg-green-500 border-2 border-slate-800 rounded-full"></span>
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-xl font-black text-white">{creatorData.fullName}</h1>
            <div className="flex items-center justify-center sm:justify-start gap-4 my-2 text-xs">
              <div><span className="font-bold text-indigo-400">{creatorData.totalFollowers}</span> Followers</div>
              <div><span className="font-bold text-indigo-400">{creatorData.totalFollowing}</span> Following</div>
            </div>
            <div className="mt-3 flex gap-2 justify-center sm:justify-start">
              <button onClick={() => setIsFollowing(!isFollowing)} className={`text-xs font-bold px-4 py-2 rounded-xl transition ${isFollowing ? 'bg-slate-700 text-slate-300' : 'bg-indigo-500 text-white'}`}>
                {isFollowing ? '✓ Following' : 'Follow'}
              </button>
              <button className="bg-slate-700 text-slate-200 text-xs font-bold px-4 py-2 rounded-xl">Message</button>
            </div>
          </div>
        </div>

        {/* TAB NAVIGATION */}
        <div className="flex border-b border-slate-800 mt-6 text-sm font-bold">
          <button onClick={() => setActiveTab('posts')} className={`pb-3 px-4 border-b-2 ${activeTab === 'posts' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400'}`}>Feed</button>
          <button onClick={() => setActiveTab('about')} className={`pb-3 px-4 border-b-2 ${activeTab === 'about' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400'}`}>About</button>
        </div>

        {/* TABS CONTAINER */}
        <div className="mt-5">
          {activeTab === 'posts' && (
            <div className="space-y-4">
              {creatorData.posts.map(post => (
                <article key={post.id} className="bg-slate-800 rounded-2xl border border-slate-700 p-4">
                  <div className="flex items-center gap-2 mb-2 text-xs text-slate-400">
                    <span className="font-bold text-slate-200">{creatorData.username}</span> • <span>{post.time}</span>
                  </div>
                  <p className="text-sm text-slate-300 mb-3">{post.content}</p>
                  <div className="flex gap-4 text-xs text-slate-400 font-semibold">
                    <button className="flex items-center gap-1 hover:text-indigo-400"><ThumbsUp size={14}/> {post.likes}</button>
                    <button className="flex items-center gap-1 hover:text-indigo-400"><MessageCircle size={14}/> {post.comments}</button>
                  </div>
                </article>
              ))}
            </div>
          )}

          {activeTab === 'about' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Public Badge Links */}
              <div className="bg-slate-800 rounded-2xl border border-slate-700 p-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase mb-3">Profiles</h3>
                <div className="space-y-2">
                  {creatorData.socialLinks.map((link, idx) => (
                    <a key={idx} href={link.url} target="_blank" rel="noreferrer" className="flex justify-between p-2.5 bg-slate-700/40 rounded-xl text-xs">
                      <span className="font-bold text-slate-200">{link.platform}</span>
                      <span className="text-slate-400 flex items-center gap-1">{link.handle} <ExternalLink size={12}/></span>
                    </a>
                  ))}
                </div>
              </div>

              {/* Status and Secure Private Items */}
              <div className="bg-slate-800 rounded-2xl border border-slate-700 p-4 space-y-4">
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase mb-2">Status</h3>
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-2"><Briefcase size={14}/> <span>Work: {creatorData.workStatus}</span></div>
                    <div className="flex items-center gap-2"><Heart size={14}/> <span>Status: {creatorData.relationshipStatus}</span></div>
                  </div>
                </div>
                <div className="border-t border-slate-700 pt-3">
                  <h3 className="text-xs font-bold text-amber-500 uppercase mb-2">Private Details</h3>
                  <div className="space-y-2 text-xs font-mono">
                    <div className="flex items-center gap-2 p-2 bg-slate-900 rounded-xl"><Mail size={14}/> <span>{creatorData.privateEmail}</span></div>
                    <div className="flex items-center gap-2 p-2 bg-slate-900 rounded-xl"><Phone size={14}/> <span>{creatorData.privatePhone}</span></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div> {/* Tab closure */}
      </div> {/* Width limit closure */}
    </div> {/* Screen root closure */}
  );
}