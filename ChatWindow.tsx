import React, { useState } from 'react';
import { Send, Image, Eye, EyeOff, Mic, Phone, Video, ArrowLeft } from 'lucide-react';

export default function ChatWindow() {
  const [messages, setMessages] = useState([
    { id: 1, sender: 'them', type: 'text', content: 'Hey, did you see the brand deal requirement guidelines?', timestamp: '10:04 AM', status: 'read' },
    { id: 2, sender: 'me', type: 'text', content: 'Yeah, just checked them! Sending you the asset requirements layout draft now.', timestamp: '10:05 AM', status: 'read' },
    { id: 3, sender: 'me', type: 'image', content: 'https://unsplash.com', timestamp: '10:06 AM', status: 'delivered', isViewOnce: true, opened: false }
  ]);
  const [textInput, setTextInput] = useState('');
  const [isViewOnceActive, setIsViewOnceActive] = useState(false);

  const handleSendMessage = () => {
    if (!textInput.trim()) return;
    setMessages([...messages, {
      id: Date.now(),
      sender: 'me',
      type: 'text',
      content: textInput,
      timestamp: 'Just now',
      status: 'sent' // 1 Grey Tick initially
    }]);
    setTextInput('');
  };

  // Status Ticks Component Parser
  const RenderTicks = ({ status }: { status: string }) => {
    if (status === 'sent') return <span className="text-slate-500 text-[11px] ml-1">✓</span>; // 1 Grey Tick
    if (status === 'delivered') return <span className="text-slate-500 text-[11px] ml-1">✓✓</span>; // 2 Grey Ticks
    if (status === 'read') return <span className="text-sky-400 text-[11px] ml-1">✓✓</span>; // 1 Blue Tick
    return null;
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans max-w-4xl mx-auto border-x border-slate-800 shadow-2xl">
      
      {/* 1. CHAT CONTACT CONTAINER HEADER */}
      <header className="bg-slate-800 border-b border-slate-700 px-4 py-3 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <button className="md:hidden text-slate-400 hover:text-white"><ArrowLeft size={20}/></button>
          <div className="relative">
            <img src="https://unsplash.com" alt="Avatar" className="w-10 h-10 rounded-full object-cover border border-indigo-400"/>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-slate-800 rounded-full"></span>
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-100">Alex_TechCreator</h3>
            <p className="text-[11px] text-green-400 font-medium">Online</p>
          </div>
        </div>
        
        {/* Calling Features Hook */}
        <div className="flex items-center gap-3 text-slate-400">
          <button className="hover:text-indigo-400 transition p-2 hover:bg-slate-700 rounded-xl"><Phone size={18}/></button>
          <button className="hover:text-indigo-400 transition p-2 hover:bg-slate-700 rounded-xl"><Video size={18}/></button>
        </div>
      </header>

      {/* 2. CHAT STREAM PORTAL */}
      <main className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-900/40">
        <div className="text-center my-2"><span className="text-[10px] bg-slate-800/80 text-slate-400 font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">Today</span></div>
        
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 shadow-sm ${msg.sender === 'me' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-slate-800 text-slate-100 rounded-tl-none'}`}>
              
              {/* Media Parser Conditions */}
              {msg.type === 'text' && <p className="text-sm leading-relaxed">{msg.content}</p>}
              
              {msg.type === 'image' && (
                msg.isViewOnce && msg.opened ? (
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 italic py-1"><EyeOff size={16}/> View Once Media Opened</div>
                ) : (
                  <div className="relative group rounded-lg overflow-hidden">
                    <img src={msg.content} alt="Media Attachment" className="max-w-full h-auto max-h-48 object-cover rounded-lg"/>
                    {msg.isViewOnce && (
                      <span className="absolute top-2 left-2 flex items-center gap-1 text-[9px] bg-black/70 text-amber-400 font-black px-1.5 py-0.5 rounded uppercase"><Eye size={10}/> View Once</span>
                    )}
                  </div>
                )
              )}

              {/* Timestamp & Ticks Overlay */}
              <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-slate-300/80 select-none">
                <span>{msg.timestamp}</span>
                {msg.sender === 'me' && <RenderTicks status={msg.status} />}
              </div>

            </div>
          </div>
        ))}
      </main>

      {/* 3. INPUT UTILITY FOOTER */}
      <footer className="bg-slate-800 border-t border-slate-700 p-3 sticky bottom-0">
        <div className="flex items-center gap-2">
          
          {/* Media Attach buttons */}
          <button className="text-slate-400 hover:text-indigo-400 p-2 hover:bg-slate-700 rounded-xl transition"><Image size={20}/></button>
          <button className="text-slate-400 hover:text-indigo-400 p-2 hover:bg-slate-700 rounded-xl transition"><Mic size={20}/></button>
          
          {/* View Once Mode Activation Toggle */}
          <button onClick={() => setIsViewOnceActive(!isViewOnceActive)} className={`p-2 rounded-xl transition flex items-center justify-center ${isViewOnceActive ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'text-slate-400 hover:text-indigo-400 hover:bg-slate-700'}`} title="Toggle View Once Media">
            <Eye size={20}/>
          </button>

          {/* Typing Container Frame */}
          <div className="flex-1 relative flex items-center">
            <input type="text" value={textInput} onChange={(e) => setTextInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} placeholder={isViewOnceActive ? "Send an asset locked as View-Once..." : "Type a secure message..."} className="w-full bg-slate-700 rounded-xl pl-4 pr-10 py-2.5 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"/>
          </div>

          {/* Dispatch Message Trigger */}
          <button onClick={handleSendMessage} className="bg-indigo-500 hover:bg-indigo-600 text-white p-2.5 rounded-xl shadow-md transition flex items-center justify-center"><Send size={18}/></button>
        </div>
      </footer>

    </div>
  );
}