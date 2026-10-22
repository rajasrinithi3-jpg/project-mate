import React, { useState, useEffect } from 'react';
import { 
  Users, 
  FolderKanban, 
  Mail, 
  CheckSquare, 
  Sparkles, 
  ArrowRight, 
  Calendar, 
  UserPlus, 
  AlertCircle,
  ExternalLink,
  Clock,
  ChevronRight,
  TrendingUp
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Avatar } from '../components/ui/Avatar';
import { MatchScoreBadge } from '../components/ui/MatchScoreBadge';
import { SkillChip } from '../components/ui/SkillChip';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { useToast } from '../context/ToastContext';

interface DashboardPageProps {
  onNavigate: (page: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [respondingInvId, setRespondingInvId] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await api.getDashboardSummary();
      setData(res);
    } catch (err: any) {
      toastError(err.message || 'Unable to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleRespondInvitation = async (invId: string, action: 'accept' | 'decline') => {
    setRespondingInvId(invId);
    try {
      const res = await api.respondToInvitation(invId, action);
      success(res.message);
      await fetchDashboardData();
    } catch (err: any) {
      toastError(err.message || 'Could not process invitation response.');
    } finally {
      setRespondingInvId(null);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading your project collaboration dashboard..." fullHeight />;
  }

  const stats = data?.stats || {
    projectsCount: 0,
    teamMembersCount: 0,
    pendingInvitationsCount: 0,
    tasksDueCount: 0,
  };

  const profileCompletion = data?.profileCompletion || 75;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-blue-600 rounded-2xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none hidden md:block">
          <Sparkles className="w-96 h-96 -mr-16 -mt-16" />
        </div>
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/15 text-white text-xs font-semibold mb-3 backdrop-blur-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            {user?.department} • {user?.year}
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
            Hello, {user?.name} 👋
          </h1>
          <p className="text-indigo-100 text-xs sm:text-sm mb-6 leading-relaxed">
            Welcome to ProjectMate. Connect with classmates, coordinate semester projects, and form teams with the right technical skills.
          </p>

          <div className="flex flex-wrap gap-3">
            <Button
              variant="secondary"
              size="sm"
              className="bg-white text-indigo-700 hover:bg-indigo-50 border-white font-bold"
              leftIcon={<Sparkles className="w-4 h-4 text-indigo-600" />}
              onClick={() => onNavigate('find-teammates')}
            >
              Find Compatible Teammates
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-white/10 hover:bg-white/20 text-white border-white/25"
              onClick={() => onNavigate('create-project')}
            >
              Post a Project
            </Button>
          </div>
        </div>
      </div>

      {/* Profile Completion Bar */}
      {profileCompletion < 100 && (
        <div className="bg-white rounded-2xl border border-indigo-100 p-4 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex-1 w-full sm:w-auto">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-slate-800">
                Your Student Profile: {profileCompletion}% Complete
              </span>
              <span className="text-xs text-indigo-600 font-semibold">
                {100 - profileCompletion}% remaining
              </span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${profileCompletion}%` }}
              />
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigate('profile')}
            className="shrink-0 text-xs text-indigo-600 border-indigo-200 hover:bg-indigo-50"
          >
            Enhance Skills & Availability
          </Button>
        </div>
      )}

      {/* 4 Dashboard Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 sm:p-5 flex items-center gap-3.5 hover:border-slate-300 transition-all">
          <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <FolderKanban className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Active Projects</p>
            <p className="text-2xl font-black text-slate-900">{stats.projectsCount}</p>
          </div>
        </Card>

        <Card className="p-4 sm:p-5 flex items-center gap-3.5 hover:border-slate-300 transition-all">
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Team Members</p>
            <p className="text-2xl font-black text-slate-900">{stats.teamMembersCount}</p>
          </div>
        </Card>

        <Card className="p-4 sm:p-5 flex items-center gap-3.5 hover:border-slate-300 transition-all">
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Pending Invites</p>
            <p className="text-2xl font-black text-slate-900">{stats.pendingInvitationsCount}</p>
          </div>
        </Card>

        <Card className="p-4 sm:p-5 flex items-center gap-3.5 hover:border-slate-300 transition-all">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckSquare className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Tasks Due</p>
            <p className="text-2xl font-black text-slate-900">{stats.tasksDueCount}</p>
          </div>
        </Card>
      </div>

      {/* Pending Invitations Banner if any */}
      {data?.pendingInvitations && data.pendingInvitations.length > 0 && (
        <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-amber-600" />
              <h2 className="font-bold text-amber-950 text-sm">
                You have {data.pendingInvitations.length} pending project invitation{data.pendingInvitations.length > 1 ? 's' : ''}
              </h2>
            </div>
            <button
              onClick={() => onNavigate('invitations')}
              className="text-xs font-bold text-amber-800 hover:text-amber-950 flex items-center gap-1"
            >
              View all <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {data.pendingInvitations.map((inv: any) => (
              <div
                key={inv.id}
                className="bg-white p-3.5 rounded-xl border border-amber-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
              >
                <div>
                  <p className="text-sm font-bold text-slate-900">
                    {inv.projectName}
                  </p>
                  <p className="text-xs text-slate-500">
                    Invited by <span className="font-semibold text-slate-700">{inv.senderName}</span> as a{' '}
                    <span className="font-semibold text-indigo-700">{inv.roleOffered}</span>
                  </p>
                </div>
                <div className="flex items-center gap-2 self-end sm:self-center">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={respondingInvId === inv.id}
                    onClick={() => handleRespondInvitation(inv.id, 'decline')}
                    className="text-xs text-slate-600 hover:text-rose-600"
                  >
                    Decline
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    isLoading={respondingInvId === inv.id}
                    onClick={() => handleRespondInvitation(inv.id, 'accept')}
                    className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    Accept & Join Team
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Two Column Layout: Recommended Teammates & Recommended Projects */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recommended Teammates */}
        <Card className="flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-600" />
                Recommended Teammates
              </h2>
              <p className="text-xs text-slate-500">Matching with your active academic projects</p>
            </div>
            <button
              onClick={() => onNavigate('find-teammates')}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              See all <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3 flex-1">
            {data?.recommendedTeammates?.slice(0, 3).map((item: any) => (
              <div
                key={item.student.id}
                className="p-3.5 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50/50 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
              >
                <div className="flex items-start gap-3">
                  <Avatar src={item.student.photoURL} name={item.student.name} size="md" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{item.student.name}</span>
                      <MatchScoreBadge score={item.matchScore} size="sm" />
                    </div>
                    <p className="text-xs text-slate-500 mb-1.5">
                      {item.student.department} • {item.student.year}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {item.student.skills.slice(0, 3).map((s: string) => (
                        <span key={s} className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex sm:flex-col gap-2 w-full sm:w-auto shrink-0">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="flex-1 sm:flex-none text-xs"
                    onClick={() => onNavigate(`find-teammates`)}
                  >
                    View Match
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Recommended Projects */}
        <Card className="flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <FolderKanban className="w-4 h-4 text-blue-600" />
                Projects Needing Your Skills
              </h2>
              <p className="text-xs text-slate-500">Recruiting projects aligned with your profile</p>
            </div>
            <button
              onClick={() => onNavigate('projects')}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              Browse all <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3 flex-1">
            {data?.recommendedProjects && data.recommendedProjects.length > 0 ? (
              data.recommendedProjects.map((item: any) => (
                <div
                  key={item.project.id}
                  className="p-3.5 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50/50 transition-all flex flex-col justify-between gap-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded mb-1">
                        {item.project.category}
                      </span>
                      <h3 className="font-bold text-slate-900 text-sm">{item.project.name}</h3>
                      <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                        {item.project.description}
                      </p>
                    </div>
                    <MatchScoreBadge score={item.matchScore} size="sm" />
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-100/70 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      Due {item.project.deadline}
                    </span>
                    <button
                      onClick={() => onNavigate(`project-details?id=${item.project.id}`)}
                      className="font-bold text-indigo-600 hover:text-indigo-700 text-xs"
                    >
                      View Details →
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 p-4 text-center">No projects found. Check back soon!</p>
            )}
          </div>
        </Card>
      </div>

      {/* Active Projects & Upcoming Tasks */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Active Projects */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <FolderKanban className="w-4 h-4 text-indigo-600" />
              Your Active Teams
            </h2>
            <button
              onClick={() => onNavigate('my-team')}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700"
            >
              Open Team Workspace →
            </button>
          </div>

          {data?.activeProjects && data.activeProjects.length > 0 ? (
            <div className="space-y-3">
              {data.activeProjects.map((item: any) => (
                <div
                  key={item.team.id}
                  onClick={() => onNavigate(`my-team?teamId=${item.team.id}`)}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/40 hover:bg-slate-50 cursor-pointer transition-all"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-slate-900 text-sm">{item.team.projectName}</h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {item.project?.status || 'Active'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>{item.team.members.length} team members</span>
                    <span className="text-indigo-600 font-semibold">Enter Workspace →</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-xs text-slate-400">
              You are not a member of any project teams yet.{' '}
              <button
                onClick={() => onNavigate('projects')}
                className="text-indigo-600 font-bold underline"
              >
                Browse projects
              </button>
            </div>
          )}
        </Card>

        {/* Tasks Due Soon */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-emerald-600" />
              Tasks Due Soon
            </h2>
            <button
              onClick={() => onNavigate('tasks')}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700"
            >
              Manage Tasks →
            </button>
          </div>

          {data?.tasksDueSoon && data.tasksDueSoon.length > 0 ? (
            <div className="space-y-2.5">
              {data.tasksDueSoon.map((task: any) => (
                <div
                  key={task.id}
                  className="p-3 rounded-xl border border-slate-100 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        task.priority === 'High'
                          ? 'bg-rose-500'
                          : task.priority === 'Medium'
                          ? 'bg-amber-500'
                          : 'bg-blue-500'
                      }`}
                    />
                    <div className="truncate">
                      <p className="font-bold text-slate-900 truncate">{task.title}</p>
                      <p className="text-slate-400 text-[11px]">
                        {task.assignedToName ? `Assigned to ${task.assignedToName}` : 'Unassigned'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] font-medium text-slate-500">
                      {task.dueDate ? `Due ${task.dueDate}` : ''}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                      {task.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-xs text-slate-400">
              No pending tasks right now. You're completely up to date!
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
