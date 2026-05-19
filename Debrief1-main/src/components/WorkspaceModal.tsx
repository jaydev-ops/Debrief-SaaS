import React, { useState, useEffect } from 'react';
import { useRoom } from '../context/RoomContext';
import { motion } from 'motion/react';
import { Users, Plus, Key, X } from 'lucide-react';

interface WorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'select' | 'create' | 'join';
}

export const WorkspaceModal: React.FC<WorkspaceModalProps> = ({ isOpen, onClose, defaultMode = 'select' }) => {
  const { rooms, activeRoom, setActiveRoom, createRoom, joinRoom, isLoadingRooms } = useRoom();
  const [mode, setMode] = useState<'select' | 'create' | 'join'>(defaultMode);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setMode(defaultMode);
    }
  }, [isOpen, defaultMode]);

  if (!isOpen) return null;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await createRoom(name, desc);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create workspace');
    }
    setLoading(false);
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await joinRoom(inviteCode.trim().toUpperCase());
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid invite code or already joined');
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[85vh]"
      >
        <div className="p-6 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-start justify-between">
            <div>
              <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center mb-4 shadow-sm">
                <Users className="text-white" size={20} />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Your Workspaces</h2>
              <p className="text-sm text-gray-500 mt-1">Select a workspace to start collaborating</p>
            </div>
            <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto">
          {mode === 'select' && (
            <div className="space-y-6">
              {isLoadingRooms ? (
                <div className="py-8 text-center text-sm text-gray-400">Loading workspaces...</div>
              ) : rooms.length > 0 ? (
                <div className="space-y-2">
                  {rooms.map(room => (
                    <button
                      key={room.id}
                      onClick={() => { setActiveRoom(room); onClose(); }}
                      className="w-full text-left p-3 rounded-xl border border-gray-100 hover:border-gray-300 hover:shadow-sm hover:bg-gray-50 transition-all flex items-center justify-between group"
                    >
                      <div>
                        <h3 className="font-semibold text-gray-900 group-hover:text-gray-900 transition-colors">{room.name}</h3>
                        <p className="text-xs text-gray-500 mt-0.5">{room.memberCount || 1} member{(room.memberCount || 1) !== 1 ? 's' : ''}</p>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-gray-900 group-hover:text-white transition-all">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  <p className="text-sm text-gray-500">You haven't joined any workspaces yet.</p>
                </div>
              )}

              <div className="flex gap-3">
                <button 
                  onClick={() => setMode('create')}
                  className="flex-1 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-semibold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                >
                  <Plus size={16} /> Create
                </button>
                <button 
                  onClick={() => setMode('join')}
                  className="flex-1 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50 hover:border-gray-300 transition-colors flex items-center justify-center gap-2"
                >
                  <Key size={16} /> Join via Code
                </button>
              </div>
            </div>
          )}

          {mode === 'create' && (
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Workspace Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Acme Corp Team"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Description (Optional)</label>
                <textarea
                  value={desc}
                  onChange={e => setDesc(e.target.value)}
                  placeholder="What is this workspace for?"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 min-h-[80px]"
                />
              </div>
              
              {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
              
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setMode('select')} className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-200 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={loading || !name.trim()} className="flex-1 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50">
                  {loading ? 'Creating...' : 'Create Workspace'}
                </button>
              </div>
            </form>
          )}

          {mode === 'join' && (
            <form onSubmit={handleJoin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Invite Code</label>
                <input
                  type="text"
                  value={inviteCode}
                  onChange={e => setInviteCode(e.target.value.toUpperCase())}
                  placeholder="e.g. TEAM-X7Q92A"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-mono tracking-widest text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 uppercase"
                  required
                />
                <p className="text-xs text-gray-400 mt-2">Ask your workspace admin for the 8-character invite code.</p>
              </div>
              
              {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
              
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setMode('select')} className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-200 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={loading || !inviteCode.trim()} className="flex-1 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50">
                  {loading ? 'Joining...' : 'Join Workspace'}
                </button>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
};
