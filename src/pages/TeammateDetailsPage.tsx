import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Github, 
  Linkedin, 
  Clock, 
  Building, 
  Calendar, 
  Sparkles, 
  BrainCircuit, 
  UserPlus, 
  Mail, 
  CheckCircle2, 
  FolderKanban,
  Send
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { User, Project } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Avatar } from '../components/ui/Avatar';
import { MatchScoreBadge } from '../components/ui/MatchScoreBadge';
import { SkillChip } from '../components/ui/SkillChip';
import { Modal } from '../components/ui/Modal';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { useToast } from '../context/ToastContext';

interface TeammateDetailsPageProps {
  studentId: string;
  projectId?: string;
  onNavigate: (page: string) => void;
}

export const TeammateDetailsPage: React.FC<TeammateDetailsPageProps> = ({
  studentId,
  projectId,
  onNavigate,
}) => {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();

  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState<User | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [matchData, setMatchData] = useState<any | null>(null);

  // Invite modal
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteRole, setInviteRole] = useState('Developer');
  const [inviteMessage, setInviteMessage] = useState('');
  const [isSendingInvite, setIsSendingInvite] = useState(false);

  // AI analysis
  const [loadingAI, setLoadingAI] = useState(false);
  const [aiInsight, setAiInsight] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const userRes = await api.getUserById(studentId);
        setStudent(userRes.user);

        // Fetch user's recruiting project or the provided projectId
        const projectsRes = await api.getProjects();
        const activeProj = projectId 
          ? projectsRes.projects.find(p => p.id === projectId)
          : projectsRes.projects.find(p => p.creatorId === user?.id && p.status === 'Recruiting') || projectsRes.projects[0];

        if (activeProj) {
          setProject(activeProj);
          const matchRes = await api.getMatchingTeammates(activeProj.id);
          const foundMatch = matchRes.matches.find(m => m.student.id === studentId);
          if (foundMatch) {
            setMatchData(foundMatch);
          }
        }
      } catch (err: any) {
        toastError(err.message || 'Unable to load student profile.');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [studentId, projectId, user]);

  const handleFetchAI = async () => {
    if (!project || !student) return;
    setLoadingAI(true);
    try {
      const res = await api.getAIEvaluation(student.id, project.id);
      setAiInsight(res.explanation);
    } catch {
      toastError('Could not generate AI insight.');
    } finally {
      setLoadingAI(false);
    }
  };

  const handleSendInvite = async () => {
    if (!student || !project) return;
    setIsSendingInvite(true);
    try {
      await api.sendInvitation({
        projectId: project.id,
        receiverId: student.id,
        roleOffered: inviteRole,
        message: inviteMessage,
      });
      success(`Invitation sent to ${student.name}!`);
      setShowInviteModal(false);
    } catch (err: any) {
      toastError(err.message || 'Failed to send invitation.');
    } finally {
      setIsSendingInvite(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading student profile & match score..." fullHeight />;
  }

  if (!student) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500 mb-4">Student profile could not be found.</p>
        <Button variant="outline" size="sm" onClick={() => onNavigate('find-teammates')}>
          Return to Teammate Search
        </Button>
      </div>
    );
  }

  const isUserHimself = user?.id === student.id;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top back button */}
      <button
        onClick={() => onNavigate('find-teammates')}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Teammates List
      </button>

      {/* Main Profile Header Card */}
      <Card className="p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <Avatar src={student.photoURL} name={student.name} size="xl" />
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-black text-slate-900">{student.name}</h1>
                {matchData && <MatchScoreBadge score={matchData.matchScore} size="lg" />}
              </div>
              <p className="text-sm font-semibold text-slate-500 mt-1 flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <Building className="w-4 h-4 text-slate-400" />
                  {student.department}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  {student.year}
                </span>
              </p>
              <p className="text-xs text-slate-400 mt-1">{student.email}</p>
            </div>
          </div>

          {!isUserHimself && project && (
            <Button
              variant="primary"
              size="md"
              leftIcon={<UserPlus className="w-4 h-4" />}
              onClick={() => {
                setInviteMessage(`Hi ${student.name.split(' ')[0]}! We are building "${project.name}" and your skills match what we need.`);
                setShowInviteModal(true);
              }}
            >
              Invite to Project
            </Button>
          )}
        </div>

        {/* Social / Links */}
        <div className="flex flex-wrap items-center gap-3 pt-6 mt-6 border-t border-slate-100 text-xs">
          {student.github && (
            <a
              href={student.github}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:border-slate-400 transition-colors"
            >
              <Github className="w-4 h-4" />
              <span>GitHub</span>
            </a>
          )}
          {student.linkedin && (
            <a
              href={student.linkedin}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:border-slate-400 transition-colors"
            >
              <Linkedin className="w-4 h-4 text-blue-600" />
              <span>LinkedIn</span>
            </a>
          )}
          <span className="text-slate-400">
            Joined {new Date(student.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
          </span>
        </div>
      </Card>

      {/* Match Compatibility Highlight (if project active) */}
      {project && matchData && (
        <Card className="p-6 bg-gradient-to-r from-indigo-50/50 to-white border-indigo-100">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              <h2 className="text-sm font-bold text-indigo-950">
                Compatibility Breakdown for "{project.name}"
              </h2>
            </div>
            <MatchScoreBadge score={matchData.matchScore} size="md" />
          </div>

          <p className="text-xs text-slate-600 mb-4 leading-relaxed">
            {matchData.explanation}
          </p>

          <div className="grid sm:grid-cols-3 gap-3 text-xs mb-4">
            <div className="p-3 rounded-xl bg-white border border-slate-200/80">
              <span className="text-slate-400 block mb-1 font-semibold">Matched Skills:</span>
              <span className="font-bold text-emerald-700">
                {matchData.matchedSkills?.join(', ') || 'None directly matched'}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-white border border-slate-200/80">
              <span className="text-slate-400 block mb-1 font-semibold">Shared Interests:</span>
              <span className="font-bold text-indigo-700">
                {matchData.sharedInterests?.join(', ') || 'Aligned engineering domain'}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-white border border-slate-200/80">
              <span className="text-slate-400 block mb-1 font-semibold">Schedule Compatibility:</span>
              <span className="font-bold text-slate-700">
                {matchData.availabilityCompatibility}
              </span>
            </div>
          </div>

          {/* AI Analysis Button */}
          <div className="pt-3 border-t border-indigo-100/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <span className="text-xs text-indigo-900 font-semibold flex items-center gap-1.5">
              <BrainCircuit className="w-4 h-4 text-indigo-600" />
              Optional Gemini Teammate Analysis:
            </span>
            {!aiInsight ? (
              <Button
                variant="secondary"
                size="sm"
                className="text-xs"
                isLoading={loadingAI}
                onClick={handleFetchAI}
              >
                Why this student? (AI Assessment)
              </Button>
            ) : null}
          </div>

          {aiInsight && (
            <div className="mt-3 p-3.5 rounded-xl bg-white border border-indigo-200 text-xs text-slate-700 leading-relaxed shadow-xs animate-fade-in">
              <p className="font-bold text-indigo-700 mb-1">AI Advisor Note:</p>
              <p>{aiInsight}</p>
            </div>
          )}
        </Card>
      )}

      {/* Bio & Details Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* Bio Card */}
          <Card className="p-6">
            <h2 className="text-sm font-bold text-slate-900 mb-3">About / Bio</h2>
            <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
              {student.bio || 'No biography written yet.'}
            </p>
          </Card>

          {/* Technical Skills */}
          <Card className="p-6">
            <h2 className="text-sm font-bold text-slate-900 mb-3">
              Technical Skills ({student.skills.length})
            </h2>
            <div className="flex flex-wrap gap-2">
              {student.skills.map(s => {
                const isMatched = matchData?.matchedSkills?.includes(s);
                return (
                  <SkillChip
                    key={s}
                    skill={s}
                    isMatched={isMatched}
                    size="md"
                  />
                );
              })}
            </div>
          </Card>

          {/* Project Interests */}
          <Card className="p-6">
            <h2 className="text-sm font-bold text-slate-900 mb-3">
              Interests & Domains
            </h2>
            <div className="flex flex-wrap gap-2">
              {student.interests.map(i => (
                <span
                  key={i}
                  className="text-xs px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700 font-medium"
                >
                  {i}
                </span>
              ))}
            </div>
          </Card>
        </div>

        {/* Sidebar: Availability & Preferences */}
        <div className="space-y-6">
          <Card className="p-6 space-y-4">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                Availability
              </h2>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {student.availability.map(a => (
                  <li key={a} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>{a}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Preferred Projects
              </h2>
              <div className="flex flex-wrap gap-1.5">
                {student.preferredProjectTypes?.map(pt => (
                  <span
                    key={pt}
                    className="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium"
                  >
                    {pt}
                  </span>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && project && (
        <Modal
          isOpen={showInviteModal}
          onClose={() => setShowInviteModal(false)}
          title={`Invite ${student.name}`}
          description={`Send a team invitation for project "${project.name}"`}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Role in Team
              </label>
              <select
                value={inviteRole}
                onChange={e => setInviteRole(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600"
              >
                <option value="Developer">Developer (Frontend / Backend)</option>
                <option value="Researcher">Researcher / ML Engineer</option>
                <option value="Designer">UI/UX Designer</option>
                <option value="Data Scientist">Data Scientist</option>
                <option value="Member">General Contributor</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Message
              </label>
              <textarea
                rows={3}
                value={inviteMessage}
                onChange={e => setInviteMessage(e.target.value)}
                className="w-full p-3 text-xs rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button variant="outline" size="sm" onClick={() => setShowInviteModal(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                isLoading={isSendingInvite}
                leftIcon={<Send className="w-3.5 h-3.5" />}
                onClick={handleSendInvite}
              >
                Send Invitation
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
