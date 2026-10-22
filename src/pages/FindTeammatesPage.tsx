import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Sparkles, 
  UserPlus, 
  Check, 
  X, 
  HelpCircle, 
  Send, 
  BookOpen, 
  Calendar, 
  Clock, 
  CheckCircle2,
  FolderKanban,
  BrainCircuit,
  SlidersHorizontal
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
import { EmptyState } from '../components/ui/EmptyState';
import { useToast } from '../context/ToastContext';

interface FindTeammatesPageProps {
  onNavigate: (page: string) => void;
  initialSearch?: string;
}

export const FindTeammatesPage: React.FC<FindTeammatesPageProps> = ({ onNavigate, initialSearch = '' }) => {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();

  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [matches, setMatches] = useState<any[]>([]);

  // Search and filters
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedYear, setSelectedYear] = useState('All');
  const [selectedAvailability, setSelectedAvailability] = useState('All');
  const [skillFilter, setSkillFilter] = useState('');

  // Modals
  const [selectedMatchForInfo, setSelectedMatchForInfo] = useState<any | null>(null);
  const [inviteModalStudent, setInviteModalStudent] = useState<User | null>(null);
  const [inviteRole, setInviteRole] = useState<'Developer' | 'Researcher' | 'Designer' | 'Data Scientist' | 'Member'>('Developer');
  const [inviteMessage, setInviteMessage] = useState('');
  const [isSendingInvite, setIsSendingInvite] = useState(false);

  // AI explanation state
  const [loadingAI, setLoadingAI] = useState(false);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);

  // Load projects and initial matches
  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        const projectsRes = await api.getProjects();
        setProjects(projectsRes.projects);

        // Pick user's project if available, otherwise first project
        const userProject = projectsRes.projects.find(p => p.creatorId === user?.id && p.status === 'Recruiting');
        const defaultProjId = userProject?.id || projectsRes.projects[0]?.id || '';
        setSelectedProjectId(defaultProjId);

        if (defaultProjId) {
          const matchRes = await api.getMatchingTeammates(defaultProjId);
          setMatches(matchRes.matches);
        }
      } catch (err: any) {
        toastError(err.message || 'Failed to load matching data.');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [user]);

  // When selected project changes, re-fetch matching teammates
  const handleProjectChange = async (projectId: string) => {
    setSelectedProjectId(projectId);
    try {
      setLoading(true);
      const res = await api.getMatchingTeammates(projectId);
      setMatches(res.matches);
    } catch (err: any) {
      toastError(err.message || 'Error updating teammate matches.');
    } finally {
      setLoading(false);
    }
  };

  const selectedProject = projects.find(p => p.id === selectedProjectId);

  // Filter matches based on criteria
  const filteredMatches = useMemo(() => {
    return matches.filter(item => {
      const student = item.student;
      const q = searchQuery.toLowerCase().trim();

      if (q) {
        const matchesName = student.name.toLowerCase().includes(q);
        const matchesBio = student.bio?.toLowerCase().includes(q);
        const matchesSkill = student.skills.some((s: string) => s.toLowerCase().includes(q));
        const matchesInterest = student.interests.some((i: string) => i.toLowerCase().includes(q));
        if (!matchesName && !matchesBio && !matchesSkill && !matchesInterest) {
          return false;
        }
      }

      if (selectedDept !== 'All' && student.department !== selectedDept) {
        return false;
      }

      if (selectedYear !== 'All' && student.year !== selectedYear) {
        return false;
      }

      if (selectedAvailability !== 'All' && !student.availability.includes(selectedAvailability)) {
        return false;
      }

      if (skillFilter.trim()) {
        const sf = skillFilter.toLowerCase().trim();
        if (!student.skills.some((s: string) => s.toLowerCase().includes(sf))) {
          return false;
        }
      }

      return true;
    });
  }, [matches, searchQuery, selectedDept, selectedYear, selectedAvailability, skillFilter]);

  const handleOpenInvite = (student: User) => {
    setInviteModalStudent(student);
    setInviteRole('Developer');
    setInviteMessage(`Hi ${student.name.split(' ')[0]}! I noticed your technical background and would love to collaborate on "${selectedProject?.name || 'our semester project'}".`);
  };

  const handleSendInvite = async () => {
    if (!inviteModalStudent || !selectedProjectId) return;
    setIsSendingInvite(true);
    try {
      await api.sendInvitation({
        projectId: selectedProjectId,
        receiverId: inviteModalStudent.id,
        roleOffered: inviteRole,
        message: inviteMessage,
      });
      success(`Invitation sent successfully to ${inviteModalStudent.name}!`);
      setInviteModalStudent(null);
    } catch (err: any) {
      toastError(err.message || 'Could not send invitation.');
    } finally {
      setIsSendingInvite(false);
    }
  };

  const handleFetchAIInsight = async (studentId: string) => {
    if (!selectedProjectId) return;
    setLoadingAI(true);
    setAiExplanation(null);
    try {
      const res = await api.getAIEvaluation(studentId, selectedProjectId);
      setAiExplanation(res.explanation);
    } catch {
      toastError('Could not fetch AI insight.');
    } finally {
      setLoadingAI(false);
    }
  };

  const departments = ['All', 'CSE', 'IT', 'AI', 'DS', 'ECE', 'Other'];
  const years = ['All', '1st Year', '2nd Year', '3rd Year', '4th Year'];

  return (
    <div className="space-y-6">
      {/* Header and Project Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Deterministic Match Algorithm</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Find Project Teammates
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Discover peer engineers based on verified skills, availability, and real match scores.
          </p>
        </div>

        {/* Project Target Dropdown */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
          <label className="text-xs font-bold text-slate-700 whitespace-nowrap">
            Matching for Project:
          </label>
          <select
            value={selectedProjectId}
            onChange={e => handleProjectChange(e.target.value)}
            className="w-full sm:w-auto px-3.5 py-2 text-xs font-semibold bg-slate-50 border border-slate-300 rounded-xl text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600"
          >
            {projects.map(p => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.category})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Target Project Summary Banner */}
      {selectedProject && (
        <div className="bg-indigo-50/60 border border-indigo-100 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <div>
            <span className="font-bold text-indigo-950 text-sm">{selectedProject.name}</span>
            <span className="ml-2 text-indigo-700 font-medium">({selectedProject.category})</span>
            <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
              <span className="text-slate-500 font-medium">Required Skills:</span>
              {selectedProject.requiredSkills.map(s => (
                <span key={s} className="px-2 py-0.5 rounded bg-white text-indigo-800 font-semibold border border-indigo-200 text-[11px]">
                  {s}
                </span>
              ))}
            </div>
          </div>
          <div className="text-slate-500 flex items-center gap-3">
            <span>Team Cap: <strong className="text-slate-800">{selectedProject.currentTeamSize || 1}/{selectedProject.teamSize}</strong></span>
            <span>Deadline: <strong className="text-slate-800">{selectedProject.deadline}</strong></span>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <Card className="p-4 space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Main search box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by student name, bio, or interest..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600"
            />
          </div>

          {/* Skill Filter input */}
          <div className="relative md:w-60">
            <input
              type="text"
              value={skillFilter}
              onChange={e => setSkillFilter(e.target.value)}
              placeholder="Filter specific skill (e.g. React)..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600"
            />
          </div>
        </div>

        {/* Filter Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1 flex items-center gap-1">
            <SlidersHorizontal className="w-3 h-3" />
            Department:
          </span>
          {departments.map(dept => (
            <button
              key={dept}
              onClick={() => setSelectedDept(dept)}
              className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-all ${
                selectedDept === dept
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs font-semibold'
                  : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              {dept}
            </button>
          ))}

          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mx-2">Year:</span>
          {years.map(yr => (
            <button
              key={yr}
              onClick={() => setSelectedYear(yr)}
              className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-all ${
                selectedYear === yr
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs font-semibold'
                  : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              {yr}
            </button>
          ))}
        </div>
      </Card>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>
          Showing <strong>{filteredMatches.length}</strong> matching teammate candidates
        </span>
        <span className="text-[11px] text-slate-400">
          Formula: Skills (60%) + Interests (15%) + Availability (10%) + Dept (5%) + Year (5%) + Pref (5%)
        </span>
      </div>

      {/* Candidates List */}
      {loading ? (
        <LoadingSpinner message="Calculating deterministic candidate match scores..." />
      ) : filteredMatches.length > 0 ? (
        <div className="grid md:grid-cols-2 gap-5">
          {filteredMatches.map(item => {
            const student: User = item.student;
            const isUserHimself = student.id === user?.id;

            return (
              <div
                key={student.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all duration-200 p-5 flex flex-col justify-between"
              >
                <div>
                  {/* Top: Avatar, Name, Department & Match Score */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <Avatar src={student.photoURL} name={student.name} size="lg" />
                      <div>
                        <h2 className="text-base font-bold text-slate-900 hover:text-indigo-600 cursor-pointer"
                            onClick={() => onNavigate(`teammate-details?id=${student.id}&projectId=${selectedProjectId}`)}>
                          {student.name}
                        </h2>
                        <p className="text-xs font-medium text-slate-500">
                          {student.department} • {student.year}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedMatchForInfo(item)}
                      className="cursor-pointer hover:opacity-90 transition-opacity"
                      title="Click to view full match score breakdown"
                    >
                      <MatchScoreBadge score={item.matchScore} size="md" />
                    </button>
                  </div>

                  {/* Bio */}
                  {student.bio && (
                    <p className="text-xs text-slate-600 line-clamp-2 mb-3">
                      {student.bio}
                    </p>
                  )}

                  {/* Skills Section */}
                  <div className="mb-3">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      Skills:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {student.skills.slice(0, 5).map((s: string) => {
                        const isMatched = item.matchedSkills?.includes(s);
                        return (
                          <SkillChip
                            key={s}
                            skill={s}
                            isMatched={isMatched}
                            size="sm"
                          />
                        );
                      })}
                      {student.skills.length > 5 && (
                        <span className="text-[10px] text-slate-400 self-center">
                          +{student.skills.length - 5} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Explanation Capsule */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 text-xs text-slate-600 mb-4">
                    <div className="flex items-center justify-between text-slate-700 font-semibold mb-1">
                      <span className="flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                        Match Rationale:
                      </span>
                      <button
                        onClick={() => setSelectedMatchForInfo(item)}
                        className="text-[11px] text-indigo-600 hover:underline"
                      >
                        Breakdown
                      </button>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {item.explanation}
                    </p>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs"
                    onClick={() => onNavigate(`teammate-details?id=${student.id}&projectId=${selectedProjectId}`)}
                  >
                    View Profile
                  </Button>

                  {!isUserHimself && (
                    <Button
                      variant="primary"
                      size="sm"
                      className="flex-1 text-xs"
                      leftIcon={<UserPlus className="w-3.5 h-3.5" />}
                      onClick={() => handleOpenInvite(student)}
                    >
                      Invite
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="No teammates match your filters"
          description="Try broadening your department or skill filters to discover other capable engineering candidates."
          actionText="Reset All Filters"
          onAction={() => {
            setSearchQuery('');
            setSelectedDept('All');
            setSelectedYear('All');
            setSelectedAvailability('All');
            setSkillFilter('');
          }}
        />
      )}

      {/* Match Score Breakdown Modal */}
      {selectedMatchForInfo && (
        <Modal
          isOpen={!!selectedMatchForInfo}
          onClose={() => {
            setSelectedMatchForInfo(null);
            setAiExplanation(null);
          }}
          title={`Match Analysis: ${selectedMatchForInfo.student.name}`}
          description={`Compatibility breakdown for "${selectedProject?.name}"`}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <p className="text-xs font-semibold text-slate-500">Overall Match Score</p>
                <p className="text-2xl font-black text-indigo-700">
                  {selectedMatchForInfo.matchScore}%
                </p>
              </div>
              <MatchScoreBadge score={selectedMatchForInfo.matchScore} size="lg" />
            </div>

            {/* Score Weights */}
            <div className="space-y-2 text-xs">
              <p className="font-bold text-slate-700">Weighted Breakdown:</p>
              <div className="grid grid-cols-2 gap-2 text-slate-600">
                <div className="p-2.5 rounded-lg border border-slate-100 bg-white">
                  <span className="font-semibold block">Skills (60%):</span>
                  <span className="text-slate-800">{selectedMatchForInfo.breakdown?.skillScore || 0}% score</span>
                  <span className="text-[10px] text-slate-400 block">
                    {selectedMatchForInfo.matchedSkills?.length} matching skills
                  </span>
                </div>
                <div className="p-2.5 rounded-lg border border-slate-100 bg-white">
                  <span className="font-semibold block">Interests (15%):</span>
                  <span className="text-slate-800">{selectedMatchForInfo.breakdown?.interestScore || 0}% score</span>
                  <span className="text-[10px] text-slate-400 block">
                    {selectedMatchForInfo.sharedInterests?.join(', ') || 'General domain'}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg border border-slate-100 bg-white">
                  <span className="font-semibold block">Availability (10%):</span>
                  <span className="text-slate-800">{selectedMatchForInfo.breakdown?.availabilityScore || 0}% score</span>
                  <span className="text-[10px] text-slate-400 block">
                    {selectedMatchForInfo.availabilityCompatibility}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg border border-slate-100 bg-white">
                  <span className="font-semibold block">Dept & Year (10%):</span>
                  <span className="text-slate-800">Compatible</span>
                  <span className="text-[10px] text-slate-400 block">
                    {selectedMatchForInfo.student.department} • {selectedMatchForInfo.student.year}
                  </span>
                </div>
              </div>
            </div>

            {/* Skills Details */}
            <div className="space-y-1.5 text-xs">
              <span className="font-bold text-slate-700">Matched Required Skills:</span>
              <div className="flex flex-wrap gap-1">
                {selectedMatchForInfo.matchedSkills?.map((s: string) => (
                  <span key={s} className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold text-xs">
                    ✓ {s}
                  </span>
                ))}
                {(!selectedMatchForInfo.matchedSkills || selectedMatchForInfo.matchedSkills.length === 0) && (
                  <span className="text-slate-400">None directly matched</span>
                )}
              </div>
            </div>

            {selectedMatchForInfo.missingSkills?.length > 0 && (
              <div className="space-y-1.5 text-xs">
                <span className="font-bold text-slate-700">Missing Skills (can be filled by other teammates):</span>
                <div className="flex flex-wrap gap-1">
                  {selectedMatchForInfo.missingSkills.map((s: string) => (
                    <span key={s} className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-xs">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* AI Advisor Button */}
            <div className="pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <BrainCircuit className="w-4 h-4 text-indigo-600" />
                  Gemini Teammate Rationale
                </span>
                {!aiExplanation && (
                  <Button
                    variant="secondary"
                    size="sm"
                    className="text-xs"
                    isLoading={loadingAI}
                    onClick={() => handleFetchAIInsight(selectedMatchForInfo.student.id)}
                  >
                    Generate AI Insight
                  </Button>
                )}
              </div>

              {aiExplanation && (
                <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-200 text-xs text-indigo-950 leading-relaxed animate-fade-in">
                  <p className="font-bold mb-1 text-indigo-700">AI Collaboration Assessment:</p>
                  <p>{aiExplanation}</p>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  handleOpenInvite(selectedMatchForInfo.student);
                  setSelectedMatchForInfo(null);
                }}
              >
                Invite {selectedMatchForInfo.student.name.split(' ')[0]} to Project
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Invite Modal */}
      {inviteModalStudent && (
        <Modal
          isOpen={!!inviteModalStudent}
          onClose={() => setInviteModalStudent(null)}
          title={`Invite ${inviteModalStudent.name}`}
          description={`Send a team invitation for project "${selectedProject?.name}"`}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Role in Team
              </label>
              <select
                value={inviteRole}
                onChange={e => setInviteRole(e.target.value as any)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600"
              >
                <option value="Developer">Developer (Frontend / Backend / Full-Stack)</option>
                <option value="Researcher">Researcher / Machine Learning Specialist</option>
                <option value="Designer">UI/UX Designer</option>
                <option value="Data Scientist">Data Scientist / Analyst</option>
                <option value="Member">General Contributor</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Personalized Invitation Message
              </label>
              <textarea
                rows={3}
                value={inviteMessage}
                onChange={e => setInviteMessage(e.target.value)}
                placeholder="Explain why their skills are a great fit..."
                className="w-full p-3 text-xs rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600"
              />
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-600">
              <p className="font-semibold text-slate-800 mb-1">What happens next?</p>
              <p>
                When {inviteModalStudent.name} accepts the invitation, they will be automatically added to the team roster, granted access to the team workspace, and invited to the private team chat.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setInviteModalStudent(null)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                isLoading={isSendingInvite}
                leftIcon={<Send className="w-3.5 h-3.5" />}
                onClick={handleSendInvite}
              >
                Send Official Invitation
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
