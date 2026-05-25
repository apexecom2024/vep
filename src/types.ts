export type ViewState = 'auth' | 'hub' | 'video' | 'computer';

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  accessToken?: string;
}

export interface BeatriceMessage {
  type: 'user' | 'agent' | 'system';
  content: string;
  timestamp: number;
}

export interface WorkspaceFile {
  id: string;
  name: string;
  mimeType: string;
  webViewLink?: string;
}

export interface CalendarEvent {
  id: string;
  summary: string;
  start: { dateTime?: string; date?: string };
}
