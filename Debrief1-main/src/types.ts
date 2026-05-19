export type NoteCategory = 'action' | 'decision' | 'problem' | 'discussion';

export type Route = 'all' | 'action' | 'decision' | 'discussion' | 'problem' | 'settings';

export interface Note {
  id: string;
  content: string;
  category: NoteCategory;
  title: string;
  priority?: 'high' | 'medium' | 'low';
  assignee?: string;
  assigneeAvatar?: string;
  dueDate?: string;
  reportedBy?: string;
  reporterAvatar?: string;
  type?: string;
  author?: string;
  authorAvatar?: string;
  replies?: number;
  votes?: number;
  createdAt: number;
  syncStatus?: 'pending' | 'synced' | 'error';
  roomId?: number;
  meetingId?: number;
}

export interface ClassificationResult {
  category: NoteCategory;
  title: string;
  priority?: 'high' | 'medium' | 'low';
  assignee?: string;
  dueDate?: string;
  type?: string;
  reportedBy?: string;
}

export interface AuthUser {
  id: number;
  email: string;
  name: string;
  createdAt: string | null;
}

export interface RoomMember {
  id: number;
  name: string;
  role: string;
}

export interface Room {
  id: number;
  name: string;
  description?: string;
  inviteCode: string;
  memberCount?: number;
  lastNoteCreatedAt?: string;
  lastChatMessageText?: string;
  members?: RoomMember[];
}
