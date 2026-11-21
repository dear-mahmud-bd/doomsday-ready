import React from 'react';
import { Film } from 'lucide-react';

export const MoviesPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sm:p-8">
        <div className="flex items-center space-x-3 mb-2">
          <Film className="w-6 h-6 text-indigo-600" />
          <h1 className="text-2xl font-bold text-slate-900">MCU Movies & Prerequisites</h1>
        </div>
        <p className="text-slate-600">
          Manage Marvel Cinematic Universe titles, configure release order, tick watched status, and establish prerequisite viewing chains.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500 shadow-sm">
        <p className="text-sm font-medium">Scaffolding complete. Interactive movies view and modal will be implemented in Task 9.</p>
      </div>
    </div>
  );
};
