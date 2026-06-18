import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useSocket } from '../hooks/useSocket';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

interface ChatMessage {
  id: number;
  text: string;
  createdAt: string;
  roomId?: number;
  meetingId?: number;
  sender: {
    id: number;
    name: string;
  };
}

export const GroupChat: React.FC<{ roomId?: number, meetingId?: number }> = ({ roomId, meetingId }) => {
  const { user } = useAuth();
  const { socket, connected } = useSocket();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [isOpen, messages]);

  useEffect(() => {
    if (!socket) return;

    if (roomId) {
      socket.emit('room:join', roomId);
      
      // Fetch historical messages
      const fetchHistory = async () => {
        try {
          setIsLoadingHistory(true);
          const res = await api.get(`/chat/room/${roomId}`);
          setMessages(res.data.messages || []);
        } catch (error) {
          console.error('Failed to fetch chat history', error);
        } finally {
          setIsLoadingHistory(false);
        }
      };
      fetchHistory();
    }

    const onMessage = (msg: ChatMessage) => {
      // Basic check to see if this message belongs to the current view
      if ((roomId && msg.roomId === roomId) || (!roomId && !msg.roomId)) {
        setMessages(prev => [...prev, msg]);
      }
    };
    
    const onDeleted = (msgId: number) => {
      setMessages(prev => prev.filter(m => m.id !== msgId));
    };

    socket.on('chat:message', onMessage);
    socket.on('chat:deleted', onDeleted);

    return () => {
      socket.off('chat:message', onMessage);
      socket.off('chat:deleted', onDeleted);
      if (roomId) {
        socket.emit('room:leave', roomId);
      }
    };
  }, [socket, roomId]);

  const handleSend = () => {
    if (!inputText.trim() || !socket || !connected) return;
    
    socket.emit('chat:send', {
      text: inputText,
      roomId,
      meetingId
    });
    
    setInputText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleDelete = async (msgId: number) => {
    try {
      await api.delete(`/chat/${msgId}`);
      setMessages(prev => prev.filter(m => m.id !== msgId));
    } catch (err) {
      console.error('Failed to delete message', err);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-20 right-4 md:bottom-24 md:right-8 w-12 h-12 bg-blue-600 text-white rounded-full shadow-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all z-40 group ${isOpen ? 'hidden' : 'flex'}`}
      >
        <MessageSquare size={20} />
        {connected && <span className="absolute top-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>}
        <span className="absolute right-14 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none hidden md:block">
          Team Chat
        </span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-0 right-0 left-0 md:bottom-8 md:right-8 md:left-auto w-full md:w-96 h-[85vh] md:h-[500px] md:max-h-[80vh] bg-white md:rounded-2xl shadow-2xl border border-gray-100 flex flex-col z-50 overflow-hidden rounded-t-2xl"
          >
            <div className="p-4 bg-gray-900 text-white flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                <MessageSquare size={18} />
                <h3 className="font-bold">Team Chat {roomId ? `(Room)` : ''}</h3>
                {!connected && <span className="text-xs text-red-300">(Offline)</span>}
              </div>
              <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white hover:bg-white/10 p-1 rounded transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {isLoadingHistory ? (
                <div className="text-center text-xs text-gray-400 py-4">Loading history...</div>
              ) : messages.length === 0 ? (
                <div className="text-center text-xs text-gray-400 py-4">No messages yet. Start the conversation!</div>
              ) : (
                messages.map(msg => {
                  const isMe = msg.sender.id === user?.id;
                return (
                  <div key={msg.id} className={`flex flex-col group ${isMe ? 'items-end' : 'items-start'}`}>
                    <span className="text-[10px] text-gray-400 mb-1 px-1">{isMe ? 'You' : msg.sender.name}</span>
                    <div className="flex items-center gap-2">
                      {isMe && (
                        <button 
                          onClick={() => handleDelete(msg.id)}
                          className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all p-1"
                          title="Delete message"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                      <div className={`px-4 py-2 rounded-2xl max-w-[85%] text-sm ${isMe ? 'bg-gray-900 text-white rounded-tr-sm' : 'bg-white border border-gray-100 text-gray-800 rounded-tl-sm shadow-sm'}`}>
                        {msg.text}
                      </div>
                    </div>
                  </div>
                );
              }))}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-3 bg-white border-t border-gray-100 shrink-0">
              <div className="flex items-end gap-2 bg-gray-50 rounded-xl p-1 border border-gray-200 focus-within:border-gray-400 focus-within:ring-1 focus-within:ring-gray-400 transition-all">
                <textarea
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={connected ? "Type a message..." : "Connecting..."}
                  disabled={!connected}
                  className="w-full bg-transparent border-none focus:ring-0 resize-none max-h-32 min-h-[40px] px-3 py-2 text-sm outline-none disabled:opacity-50"
                  rows={1}
                />
                <button
                  onClick={handleSend}
                  disabled={!inputText.trim() || !connected}
                  className="p-2 mb-1 mr-1 bg-gray-900 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors shrink-0"
                >
                  <Send size={16} className={inputText.trim() ? "translate-x-0.5" : ""} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
