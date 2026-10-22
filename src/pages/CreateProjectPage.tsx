import React, { useState } from 'react';
import { 
  ArrowLeft, 
  FolderKanban, 
  Plus, 
  Calendar, 
  Users, 
  Code2, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { ProjectCategory } from '../types';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { SkillChip } from '../components/ui/SkillChip';
import { useToast } from '../context/ToastContext';

interface CreateProjectPageProps {
  onNavigate: (page: string) => void;
}

const COMMON_SKILLS = [
  'Python', 'React', 'C++', 'Java', 'Machine Learning', 'UI/UX',
  'Node.js', 'FastAPI', 'SQL', 'TypeScript', 'Flutter', 'Deep Learning',
  'Figma', 'IoT', 'Docker', 'Embedded Systems'
];

export const CreateProjectPage: React.FC<CreateProjectPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ProjectCategory>('AI / ML');
  const [teamSize, setTeamSize] = useState<number>(4);
  const [deadline, setDeadline] = useState('2026-11-30');
  const [requiredSkills, setRequiredSkills] = useState<string[]>(['Python', 'Machine Learning', 'React']);
  const [skillInput, setSkillInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddSkill = (skill: string) => {
    const trimmed = skill.trim();
    if (trimmed && !requiredSkills.includes(trimmed)) {
      setRequiredSkills(prev => [...prev, trimmed]);
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setRequiredSkills(prev => prev.filter(s => s !== skill));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !description.trim()) {
      toastError('Project name and description are required.');
      return;
    }

    if (requiredSkills.length === 0) {
      toastError('Please specify at least one required skill.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.createProject({
        name: name.trim(),
        description: description.trim(),
        category,
        requiredSkills,
        teamSize: Number(teamSize),
        deadline,
      });

      success(`Project "${res.project.name}" created! Find teammates now.`);
      onNavigate(`find-teammates?projectId=${res.project.id}`);
    } catch (err: any) {
      toastError(err.message || 'Failed to create project.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <button
        onClick={() => onNavigate('projects')}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Projects
      </button>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
        <div className="mb-6 border-b border-slate-100 pb-5">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full mb-2">
            <FolderKanban className="w-3.5 h-3.5" />
            <span>Academic Collaboration</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Post an Academic Project
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Specify the required tech stack and find matched students from your college.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Project Title"
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. AI-Based Disease Prediction System"
            required
          />

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5 text-left">
              <label className="block text-sm font-medium text-slate-700">Project Category</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as ProjectCategory)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600"
              >
                <option value="AI / ML">AI / ML</option>
                <option value="Web Development">Web Development</option>
                <option value="Mobile Development">Mobile Development</option>
                <option value="IoT">IoT & Hardware</option>
                <option value="Data Science">Data Science</option>
                <option value="Cybersecurity">Cybersecurity</option>
                <option value="UI/UX">UI/UX Design</option>
                <option value="Cloud">Cloud</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="space-y-1.5 text-left">
              <label className="block text-sm font-medium text-slate-700">Desired Team Size</label>
              <div className="relative">
                <input
                  type="number"
                  min={2}
                  max={8}
                  value={teamSize}
                  onChange={e => setTeamSize(Number(e.target.value))}
                  className="w-full pl-3.5 pr-10 py-2.5 rounded-lg border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600"
                  required
                />
                <span className="absolute right-3 top-2.5 text-xs text-slate-400">members</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Project Description & Goals
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Describe the problem statement, objectives, expected deliverables, and the roles needed..."
              className="w-full p-3.5 text-sm rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600"
              required
            />
          </div>

          {/* Required Skills Picker */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-slate-700 flex items-center gap-1.5">
                <Code2 className="w-4 h-4 text-indigo-600" />
                Required Technical Skills ({requiredSkills.length})
              </label>
              <span className="text-xs text-slate-400">These power the match percentage</span>
            </div>

            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={skillInput}
                onChange={e => setSkillInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSkill(skillInput);
                  }
                }}
                placeholder="Type a skill and press Enter (e.g. PyTorch, React, SQL)..."
                className="flex-1 px-3.5 py-2 text-sm rounded-lg border border-slate-300 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600"
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => handleAddSkill(skillInput)}
                leftIcon={<Plus className="w-3.5 h-3.5" />}
              >
                Add Skill
              </Button>
            </div>

            <div className="flex flex-wrap gap-1.5 p-3 rounded-xl bg-slate-50 border border-slate-200/80 min-h-[48px] mb-3">
              {requiredSkills.map(s => (
                <SkillChip
                  key={s}
                  skill={s}
                  onRemove={() => handleRemoveSkill(s)}
                />
              ))}
            </div>

            <div className="flex flex-wrap gap-1.5">
              <span className="text-xs text-slate-400 self-center mr-1">Suggestions:</span>
              {COMMON_SKILLS.filter(s => !requiredSkills.includes(s)).slice(0, 8).map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => handleAddSkill(s)}
                  className="text-xs px-2.5 py-1 rounded bg-white border border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-600 transition-colors"
                >
                  + {s}
                </button>
              ))}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              label="Submission / Presentation Deadline"
              type="date"
              value={deadline}
              onChange={e => setDeadline(e.target.value)}
              leftIcon={<Calendar className="w-4 h-4" />}
              required
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => onNavigate('projects')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isSubmitting}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Post Project & Discover Teammates
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
