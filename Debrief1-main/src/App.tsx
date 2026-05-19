import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotesProvider, useNotes } from './context/NotesContext';
import { RouterProvider, useRouter } from './context/RouterContext';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { RoomProvider, useRoom } from './context/RoomContext';
import { WorkspaceModal } from './components/WorkspaceModal';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { NoteList } from './components/NoteList';
import { NoteInput } from './components/NoteInput';
import { SummaryPanel } from './components/SummaryPanel';
import { GroupChat } from './components/GroupChat';
import { SettingsPage } from './pages/SettingsPage';
import { Plus } from 'lucide-react';
import { Route } from './types';

const ROUTE_LABELS: Record<Route, string> = {
  all: 'All Meetings',
  action: 'Action Items',
  decision: 'Decisions',
  discussion: 'Discussion',
  problem: 'Problems',
  settings: 'Settings',
};

const ROUTE_EMPTY: Record<Route, string> = {
  all: 'Create your first note using the button below.',
  action: 'No action items yet. Add tasks, assignments, or to-dos.',
  decision: 'No decisions recorded yet. Note down key choices made.',
  discussion: 'No discussions captured yet. Save questions or ideas.',
  problem: 'No problems logged. Report bugs, blockers, or incidents.',
  settings: '',
};

function MainApp() {
  const { notes, addNote } = useNotes();
  const { route } = useRouter();
  const { activeRoom } = useRoom();
  const [searchQuery, setSearchQuery] = useState('');
  const [isInputOpen, setIsInputOpen] = useState(false);
  const [isWorkspaceModalOpen, setIsWorkspaceModalOpen] = useState(!activeRoom);
  const [workspaceModalMode, setWorkspaceModalMode] = useState<'select' | 'create' | 'join'>('select');

  // If activeRoom changes to null internally, make sure to open the modal
  useEffect(() => {
    if (!activeRoom) {
      setIsWorkspaceModalOpen(true);
      setWorkspaceModalMode('select');
    }
  }, [activeRoom]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.altKey && e.key === 'n') || (e.metaKey && e.key === 'k')) {
        e.preventDefault();
        setIsInputOpen(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const filtered = notes.filter(n => {
    const matchesRoute = route === 'all' || n.category === route;
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      !query ||
      n.title?.toLowerCase().includes(query) ||
      n.content.toLowerCase().includes(query);
    return matchesRoute && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#F7F6F3] text-gray-900">
      <Sidebar onNewNote={() => setIsInputOpen(true)} />

      <div className="ml-60">
        <TopBar 
          onSearch={setSearchQuery} 
          onOpenWorkspaceModal={(mode) => {
            setWorkspaceModalMode(mode);
            setIsWorkspaceModalOpen(true);
          }}
        />

        <main className="pt-14 min-h-screen">
          <div className="px-8 py-8 flex gap-8 max-w-6xl w-full">
            {route === 'settings' ? (
              <div className="flex-1 min-w-0 w-full">
                <SettingsPage />
              </div>
            ) : (
              <>
                {/* Main content */}
                <div className="flex-1 min-w-0">
                  {/* Page header */}
                  <div className="mb-6">
                    <h1 className="text-xl font-bold text-gray-900">{ROUTE_LABELS[route]}</h1>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {filtered.length} {filtered.length === 1 ? 'note' : 'notes'}
                      {searchQuery && ` matching "${searchQuery}"`}
                    </p>
                  </div>

                  <NoteList
                    notes={filtered}
                    emptyMessage={ROUTE_EMPTY[route as keyof typeof ROUTE_EMPTY]}
                  />
                </div>

                {/* Right panel */}
                <SummaryPanel />
              </>
            )}
          </div>
        </main>
      </div>

      {/* FAB */}
      <button
        onClick={() => setIsInputOpen(true)}
        className="fixed bottom-8 right-8 w-12 h-12 bg-gray-900 text-white rounded-full shadow-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all z-50"
        title="New note (⌥N)"
      >
        <Plus size={20} />
      </button>

      <GroupChat roomId={activeRoom?.id} />

      <WorkspaceModal 
        isOpen={isWorkspaceModalOpen} 
        onClose={() => setIsWorkspaceModalOpen(false)} 
        defaultMode={workspaceModalMode}
      />
      <NoteInput
        isOpen={isInputOpen}
        onClose={() => setIsInputOpen(false)}
      />
    </div>
  );
}

function AuthGate() {
  const { user } = useAuth();
  const [view, setView] = useState<'login' | 'register'>('login');

  if (!user) {
    if (view === 'login') return <LoginPage onSwitchToRegister={() => setView('register')} />;
    return <RegisterPage onSwitchToLogin={() => setView('login')} />;
  }
  return (
    <RoomProvider>
      <NotesProvider>
        <RouterProvider>
          <MainApp />
        </RouterProvider>
      </NotesProvider>
    </RoomProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  );
}

