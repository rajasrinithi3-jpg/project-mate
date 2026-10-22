import React from 'react';
import { 
  Users, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  FolderKanban, 
  MessageSquare, 
  CheckSquare, 
  Target,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { MatchScoreBadge } from '../components/ui/MatchScoreBadge';
import { SkillChip } from '../components/ui/SkillChip';
import { Avatar } from '../components/ui/Avatar';
import { useAuth } from '../context/AuthContext';

export const LandingPage: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
  const { quickSwitch } = useAuth();

  const handleDemoLogin = async (userId: string) => {
    await quickSwitch(userId);
    onNavigate('dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Top Navigation */}
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-extrabold text-base shadow-sm">
              P
            </div>
            <div>
              <span className="font-extrabold text-slate-900 text-lg tracking-tight">ProjectMate</span>
              <span className="hidden sm:inline-block ml-2 text-xs text-slate-400 font-medium border-l border-slate-200 pl-2">
                College Project Collaboration
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => onNavigate('login')}>
              Sign In
            </Button>
            <Button variant="primary" size="sm" onClick={() => onNavigate('register')}>
              Join ProjectMate
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold mb-6 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Campus Skill Matching & Team Formation Platform</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight sm:leading-none mb-6">
            Find the right teammates.<br />
            <span className="text-indigo-600">Build better projects.</span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            Stop forming random project teams with skill gaps. ProjectMate matches college students based on verified skills, academic department, availability, and shared project interests.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 max-w-md mx-auto mb-12">
            <Button
              variant="primary"
              size="lg"
              className="w-full sm:w-auto"
              rightIcon={<ArrowRight className="w-4 h-4" />}
              onClick={() => onNavigate('register')}
            >
              Get Started Free
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto"
              onClick={() => onNavigate('login')}
            >
              Sign In to Your Account
            </Button>
          </div>

          {/* Quick Demo Test Bar */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs max-w-2xl mx-auto text-left">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                1-Click Student Demo Switcher:
              </span>
              <span className="text-[11px] text-indigo-600 font-medium">Instant Test Access</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                onClick={() => handleDemoLogin('usr_lokitha')}
                className="p-2.5 rounded-xl border border-indigo-100 bg-indigo-50/50 hover:bg-indigo-100/70 text-left transition-all"
              >
                <p className="text-xs font-bold text-slate-900">Lokitha A</p>
                <p className="text-[11px] text-slate-500">IT • 2nd Year (Lead)</p>
              </button>
              <button
                onClick={() => handleDemoLogin('usr_riya')}
                className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-left transition-all"
              >
                <p className="text-xs font-bold text-slate-900">Riya Sharma</p>
                <p className="text-[11px] text-slate-500">CSE • 2nd Year (AI)</p>
              </button>
              <button
                onClick={() => handleDemoLogin('usr_arjun')}
                className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-left transition-all"
              >
                <p className="text-xs font-bold text-slate-900">Arjun Mehta</p>
                <p className="text-[11px] text-slate-500">CSE • 3rd Year (Web)</p>
              </button>
              <button
                onClick={() => handleDemoLogin('usr_sneha')}
                className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-left transition-all"
              >
                <p className="text-xs font-bold text-slate-900">Sneha R</p>
                <p className="text-[11px] text-slate-500">AI • 2nd Year (ML)</p>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Teammate Card Preview Section */}
      <section className="py-16 bg-white border-y border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">
              Real Teammate Discovery with Transparent Match Scores
            </h2>
            <p className="text-slate-600 text-sm sm:text-base">
              No random percentages. Our formula evaluates 60% skills, 15% interests, 10% availability, 5% department, 5% year, and 5% project focus.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Example Card 1 */}
            <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-xs hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <Avatar name="Riya Sharma" size="lg" />
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Riya Sharma</h3>
                    <p className="text-xs font-medium text-slate-500">CSE • 2nd Year</p>
                  </div>
                </div>
                <MatchScoreBadge score={95} size="md" />
              </div>

              <div className="mb-4">
                <p className="text-xs text-slate-500 font-semibold mb-2">Required Skills for "AI Disease Prediction":</p>
                <div className="flex flex-wrap gap-1.5">
                  <SkillChip skill="Python" isMatched />
                  <SkillChip skill="Machine Learning" isMatched />
                  <SkillChip skill="React" isMatched />
                  <SkillChip skill="UI/UX" />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 text-xs text-slate-600 mb-4">
                <p className="font-semibold text-slate-800 mb-1">Why this is a good match:</p>
                <p>✓ Matches 3 of 4 required technical skills</p>
                <p>✓ Shared interest in AI / ML & Healthcare tech</p>
                <p>✓ Available weekday evenings & weekends</p>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => onNavigate('login')}>
                  View Profile
                </Button>
                <Button variant="primary" size="sm" className="flex-1" onClick={() => onNavigate('login')}>
                  Send Invitation
                </Button>
              </div>
            </div>

            {/* Example Card 2 */}
            <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-xs hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <Avatar name="Vikram K" size="lg" />
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Vikram K</h3>
                    <p className="text-xs font-medium text-slate-500">IT • 3rd Year</p>
                  </div>
                </div>
                <MatchScoreBadge score={88} size="md" />
              </div>

              <div className="mb-4">
                <p className="text-xs text-slate-500 font-semibold mb-2">Technical Skills:</p>
                <div className="flex flex-wrap gap-1.5">
                  <SkillChip skill="UI/UX" isMatched />
                  <SkillChip skill="React" isMatched />
                  <SkillChip skill="Figma" />
                  <SkillChip skill="Tailwind CSS" />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 text-xs text-slate-600 mb-4">
                <p className="font-semibold text-slate-800 mb-1">Why this is a good match:</p>
                <p>✓ Solves UI/UX and frontend requirements</p>
                <p>✓ High experience in responsive design systems</p>
                <p>✓ Compatible department & project focus</p>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => onNavigate('login')}>
                  View Profile
                </Button>
                <Button variant="primary" size="sm" className="flex-1" onClick={() => onNavigate('login')}>
                  Send Invitation
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Workflow Features */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">
              Everything Your Academic Team Needs in One Place
            </h2>
            <p className="text-slate-600 text-sm sm:text-base">
              From finding teammates to task tracking and team chat, ProjectMate supports the entire semester project lifecycle.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                <Target className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-2">Skill-Based Discovery</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Filter students by department, skills, year, and availability. Avoid blind teammate choices.
              </p>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                <FolderKanban className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-2">Project Creation</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Post academic projects with deadlines, required tech stacks, and desired team size.
              </p>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                <CheckSquare className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-2">Task Management</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Assign tasks with priorities, due dates, and statuses (Pending, In Progress, Completed).
              </p>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center mb-4">
                <MessageSquare className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-2">Team Workspace & Chat</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Dedicated team chat and role coordination for seamless semester progress.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900">ProjectMate</span>
            <span>— Find the right teammates. Build better projects.</span>
          </div>
          <div>
            Built for college engineering & academic project collaboration.
          </div>
        </div>
      </footer>
    </div>
  );
};
