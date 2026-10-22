import React, { useState, useEffect, useMemo } from 'react';
import { 
  CheckSquare, 
  Plus, 
  Filter, 
  Calendar, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  FolderKanban
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Task, Team, Project } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { EmptyState } from '../components/ui/EmptyState';
import { useToast } from '../context/ToastContext';

interface TasksPageProps {
  onNavigate: (page: string) => void;
}

export const TasksPage: React.FC<TasksPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();

  const [loading, setLoading] = useState(true);
  const [teams, setTeams] = useState<Array<Team & { project?: Project }>>([]);
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [selectedTeamFilter, setSelectedTeamFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');

  // Modal
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [targetTeamId, setTargetTeamId] = useState('');
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskAssignee, setTaskAssignee] = useState('');
  const [taskPriority, setTaskPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await api.getMyTeams();
      setTeams(res.teams);

      const collected: Task[] = [];
      for (const t of res.teams) {
        const tTasks = await api.getTeamTasks(t.id);
        collected.push(...tTasks.tasks);
      }
      setAllTasks(collected);
      if (res.teams[0] && !targetTeamId) {
        setTargetTeamId(res.teams[0].id);
      }
    } catch (err: any) {
      toastError(err.message || 'Failed to load tasks.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleUpdateStatus = async (taskId: string, newStatus: any) => {
    try {
      const res = await api.updateTask(taskId, { status: newStatus });
      setAllTasks(prev => prev.map(t => (t.id === taskId ? res.task : t)));
      success(`Task updated to ${newStatus}.`);
    } catch (err: any) {
      toastError(err.message || 'Failed to update task.');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await api.deleteTask(taskId);
      setAllTasks(prev => prev.filter(t => t.id !== taskId));
      success('Task deleted.');
    } catch (err: any) {
      toastError(err.message || 'Failed to delete task.');
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim() || !targetTeamId) return;

    setIsCreating(true);
    try {
      const res = await api.createTask(targetTeamId, {
        title: taskTitle.trim(),
        description: taskDesc.trim(),
        assignedTo: taskAssignee,
        priority: taskPriority,
        dueDate: taskDueDate,
      });
      setAllTasks(prev => [res.task, ...prev]);
      success('Task created successfully!');
      setShowTaskModal(false);
      setTaskTitle('');
      setTaskDesc('');
      setTaskAssignee('');
    } catch (err: any) {
      toastError(err.message || 'Failed to create task.');
    } finally {
      setIsCreating(false);
    }
  };

  const filteredTasks = useMemo(() => {
    return allTasks.filter(t => {
      if (selectedTeamFilter !== 'All' && t.teamId !== selectedTeamFilter) return false;
      if (statusFilter !== 'All' && t.status !== statusFilter) return false;
      if (priorityFilter !== 'All' && t.priority !== priorityFilter) return false;
      return true;
    });
  }, [allTasks, selectedTeamFilter, statusFilter, priorityFilter]);

  const activeTeamObject = teams.find(t => t.id === targetTeamId);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-emerald-600" />
            Task Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Track academic deliverables, manage milestones, and assign tasks to teammates.
          </p>
        </div>

        {teams.length > 0 && (
          <Button
            variant="primary"
            size="md"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setShowTaskModal(true)}
          >
            Create Task
          </Button>
        )}
      </div>

      {/* Filters Bar */}
      <Card className="p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          {/* Status filter */}
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-slate-400">Status:</span>
            {['All', 'Pending', 'In Progress', 'Completed'].map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-2.5 py-1 rounded-lg border font-medium transition-all ${
                  statusFilter === s
                    ? 'bg-indigo-600 text-white border-indigo-600 font-bold'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Priority filter */}
          <div className="flex items-center gap-1.5 ml-0 sm:ml-4">
            <span className="font-bold text-slate-400">Priority:</span>
            {['All', 'High', 'Medium', 'Low'].map(p => (
              <button
                key={p}
                onClick={() => setPriorityFilter(p)}
                className={`px-2.5 py-1 rounded-lg border font-medium transition-all ${
                  priorityFilter === p
                    ? 'bg-indigo-600 text-white border-indigo-600 font-bold'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Team filter dropdown */}
        {teams.length > 1 && (
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-400">Team:</span>
            <select
              value={selectedTeamFilter}
              onChange={e => setSelectedTeamFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-medium"
            >
              <option value="All">All Teams</option>
              {teams.map(t => (
                <option key={t.id} value={t.id}>
                  {t.projectName}
                </option>
              ))}
            </select>
          </div>
        )}
      </Card>

      {/* Tasks List */}
      {loading ? (
        <LoadingSpinner message="Loading tasks..." />
      ) : filteredTasks.length > 0 ? (
        <div className="space-y-3">
          {filteredTasks.map(task => {
            const team = teams.find(t => t.id === task.teamId);
            const isCompleted = task.status === 'Completed';

            return (
              <Card
                key={task.id}
                className={`p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-all ${
                  isCompleted ? 'bg-slate-50/70 border-slate-200 opacity-80' : 'bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1.5">
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
                    {team && (
                      <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                        {team.projectName}
                      </span>
                    )}
                    {task.dueDate && (
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Due {task.dueDate}
                      </span>
                    )}
                  </div>

                  <h2
                    className={`text-sm font-bold ${
                      isCompleted ? 'line-through text-slate-400' : 'text-slate-900'
                    }`}
                  >
                    {task.title}
                  </h2>

                  {task.description && (
                    <p className="text-xs text-slate-500 mt-0.5">{task.description}</p>
                  )}

                  <p className="text-[11px] text-slate-600 mt-1 font-medium">
                    Assigned to: <strong className="text-slate-800">{task.assignedToName || 'Unassigned'}</strong>
                  </p>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <select
                    value={task.status}
                    onChange={e => handleUpdateStatus(task.id, e.target.value)}
                    className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg border focus:outline-none ${
                      isCompleted
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

                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                    title="Delete task"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={CheckSquare}
          title="No tasks found"
          description="Create tasks to organize semester goals, milestone deadlines, and individual assignments."
          actionText="Create First Task"
          onAction={() => setShowTaskModal(true)}
        />
      )}

      {/* New Task Modal */}
      {showTaskModal && (
        <Modal
          isOpen={showTaskModal}
          onClose={() => setShowTaskModal(false)}
          title="Create New Task"
          description="Assign a task to a project team member"
        >
          <form onSubmit={handleCreateTask} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Project Team
              </label>
              <select
                value={targetTeamId}
                onChange={e => {
                  setTargetTeamId(e.target.value);
                  setTaskAssignee('');
                }}
                className="w-full px-3 py-2 text-xs font-semibold rounded-lg border border-slate-300 bg-white"
                required
              >
                {teams.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.projectName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Task Title
              </label>
              <input
                type="text"
                value={taskTitle}
                onChange={e => setTaskTitle(e.target.value)}
                placeholder="e.g. Clean and preprocess medical dataset"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
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
                placeholder="Detailed task requirements..."
                className="w-full p-2.5 text-xs rounded-lg border border-slate-300 bg-white"
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
                  {activeTeamObject?.members.map(m => (
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
              <Button type="submit" variant="primary" size="sm" isLoading={isCreating}>
                Add Task
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
