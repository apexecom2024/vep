import { WorkspaceFile, CalendarEvent } from '../types';

export const fetchDriveFiles = async (token: string): Promise<WorkspaceFile[]> => {
  const res = await fetch('https://www.googleapis.com/drive/v3/files?pageSize=10&fields=files(id,name,mimeType,webViewLink)', {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  return data.files || [];
};

export const fetchCalendarEvents = async (token: string): Promise<CalendarEvent[]> => {
  const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events?maxResults=10&timeMin=' + new Date().toISOString(), {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  return data.items || [];
};

export const fetchGmailList = async (token: string) => {
  const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=10', {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  return data.messages || [];
};

export const fetchTasks = async (token: string) => {
  const res = await fetch('https://tasks.googleapis.com/tasks/v1/lists/@default/tasks', {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  return data.items || [];
};
