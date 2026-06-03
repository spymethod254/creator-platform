import React, { useState } from 'react';
import { Home, Compass, Video, MessageSquare, Menu, ThumbsUp, MessageCircle, Share2, Award, ExternalLink } from 'lucide-react';

export default function Homepage() {
  const [posts, setPosts] = useState([
    {
      id: 1,
      author: "Alex_TechCreator",
      avatar: "https://unsplash.com",
      content: "Just dropped a new tech review tutorial! Check my links to watch on TikTok or YouTube. Let's collaborate!",
      links: [{ platform: "TikTok", url: "https://tiktok.com" }, { platform: "YouTube", url: "https://youtube.com" }],
      isAdminFeatured: true,
      likes: 24,
      comments: 5
    },
    {
      id: 2,
      author: "Sarah_Design",
      avatar: "https://unsplash.com",
      content: "Looking for a video editor for a lifestyle brand campaign. High budget job opportunity! DM for details.",
      links: [{ platform: "LinkedIn", url: "https://linkedin.com" }],
      isAdminFeatured: false,
      likes: 12,
      comments: 3
    }
  ]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      
      {/* GLOBAL TOP NAVIGATION HEADER */}
      <header className="bg-slate-800 border-b border-slate-700 sticky top-0 z-50 px-4 py-2 flex justify-between items-center shadow-md">
        <h1 className="text-xl font-black tracking-wider text-indigo-400">CREATOR.HUB</h1>
        <div className="flex bg-slate-700 rounded-full px-3 py-1 text-sm border border-slate-600">
          <span className="text-green-400 mr-1.5">●</span> 1,240 Creators Online
        </div>
      </header>

      {/* MAIN LAYOUT CONTAINER */}
      <div className="flex-1 max-w-6xl w-full mx-auto flex">
        
        {/* DESKTOP LEFT SIDEBAR (HIDDEN ON MOBILE) */}
        <aside className="w-64 p-4 hidden md:flex flex-col gap-2 border-r border-slate-800">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 mb-2">Navigation</p>
          <button className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium transition"><Home size={18}/> Feed Home</button>
          <button className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-slate-200 text-sm font-medium transition"><Compass size={18}/> Suggestions</button>
          <button className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-slate-200 text-sm font-medium transition"><Video size={18}/> Videos</button>
          <button className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-slate-200 text-sm font-medium transition"><MessageSquare size={18}/> Messenger</button>
        </aside>

        {/* SCROLLABLE SCROLL FEED (MOBILE & DESKTOP) */}
        <main className="flex-1 p-4 overflow-y-auto max-w-2xl mx-auto w-full pb-24 md:pb-4">
          
          {/* QUICK POST CREATOR BOX */}
          <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700 mb-5 shadow-sm">
            <div className="flex gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center font-bold text-sm">YOU</div>
              <input type="text" placeholder="Share a post, job update or cross-promotion link..." className="bg-slate-700 w-full rounded-xl px-4 py-2 text-sm text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"/>
            </div>
            <div className="border-t border-slate-700/60 pt-2 flex justify-end">
              <button className="bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold px-4 py-2 rounded-lg transition shadow-sm">Post Update</button>
            </div>
          </div>

          {/* POSTS LIST FEED MAP */}
          <div className="flex flex-col gap-4">
            {posts.map(post => (
              <article key={post.id} className="bg-slate-800 rounded-2xl border border-slate-700 shadow-sm overflow-hidden">
                
                {/* Post Author Block */}
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src={post.avatar} alt="Avatar" className="w-10 h-10 rounded-full object-cover border-2 border-indigo-400"/>
                    <div>
                      <h4 className="font-bold text-sm text-slate-100 hover:underline cursor-pointer">{post.author}</h4>
                      <p className="text-xs text-slate-400">Just now</p>
                    </div>
                  </div>
                  {post.isAdminFeatured && (
                    <span className="flex items-center gap-1 text-[10px] uppercase font-black bg-amber-500/10 text-amber-400 px-2 py-1 rounded-md border border-amber-500/20">
                      <Award size={12}/> Featured
                    </span>
                  )}
                </div>

                {/* Content Paragraph */}
                <div className="px-4 pb-3 text-sm text-slate-300 leading-relaxed">
                  {post.content}
                </div>

                {/* Attached Shared Cross-Promotion Social Links */}
                {post.links && post.links.length > 0 && (
                  <div className="px-4 pb-3 flex flex-wrap gap-2">
                    {post.links.map((link, idx) => (
                      <a key={idx} href={link.url} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-xs bg-slate-700 hover:bg-indigo-950 hover:text-indigo-300 border border-slate-600 rounded-lg px-3 py-1.5 font-medium text-slate-200 transition">
                        <ExternalLink size={12}/> {link.platform} Profile
                      </a>
                    ))}
                  </div>
                )}

                {/* Action Interaction Buttons (Like / Comment) */}
                <div className="px-4 py-2.5 bg-slate-800/50 border-t border-slate-700/60 flex items-center justify-between text-xs font-semibold text-slate-400">
                  <button className="flex items-center gap-1.5 hover:text-indigo-400 transition py-1 px-2 rounded-lg hover:bg-slate-700/50">
                    <ThumbsUp size={16}/> <span>{post.likes} Likes</span>
                  </button>
                  <button className="flex items-center gap-1.5 hover:text-indigo-400 transition py-1 px-2 rounded-lg hover:bg-slate-700/50">
                    <MessageCircle size={16}/> <span>{post.comments} Comments</span>
                  </button>
                  <button className="flex items-center gap-1.5 hover:text-indigo-400 transition py-1 px-2 rounded-lg hover:bg-slate-700/50">
                    <Share2 size={16}/> <span>Share</span>
                  </button>
                </div>

              </article>
            ))}
          </div>
        </main>

      </div>

      {/* MOBILE BOTTOM TOOLBAR MENU (ONLY SHOWS ON MOBILE SCREENS) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-800/95 backdrop-blur-md border-t border-slate-700 px-4 py-2 flex justify-around items-center text-slate-400 z-50 shadow-lg">
        <button className="flex flex-col items-center gap-0.5 text-indigo-400"><Home size={20}/><span className="text-[10px] font-medium">Home</span></button>
        <button className="flex flex-col items-center gap-0.5 hover:text-slate-200"><Compass size={20}/><span className="text-[10px] font-medium">Explore</span></button>
        <button className="flex flex-col items-center gap-0.5 hover:text-slate-200"><Video size={20}/><span className="text-[10px] font-medium">Videos</span></button>
        <button className="flex flex-col items-center gap-0.5 hover:text-slate-200"><MessageSquare size={20}/><span className="text-[10px] font-medium">Chat</span></button>
        <button className="flex flex-col items-center gap-0.5 hover:text-slate-200"><Menu size={20}/><span className="text-[10px] font-medium">Menu</span></button>
      </nav>

    </div>
  );
}