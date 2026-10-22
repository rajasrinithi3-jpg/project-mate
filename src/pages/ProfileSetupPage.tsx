import React, { useState } from 'react';
import { 
  Sparkles, 
  Plus, 
  ArrowRight, 
  Check, 
  Github, 
  Linkedin, 
  Clock, 
  Lightbulb, 
  Code2 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { SkillChip } from '../components/ui/SkillChip';
import { useToast } from '../context/ToastContext';

interface ProfileSetupPageProps {
  onNavigate: (page: string) => void;
}

const COMMON_SKILLS = [
  'Python', 'React', 'C++', 'Java', 'Machine Learning', 'UI/UX',
  'Node.js', 'FastAPI', 'SQL', 'TypeScript', 'Flutter', 'Android',
  'Docker', 'Data Structures', 'Deep Learning', 'Figma', 'IoT', 'CSS'
];

const COMMON_INTERESTS = [
  'Artificial Intelligence', 'Web Development', 'App Development',
  'Data Science', 'Cloud Computing', 'Cybersecurity', 'IoT & Hardware',
  'Healthcare Tech', 'FinTech', 'Robotics'
];

const AVAILABILITY_OPTIONS = [
  'Weekday mornings',
  'Weekday evenings',
  'Weekends',
  'Flexible',
  'Full-time semester break'
];

const PROJECT_TYPE_OPTIONS = [
  'AI / ML',
  'Web Development',
  'Mobile Development',
  'IoT',
  'Data Science',
  'Cybersecurity',
  'UI/UX'
];

export const ProfileSetupPage: React.FC<ProfileSetupPageProps> = ({ onNavigate }) => {
  const { user, updateProfile } = useAuth();
  const { success } = useToast();

  const [bio, setBio] = useState(user?.bio || '');
  const [skills, setSkills] = useState<string[]>(user?.skills?.length ? user.skills : ['C++', 'Python', 'React']);
  const [newSkillInput, setNewSkillInput] = useState('');
  const [interests, setInterests] = useState<string[]>(user?.interests?.length ? user.interests : ['Artificial Intelligence', 'Web Development']);
  const [availability, setAvailability] = useState<string[]>(user?.availability?.length ? user.availability : ['Weekday evenings', 'Weekends']);
  const [preferredProjectTypes, setPreferredProjectTypes] = useState<string[]>(user?.preferredProjectTypes?.length ? user.preferredProjectTypes : ['AI / ML', 'Web Development']);
  const [github, setGithub] = useState(user?.github || '');
  const [linkedin, setLinkedin] = useState(user?.linkedin || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddSkill = (skill: string) => {
    const trimmed = skill.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills(prev => [...prev, trimmed]);
      setNewSkillInput('');
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setSkills(prev => prev.filter(s => s !== skill));
  };

  const toggleInterest = (item: string) => {
    setInterests(prev =>
      prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
    );
  };

  const toggleAvailability = (item: string) => {
    setAvailability(prev =>
      prev.includes(item) ? prev.filter(a => a !== item) : [...prev, item]
    );
  };

  const toggleProjectType = (type: string) => {
    setPreferredProjectTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await updateProfile({
        bio: bio.trim(),
        skills,
        interests,
        availability,
        preferredProjectTypes,
        github: github.trim(),
        linkedin: linkedin.trim(),
      });
      success('Profile set up complete! Welcome to your dashboard.');
      onNavigate('dashboard');
    } catch {
      // toast shown in context
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Step 2 of 2: Profile Customization</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Complete your Student Profile
          </h1>
          <p className="mt-1 text-sm text-slate-500 max-w-lg mx-auto">
            Adding your skills and availability powers our matching algorithm to suggest the most compatible project teammates.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-8">
          {/* Bio */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-1.5">
              About You / Bio
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={e => setBio(e.target.value)}
              placeholder="Tell other students what you enjoy working on, previous hackathon experience, or semester project goals..."
              className="w-full p-3.5 text-sm rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600"
            />
          </div>

          {/* Technical Skills */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-semibold text-slate-900 flex items-center gap-1.5">
                <Code2 className="w-4 h-4 text-indigo-600" />
                Technical Skills ({skills.length})
              </label>
              <span className="text-xs text-slate-400">Add at least 3 skills</span>
            </div>

            {/* Custom Input */}
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newSkillInput}
                onChange={e => setNewSkillInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSkill(newSkillInput);
                  }
                }}
                placeholder="Type a skill and press Enter (e.g. PyTorch, Vue, Go)..."
                className="flex-1 px-3.5 py-2 text-sm rounded-lg border border-slate-300 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600"
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => handleAddSkill(newSkillInput)}
                leftIcon={<Plus className="w-3.5 h-3.5" />}
              >
                Add
              </Button>
            </div>

            {/* Active Skills List */}
            <div className="flex flex-wrap gap-1.5 p-3 rounded-xl bg-slate-50 border border-slate-200/80 min-h-[50px] mb-3">
              {skills.map(s => (
                <SkillChip
                  key={s}
                  skill={s}
                  onRemove={() => handleRemoveSkill(s)}
                />
              ))}
              {skills.length === 0 && (
                <span className="text-xs text-slate-400 self-center">No skills added yet. Click suggestions below.</span>
              )}
            </div>

            {/* Quick Suggestions */}
            <div>
              <p className="text-xs font-semibold text-slate-400 mb-2">Popular College Tech Stacks:</p>
              <div className="flex flex-wrap gap-1.5">
                {COMMON_SKILLS.filter(s => !skills.includes(s)).slice(0, 10).map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => handleAddSkill(s)}
                    className="text-xs px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-600 hover:border-indigo-400 hover:text-indigo-600 transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3 text-slate-400" />
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Interests */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2 flex items-center gap-1.5">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              Project Interests & Domains
            </label>
            <div className="flex flex-wrap gap-2">
              {COMMON_INTERESTS.map(item => {
                const isSelected = interests.includes(item);
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => toggleInterest(item)}
                    className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all ${
                      isSelected
                        ? 'bg-indigo-50 border-indigo-300 text-indigo-700 shadow-2xs font-semibold'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 inline mr-1 text-indigo-600" />}
                    {item}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Availability */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-emerald-600" />
              Your Availability
            </label>
            <div className="grid sm:grid-cols-2 gap-2">
              {AVAILABILITY_OPTIONS.map(opt => {
                const isSelected = availability.includes(opt);
                return (
                  <label
                    key={opt}
                    className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-emerald-50/60 border-emerald-300 text-emerald-900'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleAvailability(opt)}
                      className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                    />
                    <span className="text-xs font-medium">{opt}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Preferred Project Types */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">
              Preferred Project Categories
            </label>
            <div className="flex flex-wrap gap-2">
              {PROJECT_TYPE_OPTIONS.map(cat => {
                const isSelected = preferredProjectTypes.includes(cat);
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => toggleProjectType(cat)}
                    className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                      isSelected
                        ? 'bg-blue-50 border-blue-300 text-blue-700 font-semibold'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* External Profile Links */}
          <div className="grid sm:grid-cols-2 gap-4 pt-2">
            <Input
              label="GitHub Profile URL"
              type="url"
              value={github}
              onChange={e => setGithub(e.target.value)}
              placeholder="https://github.com/your-username"
              leftIcon={<Github className="w-4 h-4" />}
            />
            <Input
              label="LinkedIn Profile URL"
              type="url"
              value={linkedin}
              onChange={e => setLinkedin(e.target.value)}
              placeholder="https://linkedin.com/in/your-profile"
              leftIcon={<Linkedin className="w-4 h-4" />}
            />
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={() => onNavigate('dashboard')}
              className="text-xs text-slate-400 hover:text-slate-600 font-medium"
            >
              Skip for now
            </button>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isSubmitting}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Complete Profile & Go to Dashboard
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
