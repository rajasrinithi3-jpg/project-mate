import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  FolderKanban, 
  Calendar, 
  Users, 
  Sparkles, 
  ShieldCheck, 
  Trash2, 
  Edit3, 
  MessageSquare,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Project, Team } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Avatar } from '../components/ui/Avatar';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Modal } from '../components/ui/Modal';
import { useToast } from '../context/ToastContext';

interface ProjectDetailsPageProps {
  projectId: string;
  onNavigate: (page: string) => void;
}

export const ProjectDetailsPage: React.FC<ProjectDetailsPageProps> = ({ projectId, onNavigate }) => {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();

  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<Project | null>(null);
  const [team, setTeam] = useState<Team | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchProjectData = async () => {
    try {
      setLoading(true);
      const res = await api.getProjectById(projectId);
      setProject(res.project);
      if (res.team) setTeam(res.team);
    } catch (err: any) {
      toastError(err.message || 'Failed to load project details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectData();
  }, [projectId]);

  const handleDelete = async () => {
    if (!project) return;
    setIsDeleting(true);
    try {
      await api.deleteProject(project.id);
      success('Project removed successfully.');
      onNavigate('projects');
    } catch (err: any) {
      toastError(err.message || 'Could not delete project.');
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading project details..." fullHeight />;
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500 mb-4">Project not found.</p>
        <Button variant="outline" size="sm" onClick={() => onNavigate('projects')}>
          Back to Projects
        </Button>
      </div>
    );
  }

  const isCreator = project.creatorId === user?.id;
  const isMember = team?.members.some(m => m.userId === user?.id);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <button
        onClick={() => onNavigate('projects')}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Projects
      </button>

      {/* Main Project Header Card */}
      <Card className="p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
                {project.category}
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  project.status === 'Recruiting'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-blue-50 text-blue-700 border border-blue-200'
                }`}
              >
                {project.status}
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              {project.name}
            </h1>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto">
            {isMember && team && (
              <Button
                variant="primary"
                size="sm"
                className="flex-1 sm:flex-none text-xs"
                leftIcon={<ShieldCheck className="w-4 h-4" />}
                onClick={() => onNavigate(`my-team?teamId=${team.id}`)}
              >
                Open Team Workspace
              </Button>
            )}
            <Button
              variant="secondary"
              size="sm"
              className="flex-1 sm:flex-none text-xs"
              leftIcon={<Sparkles className="w-4 h-4" />}
              onClick={() => onNavigate(`find-teammates?projectId=${project.id}`)}
            >
              Find Teammates
            </Button>
            {isCreator && (
              <Button
                variant="outline"
                size="sm"
                className="text-rose-600 hover:bg-rose-50 border-rose-200"
                onClick={() => setShowDeleteModal(true)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Project Description */}
        <p className="text-sm text-slate-600 leading-relaxed mb-6 whitespace-pre-line">
          {project.description}
        </p>

        {/* Meta Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600">
          <div>
            <span className="text-slate-400 block mb-0.5 font-medium">Team Capacity:</span>
            <span className="font-bold text-slate-800 flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-slate-500" />
              {team?.members.length || 1} / {project.teamSize} Students
            </span>
          </div>
          <div>
            <span className="text-slate-400 block mb-0.5 font-medium">Deadline:</span>
            <span className="font-bold text-slate-800 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              {project.deadline}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block mb-0.5 font-medium">Project Lead:</span>
            <span className="font-bold text-slate-800">
              {project.creatorName || 'Student'} ({project.creatorDepartment || 'IT'})
            </span>
          </div>
          <div>
            <span className="text-slate-400 block mb-0.5 font-medium">Created:</span>
            <span className="font-bold text-slate-800">
              {new Date(project.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Required Technical Stack */}
        <div className="pt-6 mt-6 border-t border-slate-100">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
            Required Technical Stack:
          </h2>
          <div className="flex flex-wrap gap-1.5">
            {project.requiredSkills.map(skill => (
              <span
                key={skill}
                className="text-xs px-3 py-1 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 font-semibold"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </Card>

      {/* Team Roster Card */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600" />
              Current Team Members ({team?.members.length || 1} / {project.teamSize})
            </h2>
            <p className="text-xs text-slate-500">Students officially registered in this project team</p>
          </div>
          {team && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate(`my-team?teamId=${team.id}`)}
              className="text-xs"
            >
              Go to Workspace →
            </Button>
          )}
        </div>

        <div className="space-y-3">
          {team?.members.map(member => (
            <div
              key={member.userId}
              className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 bg-slate-50/50"
            >
              <div className="flex items-center gap-3">
                <Avatar src={member.photoURL} name={member.name} size="md" />
                <div>
                  <p className="font-bold text-slate-900 text-sm">{member.name}</p>
                  <p className="text-xs text-slate-500">
                    {member.department} • {member.year}
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-white border border-slate-200 text-slate-700 shadow-2xs">
                {member.role}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Project?"
        description="Are you sure you want to remove this project? This will also remove the associated team workspace and tasks."
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-500">
            This action cannot be undone. All project data will be permanently cleared.
          </p>
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              isLoading={isDeleting}
              onClick={handleDelete}
            >
              Confirm Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
