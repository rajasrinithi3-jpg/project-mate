import React, { useState } from 'react';
import { 
  UserCircle, 
  Edit3, 
  Building, 
  Calendar, 
  Mail, 
  Github, 
  Linkedin, 
  Clock, 
  Code2, 
  Lightbulb, 
  Plus, 
  X,
  Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Avatar } from '../components/ui/Avatar';
import { SkillChip } from '../components/ui/SkillChip';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { useToast } from '../context/ToastContext';

interface MyProfilePageProps {
  onNavigate: (page: string) => void;
}

const COMMON_SKILLS = [
  'Python', 'React', 'C++', 'Java', 'Machine Learning', 'UI/UX',
  'Node.js', 'FastAPI', 'SQL', 'TypeScript', 'Flutter', 'Data Structures',
  'Figma', 'IoT', 'Docker', 'Embedded Systems'
];

export const MyProfilePage: React.FC<MyProfilePageProps> = ({ onNavigate }) => {
  const { user, updateProfile } = useAuth();
  const { success, error: toastError } = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [skills, setSkills] = useState<string[]>(user?.skills || []);
  const [skillInput, setSkillInput] = useState('');
  const [interests, setInterests] = useState<string[]>(user?.interests || []);
  const [availability, setAvailability] = useState<string[]>(user?.availability || []);
  const [github, setGithub] = useState(user?.github || '');
  const [linkedin, setLinkedin] = useState(user?.linkedin || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleOpenEdit = () => {
    if (!user) return;
    setName(user.name);
    setBio(user.bio || '');
    setSkills(user.skills || []);
    setInterests(user.interests || []);
    setAvailability(user.availability || []);
    setGithub(user.github || '');
    setLinkedin(user.linkedin || '');
    setIsEditing(true);
  };

  const handleAddSkill = (s: string) => {
    const trimmed = s.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills(prev => [...prev, trimmed]);
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (s: string) => {
    setSkills(prev => prev.filter(x => x !== s));
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateProfile({
        name: name.trim(),
        bio: bio.trim(),
        skills,
        interests,
        availability,
        github: github.trim(),
        linkedin: linkedin.trim(),
      });
      success('Profile updated successfully.');
      setIsEditing(false);
    } catch (err: any) {
      toastError(err.message || 'Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile Header */}
      <Card className="p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <Avatar src={user.photoURL} name={user.name} size="xl" />
            <div>
              <h1 className="text-2xl font-black text-slate-900">{user.name}</h1>
              <p className="text-sm font-semibold text-slate-500 mt-1 flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <Building className="w-4 h-4 text-slate-400" />
                  {user.department}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  {user.year}
                </span>
              </p>
              <p className="text-xs text-slate-400 mt-1">{user.email}</p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            leftIcon={<Edit3 className="w-4 h-4" />}
            onClick={handleOpenEdit}
          >
            Edit Profile
          </Button>
        </div>

        {/* Links */}
        <div className="flex flex-wrap items-center gap-3 pt-6 mt-6 border-t border-slate-100 text-xs">
          {user.github && (
            <a
              href={user.github}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:border-slate-400 transition-colors"
            >
              <Github className="w-4 h-4" />
              <span>GitHub</span>
            </a>
          )}
          {user.linkedin && (
            <a
              href={user.linkedin}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:border-slate-400 transition-colors"
            >
              <Linkedin className="w-4 h-4 text-blue-600" />
              <span>LinkedIn</span>
            </a>
          )}
        </div>
      </Card>

      {/* Details Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* Bio */}
          <Card className="p-6">
            <h2 className="text-sm font-bold text-slate-900 mb-3">About Me</h2>
            <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
              {user.bio || 'No biography written yet. Click "Edit Profile" to tell classmates about your interests!'}
            </p>
          </Card>

          {/* Technical Skills */}
          <Card className="p-6">
            <h2 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Code2 className="w-4 h-4 text-indigo-600" />
              My Skills ({user.skills.length})
            </h2>
            <div className="flex flex-wrap gap-2">
              {user.skills.map(s => (
                <SkillChip key={s} skill={s} size="md" />
              ))}
              {user.skills.length === 0 && (
                <p className="text-xs text-slate-400">No skills added yet.</p>
              )}
            </div>
          </Card>

          {/* Interests */}
          <Card className="p-6">
            <h2 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              Project Interests
            </h2>
            <div className="flex flex-wrap gap-2">
              {user.interests.map(i => (
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

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              Availability
            </h2>
            <ul className="space-y-2 text-xs text-slate-700">
              {user.availability.map(a => (
                <li key={a} className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>{a}</span>
                </li>
              ))}
              {user.availability.length === 0 && (
                <li className="text-slate-400">Not specified</li>
              )}
            </ul>
          </Card>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <Modal
          isOpen={isEditing}
          onClose={() => setIsEditing(false)}
          title="Edit Profile Information"
          maxWidth="lg"
        >
          <form onSubmit={handleSaveProfile} className="space-y-4 max-h-[75vh] overflow-y-auto px-1">
            <Input
              label="Full Name"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Bio / About
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={e => setBio(e.target.value)}
                placeholder="Share your experience and collaboration interests..."
                className="w-full p-2.5 text-xs rounded-lg border border-slate-300 bg-white"
              />
            </div>

            {/* Skills manager */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Skills ({skills.length})
              </label>
              <div className="flex gap-2 mb-2">
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
                  placeholder="Add skill..."
                  className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => handleAddSkill(skillInput)}
                >
                  Add
                </Button>
              </div>

              <div className="flex flex-wrap gap-1.5 p-2 rounded-lg bg-slate-50 border border-slate-200 min-h-[40px] mb-2">
                {skills.map(s => (
                  <SkillChip
                    key={s}
                    skill={s}
                    onRemove={() => handleRemoveSkill(s)}
                    size="sm"
                  />
                ))}
              </div>

              <div className="flex flex-wrap gap-1">
                {COMMON_SKILLS.filter(s => !skills.includes(s)).slice(0, 6).map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => handleAddSkill(s)}
                    className="text-[11px] px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-600 hover:text-indigo-600"
                  >
                    + {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <Input
                label="GitHub URL"
                type="url"
                value={github}
                onChange={e => setGithub(e.target.value)}
                placeholder="https://github.com/..."
              />
              <Input
                label="LinkedIn URL"
                type="url"
                value={linkedin}
                onChange={e => setLinkedin(e.target.value)}
                placeholder="https://linkedin.com/in/..."
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" isLoading={isSaving}>
                Save Changes
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
