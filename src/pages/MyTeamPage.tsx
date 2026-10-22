import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldCheck, 
  Users, 
  MessageSquare, 
  CheckSquare, 
  Send, 
  Plus, 
  Trash2, 
  UserMinus, 
  Calendar, 
  FolderKanban, 
  Sparkles,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Team, Project, Task, ChatMessage } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Avatar } from '../components/ui/Avatar';
import { Modal } from '../components/ui/Modal';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { EmptyState } from '../components/ui/EmptyState';
import { useToast } from '../context/ToastContext';

interface MyTeamPageProps {
  initialTeamId?: string;
  onNavigate: (page: string) => void;
}

export const MyTeamPage: React.FC<MyTeamPageProps> = ({ initialTeamId, onNavigate }) => {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();

  const [loading, setLoading] = useState(true);
  const [teams, setTeams] = useState<Array<Team & { project?: Project }>>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<string>(initialTeamId || '');
  const [activeTab, setActiveTab] = useState<'members' | 'tasks' | 'chat'>('members');

  // Active Team Data
  const [currentTeam, setCurrentTeam] = useState<Team | null>(null);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // Chat message input
  const [messageInput, setMessageInput] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // New task modal
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskAssignee, setTaskAssignee] = useState('');
  const [taskPriority, setTaskPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [isCreatingTask, setIsCreatingTask] = useState(false);

  // Remove member modal
  const [memberToRemove, setMemberToRemove] = useState<any | null>(null);

  const fetchMyTeams = async () => {
    try {
      setLoading(true);
      const res = await api.getMyTeams();
      setTeams(res.teams);

      const targetId = selectedTeamId || res.teams[0]?.id || '';
      setSelectedTeamId(targetId);

      if (targetId) {
        await loadTeamDetails(targetId);
      }
    } catch (err: any) {
      toastError(err.message || 'Unable to load your teams.');
    } finally {
      setLoading(false);
    }
  };

  const loadTeamDetails = async (tId: string) => {
    try {
      const res = await api.getTeamById(tId);
      setCurrentTeam(res.team);
      setCurrentProject(res.project);
      setTasks(res.tasks);

      // Load chat messages
      const msgRes = await api.getTeamMessages(tId);
      setMessages(msgRes.messages);
    } catch (err: any) {
      toastError(err.message || 'Could not fetch team workspace.');
    }
  };

  useEffect(() => {
    fetchMyTeams();
  }, []);

  // Poll for new messages every 6 seconds when chat tab is active
  useEffect(() => {
    if (!selectedTeamId || activeTab !== 'chat') return;
    const interval = setInterval(async () => {
      try {
        const msgRes = await api.getTeamMessages(selectedTeamId);
        setMessages(msgRes.messages);
      } catch {
        // silent
      }
    }, 6000);
    return () => clearInterval(interval);
  }, [selectedTeamId, activeTab]);

  useEffect(() => {
    if (activeTab === 'chat') {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeTab]);

  const handleSelectTeam = async (tId: string) => {
    setSelectedTeamId(tId);
    await loadTeamDetails(tId);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !selectedTeamId) return;

    setIsSendingMessage(true);
    try {
      const res = await api.sendMessage(selectedTeamId, messageInput.trim());
      setMessages(prev => [...prev, res.message]);
      setMessageInput('');
    } catch (err: any) {
      toastError(err.message || 'Failed to send message.');
    } finally {
      setIsSendingMessage(false);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim() || !selectedTeamId) return;

    setIsCreatingTask(true);
    try {
      const res = await api.createTask(selectedTeamId, {
        title: taskTitle.trim(),
        description: taskDesc.trim(),
        assignedTo: taskAssignee,
        priority: taskPriority,
        dueDate: taskDueDate,
      });
      setTasks(prev => [res.task, ...prev]);
      success('Task created and assigned!');
      setShowTaskModal(false);
      setTaskTitle('');
      setTaskDesc('');
      setTaskAssignee('');
    } catch (err: any) {
      toastError(err.message || 'Could not create task.');
    } finally {
      setIsCreatingTask(false);
    }
  };

  const handleUpdateTaskStatus = async (taskId: string, newStatus: any) => {
    try {
      const res = await api.updateTask(taskId, { status: newStatus });
      setTasks(prev => prev.map(t => (t.id === taskId ? res.task : t)));
      success(`Task marked as ${newStatus}.`);
    } catch (err: any) {
      toastError(err.message || 'Failed to update task.');
    }
  };

  const handleRemoveMember = async () => {
    if (!memberToRemove || !selectedTeamId) return;
    try {
      await api.removeTeamMember(selectedTeamId, memberToRemove.userId);
      success(`${memberToRemove.name} was removed from the team.`);
      await loadTeamDetails(selectedTeamId);
      setMemberToRemove(null);
    } catch (err: any) {
      toastError(err.message || 'Could not remove member.');
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading your team collaboration workspace..." fullHeight />;
  }

  if (teams.length === 0) {
    return (
      <EmptyState
        icon={ShieldCheck}
        title="You don't belong to any project teams yet"
        description="Create your own academic project or accept an invitation to enter a team workspace."
        actionText="Post Academic Project"
        onAction={() => onNavigate('create-project')}
      />
    );
  }

  const isLead = currentTeam?.teamLeadId === user?.id;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Workspace Header & Team Switcher */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Project Workspace</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            {currentTeam?.projectName || 'My Team'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {currentProject?.category} • {currentTeam?.members.length} Members • Due {currentProject?.deadline}
          </p>
        </div>

        {/* Switch Team Dropdown */}
        {teams.length > 1 && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400">Team:</span>
            <select
              value={selectedTeamId}
              onChange={e => handleSelectTeam(e.target.value)}
              className="px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-300 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            >
              {teams.map(t => (
                <option key={t.id} value={t.id}>
                  {t.projectName}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-1">
        <button
          onClick={() => setActiveTab('members')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'members'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Members ({currentTeam?.members.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('tasks')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'tasks'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <CheckSquare className="w-4 h-4" />
          <span>Tasks ({tasks.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('chat')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'chat'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Team Chat ({messages.length})</span>
        </button>
      </div>

      {/* TAB 1: MEMBERS */}
      {activeTab === 'members' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800">Team Roster & Roles</h2>
            {isLead && currentProject && (
              <Button
                variant="primary"
                size="sm"
                className="text-xs"
                leftIcon={<Plus className="w-3.5 h-3.5" />}
                onClick={() => onNavigate(`find-teammates?projectId=${currentProject.id}`)}
              >
                Recruit Teammate
              </Button>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {currentTeam?.members.map(member => {
              const isMemberLead = member.role === 'Team Lead';
              const canRemove = isLead && !isMemberLead && member.userId !== user?.id;

              return (
                <Card key={member.userId} className="p-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Avatar src={member.photoURL} name={member.name} size="md" />
                    <div>
                      <p className="font-bold text-slate-900 text-sm flex items-center gap-2">
                        {member.name}
                        {isMemberLead && (
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                            Lead
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-slate-500">
                        {member.department} • {member.year}
                      </p>
                      <span className="inline-block mt-1 text-[11px] font-semibold text-slate-700">
                        Role: {member.role}
                      </span>
                    </div>
                  </div>

                  {canRemove && (
                    <button
                      onClick={() => setMemberToRemove(member)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Remove member from team"
                    >
                      <UserMinus className="w-4 h-4" />
                    </button>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: TASKS */}
      {activeTab === 'tasks' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800">Team Tasks & Progress</h2>
            <Button
              variant="primary"
              size="sm"
              className="text-xs"
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              onClick={() => {
                setTaskAssignee(user?.id || '');
                setShowTaskModal(true);
              }}
            >
              Add New Task
            </Button>
          </div>

          {tasks.length > 0 ? (
            <div className="space-y-3">
              {tasks.map(task => (
                <Card key={task.id} className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          task.priority === 'High'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : task.priority === 'Medium'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}
                      >
                        {task.priority} Priority
                      </span>
                      {task.dueDate && (
                        <span className="text-[11px] text-slate-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Due {task.dueDate}
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-slate-900 text-sm">{task.title}</h3>
                    {task.description && (
                      <p className="text-xs text-slate-500 mt-0.5">{task.description}</p>
                    )}
                    <p className="text-[11px] text-indigo-700 mt-1 font-medium">
                      Assigned to: {task.assignedToName || 'Unassigned'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <select
                      value={task.status}
                      onChange={e => handleUpdateTaskStatus(task.id, e.target.value)}
                      className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg border focus:outline-none ${
                        task.status === 'Completed'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : task.status === 'In Progress'
                          ? 'bg-blue-50 text-blue-800 border-blue-300'
                          : 'bg-slate-100 text-slate-700 border-slate-300'
                      }`}
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={CheckSquare}
              title="No tasks created yet"
              description="Break down your semester project deliverables into tasks for team members."
              actionText="Create First Task"
              onAction={() => setShowTaskModal(true)}
            />
          )}
        </div>
      )}

      {/* TAB 3: TEAM CHAT */}
      {activeTab === 'chat' && (
        <Card className="p-0 overflow-hidden flex flex-col h-[550px]">
          {/* Chat Header */}
          <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
            <span className="font-bold text-slate-800 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-indigo-600" />
              {currentTeam?.projectName} Team Channel
            </span>
            <span className="text-slate-400">
              {currentTeam?.members.length} members online
            </span>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3">
            {messages.length > 0 ? (
              messages.map(msg => {
                const isMe = msg.senderId === user?.id;
                const isBot = msg.senderId === 'system';

                if (isBot) {
                  return (
                    <div key={msg.id} className="text-center my-2">
                      <span className="inline-block px-3 py-1 rounded-full bg-slate-100 text-slate-500 text-[11px] font-medium border border-slate-200">
                        {msg.content}
                      </span>
                    </div>
                  );
                }

                return (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-2.5 ${isMe ? 'flex-row-reverse' : ''}`}
                  >
                    <Avatar src={msg.senderPhoto} name={msg.senderName} size="sm" />
                    <div
                      className={`max-w-[75%] rounded-2xl p-3 text-xs shadow-2xs ${
                        isMe
                          ? 'bg-indigo-600 text-white rounded-tr-none'
                          : 'bg-slate-100 text-slate-900 rounded-tl-none border border-slate-200/80'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3 mb-1">
                        <span className={`font-bold ${isMe ? 'text-indigo-100' : 'text-slate-700'}`}>
                          {isMe ? 'You' : msg.senderName}
                        </span>
                        <span className={`text-[10px] ${isMe ? 'text-indigo-200' : 'text-slate-400'}`}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 text-xs">
                <MessageSquare className="w-8 h-8 text-slate-300 mb-2" />
                <p>No messages yet. Say hello to your teammates!</p>
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Message Input Form */}
          <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-200 flex gap-2">
            <input
              type="text"
              value={messageInput}
              onChange={e => setMessageInput(e.target.value)}
              placeholder="Type your message to the team..."
              className="flex-1 px-4 py-2.5 text-xs rounded-xl border border-slate-300 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600"
            />
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSendingMessage}
              leftIcon={<Send className="w-3.5 h-3.5" />}
            >
              Send
            </Button>
          </form>
        </Card>
      )}

      {/* New Task Modal */}
      {showTaskModal && (
        <Modal
          isOpen={showTaskModal}
          onClose={() => setShowTaskModal(false)}
          title="Create New Team Task"
          description={`Add a deliverable for "${currentTeam?.projectName}"`}
        >
          <form onSubmit={handleCreateTask} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Task Title
              </label>
              <input
                type="text"
                value={taskTitle}
                onChange={e => setTaskTitle(e.target.value)}
                placeholder="e.g. Model training & parameter tuning"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Description
              </label>
              <textarea
                rows={2}
                value={taskDesc}
                onChange={e => setTaskDesc(e.target.value)}
                placeholder="Provide instructions or dataset paths..."
                className="w-full p-2.5 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Assign To
                </label>
                <select
                  value={taskAssignee}
                  onChange={e => setTaskAssignee(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                >
                  <option value="">Unassigned</option>
                  {currentTeam?.members.map(m => (
                    <option key={m.userId} value={m.userId}>
                      {m.name} ({m.role})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Priority
                </label>
                <select
                  value={taskPriority}
                  onChange={e => setTaskPriority(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Due Date
              </label>
              <input
                type="date"
                value={taskDueDate}
                onChange={e => setTaskDueDate(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button type="button" variant="outline" size="sm" onClick={() => setShowTaskModal(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" isLoading={isCreatingTask}>
                Create Task
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Remove Member Modal */}
      {memberToRemove && (
        <Modal
          isOpen={!!memberToRemove}
          onClose={() => setMemberToRemove(null)}
          title={`Remove ${memberToRemove.name}?`}
          description="Are you sure you want to remove this member from the team?"
        >
          <div className="space-y-4">
            <p className="text-xs text-slate-500">
              They will lose access to team workspace, tasks, and private channel messages.
            </p>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button variant="outline" size="sm" onClick={() => setMemberToRemove(null)}>
                Cancel
              </Button>
              <Button variant="danger" size="sm" onClick={handleRemoveMember}>
                Remove Member
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
