import React from 'react';
import { Ticket } from 'lucide-react';

export const BookingPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sm:p-8">
        <div className="flex items-center space-x-3 mb-2">
          <Ticket className="w-6 h-6 text-indigo-600" />
          <h1 className="text-2xl font-bold text-slate-900">Opening Night Seat Booking</h1>
        </div>
        <p className="text-slate-600">
          Find the fewest exact seat bundles for your group size at registered cinemas using dynamic programming.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500 shadow-sm">
        <p className="text-sm font-medium">Scaffolding complete. Interactive cinema selection and booking quote view will be implemented in Task 10.</p>
      </div>
    </div>
  );
};
