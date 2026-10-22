import { 
  User, 
  Project, 
  Team, 
  Invitation, 
  Task, 
  ChatMessage, 
  Notification, 
  MatchResult 
} from '../types';

const TOKEN_KEY = 'projectmate_token';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearStoredToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`/api${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMsg = 'An unexpected error occurred.';
    try {
      const errData = await response.json();
      errorMsg = errData.error || errorMsg;
    } catch {
      errorMsg = response.statusText || errorMsg;
    }
    throw new Error(errorMsg);
  }

  return response.json();
}

export const api = {
  // Auth
  register: (data: { name: string; email: string; password: string; department: string; year: string }) =>
    request<{ token: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  login: (data: { email: string; password: string }) =>
    request<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  logout: () =>
    request<{ message: string }>('/auth/logout', {
      method: 'POST',
    }),

  getMe: () => request<{ user: User }>('/auth/me'),

  quickSwitchUser: (userId: string) =>
    request<{ token: string; user: User }>('/auth/quick-switch', {
      method: 'POST',
      body: JSON.stringify({ userId }),
    }),

  forgotPassword: (email: string) =>
    request<{ message: string; devHintResetCode?: string; email?: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  resetPassword: (data: { email: string; newPassword: string }) =>
    request<{ message: string }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Users / Profiles
  getUsers: (filters?: {
    search?: string;
    skill?: string;
    department?: string;
    year?: string;
    interest?: string;
    availability?: string;
  }) => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([k, v]) => {
        if (v && v !== 'All') params.append(k, v);
      });
    }
    const query = params.toString() ? `?${params.toString()}` : '';
    return request<{ users: User[] }>(`/users${query}`);
  },

  getUserById: (id: string) => request<{ user: User }>(`/users/${id}`),

  updateProfile: (id: string, updates: Partial<User>) =>
    request<{ user: User }>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),

  // Projects
  getProjects: (filters?: { category?: string; status?: string; search?: string; creatorId?: string }) => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([k, v]) => {
        if (v && v !== 'All') params.append(k, v);
      });
    }
    const query = params.toString() ? `?${params.toString()}` : '';
    return request<{ projects: Project[] }>(`/projects${query}`);
  },

  getProjectById: (id: string) => request<{ project: Project; team?: Team }>(`/projects/${id}`),

  createProject: (data: {
    name: string;
    description: string;
    category: string;
    requiredSkills: string[];
    teamSize: number;
    deadline: string;
  }) =>
    request<{ project: Project; team: Team }>('/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateProject: (id: string, updates: Partial<Project>) =>
    request<{ project: Project }>(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),

  deleteProject: (id: string) =>
    request<{ message: string }>(`/projects/${id}`, {
      method: 'DELETE',
    }),

  // Matching
  getMatchingTeammates: (projectId?: string) => {
    const query = projectId ? `?projectId=${projectId}` : '';
    return request<{
      project: Project | null;
      matches: Array<{
        student: User;
        matchScore: number;
        matchedSkills: string[];
        missingSkills: string[];
        sharedInterests: string[];
        availabilityCompatibility: string;
        explanation: string;
        breakdown: any;
      }>;
    }>(`/matching/teammates${query}`);
  },

  getAIEvaluation: (studentId: string, projectId: string) =>
    request<{ aiGenerated: boolean; explanation: string; deterministicScore?: number }>(
      '/matching/ai-explanation',
      {
        method: 'POST',
        body: JSON.stringify({ studentId, projectId }),
      }
    ),

  // Invitations
  getInvitations: () =>
    request<{ received: Invitation[]; sent: Invitation[] }>('/invitations'),

  sendInvitation: (data: {
    projectId: string;
    receiverId: string;
    roleOffered: string;
    message?: string;
  }) =>
    request<{ invitation: Invitation }>('/invitations', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  respondToInvitation: (id: string, action: 'accept' | 'decline') =>
    request<{ message: string; teamId?: string }>(`/invitations/${id}/respond`, {
      method: 'POST',
      body: JSON.stringify({ action }),
    }),

  cancelInvitation: (id: string) =>
    request<{ message: string }>(`/invitations/${id}/cancel`, {
      method: 'POST',
    }),

  // Teams
  getMyTeams: () => request<{ teams: Array<Team & { project?: Project }> }>('/teams/my'),

  getTeamById: (id: string) =>
    request<{ team: Team; project: Project; tasks: Task[] }>(`/teams/${id}`),

  removeTeamMember: (teamId: string, memberId: string) =>
    request<{ team: Team }>(`/teams/${teamId}/members/${memberId}`, {
      method: 'DELETE',
    }),

  // Tasks
  getTeamTasks: (teamId: string) => request<{ tasks: Task[] }>(`/teams/${teamId}/tasks`),

  createTask: (
    teamId: string,
    data: {
      title: string;
      description?: string;
      assignedTo?: string;
      priority?: string;
      status?: string;
      dueDate?: string;
    }
  ) =>
    request<{ task: Task }>(`/teams/${teamId}/tasks`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateTask: (id: string, updates: Partial<Task>) =>
    request<{ task: Task }>(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),

  deleteTask: (id: string) =>
    request<{ message: string }>(`/tasks/${id}`, {
      method: 'DELETE',
    }),

  // Chat
  getTeamMessages: (teamId: string) =>
    request<{ messages: ChatMessage[] }>(`/teams/${teamId}/messages`),

  sendMessage: (teamId: string, content: string) =>
    request<{ message: ChatMessage }>(`/teams/${teamId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    }),

  // Notifications
  getNotifications: () =>
    request<{ notifications: Notification[]; unreadCount: number }>('/notifications'),

  markNotificationRead: (id: string) =>
    request<{ message: string }>(`/notifications/${id}/read`, {
      method: 'PUT',
    }),

  markAllNotificationsRead: () =>
    request<{ message: string }>('/notifications/read-all', {
      method: 'PUT',
    }),

  // Dashboard
  getDashboardSummary: () =>
    request<{
      user: User;
      profileCompletion: number;
      stats: {
        projectsCount: number;
        teamMembersCount: number;
        pendingInvitationsCount: number;
        tasksDueCount: number;
        unreadNotificationsCount: number;
      };
      activeProjects: Array<{ team: Team; project?: Project }>;
      recommendedTeammates: Array<{
        student: User;
        matchScore: number;
        matchedSkills: string[];
        explanation: string;
      }>;
      recommendedProjects: Array<{
        project: Project;
        matchScore: number;
        matchedSkills: string[];
        requiredSkills: string[];
      }>;
      pendingInvitations: Invitation[];
      tasksDueSoon: Task[];
    }>('/dashboard/summary'),
};
