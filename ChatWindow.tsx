import React, { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { Send, Image, Eye, EyeOff, Mic, Phone, Video, ArrowLeft } from 'lucide-react';

interface ChatMessage {
  id: string;
  senderId: string;
  recipientId: string;
  type: 'text' | 'image' | 'video' | 'audio';
  content: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
  isViewOnce?: boolean;
  opened?: boolean;
  dbId?: number;
}

let socketInstance: Socket | null = null;

export default function ChatWindow() {
  const currentUserId = localStorage.getItem('userId') || '1';
  const targetUserId = '2'; // Simulated chat partner connection index
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [textInput, setTextInput] = useState('');
  const [isViewOnceActive, setIsViewOnceActive] = useState(false);

  useEffect(() => {
    // Connect to live Socket.io backend channel
    socketInstance = io('http://localhost:5000');

    socketInstance.emit('user_online', currentUserId);

    socketInstance.on('receive_message', (data: any) => {
      if (data.senderId === targetUserId) {
        const incomingMsg: ChatMessage = {
          id: data.messageId,
          senderId: data.senderId,
          recipientId: data.recipientId,
          type: data.type,
          content: data.content,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: 'read',
          isViewOnce: data.isViewOnce,
          opened: false,
          dbId: data.dbId
        };
        setMessages((prev) => [...prev, incomingMsg]);
        // Immediately fire back read event signal to trigger Blue Ticks on sender device
        socketInstance?.emit('message_read', { messageId: data.messageId, senderId: data.senderId, isViewOnce: data.isViewOnce, dbId: data.dbId });
      }
    });

    socketInstance.on('message_status_update', (data: { messageId: string; status: 'sent' | 'delivered' | 'read' }) => {
      setMessages((prev) =>
        prev.map((msg) => (msg.id === data.messageId ? { ...msg, status: data.status } : msg))
      );
    });

    socketInstance.on('destroy_view_once_media', (data: { messageId: string }) => {
      setMessages((prev) =>
        prev.map((msg) => (msg.id === data.messageId ? { ...msg, opened: true } : msg))
      );
    });

    return () => {
      socketInstance?.disconnect();
    };
  }, [currentUserId]);

  const handleSendMessage = () => {
    if (!textInput.trim() || !socketInstance) return;

    const uniqueMsgId = Date.now().toString();
    const payload = {
      messageId: uniqueMsgId,
      senderId: currentUserId,
      recipientId: targetUserId,
      type: 'text' as const,
      content: textInput,
      isViewOnce: isViewOnceActive
    };

    const newLocalMsg: ChatMessage = {
      id: uniqueMsgId,
      senderId: currentUserId,
      recipientId: targetUserId,
      type: 'text',
      content: textInput,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sent',
      isViewOnce: isViewOnceActive,
      opened: false
    };

    setMessages((prev) => [...prev, newLocalMsg]);
    socketInstance.emit('send_message', payload);
    setTextInput('');
    setIsViewOnceActive(false);
  };

  const RenderTicks = ({ status }: { status: string }) => {
    if (status === 'sent') return <span className="text-slate-500 text-[11px] ml-1" title="Sent (1 Grey Tick)">✓</span>;
    if (status === 'delivered') return <span className="text-slate-500 text-[11px] ml-1" title="Delivered (2 Grey Ticks)">✓✓</span>;
    if (status === 'read') return <span className="text-sky-400 text-[11px] ml-1" title="Read (Blue Tick)">✓✓</span>;
    return null;
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans max-w-4xl mx-auto border-x border-slate-800 shadow-2xl">
      <header className="bg-slate-800 border-b border-slate-700 px-4 py-3 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <button type="button" className="md:hidden text-slate-400 hover:text-white"><ArrowLeft size={20}/></button>
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center font-bold">CC</div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-slate-800 rounded-full"></span>
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-100">Chat Connection Channel</h3>
            <p className="text-[11px] text-green-400 font-medium">Online</p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-slate-400">
          <button type="button" className="hover:text-indigo-400 p-2 hover:bg-slate-700 rounded-xl"><Phone size={18}/></button>
          <button type="button" className="hover:text-indigo-400 p-2 hover:bg-slate-700 rounded-xl"><Video size={18}/></button>
        </div>
      </header>

      <main className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.senderId === currentUserId ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 shadow-sm ${msg.senderId === currentUserId ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-slate-800 text-slate-100 rounded-tl-none'}`}>
              {msg.type === 'text' && <p className="text-sm leading-relaxed">{msg.content}</p>}
              {msg.type === 'image' && (
                msg.isViewOnce && msg.opened ? (
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 italic py-1"><EyeOff size={16}/> View Once Media Opened</div>
                ) : (
                  <div className="relative group rounded-lg overflow-hidden">
                    <img src={msg.content} alt="Media Attachment" className="max-w-full h-auto max-h-48 object-cover rounded-lg"/>
                    {msg.isViewOnce && <span className="absolute top-2 left-2 flex items-center gap-1 text-[9px] bg-black/70 text-amber-400 font-black px-1.5 py-0.5 rounded uppercase"><Eye size={10}/> View Once</span>}
                  </div>
                )
              )}
              <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-slate-300/80 select-none">
                <span>{msg.timestamp}</span>
                {msg.senderId === currentUserId && <RenderTicks status={msg.status} />}
              </div>
            </div>
          </div>
        ))}
      </main>

      <footer className="bg-slate-800 border-t border-slate-700 p-3 sticky bottom-0">
        <div className="flex items-center gap-2">
          <button type="button" className="text-slate-400 hover:text-indigo-400 p-2 hover:bg-slate-700 rounded-xl"><Image size={20}/></button>
          <button type="button" className="text-slate-400 hover:text-indigo-400 p-2 hover:bg-slate-700 rounded-xl"><Mic size={20}/></button>
          <button type="button" onClick={() => setIsViewOnceActive(!isViewOnceActive)} className={`p-2 rounded-xl transition flex items-center justify-center ${isViewOnceActive ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'text-slate-400 hover:text-indigo-400 hover:bg-slate-700'}`}>
            <Eye size={20}/>
          </button>
          <div className="flex-1 relative flex items-center">
            <input type="text" value={textInput} onChange={(e) => setTextInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} placeholder={isViewOnceActive ? "Send a View-Once text secure flag item..." : "Type a message..."} className="w-full bg-slate-700 rounded-xl pl-4 pr-10 py-2.5 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
          </div>
          <button type="button" onClick={handleSendMessage} className="bg-indigo-500 hover:bg-indigo-600 text-white p-2.5 rounded-xl shadow-md flex items-center justify-center"><Send size={18}/></button>
        </div>
      </footer>
    </div>
  );
}
