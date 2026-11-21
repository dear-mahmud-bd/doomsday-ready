import React from 'react';
import { Compass } from 'lucide-react';

export const RewatchPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sm:p-8">
        <div className="flex items-center space-x-3 mb-2">
          <Compass className="w-6 h-6 text-indigo-600" />
          <h1 className="text-2xl font-bold text-slate-900">MCU Rewatch Planner</h1>
        </div>
        <p className="text-slate-600">
          Pick your target MCU movie to automatically calculate the complete, deduplicated topological viewing order, runtime remaining, and progress bar.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500 shadow-sm">
        <p className="text-sm font-medium">Scaffolding complete. Interactive rewatch plan view will be implemented in Task 10.</p>
      </div>
    </div>
  );
};
