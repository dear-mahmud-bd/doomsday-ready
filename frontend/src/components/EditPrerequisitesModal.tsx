import React, { useState, useEffect } from 'react';
import { Movie } from '../api/types.js';
import { X, GitFork, AlertTriangle, Loader2, Check } from 'lucide-react';

interface EditPrerequisitesModalProps {
  movie: Movie | null;
  isOpen: boolean;
  onClose: () => void;
  onSavePrerequisites: (movieId: number, prereqIds: number[]) => Promise<void>;
  allMovies: Movie[];
}

export const EditPrerequisitesModal: React.FC<EditPrerequisitesModalProps> = ({
  movie,
  isOpen,
  onClose,
  onSavePrerequisites,
  allMovies,
}) => {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (movie) {
      setSelectedIds([...movie.prerequisites]);
      setError(null);
    }
  }, [movie]);

  if (!isOpen || !movie) return null;

  // Filter out the movie itself (cannot be its own prerequisite)
  const candidateMovies = allMovies.filter((m) => m.id !== movie.id);

  const handleToggle = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await onSavePrerequisites(movie.id, selectedIds);
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to update prerequisites');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <GitFork className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-bold text-slate-900 truncate">
              Edit Prerequisites: {movie.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content & Form */}
        <form onSubmit={handleSave} className="p-6 space-y-4">
          <p className="text-xs text-slate-500 leading-relaxed">
            Select the movies that must be viewed <strong>before</strong> watching{' '}
            <span className="font-semibold text-slate-700">{movie.title}</span>. The system will
            automatically prevent any circular dependencies.
          </p>

          {/* Circular Dependency / Error Banner */}
          {error && (
            <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start space-x-2.5 animate-shake">
              <AlertTriangle className="w-5 h-5 shrink-0 text-rose-500 mt-0.5" />
              <div>
                <p className="font-semibold">Circular Dependency Detected</p>
                <p className="text-xs text-rose-700 mt-0.5">{error}</p>
              </div>
            </div>
          )}

          {/* Candidate List */}
          <div className="max-h-60 overflow-y-auto border border-slate-200 rounded-xl p-3 space-y-1 bg-slate-50/50">
            {candidateMovies.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-2 text-center">
                No other movies available
              </p>
            ) : (
              candidateMovies.map((candidate) => {
                const isChecked = selectedIds.includes(candidate.id);
                return (
                  <label
                    key={candidate.id}
                    className={`flex items-center justify-between p-2.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                      isChecked
                        ? 'bg-indigo-50/70 border-indigo-200 text-indigo-900 font-semibold'
                        : 'bg-white border-slate-200/80 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 truncate mr-2">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggle(candidate.id)}
                        className="rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 w-4 h-4"
                      />
                      <span className="truncate">{candidate.title}</span>
                    </div>
                    <span className="text-slate-400 text-xs shrink-0 font-normal">
                      ({candidate.releaseYear})
                    </span>
                  </label>
                );
              })
            )}
          </div>

          <div className="text-xs text-slate-500 flex justify-between items-center px-1">
            <span>{selectedIds.length} prerequisites selected</span>
            {selectedIds.length > 0 && (
              <button
                type="button"
                onClick={() => setSelectedIds([])}
                className="text-indigo-600 hover:underline font-medium"
              >
                Clear all
              </button>
            )}
          </div>

          {/* Actions */}
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
                  <span>Checking & Saving...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Save Prerequisites</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
