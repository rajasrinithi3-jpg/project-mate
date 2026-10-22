import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  Send, 
  Inbox, 
  Check, 
  X, 
  Clock, 
  Calendar, 
  ShieldCheck, 
  ArrowRight,
  FolderKanban,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Invitation } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { EmptyState } from '../components/ui/EmptyState';
import { useToast } from '../context/ToastContext';

interface InvitationsPageProps {
  onNavigate: (page: string) => void;
}

export const InvitationsPage: React.FC<InvitationsPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');
  const [received, setReceived] = useState<Invitation[]>([]);
  const [sent, setSent] = useState<Invitation[]>([]);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchInvitations = async () => {
    try {
      setLoading(true);
      const res = await api.getInvitations();
      setReceived(res.received);
      setSent(res.sent);
    } catch (err: any) {
      toastError(err.message || 'Failed to load invitations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvitations();
  }, []);

  const handleRespond = async (invId: string, action: 'accept' | 'decline') => {
    setProcessingId(invId);
    try {
      const res = await api.respondToInvitation(invId, action);
      success(res.message);
      await fetchInvitations();
      if (action === 'accept' && res.teamId) {
        onNavigate(`my-team?teamId=${res.teamId}`);
      }
    } catch (err: any) {
      toastError(err.message || 'Failed to update invitation status.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleCancel = async (invId: string) => {
    setProcessingId(invId);
    try {
      const res = await api.cancelInvitation(invId);
      success(res.message);
      await fetchInvitations();
    } catch (err: any) {
      toastError(err.message || 'Failed to cancel invitation.');
    } finally {
      setProcessingId(null);
    }
  };

  const pendingReceivedCount = received.filter(i => i.status === 'Pending').length;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Mail className="w-6 h-6 text-indigo-600" />
            Project Invitations
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage incoming team collaboration requests and view invitations you have sent.
          </p>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => setActiveTab('received')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'received'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Inbox className="w-4 h-4" />
            <span>Received</span>
            {pendingReceivedCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-500 text-white">
                {pendingReceivedCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('sent')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'sent'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Send className="w-4 h-4" />
            <span>Sent ({sent.length})</span>
          </button>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading your invitations..." />
      ) : activeTab === 'received' ? (
        /* RECEIVED INVITATIONS */
        received.length > 0 ? (
          <div className="space-y-4">
            {received.map(inv => {
              const isPending = inv.status === 'Pending';

              return (
                <Card
                  key={inv.id}
                  className={`p-6 transition-all ${
                    isPending
                      ? 'border-indigo-200 bg-white shadow-xs'
                      : 'border-slate-200 bg-slate-50/50 opacity-80'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
                          Role Offered: {inv.roleOffered}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            inv.status === 'Pending'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : inv.status === 'Accepted'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {inv.status}
                        </span>
                      </div>
                      <h2 className="text-lg font-bold text-slate-900">{inv.projectName}</h2>
                      <p className="text-xs text-slate-500">
                        Invited by <strong className="text-slate-700">{inv.senderName}</strong> on{' '}
                        {new Date(inv.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    {/* Actions if pending */}
                    {isPending ? (
                      <div className="flex items-center gap-2 self-stretch sm:self-auto">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={processingId === inv.id}
                          onClick={() => handleRespond(inv.id, 'decline')}
                          className="flex-1 sm:flex-none text-xs text-slate-600 hover:text-rose-600"
                        >
                          Decline
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          isLoading={processingId === inv.id}
                          onClick={() => handleRespond(inv.id, 'accept')}
                          className="flex-1 sm:flex-none text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                          leftIcon={<Check className="w-3.5 h-3.5" />}
                        >
                          Accept & Join Team
                        </Button>
                      </div>
                    ) : (
                      inv.status === 'Accepted' && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => onNavigate('my-team')}
                          className="text-xs"
                        >
                          Open Team Workspace →
                        </Button>
                      )
                    )}
                  </div>

                  {/* Message body */}
                  {inv.message && (
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600 my-3">
                      <p className="font-semibold text-slate-700 mb-0.5">Note from {inv.senderName}:</p>
                      <p className="italic">"{inv.message}"</p>
                    </div>
                  )}

                  {/* Skills required */}
                  {inv.requiredSkills && inv.requiredSkills.length > 0 && (
                    <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-1.5 text-xs">
                      <span className="text-slate-400 font-medium">Project Tech Stack:</span>
                      {inv.requiredSkills.map(s => (
                        <span key={s} className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-medium">
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={Inbox}
            title="No invitations received"
            description="When other students invite you to join their project teams, they will appear right here."
            actionText="Browse Academic Projects"
            onAction={() => onNavigate('projects')}
          />
        )
      ) : (
        /* SENT INVITATIONS */
        sent.length > 0 ? (
          <div className="space-y-4">
            {sent.map(inv => (
              <Card key={inv.id} className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        inv.status === 'Pending'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : inv.status === 'Accepted'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : inv.status === 'Declined'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {inv.status}
                    </span>
                    <span className="text-xs text-slate-400">
                      Sent on {new Date(inv.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h2 className="text-sm font-bold text-slate-900">
                    To: {inv.receiverName} ({inv.roleOffered})
                  </h2>
                  <p className="text-xs text-slate-500">
                    For Project: <strong>{inv.projectName}</strong>
                  </p>
                </div>

                {inv.status === 'Pending' && (
                  <Button
                    variant="outline"
                    size="sm"
                    isLoading={processingId === inv.id}
                    onClick={() => handleCancel(inv.id)}
                    className="text-xs text-rose-600 border-rose-200 hover:bg-rose-50"
                  >
                    Cancel Invitation
                  </Button>
                )}
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Send}
            title="No sent invitations"
            description="You haven't sent any invitations yet. Go to teammate search to recruit candidates."
            actionText="Find Teammates"
            onAction={() => onNavigate('find-teammates')}
          />
        )
      )}
    </div>
  );
};
