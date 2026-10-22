import { Router } from 'express';
import crypto from 'crypto';
import { db } from './db.js';
import { 
  hashPassword, 
  verifyPassword, 
  createSession, 
  removeSession, 
  requireAuth, 
  optionalAuth, 
  AuthenticatedRequest 
} from './auth.js';
import { calculateMatchScore } from '../src/lib/matching.js';
import { GoogleGenAI } from '@google/genai';
import { Project, Team, Invitation, Task, ChatMessage, Notification } from '../src/types/index.js';

export const apiRouter = Router();

// ==========================================
// 1. AUTHENTICATION ROUTES
// ==========================================

apiRouter.post('/auth/register', (req, res) => {
  const { name, email, password, department, year } = req.body;

  if (!name || !email || !password || !department || !year) {
    return res.status(400).json({ error: 'All fields (name, email, password, department, year) are required.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
  }

  const existing = db.getUserByEmail(email);
  if (existing) {
    return res.status(409).json({ error: 'An account with this email already exists.' });
  }

  const { hash, salt } = hashPassword(password);
  const userId = `usr_${crypto.randomBytes(6).toString('hex')}`;
  const now = new Date().toISOString();

  const newUser = db.createUser({
    id: userId,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    passwordHash: hash,
    salt,
    department,
    year,
    bio: '',
    skills: [],
    interests: [],
    availability: ['Weekday evenings', 'Weekends'],
    preferredProjectTypes: [],
    createdAt: now,
    updatedAt: now,
  });

  const token = createSession(userId);

  // Initial welcome notification
  db.createNotification({
    id: `notif_${crypto.randomBytes(6).toString('hex')}`,
    userId,
    type: 'general',
    title: 'Welcome to ProjectMate! 🎉',
    message: 'Set up your technical skills and interests to find the best teammates for your semester projects.',
    read: false,
    createdAt: now,
  });

  res.status(201).json({ token, user: newUser });
});

apiRouter.post('/auth/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const user = db.getUserByEmail(email);
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const isValid = verifyPassword(password, user.passwordHash, user.salt);
  if (!isValid) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const token = createSession(user.id);
  const { passwordHash, salt, ...safeUser } = user;

  res.json({ token, user: safeUser });
});

apiRouter.post('/auth/logout', requireAuth, (req: AuthenticatedRequest, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : (req.headers['x-auth-token'] as string);
  if (token) {
    removeSession(token);
  }
  res.json({ message: 'Successfully logged out.' });
});

apiRouter.get('/auth/me', requireAuth, (req: AuthenticatedRequest, res) => {
  const user = db.getUserById(req.userId!);
  if (!user) {
    return res.status(404).json({ error: 'User not found.' });
  }
  res.json({ user });
});

// Quick demo switcher for testing multi-student scenarios seamlessly
apiRouter.post('/auth/quick-switch', (req, res) => {
  const { userId } = req.body;
  if (!userId) {
    return res.status(400).json({ error: 'userId is required.' });
  }

  const user = db.getUserById(userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found.' });
  }

  const token = createSession(user.id);
  res.json({ token, user });
});

apiRouter.post('/auth/forgot-password', (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required.' });
  }

  const user = db.getUserByEmail(email);
  if (!user) {
    // For security, still return generic friendly response
    return res.json({ message: 'If an account exists, a password reset link has been dispatched to your email.' });
  }

  // Generate temporary 6-digit reset code
  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
  res.json({ 
    message: 'Reset instructions sent.', 
    devHintResetCode: resetCode,
    email: user.email,
  });
});

apiRouter.post('/auth/reset-password', (req, res) => {
  const { email, newPassword } = req.body;
  if (!email || !newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: 'Valid email and password (min 6 characters) required.' });
  }

  const user = db.getUserByEmail(email);
  if (!user) {
    return res.status(404).json({ error: 'User not found.' });
  }

  const { hash, salt } = hashPassword(newPassword);
  db.updateUserPassword(user.id, hash, salt);

  res.json({ message: 'Password updated successfully. You can now login.' });
});

// ==========================================
// 2. USER & PROFILE ROUTES
// ==========================================

apiRouter.get('/users', optionalAuth, (req: AuthenticatedRequest, res) => {
  const { search, skill, department, year, interest, availability } = req.query;
  let users = db.getAllUsers();

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    users = users.filter(u => 
      u.name.toLowerCase().includes(q) ||
      u.bio.toLowerCase().includes(q) ||
      u.skills.some(s => s.toLowerCase().includes(q)) ||
      u.interests.some(i => i.toLowerCase().includes(q))
    );
  }

  if (skill && typeof skill === 'string') {
    const sQuery = skill.toLowerCase();
    users = users.filter(u => u.skills.some(s => s.toLowerCase() === sQuery || s.toLowerCase().includes(sQuery)));
  }

  if (department && typeof department === 'string' && department !== 'All') {
    users = users.filter(u => u.department === department);
  }

  if (year && typeof year === 'string' && year !== 'All') {
    users = users.filter(u => u.year === year);
  }

  if (interest && typeof interest === 'string' && interest !== 'All') {
    const iQuery = interest.toLowerCase();
    users = users.filter(u => u.interests.some(i => i.toLowerCase().includes(iQuery)));
  }

  if (availability && typeof availability === 'string' && availability !== 'All') {
    users = users.filter(u => u.availability.includes(availability as any));
  }

  res.json({ users });
});

apiRouter.get('/users/:id', (req, res) => {
  const user = db.getUserById(req.params.id);
  if (!user) {
    return res.status(404).json({ error: 'Student not found.' });
  }
  res.json({ user });
});

apiRouter.put('/users/:id', requireAuth, (req: AuthenticatedRequest, res) => {
  if (req.params.id !== req.userId) {
    return res.status(403).json({ error: 'You are only authorized to update your own profile.' });
  }

  const allowedUpdates = [
    'name', 
    'bio', 
    'department', 
    'year', 
    'skills', 
    'interests', 
    'availability', 
    'preferredProjectTypes', 
    'photoURL', 
    'github', 
    'linkedin'
  ];

  const updates: any = {};
  for (const key of allowedUpdates) {
    if (req.body[key] !== undefined) {
      updates[key] = req.body[key];
    }
  }

  const updated = db.updateUser(req.params.id, updates);
  if (!updated) {
    return res.status(404).json({ error: 'User not found.' });
  }

  res.json({ user: updated });
});

// ==========================================
// 3. PROJECT ROUTES
// ==========================================

apiRouter.get('/projects', (req, res) => {
  const { category, status, search, creatorId } = req.query;
  let projects = db.getAllProjects();

  if (category && typeof category === 'string' && category !== 'All') {
    projects = projects.filter(p => p.category === category);
  }

  if (status && typeof status === 'string' && status !== 'All') {
    projects = projects.filter(p => p.status === status);
  }

  if (creatorId && typeof creatorId === 'string') {
    projects = projects.filter(p => p.creatorId === creatorId);
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    projects = projects.filter(p => 
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.requiredSkills.some(s => s.toLowerCase().includes(q))
    );
  }

  res.json({ projects });
});

apiRouter.get('/projects/:id', (req, res) => {
  const project = db.getProjectById(req.params.id);
  if (!project) {
    return res.status(404).json({ error: 'Project not found.' });
  }
  const team = db.getTeamByProjectId(project.id);
  res.json({ project, team });
});

apiRouter.post('/projects', requireAuth, (req: AuthenticatedRequest, res) => {
  const { name, description, category, requiredSkills, teamSize, deadline } = req.body;
  const user = db.getUserById(req.userId!)!;

  if (!name || !description || !category || !teamSize || !deadline) {
    return res.status(400).json({ error: 'Name, description, category, team size, and deadline are required.' });
  }

  const projectId = `proj_${crypto.randomBytes(6).toString('hex')}`;
  const now = new Date().toISOString();

  const newProject: Project = {
    id: projectId,
    name: name.trim(),
    description: description.trim(),
    category,
    requiredSkills: Array.isArray(requiredSkills) ? requiredSkills : [],
    teamSize: Number(teamSize),
    deadline,
    status: 'Recruiting',
    creatorId: user.id,
    creatorName: user.name,
    creatorDepartment: user.department,
    currentTeamSize: 1,
    createdAt: now,
    updatedAt: now,
  };

  db.createProject(newProject);

  // Initialize Team with Creator as Team Lead
  const teamId = `team_${crypto.randomBytes(6).toString('hex')}`;
  const newTeam: Team = {
    id: teamId,
    projectId,
    projectName: newProject.name,
    teamLeadId: user.id,
    members: [
      {
        userId: user.id,
        name: user.name,
        email: user.email,
        department: user.department,
        year: user.year,
        photoURL: user.photoURL,
        role: 'Team Lead',
        joinedAt: now,
      },
    ],
    createdAt: now,
    updatedAt: now,
  };

  db.createTeam(newTeam);

  res.status(201).json({ project: newProject, team: newTeam });
});

apiRouter.put('/projects/:id', requireAuth, (req: AuthenticatedRequest, res) => {
  const project = db.getProjectById(req.params.id);
  if (!project) {
    return res.status(404).json({ error: 'Project not found.' });
  }

  if (project.creatorId !== req.userId) {
    return res.status(403).json({ error: 'Only the project creator can edit this project.' });
  }

  const allowedUpdates = ['name', 'description', 'category', 'requiredSkills', 'teamSize', 'deadline', 'status'];
  const updates: any = {};
  for (const k of allowedUpdates) {
    if (req.body[k] !== undefined) {
      updates[k] = req.body[k];
    }
  }

  const updated = db.updateProject(req.params.id, updates);
  res.json({ project: updated });
});

apiRouter.delete('/projects/:id', requireAuth, (req: AuthenticatedRequest, res) => {
  const project = db.getProjectById(req.params.id);
  if (!project) {
    return res.status(404).json({ error: 'Project not found.' });
  }

  if (project.creatorId !== req.userId) {
    return res.status(403).json({ error: 'Only the project creator can delete this project.' });
  }

  db.deleteProject(req.params.id);
  res.json({ message: 'Project and associated team data deleted successfully.' });
});

// ==========================================
// 4. MATCHING SYSTEM ROUTES
// ==========================================

apiRouter.get('/matching/teammates', optionalAuth, (req: AuthenticatedRequest, res) => {
  const { projectId } = req.query;
  const allUsers = db.getAllUsers();
  const allProjects = db.getAllProjects();

  let targetProject: Project | undefined;

  if (projectId && typeof projectId === 'string') {
    targetProject = db.getProjectById(projectId);
  } else if (req.userId) {
    // Pick the user's latest recruiting or active project
    targetProject = allProjects.find(p => p.creatorId === req.userId && p.status !== 'Completed');
  }

  if (!targetProject) {
    targetProject = allProjects[0]; // fallback to first project
  }

  if (!targetProject) {
    return res.json({ matches: [], project: null });
  }

  // Get current team members to exclude or flag
  const team = db.getTeamByProjectId(targetProject.id);
  const teamMemberIds = new Set(team?.members.map(m => m.userId) || [targetProject.creatorId]);

  // Compute deterministic match score for each user
  const matches = allUsers
    .filter(u => !teamMemberIds.has(u.id))
    .map(student => {
      const matchResult = calculateMatchScore(student, targetProject!);
      return {
        student,
        ...matchResult,
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore);

  res.json({
    project: targetProject,
    matches,
  });
});

apiRouter.get('/matching/projects', requireAuth, (req: AuthenticatedRequest, res) => {
  const user = db.getUserById(req.userId!)!;
  const allProjects = db.getAllProjects();

  const rankedProjects = allProjects
    .filter(p => p.creatorId !== user.id)
    .map(project => {
      const match = calculateMatchScore(user, project);
      return {
        project,
        matchScore: match.matchScore,
        matchedSkills: match.matchedSkills,
        missingSkills: match.missingSkills,
        explanation: match.explanation,
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore);

  res.json({ projects: rankedProjects });
});

// Optional Gemini AI recommendation: "Why this student may be a good teammate"
apiRouter.post('/matching/ai-explanation', async (req, res) => {
  const { studentId, projectId } = req.body;
  if (!studentId || !projectId) {
    return res.status(400).json({ error: 'studentId and projectId are required.' });
  }

  const student = db.getUserById(studentId);
  const project = db.getProjectById(projectId);

  if (!student || !project) {
    return res.status(404).json({ error: 'Student or project not found.' });
  }

  const deterministic = calculateMatchScore(student, project);

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    // Graceful fallback to deterministic explanation
    return res.json({
      aiGenerated: false,
      explanation: deterministic.explanation,
      highlight: `${student.name.split(' ')[0]} has high affinity for ${project.category} with ${deterministic.matchedSkills.length} matching skills.`,
    });
  }

  try {
    const ai = new GoogleGenAI();
    const prompt = `You are an expert college project collaboration advisor. Analyze why student "${student.name}" is a strong candidate for project "${project.name}".
Project Details:
- Category: ${project.category}
- Required skills: ${project.requiredSkills.join(', ')}
- Description: ${project.description}

Student Background:
- Department & Year: ${student.department}, ${student.year}
- Skills: ${student.skills.join(', ')}
- Interests: ${student.interests.join(', ')}
- Availability: ${student.availability.join(', ')}

In 2 concise, encouraging sentences, explain specifically why this student would be a valuable teammate and what they can contribute.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const text = response.text?.trim() || deterministic.explanation;
    res.json({
      aiGenerated: true,
      explanation: text,
      deterministicScore: deterministic.matchScore,
    });
  } catch (error) {
    console.warn('Gemini AI call failed, falling back to deterministic explanation:', error);
    res.json({
      aiGenerated: false,
      explanation: deterministic.explanation,
      deterministicScore: deterministic.matchScore,
    });
  }
});

// ==========================================
// 5. INVITATIONS ROUTES
// ==========================================

apiRouter.get('/invitations', requireAuth, (req: AuthenticatedRequest, res) => {
  const userInvs = db.getInvitationsForUser(req.userId!);
  res.json(userInvs);
});

apiRouter.post('/invitations', requireAuth, (req: AuthenticatedRequest, res) => {
  const { projectId, receiverId, roleOffered, message } = req.body;
  const sender = db.getUserById(req.userId!)!;

  if (!projectId || !receiverId) {
    return res.status(400).json({ error: 'projectId and receiverId are required.' });
  }

  const project = db.getProjectById(projectId);
  if (!project) {
    return res.status(404).json({ error: 'Project not found.' });
  }

  const receiver = db.getUserById(receiverId);
  if (!receiver) {
    return res.status(404).json({ error: 'Invited student not found.' });
  }

  const team = db.getTeamByProjectId(projectId);
  if (!team) {
    return res.status(404).json({ error: 'Team not found for project.' });
  }

  // Check if sender is team lead or member
  const isMember = team.members.some(m => m.userId === sender.id);
  if (!isMember && project.creatorId !== sender.id) {
    return res.status(403).json({ error: 'Only team members can invite teammates.' });
  }

  // Check if receiver is already a member
  if (team.members.some(m => m.userId === receiverId)) {
    return res.status(400).json({ error: 'Student is already a member of this team.' });
  }

  // Check team capacity
  if (team.members.length >= project.teamSize) {
    return res.status(400).json({ error: 'This team has already reached its maximum capacity.' });
  }

  // Check existing pending invitation
  const allInvs = db.getAllInvitations();
  const existingPending = allInvs.find(i => 
    i.projectId === projectId && 
    i.receiverId === receiverId && 
    i.status === 'Pending'
  );

  if (existingPending) {
    return res.status(400).json({ error: 'A pending invitation has already been sent to this student.' });
  }

  const now = new Date().toISOString();
  const invId = `inv_${crypto.randomBytes(6).toString('hex')}`;

  const invitation: Invitation = {
    id: invId,
    projectId,
    projectName: project.name,
    projectDescription: project.description,
    requiredSkills: project.requiredSkills,
    senderId: sender.id,
    senderName: sender.name,
    receiverId: receiver.id,
    receiverName: receiver.name,
    roleOffered: roleOffered || 'Developer',
    message: message?.trim(),
    status: 'Pending',
    createdAt: now,
    updatedAt: now,
  };

  db.createInvitation(invitation);

  // Send real persistent notification to the receiver
  db.createNotification({
    id: `notif_${crypto.randomBytes(6).toString('hex')}`,
    userId: receiver.id,
    type: 'invitation_received',
    title: 'New Team Invitation',
    message: `${sender.name} invited you to join "${project.name}" as a ${invitation.roleOffered}.`,
    relatedId: invId,
    read: false,
    createdAt: now,
  });

  res.status(201).json({ invitation });
});

apiRouter.post('/invitations/:id/respond', requireAuth, (req: AuthenticatedRequest, res) => {
  const { action } = req.body; // 'accept' | 'decline'
  const inv = db.getInvitationById(req.params.id);

  if (!inv) {
    return res.status(404).json({ error: 'Invitation not found.' });
  }

  if (inv.receiverId !== req.userId) {
    return res.status(403).json({ error: 'You are not authorized to respond to this invitation.' });
  }

  if (inv.status !== 'Pending') {
    return res.status(400).json({ error: `Invitation has already been ${inv.status.toLowerCase()}.` });
  }

  const receiver = db.getUserById(req.userId!)!;
  const now = new Date().toISOString();

  if (action === 'accept') {
    const team = db.getTeamByProjectId(inv.projectId);
    if (!team) {
      return res.status(404).json({ error: 'Associated team not found.' });
    }

    const project = db.getProjectById(inv.projectId);
    if (project && team.members.length >= project.teamSize) {
      return res.status(400).json({ error: 'This team is now full and cannot accept more members.' });
    }

    // Add student to the team
    db.addMemberToTeam(team.id, {
      userId: receiver.id,
      name: receiver.name,
      email: receiver.email,
      department: receiver.department,
      year: receiver.year,
      photoURL: receiver.photoURL,
      role: inv.roleOffered || 'Developer',
      joinedAt: now,
    });

    db.updateInvitationStatus(inv.id, 'Accepted');

    // Notify project creator / sender
    db.createNotification({
      id: `notif_${crypto.randomBytes(6).toString('hex')}`,
      userId: inv.senderId,
      type: 'invitation_accepted',
      title: 'Invitation Accepted! 🤝',
      message: `${receiver.name} accepted your invitation to join "${inv.projectName}".`,
      relatedId: team.id,
      read: false,
      createdAt: now,
    });

    // Post welcome message in team chat
    db.createMessage({
      id: `msg_${crypto.randomBytes(6).toString('hex')}`,
      teamId: team.id,
      senderId: 'system',
      senderName: 'ProjectMate Bot',
      content: `🎉 ${receiver.name} has joined the team as a ${inv.roleOffered}!`,
      createdAt: now,
    });

    return res.json({ message: 'Invitation accepted! You have joined the team.', teamId: team.id });
  } else if (action === 'decline') {
    db.updateInvitationStatus(inv.id, 'Declined');

    db.createNotification({
      id: `notif_${crypto.randomBytes(6).toString('hex')}`,
      userId: inv.senderId,
      type: 'invitation_declined',
      title: 'Invitation Declined',
      message: `${receiver.name} declined the invitation to join "${inv.projectName}".`,
      relatedId: inv.id,
      read: false,
      createdAt: now,
    });

    return res.json({ message: 'Invitation declined.' });
  } else {
    return res.status(400).json({ error: 'Action must be either "accept" or "decline".' });
  }
});

apiRouter.post('/invitations/:id/cancel', requireAuth, (req: AuthenticatedRequest, res) => {
  const inv = db.getInvitationById(req.params.id);
  if (!inv) {
    return res.status(404).json({ error: 'Invitation not found.' });
  }

  if (inv.senderId !== req.userId) {
    return res.status(403).json({ error: 'Only the sender can cancel this invitation.' });
  }

  if (inv.status !== 'Pending') {
    return res.status(400).json({ error: 'Only pending invitations can be cancelled.' });
  }

  db.updateInvitationStatus(inv.id, 'Cancelled');
  res.json({ message: 'Invitation cancelled.' });
});

// ==========================================
// 6. TEAM MANAGEMENT ROUTES
// ==========================================

apiRouter.get('/teams/my', requireAuth, (req: AuthenticatedRequest, res) => {
  const allTeams = db.getAllTeams();
  const userTeams = allTeams.filter(t => t.members.some(m => m.userId === req.userId));

  // Attach project info to each team
  const teamsWithProject = userTeams.map(t => {
    const project = db.getProjectById(t.projectId);
    return {
      ...t,
      project,
    };
  });

  res.json({ teams: teamsWithProject });
});

apiRouter.get('/teams/:id', requireAuth, (req: AuthenticatedRequest, res) => {
  const team = db.getTeamById(req.params.id);
  if (!team) {
    return res.status(404).json({ error: 'Team not found.' });
  }

  // Security check: verify user is in the team
  const isMember = team.members.some(m => m.userId === req.userId);
  if (!isMember) {
    return res.status(403).json({ error: 'You are not a member of this team.' });
  }

  const project = db.getProjectById(team.projectId);
  const tasks = db.getTasksByTeamId(team.id);

  res.json({ team, project, tasks });
});

apiRouter.delete('/teams/:id/members/:memberId', requireAuth, (req: AuthenticatedRequest, res) => {
  const team = db.getTeamById(req.params.id);
  if (!team) {
    return res.status(404).json({ error: 'Team not found.' });
  }

  if (team.teamLeadId !== req.userId) {
    return res.status(403).json({ error: 'Only the team lead can remove members.' });
  }

  if (req.params.memberId === team.teamLeadId) {
    return res.status(400).json({ error: 'The team lead cannot be removed from the team.' });
  }

  const updatedTeam = db.removeMemberFromTeam(team.id, req.params.memberId);
  if (!updatedTeam) {
    return res.status(400).json({ error: 'Could not remove member.' });
  }

  // Notify member
  db.createNotification({
    id: `notif_${crypto.randomBytes(6).toString('hex')}`,
    userId: req.params.memberId,
    type: 'member_left',
    title: 'Removed from Team',
    message: `You were removed from team "${team.projectName}".`,
    read: false,
    createdAt: new Date().toISOString(),
  });

  res.json({ team: updatedTeam });
});

// ==========================================
// 7. TASK MANAGEMENT ROUTES
// ==========================================

apiRouter.get('/teams/:teamId/tasks', requireAuth, (req: AuthenticatedRequest, res) => {
  const team = db.getTeamById(req.params.teamId);
  if (!team) {
    return res.status(404).json({ error: 'Team not found.' });
  }

  const isMember = team.members.some(m => m.userId === req.userId);
  if (!isMember) {
    return res.status(403).json({ error: 'You must be a team member to view tasks.' });
  }

  const tasks = db.getTasksByTeamId(req.params.teamId);
  res.json({ tasks });
});

apiRouter.post('/teams/:teamId/tasks', requireAuth, (req: AuthenticatedRequest, res) => {
  const team = db.getTeamById(req.params.teamId);
  if (!team) {
    return res.status(404).json({ error: 'Team not found.' });
  }

  const isMember = team.members.some(m => m.userId === req.userId);
  if (!isMember) {
    return res.status(403).json({ error: 'You must be a team member to create tasks.' });
  }

  const { title, description, assignedTo, priority, status, dueDate } = req.body;
  if (!title) {
    return res.status(400).json({ error: 'Task title is required.' });
  }

  let assignedToName = '';
  if (assignedTo) {
    const member = team.members.find(m => m.userId === assignedTo);
    if (member) {
      assignedToName = member.name;
    }
  }

  const now = new Date().toISOString();
  const taskId = `tsk_${crypto.randomBytes(6).toString('hex')}`;

  const newTask: Task = {
    id: taskId,
    teamId: team.id,
    projectId: team.projectId,
    title: title.trim(),
    description: description ? description.trim() : '',
    assignedTo: assignedTo || '',
    assignedToName,
    priority: priority || 'Medium',
    status: status || 'Pending',
    dueDate: dueDate || '',
    createdBy: req.userId!,
    createdAt: now,
    updatedAt: now,
  };

  db.createTask(newTask);

  // Notify assigned member
  if (assignedTo && assignedTo !== req.userId) {
    db.createNotification({
      id: `notif_${crypto.randomBytes(6).toString('hex')}`,
      userId: assignedTo,
      type: 'task_assigned',
      title: 'New Task Assigned',
      message: `You were assigned task: "${newTask.title}" in ${team.projectName}.`,
      relatedId: taskId,
      read: false,
      createdAt: now,
    });
  }

  res.status(201).json({ task: newTask });
});

apiRouter.put('/tasks/:id', requireAuth, (req: AuthenticatedRequest, res) => {
  const task = db.getTaskById(req.params.id);
  if (!task) {
    return res.status(404).json({ error: 'Task not found.' });
  }

  const team = db.getTeamById(task.teamId);
  if (!team) {
    return res.status(404).json({ error: 'Team not found.' });
  }

  const isMember = team.members.some(m => m.userId === req.userId);
  if (!isMember) {
    return res.status(403).json({ error: 'You must be a team member to update tasks.' });
  }

  const allowedUpdates = ['title', 'description', 'assignedTo', 'priority', 'status', 'dueDate'];
  const updates: any = {};

  for (const k of allowedUpdates) {
    if (req.body[k] !== undefined) {
      updates[k] = req.body[k];
    }
  }

  if (updates.assignedTo !== undefined) {
    const member = team.members.find(m => m.userId === updates.assignedTo);
    updates.assignedToName = member ? member.name : '';

    if (updates.assignedTo && updates.assignedTo !== req.userId && updates.assignedTo !== task.assignedTo) {
      db.createNotification({
        id: `notif_${crypto.randomBytes(6).toString('hex')}`,
        userId: updates.assignedTo,
        type: 'task_assigned',
        title: 'Task Assigned',
        message: `You were assigned: "${task.title}".`,
        relatedId: task.id,
        read: false,
        createdAt: new Date().toISOString(),
      });
    }
  }

  const updated = db.updateTask(task.id, updates);
  res.json({ task: updated });
});

apiRouter.delete('/tasks/:id', requireAuth, (req: AuthenticatedRequest, res) => {
  const task = db.getTaskById(req.params.id);
  if (!task) {
    return res.status(404).json({ error: 'Task not found.' });
  }

  const team = db.getTeamById(task.teamId);
  if (!team) {
    return res.status(404).json({ error: 'Team not found.' });
  }

  // Creator of task or team lead can delete
  if (task.createdBy !== req.userId && team.teamLeadId !== req.userId) {
    return res.status(403).json({ error: 'Only the task creator or team lead can delete this task.' });
  }

  db.deleteTask(task.id);
  res.json({ message: 'Task deleted successfully.' });
});

// ==========================================
// 8. TEAM CHAT ROUTES
// ==========================================

apiRouter.get('/teams/:teamId/messages', requireAuth, (req: AuthenticatedRequest, res) => {
  const team = db.getTeamById(req.params.teamId);
  if (!team) {
    return res.status(404).json({ error: 'Team not found.' });
  }

  const isMember = team.members.some(m => m.userId === req.userId);
  if (!isMember) {
    return res.status(403).json({ error: 'You are not authorized to view this team chat.' });
  }

  const messages = db.getMessagesByTeamId(req.params.teamId);
  res.json({ messages });
});

apiRouter.post('/teams/:teamId/messages', requireAuth, (req: AuthenticatedRequest, res) => {
  const team = db.getTeamById(req.params.teamId);
  if (!team) {
    return res.status(404).json({ error: 'Team not found.' });
  }

  const isMember = team.members.some(m => m.userId === req.userId);
  if (!isMember) {
    return res.status(403).json({ error: 'You must be a team member to post messages.' });
  }

  const { content } = req.body;
  if (!content || !content.trim()) {
    return res.status(400).json({ error: 'Message content cannot be empty.' });
  }

  const sender = db.getUserById(req.userId!)!;
  const now = new Date().toISOString();

  const newMessage: ChatMessage = {
    id: `msg_${crypto.randomBytes(6).toString('hex')}`,
    teamId: team.id,
    senderId: sender.id,
    senderName: sender.name,
    senderPhoto: sender.photoURL,
    content: content.trim(),
    createdAt: now,
  };

  db.createMessage(newMessage);
  res.status(201).json({ message: newMessage });
});

// ==========================================
// 9. NOTIFICATIONS ROUTES
// ==========================================

apiRouter.get('/notifications', requireAuth, (req: AuthenticatedRequest, res) => {
  const notifications = db.getNotificationsByUserId(req.userId!);
  const unreadCount = notifications.filter(n => !n.read).length;
  res.json({ notifications, unreadCount });
});

apiRouter.put('/notifications/:id/read', requireAuth, (req: AuthenticatedRequest, res) => {
  const ok = db.markNotificationRead(req.params.id, req.userId!);
  if (!ok) {
    return res.status(404).json({ error: 'Notification not found.' });
  }
  res.json({ message: 'Marked as read.' });
});

apiRouter.put('/notifications/read-all', requireAuth, (req: AuthenticatedRequest, res) => {
  const count = db.markAllNotificationsRead(req.userId!);
  res.json({ message: `Marked ${count} notifications as read.` });
});

// ==========================================
// 10. STATS / DASHBOARD AGGREGATE
// ==========================================

apiRouter.get('/dashboard/summary', requireAuth, (req: AuthenticatedRequest, res) => {
  const user = db.getUserById(req.userId!)!;
  const allProjects = db.getAllProjects();
  const allTeams = db.getAllTeams();
  const userTeams = allTeams.filter(t => t.members.some(m => m.userId === user.id));
  const userInvs = db.getInvitationsForUser(user.id);
  const notifications = db.getNotificationsByUserId(user.id);

  // Collect tasks due soon from all teams user belongs to
  let userTasks: Task[] = [];
  for (const t of userTeams) {
    const tasks = db.getTasksByTeamId(t.id);
    userTasks.push(...tasks);
  }

  // Profile completion calculation
  let completedFields = 0;
  const totalFields = 8;
  if (user.name) completedFields++;
  if (user.bio && user.bio.length > 10) completedFields++;
  if (user.skills && user.skills.length >= 3) completedFields++;
  if (user.interests && user.interests.length >= 2) completedFields++;
  if (user.availability && user.availability.length >= 1) completedFields++;
  if (user.department && user.year) completedFields++;
  if (user.photoURL) completedFields++;
  if (user.github || user.linkedin) completedFields++;

  const profileCompletion = Math.round((completedFields / totalFields) * 100);

  // Recommended teammates (ranked for user's created project or general affinity)
  const myCreatedProject = allProjects.find(p => p.creatorId === user.id && p.status !== 'Completed');
  const allUsers = db.getAllUsers().filter(u => u.id !== user.id);

  const recommendedTeammates = allUsers
    .map(student => {
      const match = calculateMatchScore(student, myCreatedProject || allProjects[0]);
      return {
        student,
        matchScore: match.matchScore,
        matchedSkills: match.matchedSkills,
        explanation: match.explanation,
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 4);

  // Recommended projects for this user
  const recommendedProjects = allProjects
    .filter(p => p.creatorId !== user.id)
    .map(p => {
      const match = calculateMatchScore(user, p);
      return {
        project: p,
        matchScore: match.matchScore,
        matchedSkills: match.matchedSkills,
        requiredSkills: p.requiredSkills,
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 3);

  // Calculate unique team members count
  const uniqueMemberIds = new Set<string>();
  userTeams.forEach(t => t.members.forEach(m => uniqueMemberIds.add(m.userId)));

  res.json({
    user,
    profileCompletion,
    stats: {
      projectsCount: userTeams.length,
      teamMembersCount: uniqueMemberIds.size,
      pendingInvitationsCount: userInvs.received.filter(i => i.status === 'Pending').length,
      tasksDueCount: userTasks.filter(t => t.status !== 'Completed').length,
      unreadNotificationsCount: notifications.filter(n => !n.read).length,
    },
    activeProjects: userTeams.map(t => ({
      team: t,
      project: db.getProjectById(t.projectId),
    })),
    recommendedTeammates,
    recommendedProjects,
    pendingInvitations: userInvs.received.filter(i => i.status === 'Pending').slice(0, 3),
    tasksDueSoon: userTasks
      .filter(t => t.status !== 'Completed')
      .sort((a, b) => new Date(a.dueDate || '9999').getTime() - new Date(b.dueDate || '9999').getTime())
      .slice(0, 5),
  });
});
