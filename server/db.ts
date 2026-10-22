import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { 
  User, 
  Project, 
  Team, 
  Invitation, 
  Task, 
  ChatMessage, 
  Notification 
} from '../src/types/index.js';

interface DBUser extends User {
  passwordHash: string;
  salt: string;
}

interface DatabaseSchema {
  users: DBUser[];
  projects: Project[];
  teams: Team[];
  invitations: Invitation[];
  tasks: Task[];
  messages: ChatMessage[];
  notifications: Notification[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'projectmate_db.json');

function hashPrecomputed(password: string): { hash: string; salt: string } {
  const salt = 'a1b2c3d4e5f67890';
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return { hash, salt };
}

function getInitialSeedData(): DatabaseSchema {
  const defaultPw = hashPrecomputed('password123');
  const now = new Date().toISOString();

  const users: DBUser[] = [
    {
      id: 'usr_lokitha',
      name: 'Lokitha A',
      email: 'lokitha@projectmate.edu',
      passwordHash: defaultPw.hash,
      salt: defaultPw.salt,
      department: 'IT',
      year: '2nd Year',
      bio: '2nd Year IT student passionate about building practical AI systems and sleek web interfaces. Looking for collaborative minds for semester projects.',
      skills: ['C++', 'Python', 'React', 'UI/UX', 'Java'],
      interests: ['Artificial Intelligence', 'Web Development', 'App Development'],
      availability: ['Weekday evenings', 'Weekends'],
      preferredProjectTypes: ['AI / ML', 'Web Development'],
      photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      github: 'https://github.com/lokitha-dev',
      linkedin: 'https://linkedin.com/in/lokitha',
      createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
      updatedAt: now,
    },
    {
      id: 'usr_riya',
      name: 'Riya Sharma',
      email: 'riya@projectmate.edu',
      passwordHash: defaultPw.hash,
      salt: defaultPw.salt,
      department: 'CSE',
      year: '2nd Year',
      bio: 'Machine learning enthusiast with experience in Python data pipelines and React frontends. Love Kaggle competitions and hackathons.',
      skills: ['Python', 'React', 'Machine Learning', 'FastAPI', 'Data Structures'],
      interests: ['AI / ML', 'Data Science', 'Web Development'],
      availability: ['Weekday evenings', 'Weekends'],
      preferredProjectTypes: ['AI / ML', 'Data Science'],
      photoURL: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
      github: 'https://github.com/riya-sharma',
      linkedin: 'https://linkedin.com/in/riyasharma',
      createdAt: new Date(Date.now() - 25 * 86400000).toISOString(),
      updatedAt: now,
    },
    {
      id: 'usr_arjun',
      name: 'Arjun Mehta',
      email: 'arjun@projectmate.edu',
      passwordHash: defaultPw.hash,
      salt: defaultPw.salt,
      department: 'CSE',
      year: '3rd Year',
      bio: 'Full-stack developer focused on Node.js backends, React SPAs, and database architecture. Built 3 campus utility tools.',
      skills: ['Node.js', 'React', 'SQL', 'TypeScript', 'Docker', 'UI/UX'],
      interests: ['Web Development', 'Cloud', 'Cybersecurity'],
      availability: ['Weekends', 'Flexible'],
      preferredProjectTypes: ['Web Development', 'Cloud'],
      photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
      github: 'https://github.com/arjunmehta',
      linkedin: 'https://linkedin.com/in/arjunmehta',
      createdAt: new Date(Date.now() - 40 * 86400000).toISOString(),
      updatedAt: now,
    },
    {
      id: 'usr_sneha',
      name: 'Sneha R',
      email: 'sneha@projectmate.edu',
      passwordHash: defaultPw.hash,
      salt: defaultPw.salt,
      department: 'AI',
      year: '2nd Year',
      bio: 'Specializing in deep learning, neural networks, and computer vision. Experienced with PyTorch, OpenCV, and medical datasets.',
      skills: ['Python', 'Machine Learning', 'Deep Learning', 'PyTorch', 'Pandas'],
      interests: ['AI / ML', 'Data Science', 'Healthcare Tech'],
      availability: ['Weekday evenings'],
      preferredProjectTypes: ['AI / ML', 'Data Science'],
      photoURL: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80',
      github: 'https://github.com/sneha-ai',
      linkedin: 'https://linkedin.com/in/snehar',
      createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
      updatedAt: now,
    },
    {
      id: 'usr_vikram',
      name: 'Vikram K',
      email: 'vikram@projectmate.edu',
      passwordHash: defaultPw.hash,
      salt: defaultPw.salt,
      department: 'IT',
      year: '3rd Year',
      bio: 'Product designer & frontend engineer. Passionate about user research, micro-interactions, Figma component systems, and Tailwind.',
      skills: ['UI/UX', 'Figma', 'React', 'CSS', 'Tailwind CSS', 'JavaScript'],
      interests: ['UI/UX', 'Web Development', 'Design Systems'],
      availability: ['Weekends', 'Weekday evenings'],
      preferredProjectTypes: ['UI/UX', 'Web Development', 'Mobile Development'],
      photoURL: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
      github: 'https://github.com/vikramk-design',
      linkedin: 'https://linkedin.com/in/vikramk',
      createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
      updatedAt: now,
    },
    {
      id: 'usr_ananya',
      name: 'Ananya S',
      email: 'ananya@projectmate.edu',
      passwordHash: defaultPw.hash,
      salt: defaultPw.salt,
      department: 'ECE',
      year: '3rd Year',
      bio: 'Hardware-meets-software explorer. Experience bridging microcontrollers (ESP32/Arduino) with MQTT cloud brokers and real-time dashboards.',
      skills: ['C++', 'IoT', 'Embedded Systems', 'Python', 'Robotics'],
      interests: ['IoT', 'Robotics', 'Embedded Systems'],
      availability: ['Weekday evenings', 'Weekends'],
      preferredProjectTypes: ['IoT', 'Other'],
      photoURL: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80',
      github: 'https://github.com/ananya-iot',
      linkedin: 'https://linkedin.com/in/ananyas',
      createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
      updatedAt: now,
    },
    {
      id: 'usr_karthik',
      name: 'Karthik N',
      email: 'karthik@projectmate.edu',
      passwordHash: defaultPw.hash,
      salt: defaultPw.salt,
      department: 'DS',
      year: '2nd Year',
      bio: 'Data science student focused on exploratory data analysis, business intelligence dashboards, SQL, and predictive modeling.',
      skills: ['Python', 'SQL', 'Tableau', 'Statistics', 'R', 'Data Analysis'],
      interests: ['Data Science', 'AI / ML', 'Analytics'],
      availability: ['Weekday mornings', 'Weekends'],
      preferredProjectTypes: ['Data Science', 'AI / ML'],
      photoURL: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&auto=format&fit=crop&q=80',
      github: 'https://github.com/karthik-ds',
      linkedin: 'https://linkedin.com/in/karthikn',
      createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
      updatedAt: now,
    },
  ];

  const projects: Project[] = [
    {
      id: 'proj_disease_pred',
      name: 'AI-Based Disease Prediction System',
      description: 'A clinical decision support platform using deep learning models to predict early-stage cardiac and diabetic risks from multimodal patient reports, paired with an interactive physician dashboard.',
      category: 'AI / ML',
      requiredSkills: ['Python', 'React', 'Machine Learning', 'UI/UX'],
      teamSize: 4,
      deadline: '2026-11-20',
      status: 'Recruiting',
      creatorId: 'usr_lokitha',
      creatorName: 'Lokitha A',
      creatorDepartment: 'IT',
      currentTeamSize: 2,
      createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
      updatedAt: now,
    },
    {
      id: 'proj_iot_energy',
      name: 'Smart Campus IoT Energy Monitor',
      description: 'Distributed sensor nodes deployed in campus labs to monitor per-socket power usage, detect phantom loads, and visualize real-time energy conservation stats.',
      category: 'IoT',
      requiredSkills: ['C++', 'IoT', 'Python', 'React'],
      teamSize: 4,
      deadline: '2026-12-05',
      status: 'Recruiting',
      creatorId: 'usr_ananya',
      creatorName: 'Ananya S',
      creatorDepartment: 'ECE',
      currentTeamSize: 1,
      createdAt: new Date(Date.now() - 8 * 86400000).toISOString(),
      updatedAt: now,
    },
    {
      id: 'proj_peerprep',
      name: 'PeerPrep - Collaborative Study & Notes Hub',
      description: 'A real-time note-sharing and peer tutoring platform tailored for semester course syllabus, question banks, and collaborative markdown summaries.',
      category: 'Web Development',
      requiredSkills: ['React', 'Node.js', 'SQL', 'UI/UX'],
      teamSize: 3,
      deadline: '2026-11-15',
      status: 'Active',
      creatorId: 'usr_arjun',
      creatorName: 'Arjun Mehta',
      creatorDepartment: 'CSE',
      currentTeamSize: 2,
      createdAt: new Date(Date.now() - 12 * 86400000).toISOString(),
      updatedAt: now,
    },
  ];

  const teams: Team[] = [
    {
      id: 'team_disease_pred',
      projectId: 'proj_disease_pred',
      projectName: 'AI-Based Disease Prediction System',
      teamLeadId: 'usr_lokitha',
      members: [
        {
          userId: 'usr_lokitha',
          name: 'Lokitha A',
          email: 'lokitha@projectmate.edu',
          department: 'IT',
          year: '2nd Year',
          photoURL: users[0].photoURL,
          role: 'Team Lead',
          joinedAt: new Date(Date.now() - 14 * 86400000).toISOString(),
        },
        {
          userId: 'usr_sneha',
          name: 'Sneha R',
          email: 'sneha@projectmate.edu',
          department: 'AI',
          year: '2nd Year',
          photoURL: users[3].photoURL,
          role: 'Researcher',
          joinedAt: new Date(Date.now() - 10 * 86400000).toISOString(),
        },
      ],
      createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
      updatedAt: now,
    },
    {
      id: 'team_iot_energy',
      projectId: 'proj_iot_energy',
      projectName: 'Smart Campus IoT Energy Monitor',
      teamLeadId: 'usr_ananya',
      members: [
        {
          userId: 'usr_ananya',
          name: 'Ananya S',
          email: 'ananya@projectmate.edu',
          department: 'ECE',
          year: '3rd Year',
          photoURL: users[5].photoURL,
          role: 'Team Lead',
          joinedAt: new Date(Date.now() - 8 * 86400000).toISOString(),
        },
      ],
      createdAt: new Date(Date.now() - 8 * 86400000).toISOString(),
      updatedAt: now,
    },
    {
      id: 'team_peerprep',
      projectId: 'proj_peerprep',
      projectName: 'PeerPrep - Collaborative Study & Notes Hub',
      teamLeadId: 'usr_arjun',
      members: [
        {
          userId: 'usr_arjun',
          name: 'Arjun Mehta',
          email: 'arjun@projectmate.edu',
          department: 'CSE',
          year: '3rd Year',
          photoURL: users[2].photoURL,
          role: 'Team Lead',
          joinedAt: new Date(Date.now() - 12 * 86400000).toISOString(),
        },
        {
          userId: 'usr_vikram',
          name: 'Vikram K',
          email: 'vikram@projectmate.edu',
          department: 'IT',
          year: '3rd Year',
          photoURL: users[4].photoURL,
          role: 'Designer',
          joinedAt: new Date(Date.now() - 9 * 86400000).toISOString(),
        },
      ],
      createdAt: new Date(Date.now() - 12 * 86400000).toISOString(),
      updatedAt: now,
    },
  ];

  const tasks: Task[] = [
    {
      id: 'tsk_1',
      teamId: 'team_disease_pred',
      projectId: 'proj_disease_pred',
      title: 'Research existing clinical dataset benchmarks',
      description: 'Review Kaggle cardiology and diabetes tabular datasets, verify licenses and check feature variance.',
      assignedTo: 'usr_sneha',
      assignedToName: 'Sneha R',
      priority: 'High',
      status: 'Completed',
      dueDate: '2026-10-25',
      createdBy: 'usr_lokitha',
      createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
      updatedAt: now,
    },
    {
      id: 'tsk_2',
      teamId: 'team_disease_pred',
      projectId: 'proj_disease_pred',
      title: 'Data collection & feature preprocessing',
      description: 'Clean missing values, normalize numerical features, and establish train-test splits.',
      assignedTo: 'usr_sneha',
      assignedToName: 'Sneha R',
      priority: 'Medium',
      status: 'In Progress',
      dueDate: '2026-11-02',
      createdBy: 'usr_lokitha',
      createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
      updatedAt: now,
    },
    {
      id: 'tsk_3',
      teamId: 'team_disease_pred',
      projectId: 'proj_disease_pred',
      title: 'Model training and hyperparameter tuning',
      description: 'Train XGBoost, Random Forest, and MLP baseline classifiers. Compare ROC-AUC and F1 scores.',
      assignedTo: '',
      priority: 'High',
      status: 'Pending',
      dueDate: '2026-11-10',
      createdBy: 'usr_lokitha',
      createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
      updatedAt: now,
    },
    {
      id: 'tsk_4',
      teamId: 'team_disease_pred',
      projectId: 'proj_disease_pred',
      title: 'UI design wireframes in Figma',
      description: 'Design student-friendly and clinician-friendly report summary cards with risk meters.',
      assignedTo: 'usr_lokitha',
      assignedToName: 'Lokitha A',
      priority: 'Medium',
      status: 'In Progress',
      dueDate: '2026-11-05',
      createdBy: 'usr_lokitha',
      createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
      updatedAt: now,
    },
    {
      id: 'tsk_5',
      teamId: 'team_disease_pred',
      projectId: 'proj_disease_pred',
      title: 'Integration and Testing',
      description: 'Connect React frontend with FastAPI inference endpoint and run end-to-end integration tests.',
      assignedTo: '',
      priority: 'High',
      status: 'Pending',
      dueDate: '2026-11-18',
      createdBy: 'usr_lokitha',
      createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
      updatedAt: now,
    },
    {
      id: 'tsk_6',
      teamId: 'team_peerprep',
      projectId: 'proj_peerprep',
      title: 'Design component library in Tailwind',
      description: 'Build buttons, chips, and cards for subject syllabus viewer.',
      assignedTo: 'usr_vikram',
      assignedToName: 'Vikram K',
      priority: 'Medium',
      status: 'In Progress',
      dueDate: '2026-10-30',
      createdBy: 'usr_arjun',
      createdAt: new Date(Date.now() - 6 * 86400000).toISOString(),
      updatedAt: now,
    },
  ];

  const invitations: Invitation[] = [
    {
      id: 'inv_1',
      projectId: 'proj_disease_pred',
      projectName: 'AI-Based Disease Prediction System',
      projectDescription: 'A clinical decision support platform using deep learning models to predict early-stage cardiac and diabetic risks.',
      requiredSkills: ['Python', 'React', 'Machine Learning', 'UI/UX'],
      senderId: 'usr_lokitha',
      senderName: 'Lokitha A',
      receiverId: 'usr_riya',
      receiverName: 'Riya Sharma',
      roleOffered: 'Developer',
      message: 'Hi Riya! I saw your strong Python and Machine Learning background. Your skills match our project requirements perfectly. Would love to have you on the team!',
      status: 'Pending',
      createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
      updatedAt: now,
    },
    {
      id: 'inv_2',
      projectId: 'proj_peerprep',
      projectName: 'PeerPrep - Collaborative Study & Notes Hub',
      projectDescription: 'A real-time note-sharing and peer tutoring platform tailored for semester course syllabus.',
      requiredSkills: ['React', 'Node.js', 'SQL', 'UI/UX'],
      senderId: 'usr_arjun',
      senderName: 'Arjun Mehta',
      receiverId: 'usr_lokitha',
      receiverName: 'Lokitha A',
      roleOffered: 'Developer',
      message: 'Hey Lokitha, we could really use your React and UI/UX skills to help craft our notes reader interface!',
      status: 'Pending',
      createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
      updatedAt: now,
    },
  ];

  const messages: ChatMessage[] = [
    {
      id: 'msg_1',
      teamId: 'team_disease_pred',
      senderId: 'usr_lokitha',
      senderName: 'Lokitha A',
      senderPhoto: users[0].photoURL,
      content: 'Welcome Sneha! Excited to kick off the AI disease prediction project.',
      createdAt: new Date(Date.now() - 9 * 86400000).toISOString(),
    },
    {
      id: 'msg_2',
      teamId: 'team_disease_pred',
      senderId: 'usr_sneha',
      senderName: 'Sneha R',
      senderPhoto: users[3].photoURL,
      content: 'Thanks Lokitha! I have gathered 2 medical tabular datasets with over 3,000 anonymized patient records.',
      createdAt: new Date(Date.now() - 8 * 86400000).toISOString(),
    },
    {
      id: 'msg_3',
      teamId: 'team_disease_pred',
      senderId: 'usr_lokitha',
      senderName: 'Lokitha A',
      senderPhoto: users[0].photoURL,
      content: 'Awesome! I also sent an invite to Riya Sharma for the model & API development role. Fingers crossed she joins!',
      createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    },
  ];

  const notifications: Notification[] = [
    {
      id: 'notif_1',
      userId: 'usr_riya',
      type: 'invitation_received',
      title: 'New Project Invitation',
      message: 'Lokitha A invited you to join "AI-Based Disease Prediction System" as a Developer.',
      relatedId: 'inv_1',
      read: false,
      createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    },
    {
      id: 'notif_2',
      userId: 'usr_lokitha',
      type: 'invitation_received',
      title: 'New Project Invitation',
      message: 'Arjun Mehta invited you to join "PeerPrep - Collaborative Study & Notes Hub" as a Developer.',
      relatedId: 'inv_2',
      read: false,
      createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    },
    {
      id: 'notif_3',
      userId: 'usr_sneha',
      type: 'task_assigned',
      title: 'Task Assigned',
      message: 'Lokitha A assigned you to "Data collection & feature preprocessing".',
      relatedId: 'tsk_2',
      read: true,
      createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    },
  ];

  return { users, projects, teams, invitations, tasks, messages, notifications };
}

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.ensureDataDir();
    this.data = this.loadData();
  }

  private ensureDataDir() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private loadData(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (e) {
      console.warn('Failed to load projectmate_db.json, recreating initial seed.', e);
    }
    const seed = getInitialSeedData();
    this.persistSync(seed);
    return seed;
  }

  private persistSync(dataToPersist = this.data) {
    try {
      this.ensureDataDir();
      const tmpFile = `${DB_FILE}.tmp.${Date.now()}`;
      fs.writeFileSync(tmpFile, JSON.stringify(dataToPersist, null, 2), 'utf-8');
      fs.renameSync(tmpFile, DB_FILE);
    } catch (e) {
      console.error('Error persisting database to disk:', e);
    }
  }

  // --- Users ---
  getAllUsers(): User[] {
    return this.data.users.map(({ passwordHash, salt, ...safeUser }) => safeUser);
  }

  getUserById(id: string): User | undefined {
    const u = this.data.users.find(u => u.id === id);
    if (!u) return undefined;
    const { passwordHash, salt, ...safeUser } = u;
    return safeUser;
  }

  getRawUserById(id: string): DBUser | undefined {
    return this.data.users.find(u => u.id === id);
  }

  getUserByEmail(email: string): DBUser | undefined {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  createUser(user: DBUser): User {
    this.data.users.push(user);
    this.persistSync();
    const { passwordHash, salt, ...safeUser } = user;
    return safeUser;
  }

  updateUser(id: string, updates: Partial<User>): User | undefined {
    const index = this.data.users.findIndex(u => u.id === id);
    if (index === -1) return undefined;

    this.data.users[index] = {
      ...this.data.users[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    // Update names in teams if name changed
    if (updates.name) {
      for (const t of this.data.teams) {
        for (const m of t.members) {
          if (m.userId === id) {
            m.name = updates.name;
          }
        }
      }
    }

    this.persistSync();
    const { passwordHash, salt, ...safeUser } = this.data.users[index];
    return safeUser;
  }

  updateUserPassword(id: string, passwordHash: string, salt: string): boolean {
    const user = this.data.users.find(u => u.id === id);
    if (!user) return false;
    user.passwordHash = passwordHash;
    user.salt = salt;
    user.updatedAt = new Date().toISOString();
    this.persistSync();
    return true;
  }

  // --- Projects ---
  getAllProjects(): Project[] {
    // dynamically sync currentTeamSize
    return this.data.projects.map(p => {
      const team = this.data.teams.find(t => t.projectId === p.id);
      return {
        ...p,
        currentTeamSize: team ? team.members.length : 1,
      };
    });
  }

  getProjectById(id: string): Project | undefined {
    const p = this.data.projects.find(p => p.id === id);
    if (!p) return undefined;
    const team = this.data.teams.find(t => t.projectId === p.id);
    return {
      ...p,
      currentTeamSize: team ? team.members.length : 1,
    };
  }

  createProject(project: Project): Project {
    this.data.projects.unshift(project);
    this.persistSync();
    return project;
  }

  updateProject(id: string, updates: Partial<Project>): Project | undefined {
    const idx = this.data.projects.findIndex(p => p.id === id);
    if (idx === -1) return undefined;

    this.data.projects[idx] = {
      ...this.data.projects[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    // Keep team project name in sync
    if (updates.name) {
      const team = this.data.teams.find(t => t.projectId === id);
      if (team) {
        team.projectName = updates.name;
      }
    }

    this.persistSync();
    return this.data.projects[idx];
  }

  deleteProject(id: string): boolean {
    const initialLen = this.data.projects.length;
    this.data.projects = this.data.projects.filter(p => p.id !== id);
    if (this.data.projects.length === initialLen) return false;

    // Cascade delete associated team, tasks, invitations
    const team = this.data.teams.find(t => t.projectId === id);
    if (team) {
      this.data.teams = this.data.teams.filter(t => t.id !== team.id);
      this.data.tasks = this.data.tasks.filter(tsk => tsk.teamId !== team.id);
      this.data.messages = this.data.messages.filter(msg => msg.teamId !== team.id);
    }
    this.data.invitations = this.data.invitations.filter(inv => inv.projectId !== id);

    this.persistSync();
    return true;
  }

  // --- Teams ---
  getAllTeams(): Team[] {
    return this.data.teams;
  }

  getTeamById(id: string): Team | undefined {
    return this.data.teams.find(t => t.id === id);
  }

  getTeamByProjectId(projectId: string): Team | undefined {
    return this.data.teams.find(t => t.projectId === projectId);
  }

  createTeam(team: Team): Team {
    this.data.teams.push(team);
    this.persistSync();
    return team;
  }

  addMemberToTeam(teamId: string, member: Team['members'][0]): Team | undefined {
    const team = this.data.teams.find(t => t.id === teamId);
    if (!team) return undefined;
    if (team.members.some(m => m.userId === member.userId)) return team;

    team.members.push(member);
    team.updatedAt = new Date().toISOString();

    // update project currentTeamSize
    const proj = this.data.projects.find(p => p.id === team.projectId);
    if (proj) {
      proj.currentTeamSize = team.members.length;
      if (proj.currentTeamSize >= proj.teamSize && proj.status === 'Recruiting') {
        proj.status = 'Active';
      }
    }

    this.persistSync();
    return team;
  }

  removeMemberFromTeam(teamId: string, userId: string): Team | undefined {
    const team = this.data.teams.find(t => t.id === teamId);
    if (!team) return undefined;
    // Cannot remove team lead
    if (team.teamLeadId === userId) return undefined;

    team.members = team.members.filter(m => m.userId !== userId);
    team.updatedAt = new Date().toISOString();

    const proj = this.data.projects.find(p => p.id === team.projectId);
    if (proj) {
      proj.currentTeamSize = team.members.length;
      if (proj.status === 'Active' && proj.currentTeamSize < proj.teamSize) {
        proj.status = 'Recruiting';
      }
    }

    this.persistSync();
    return team;
  }

  // --- Invitations ---
  getAllInvitations(): Invitation[] {
    return this.data.invitations;
  }

  getInvitationById(id: string): Invitation | undefined {
    return this.data.invitations.find(i => i.id === id);
  }

  getInvitationsForUser(userId: string): { received: Invitation[]; sent: Invitation[] } {
    return {
      received: this.data.invitations.filter(i => i.receiverId === userId),
      sent: this.data.invitations.filter(i => i.senderId === userId),
    };
  }

  createInvitation(invitation: Invitation): Invitation {
    this.data.invitations.unshift(invitation);
    this.persistSync();
    return invitation;
  }

  updateInvitationStatus(id: string, status: Invitation['status']): Invitation | undefined {
    const inv = this.data.invitations.find(i => i.id === id);
    if (!inv) return undefined;
    inv.status = status;
    inv.updatedAt = new Date().toISOString();
    this.persistSync();
    return inv;
  }

  // --- Tasks ---
  getTasksByTeamId(teamId: string): Task[] {
    return this.data.tasks.filter(t => t.teamId === teamId);
  }

  getTaskById(id: string): Task | undefined {
    return this.data.tasks.find(t => t.id === id);
  }

  createTask(task: Task): Task {
    this.data.tasks.unshift(task);
    this.persistSync();
    return task;
  }

  updateTask(id: string, updates: Partial<Task>): Task | undefined {
    const idx = this.data.tasks.findIndex(t => t.id === id);
    if (idx === -1) return undefined;

    this.data.tasks[idx] = {
      ...this.data.tasks[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.persistSync();
    return this.data.tasks[idx];
  }

  deleteTask(id: string): boolean {
    const initialLen = this.data.tasks.length;
    this.data.tasks = this.data.tasks.filter(t => t.id !== id);
    if (this.data.tasks.length === initialLen) return false;
    this.persistSync();
    return true;
  }

  // --- Messages ---
  getMessagesByTeamId(teamId: string): ChatMessage[] {
    return this.data.messages.filter(m => m.teamId === teamId);
  }

  createMessage(msg: ChatMessage): ChatMessage {
    this.data.messages.push(msg);
    this.persistSync();
    return msg;
  }

  // --- Notifications ---
  getNotificationsByUserId(userId: string): Notification[] {
    return this.data.notifications
      .filter(n => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  createNotification(notif: Notification): Notification {
    this.data.notifications.unshift(notif);
    this.persistSync();
    return notif;
  }

  markNotificationRead(id: string, userId: string): boolean {
    const notif = this.data.notifications.find(n => n.id === id && n.userId === userId);
    if (!notif) return false;
    notif.read = true;
    this.persistSync();
    return true;
  }

  markAllNotificationsRead(userId: string): number {
    let count = 0;
    for (const n of this.data.notifications) {
      if (n.userId === userId && !n.read) {
        n.read = true;
        count++;
      }
    }
    if (count > 0) this.persistSync();
    return count;
  }
}

export const db = new Database();
