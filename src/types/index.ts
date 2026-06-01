// ============================================================
// ScrumBoard Pro — TypeScript Types
// ============================================================

export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'completed' | 'paused';
  createdAt: string;
  totalWeeks: number;
  color: string;
}

export interface TeamMember {
  id: string;
  projectId: string;
  name: string;
  role: string;
  specialty: string;
  color: string;
  sprintFocus: number[];
  email?: string;
}

export interface Sprint {
  id: string;
  projectId: string;
  number: number;
  name: string;
  goal: string;
  startDate: string;
  endDate: string;
  status: 'pending' | 'active' | 'completed';
  plannedPoints: number;
}

export interface Epic {
  id: string;
  projectId: string;
  name: string;
  color: string;
  description?: string;
}

export type StoryStatus = 'todo' | 'in-progress' | 'review' | 'done';
export type Priority = 'low' | 'medium' | 'high' | 'critical';

export interface UserStory {
  id: string;
  projectId: string;
  sprintId: string;
  epicId: string;
  title: string;
  description: string;
  assignees: string[];
  priority: Priority;
  storyPoints: number;
  status: StoryStatus;
  acceptanceCriteria: string[];
  createdAt: string;
}

export type TaskStatus = 'todo' | 'in-progress' | 'done';

export interface Task {
  id: string;
  userStoryId: string;
  sprintId: string;
  projectId: string;
  title: string;
  assigneeId: string;
  status: TaskStatus;
  estimatedHours: number;
  loggedHours: number;
  createdAt: string;
}

export type MeetingType = 'planning' | 'daily' | 'review' | 'retrospective';

export interface DailyEntry {
  memberId: string;
  yesterday: string;
  today: string;
  blockers: string;
}

export interface RetroNotes {
  wentWell: string[];
  wentBad: string[];
  improvements: string[];
}

export interface Meeting {
  id: string;
  projectId: string;
  sprintId: string;
  type: MeetingType;
  date: string;
  duration: number;
  attendees: string[];
  notes: string;
  dailyEntries?: DailyEntry[];
  retroNotes?: RetroNotes;
  reviewItems?: string[];
}

export interface AppState {
  activeProjectId: string | null;
  activeSprintId: string | null;
  currentPage: string;
  userRole?: 'scrum-master' | 'invitado' | null;
}
