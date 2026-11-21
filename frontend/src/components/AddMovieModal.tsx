import React, { useState } from 'react';
import { Movie, CreateMovieInput } from '../api/types.js';
import { X, Plus, AlertCircle, Loader2 } from 'lucide-react';

interface AddMovieModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddMovie: (input: CreateMovieInput) => Promise<void>;
  existingMovies: Movie[];
}

export const AddMovieModal: React.FC<AddMovieModalProps> = ({
  isOpen,
  onClose,
  onAddMovie,
  existingMovies,
}) => {
  const [title, setTitle] = useState('');
  const [releaseYear, setReleaseYear] = useState<number | ''>(2026);
  const [runtime, setRuntime] = useState<number | ''>(120);
  const [watched, setWatched] = useState(false);
  const [selectedPrereqs, setSelectedPrereqs] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handlePrereqToggle = (id: number) => {
    setSelectedPrereqs((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('Title cannot be empty');
      return;
    }

    const yearNum = Number(releaseYear);
    if (!Number.isInteger(yearNum) || yearNum < 1888 || yearNum > 2100) {
      setError('Release year must be between 1888 and 2100');
      return;
    }

    const runtimeNum = Number(runtime);
    if (!Number.isInteger(runtimeNum) || runtimeNum < 1 || runtimeNum > 300) {
      setError('Runtime must be an integer between 1 and 300 minutes');
      return;
    }

    setIsSubmitting(true);
    try {
      await onAddMovie({
        title: title.trim(),
        releaseYear: yearNum,
        runtime: runtimeNum,
        watched,
        prerequisites: selectedPrereqs,
      });
      // Reset form and close
      setTitle('');
      setReleaseYear(2026);
      setRuntime(120);
      setWatched(false);
      setSelectedPrereqs([]);
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to create movie');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
            <Plus className="w-5 h-5 text-indigo-600" />
            <span>Add New MCU Movie</span>
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start space-x-2.5">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-500 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Movie Title
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Avengers: Secret Wars"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            />
          </div>

          {/* Release Year and Runtime Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Release Year
              </label>
              <input
                type="number"
                min={1888}
                max={2100}
                required
                value={releaseYear}
                onChange={(e) => setReleaseYear(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Runtime (minutes)
              </label>
              <input
                type="number"
                min={1}
                max={300}
                required
                value={runtime}
                onChange={(e) => setRuntime(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              />
            </div>
          </div>

          {/* Watched Status */}
          <div className="flex items-center space-x-2 pt-1">
            <input
              type="checkbox"
              id="watchedCheckbox"
              checked={watched}
              onChange={(e) => setWatched(e.target.checked)}
              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
            />
            <label htmlFor="watchedCheckbox" className="text-sm font-medium text-slate-700 cursor-pointer">
              I have already watched this movie
            </label>
          </div>

          {/* Prerequisites Checklist */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Select Prerequisites (Movies to watch first)
            </label>
            {existingMovies.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No existing movies to select from</p>
            ) : (
              <div className="max-h-40 overflow-y-auto border border-slate-200 rounded-lg p-2.5 space-y-1.5 bg-slate-50/50">
                {existingMovies.map((m) => (
                  <label
                    key={m.id}
                    className="flex items-center space-x-2 text-xs text-slate-700 hover:bg-slate-100 p-1.5 rounded cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedPrereqs.includes(m.id)}
                      onChange={() => handlePrereqToggle(m.id)}
                      className="rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                    />
                    <span className="font-medium truncate">{m.title}</span>
                    <span className="text-slate-400">({m.releaseYear})</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Modal Actions */}
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
                  <span>Adding...</span>
                </>
              ) : (
                <span>Add Movie</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
