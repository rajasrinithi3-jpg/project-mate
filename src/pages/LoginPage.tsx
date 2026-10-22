import React, { useState } from 'react';
import { Mail, Lock, ArrowRight, UserCheck, KeyRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';

interface LoginPageProps {
  onNavigate: (page: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const { login, quickSwitch } = useAuth();
  const { success, error: toastError } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Forgot password modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetStep, setResetStep] = useState<'request' | 'reset'>('request');
  const [isResetting, setIsResetting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please fill in both email and password.');
      return;
    }

    setIsLoading(true);
    try {
      await login(email.trim(), password);
      onNavigate('dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = async (userId: string) => {
    setIsLoading(true);
    try {
      await quickSwitch(userId);
      onNavigate('dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) {
      toastError('Please enter your account email.');
      return;
    }
    setIsResetting(true);
    try {
      const res = await api.forgotPassword(forgotEmail);
      if (res.devHintResetCode) {
        setResetCode(res.devHintResetCode);
      }
      setResetStep('reset');
      success('Verification code generated. Please enter your new password.');
    } catch (err: any) {
      toastError(err.message || 'Failed to process request.');
    } finally {
      setIsResetting(false);
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      toastError('New password must be at least 6 characters.');
      return;
    }
    setIsResetting(true);
    try {
      await api.resetPassword({ email: forgotEmail, newPassword });
      success('Password successfully reset. You can now login.');
      setShowForgotModal(false);
      setEmail(forgotEmail);
      setPassword(newPassword);
      setResetStep('request');
    } catch (err: any) {
      toastError(err.message || 'Failed to reset password.');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div 
          onClick={() => onNavigate('landing')}
          className="inline-flex items-center gap-2 cursor-pointer mb-3 select-none"
        >
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-extrabold text-lg shadow-sm">
            P
          </div>
          <span className="font-extrabold text-slate-900 text-2xl tracking-tight">ProjectMate</span>
        </div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          Sign in to your student account
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Find suitable teammates based on skills and project goals
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-sm border border-slate-200 rounded-2xl sm:px-10">
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="College Email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="e.g. lokitha@projectmate.edu"
              leftIcon={<Mail className="w-4 h-4" />}
              autoComplete="email"
              required
            />

            <div>
              <Input
                label="Password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                leftIcon={<Lock className="w-4 h-4" />}
                autoComplete="current-password"
                required
              />
              <div className="flex justify-end mt-1.5">
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                >
                  Forgot password?
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full mt-2"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Sign In
            </Button>
          </form>

          {/* 1-Click Demo Profiles For Easy Testing */}
          <div className="mt-6 pt-6 border-t border-slate-100">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2.5 text-center">
              Or Instant Sign-In with Demo Students:
            </p>
            <div className="grid grid-cols-2 gap-2 text-left">
              <button
                type="button"
                onClick={() => handleQuickLogin('usr_lokitha')}
                className="p-2 rounded-xl border border-indigo-100 bg-indigo-50/50 hover:bg-indigo-100/70 text-xs transition-colors flex items-center gap-2"
              >
                <UserCheck className="w-4 h-4 text-indigo-600 shrink-0" />
                <div className="truncate">
                  <p className="font-bold text-slate-900 truncate">Lokitha A</p>
                  <p className="text-[10px] text-slate-500">IT (Team Lead)</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('usr_riya')}
                className="p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs transition-colors flex items-center gap-2"
              >
                <UserCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <div className="truncate">
                  <p className="font-bold text-slate-900 truncate">Riya Sharma</p>
                  <p className="text-[10px] text-slate-500">CSE (Candidate)</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('usr_arjun')}
                className="p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs transition-colors flex items-center gap-2"
              >
                <UserCheck className="w-4 h-4 text-blue-600 shrink-0" />
                <div className="truncate">
                  <p className="font-bold text-slate-900 truncate">Arjun Mehta</p>
                  <p className="text-[10px] text-slate-500">CSE (3rd Year)</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('usr_sneha')}
                className="p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs transition-colors flex items-center gap-2"
              >
                <UserCheck className="w-4 h-4 text-purple-600 shrink-0" />
                <div className="truncate">
                  <p className="font-bold text-slate-900 truncate">Sneha R</p>
                  <p className="text-[10px] text-slate-500">AI (Researcher)</p>
                </div>
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-slate-500">
            Don't have an account yet?{' '}
            <button
              type="button"
              onClick={() => onNavigate('register')}
              className="font-bold text-indigo-600 hover:text-indigo-700"
            >
              Register here
            </button>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <Modal
        isOpen={showForgotModal}
        onClose={() => setShowForgotModal(false)}
        title="Reset Account Password"
        description="Verify your college email to choose a new password."
      >
        {resetStep === 'request' ? (
          <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
            <Input
              label="Account Email"
              type="email"
              value={forgotEmail}
              onChange={e => setForgotEmail(e.target.value)}
              placeholder="e.g. lokitha@projectmate.edu"
              required
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setShowForgotModal(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" isLoading={isResetting}>
                Continue
              </Button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
            <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-xs text-indigo-900">
              <p className="font-semibold mb-0.5">Verification Code:</p>
              <p className="font-mono text-sm tracking-widest">{resetCode}</p>
            </div>
            <Input
              label="New Password"
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="Min 6 characters"
              leftIcon={<KeyRound className="w-4 h-4" />}
              required
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setResetStep('request')}>
                Back
              </Button>
              <Button type="submit" variant="primary" size="sm" isLoading={isResetting}>
                Update Password
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
