import React, { useState } from 'react';
import { CreateCinemaInput, Cinema } from '../api/types.js';
import { createCinema } from '../api/cinemas.js';
import { X, Ticket, AlertCircle, Loader2 } from 'lucide-react';

interface AddCinemaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCinemaCreated: (cinema: Cinema) => void;
}

export const AddCinemaModal: React.FC<AddCinemaModalProps> = ({
  isOpen,
  onClose,
  onCinemaCreated,
}) => {
  const [name, setName] = useState('');
  const [bundleSizesInput, setBundleSizesInput] = useState('2, 5');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Cinema name cannot be empty');
      return;
    }

    const rawSizes = bundleSizesInput
      .split(/[\s,]+/)
      .map((s) => s.trim())
      .filter(Boolean)
      .map(Number);

    if (rawSizes.length === 0) {
      setError('Please provide at least one bundle size');
      return;
    }

    if (rawSizes.length > 10) {
      setError('A cinema can have at most 10 distinct bundle sizes');
      return;
    }

    for (const size of rawSizes) {
      if (!Number.isInteger(size) || size < 1 || size > 500) {
        setError(`Invalid bundle size "${size}". Sizes must be integers between 1 and 500.`);
        return;
      }
    }

    const uniqueSizes = Array.from(new Set(rawSizes)).sort((a, b) => a - b);
    if (uniqueSizes.length !== rawSizes.length) {
      setError('Bundle sizes cannot contain duplicates');
      return;
    }

    const input: CreateCinemaInput = {
      name: name.trim(),
      bundleSizes: uniqueSizes,
    };

    setIsSubmitting(true);
    try {
      const created = await createCinema(input);
      onCinemaCreated(created);
      setName('');
      setBundleSizesInput('2, 5');
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to create cinema');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Ticket className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-bold text-slate-900">Register Cinema</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm flex items-start space-x-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Cinema Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Stark Odeon"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Bundle Sizes (comma-separated, 1–500)
            </label>
            <input
              type="text"
              required
              placeholder="e.g. 2, 5 or 6, 9, 20"
              value={bundleSizesInput}
              onChange={(e) => setBundleSizesInput(e.target.value)}
              className="w-full px-3.5 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
            <p className="text-2xs text-slate-500 mt-1">
              Enter 1 to 10 distinct integer bundle sizes between 1 and 500.
            </p>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center space-x-2 px-5 py-2 rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-colors disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Registering...</span>
                </>
              ) : (
                <span>Register Cinema</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
