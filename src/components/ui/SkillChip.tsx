import React from 'react';
import { X, Check } from 'lucide-react';

export interface SkillChipProps {
  skill: string;
  isMatched?: boolean;
  onRemove?: () => void;
  onClick?: () => void;
  size?: 'sm' | 'md';
  className?: string;
}

export const SkillChip: React.FC<SkillChipProps> = ({
  skill,
  isMatched,
  onRemove,
  onClick,
  size = 'md',
  className = '',
}) => {
  const sizeStyles = {
    sm: 'text-xs px-2.5 py-1 gap-1',
    md: 'text-xs px-3 py-1.5 gap-1.5 font-medium',
  };

  const matchedStyle = isMatched
    ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-semibold'
    : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200/80';

  return (
    <span
      onClick={onClick}
      className={`inline-flex items-center rounded-lg border transition-colors select-none ${
        sizeStyles[size]
      } ${matchedStyle} ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {isMatched && <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />}
      <span>{skill}</span>
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-0.5 text-slate-400 hover:text-rose-600 p-0.5 rounded transition-colors"
          aria-label={`Remove ${skill}`}
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </span>
  );
};
