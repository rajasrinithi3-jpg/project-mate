export type Department = 'CSE' | 'IT' | 'ECE' | 'AI' | 'DS' | 'Mechanical' | 'Civil' | 'Other';
export type AcademicYear = '1st Year' | '2nd Year' | '3rd Year' | '4th Year' | 'Postgrad';
export type ProjectCategory = 
  | 'AI / ML' 
  | 'Web Development' 
  | 'Mobile Development' 
  | 'IoT' 
  | 'Cybersecurity' 
  | 'Data Science' 
  | 'Cloud' 
  | 'UI/UX' 
  | 'Other';

export type ProjectStatus = 'Recruiting' | 'Active' | 'Completed' | 'Archived';
export type InvitationStatus = 'Pending' | 'Accepted' | 'Declined' | 'Cancelled';
export type TaskPriority = 'Low' | 'Medium' | 'High';
export type TaskStatus = 'Pending' | 'In Progress' | 'Completed';
export type TeamMemberRole = 'Team Lead' | 'Developer' | 'Researcher' | 'Designer' | 'Data Scientist' | 'Member';

export interface User {
  id: string;
  name: string;
  email: string;
  department: Department;
  year: AcademicYear;
  bio: string;
  skills: string[];
  interests: string[];
  availability: string[];
  preferredProjectTypes: string[];
  photoURL?: string;
  github?: string;
  linkedin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfileUpdateInput {
  name?: string;
  bio?: string;
  department?: Department;
  year?: AcademicYear;
  skills?: string[];
  interests?: string[];
  availability?: string[];
  preferredProjectTypes?: string[];
  photoURL?: string;
  github?: string;
  linkedin?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  category: ProjectCategory;
  requiredSkills: string[];
  teamSize: number;
  deadline: string;
  status: ProjectStatus;
  creatorId: string;
  creatorName?: string;
  creatorDepartment?: string;
  currentTeamSize?: number;
  createdAt: string;
  updatedAt: string;
}

export interface TeamMember {
  userId: string;
  name: string;
  email: string;
  department: string;
  year: string;
  photoURL?: string;
  role: TeamMemberRole;
  joinedAt: string;
}

export interface Team {
  id: string;
  projectId: string;
  projectName: string;
  teamLeadId: string;
  members: TeamMember[];
  createdAt: string;
  updatedAt: string;
}

export interface Invitation {
  id: string;
  projectId: string;
  projectName: string;
  projectDescription?: string;
  requiredSkills?: string[];
  senderId: string;
  senderName: string;
  receiverId: string;
  receiverName: string;
  roleOffered: TeamMemberRole;
  message?: string;
  status: InvitationStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  teamId: string;
  projectId: string;
  title: string;
  description: string;
  assignedTo: string; // userId or ''
  assignedToName?: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  teamId: string;
  senderId: string;
  senderName: string;
  senderPhoto?: string;
  content: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: 
    | 'invitation_received' 
    | 'invitation_accepted' 
    | 'invitation_declined' 
    | 'task_assigned' 
    | 'task_updated' 
    | 'member_joined' 
    | 'member_left' 
    | 'project_update' 
    | 'general';
  title: string;
  message: string;
  relatedId?: string;
  read: boolean;
  createdAt: string;
}

export interface MatchResult {
  studentId: string;
  matchScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  sharedInterests: string[];
  availabilityCompatibility: string;
  explanation: string;
  aiExplanation?: string;
  breakdown: {
    skillScore: number;
    interestScore: number;
    availabilityScore: number;
    departmentScore: number;
    yearScore: number;
    projectPrefScore: number;
  };
}

export interface AuthResponse {
  token: string;
  user: User;
}
