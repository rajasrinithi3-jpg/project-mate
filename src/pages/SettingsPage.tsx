import React, { useState } from 'react';
import { 
  Settings, 
  Lock, 
  User, 
  LogOut, 
  ArrowRightLeft, 
  KeyRound,
  ShieldAlert
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useToast } from '../context/ToastContext';

interface SettingsPageProps {
  onNavigate: (page: string) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ onNavigate }) => {
  const { user, logout, quickSwitch } = useAuth();
  const { success, error: toastError } = useToast();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      toastError('Password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toastError('Passwords do not match.');
      return;
    }

    if (!user) return;

    setIsUpdatingPassword(true);
    try {
      await api.resetPassword({
        email: user.email,
        newPassword,
      });
      success('Password changed successfully.');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      toastError(err.message || 'Failed to update password.');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const demoAccounts = [
    { id: 'usr_lokitha', name: 'Lokitha A', role: 'IT 2nd Year (Project Creator & Lead)' },
    { id: 'usr_riya', name: 'Riya Sharma', role: 'CSE 2nd Year (Python / ML Candidate)' },
    { id: 'usr_arjun', name: 'Arjun Mehta', role: 'CSE 3rd Year (PeerPrep Project Creator)' },
    { id: 'usr_sneha', name: 'Sneha R', role: 'AI 2nd Year (Researcher / PyTorch)' },
    { id: 'usr_vikram', name: 'Vikram K', role: 'IT 3rd Year (UI/UX Designer)' },
    { id: 'usr_ananya', name: 'Ananya S', role: 'ECE 3rd Year (IoT Campus Monitor Creator)' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <Settings className="w-6 h-6 text-indigo-600" />
          Account Settings
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Manage your credentials, testing student sessions, and collaboration preferences.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Security & Password */}
        <Card className="p-6">
          <h2 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
            <Lock className="w-4 h-4 text-indigo-600" />
            Security & Password
          </h2>
          <form onSubmit={handlePasswordUpdate} className="space-y-4">
            <Input
              label="New Password"
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="Min 6 characters"
              leftIcon={<KeyRound className="w-4 h-4" />}
            />
            <Input
              label="Confirm New Password"
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              leftIcon={<KeyRound className="w-4 h-4" />}
            />
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isUpdatingPassword}
              className="w-full"
            >
              Update Password
            </Button>
          </form>
        </Card>

        {/* Account Details */}
        <Card className="p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <User className="w-4 h-4 text-indigo-600" />
              Account Information
            </h2>
            <div className="space-y-3 text-xs text-slate-600">
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block font-medium">Full Name</span>
                <span className="font-bold text-slate-900">{user?.name}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block font-medium">College Email</span>
                <span className="font-bold text-slate-900">{user?.email}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block font-medium">Department & Year</span>
                <span className="font-bold text-slate-900">
                  {user?.department} • {user?.year}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100">
            <Button
              variant="danger"
              size="sm"
              className="w-full"
              leftIcon={<LogOut className="w-4 h-4" />}
              onClick={logout}
            >
              Sign Out of ProjectMate
            </Button>
          </div>
        </Card>
      </div>

      {/* Multi-student testing panel */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-2">
          <ArrowRightLeft className="w-5 h-5 text-indigo-600" />
          <h2 className="text-sm font-bold text-slate-900">
            Multi-Student Collaboration Tester
          </h2>
        </div>
        <p className="text-xs text-slate-500 mb-4">
          Switch student sessions in 1 click to test sending an invitation as <strong>Lokitha</strong>, switching to <strong>Riya</strong>, accepting the invitation, viewing the team workspace, assigning tasks, and exchanging team messages.
        </p>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-2.5">
          {demoAccounts.map(acc => {
            const isCurrent = user?.id === acc.id;

            return (
              <button
                key={acc.id}
                onClick={() => quickSwitch(acc.id)}
                disabled={isCurrent}
                className={`p-3 rounded-xl border text-left transition-all ${
                  isCurrent
                    ? 'bg-indigo-50 border-indigo-300 ring-2 ring-indigo-200'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-900">{acc.name}</span>
                  {isCurrent && (
                    <span className="text-[10px] font-bold text-indigo-600 bg-indigo-100 px-1.5 py-0.5 rounded">
                      Active
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500">{acc.role}</p>
              </button>
            );
          })}
        </div>
      </Card>
    </div>
  );
};
