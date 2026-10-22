import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner: React.FC<{ message?: string; fullHeight?: boolean }> = ({
  message = 'Loading...',
  fullHeight = false,
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 gap-3 text-slate-500 ${
        fullHeight ? 'min-h-[50vh]' : ''
      }`}
    >
      <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      <span className="text-sm font-medium text-slate-600">{message}</span>
    </div>
  );
};
