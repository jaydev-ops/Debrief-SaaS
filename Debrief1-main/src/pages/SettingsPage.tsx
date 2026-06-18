import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRoom } from '../context/RoomContext';
import { User, Mail, Calendar, Key, LogOut, AlertTriangle, Building, X } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user, logout, deleteAccount } = useAuth();
  const { rooms } = useRoom();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteConfirm = async () => {
    if (deleteInput !== 'DELETE') return;
    setIsDeleting(true);
    await deleteAccount(true); // skip native confirm
    setIsDeleting(false);
  };

  const formattedDate = user?.createdAt 
    ? new Date(user.createdAt).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : 'Unknown Date';

  return (
    <div className="max-w-3xl w-full animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Account Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your profile, workspaces, and account security.</p>
      </div>

      <div className="space-y-6">
        {/* Profile Information Section */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50">
            <h2 className="text-sm font-semibold text-gray-900">Profile Information</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                  <User size={12} /> Name
                </label>
                <div className="text-sm font-medium text-gray-900 bg-gray-50 px-3 py-2 rounded-lg border border-gray-100">
                  {user?.name || 'Loading...'}
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Mail size={12} /> Email
                </label>
                <div className="text-sm font-medium text-gray-900 bg-gray-50 px-3 py-2 rounded-lg border border-gray-100 truncate">
                  {user?.email || 'Loading...'}
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Building size={12} /> Workspaces
                </label>
                <div className="text-sm font-medium text-gray-900 bg-gray-50 px-3 py-2 rounded-lg border border-gray-100">
                  Member of {rooms.length} {rooms.length === 1 ? 'workspace' : 'workspaces'}
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar size={12} /> Joined
                </label>
                <div className="text-sm font-medium text-gray-900 bg-gray-50 px-3 py-2 rounded-lg border border-gray-100">
                  {formattedDate}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Security & Actions Section */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50">
            <h2 className="text-sm font-semibold text-gray-900">Security & Access</h2>
          </div>
          <div className="p-4 sm:p-6 space-y-4">
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-xl border border-gray-100 bg-gray-50/50">
              <div className="flex gap-3 items-center">
                <div className="p-2 bg-white rounded-lg shadow-sm border border-gray-200 text-gray-600">
                  <Key size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">Password</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Change your account password</p>
                </div>
              </div>
              <button 
                disabled
                className="px-4 py-2 bg-gray-100 text-gray-400 text-sm font-medium rounded-lg cursor-not-allowed border border-gray-200 w-full sm:w-auto"
              >
                Coming soon
              </button>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-xl border border-gray-100 bg-gray-50/50">
              <div className="flex gap-3 items-center">
                <div className="p-2 bg-white rounded-lg shadow-sm border border-gray-200 text-gray-600">
                  <LogOut size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">Sign Out</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Log out of your current session</p>
                </div>
              </div>
              <button 
                onClick={logout}
                className="px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-lg border border-gray-200 transition-colors shadow-sm w-full sm:w-auto"
              >
                Sign out
              </button>
            </div>

          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-white rounded-2xl border border-red-200 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-red-100 bg-red-50/50">
            <h2 className="text-sm font-semibold text-red-700 flex items-center gap-2">
              <AlertTriangle size={16} /> Danger Zone
            </h2>
          </div>
          <div className="p-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Delete Account</h3>
                <p className="text-xs text-gray-500 mt-1 max-w-md leading-relaxed">
                  Permanently delete your account and all associated data. This action cannot be undone. 
                  Any workspaces you created will be handed over to the oldest remaining member.
                </p>
              </div>
              <button 
                onClick={() => setIsDeleteModalOpen(true)}
                className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 text-sm font-bold rounded-lg transition-colors border border-red-200 shrink-0"
              >
                Delete account
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <AlertTriangle size={18} className="text-red-500" />
                Delete Account
              </h3>
              <button 
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setDeleteInput('');
                }}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="p-4 bg-red-50 rounded-xl border border-red-100 text-sm text-red-800 leading-relaxed">
                <p className="font-semibold mb-1">Warning: This action is irreversible.</p>
                Deleting your account will permanently erase your profile, personal notes, messages, and remove you from all workspaces.
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  To confirm, type <span className="font-bold text-gray-900 select-all">DELETE</span> below:
                </label>
                <input 
                  type="text"
                  value={deleteInput}
                  onChange={(e) => setDeleteInput(e.target.value)}
                  placeholder="DELETE"
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm font-medium placeholder-gray-300"
                />
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
              <button 
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setDeleteInput('');
                }}
                className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm"
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteConfirm}
                disabled={deleteInput !== 'DELETE' || isDeleting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-bold shadow-sm hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isDeleting ? 'Deleting...' : 'Permanently Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
