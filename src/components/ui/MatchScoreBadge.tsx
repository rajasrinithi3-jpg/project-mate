import React from 'react';
import { Sparkles, Check, Zap } from 'lucide-react';

export interface MatchScoreBadgeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export const MatchScoreBadge: React.FC<MatchScoreBadgeProps> = ({
  score,
  size = 'md',
  showLabel = true,
  className = '',
}) => {
  // Color tiering
  const getTier = (s: number) => {
    if (s >= 85) {
      return {
        bg: 'bg-emerald-50 border-emerald-200 text-emerald-800',
        dot: 'bg-emerald-500',
        ring: 'ring-emerald-500/20',
        icon: <Zap className="w-3.5 h-3.5 text-emerald-600 fill-emerald-500" />,
      };
    }
    if (s >= 70) {
      return {
        bg: 'bg-indigo-50 border-indigo-200 text-indigo-800',
        dot: 'bg-indigo-500',
        ring: 'ring-indigo-500/20',
        icon: <Sparkles className="w-3.5 h-3.5 text-indigo-600" />,
      };
    }
    if (s >= 50) {
      return {
        bg: 'bg-blue-50 border-blue-200 text-blue-800',
        dot: 'bg-blue-500',
        ring: 'ring-blue-500/20',
        icon: <Check className="w-3.5 h-3.5 text-blue-600" />,
      };
    }
    return {
      bg: 'bg-amber-50 border-amber-200 text-amber-800',
      dot: 'bg-amber-500',
      ring: 'ring-amber-500/20',
      icon: null,
    };
  };

  const tier = getTier(score);

  const sizeStyles = {
    sm: 'text-xs px-2 py-0.5 font-semibold gap-1.5',
    md: 'text-xs px-2.5 py-1 font-bold gap-1.5 tracking-tight',
    lg: 'text-sm px-3.5 py-1.5 font-extrabold gap-2',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border shadow-xs transition-all ${
        sizeStyles[size]
      } ${tier.bg} ${className}`}
      title={`Calculated Match Score: ${score}%`}
    >
      {tier.icon}
      <span>{score}%{showLabel ? ' Match' : ''}</span>
    </span>
  );
};
