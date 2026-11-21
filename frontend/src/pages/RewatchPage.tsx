import React, { useState, useEffect } from 'react';
import { Movie, RewatchOrderResponse } from '../api/types.js';
import { getMovies, getRewatchOrder, patchMovie } from '../api/movies.js';
import {
  Compass,
  CheckCircle2,
  Circle,
  Clock,
  Calendar,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Film,
} from 'lucide-react';

export const RewatchPage: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [selectedTargetId, setSelectedTargetId] = useState<number | null>(null);
  const [plan, setPlan] = useState<RewatchOrderResponse | null>(null);
  const [loadingMovies, setLoadingMovies] = useState(true);
  const [loadingPlan, setLoadingPlan] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updatingWatchedId, setUpdatingWatchedId] = useState<number | null>(null);

  // Load all movies on mount
  useEffect(() => {
    async function loadMovies() {
      try {
        setLoadingMovies(true);
        const data = await getMovies();
        setMovies(data);

        if (data.length > 0) {
          // Default to Doomsday if present, otherwise the last movie in chronological order
          const doomsday = data.find((m) => m.title.toLowerCase().includes('doomsday'));
          const target = doomsday || data[data.length - 1];
          setSelectedTargetId(target.id);
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to fetch movies');
      } finally {
        setLoadingMovies(false);
      }
    }
    loadMovies();
  }, []);

  // Fetch rewatch order whenever selectedTargetId changes
  useEffect(() => {
    if (!selectedTargetId) {
      setPlan(null);
      return;
    }

    async function loadPlan() {
      try {
        setLoadingPlan(true);
        setError(null);
        const result = await getRewatchOrder(selectedTargetId!);
        setPlan(result);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to load rewatch order');
        setPlan(null);
      } finally {
        setLoadingPlan(false);
      }
    }
    loadPlan();
  }, [selectedTargetId]);

  // Handle watched toggle within rewatch plan
  const handleToggleWatched = async (movie: Movie) => {
    const newWatched = !movie.watched;
    setUpdatingWatchedId(movie.id);

    // Optimistically update plan in state
    setPlan((prev) => {
      if (!prev) return null;
      const updatedOrder = prev.order.map((m) =>
        m.id === movie.id ? { ...m, watched: newWatched } : m
      );
      const watchedCount = updatedOrder.filter((m) => m.watched).length;
      const remainingRuntime = updatedOrder
        .filter((m) => !m.watched)
        .reduce((sum, m) => sum + m.runtime, 0);

      return {
        ...prev,
        order: updatedOrder,
        watchedCount,
        remainingRuntime,
      };
    });

    try {
      await patchMovie(movie.id, { watched: newWatched });
      // Also update in parent movies array
      setMovies((prev) =>
        prev.map((m) => (m.id === movie.id ? { ...m, watched: newWatched } : m))
      );
    } catch (err: unknown) {
      // Rollback on failure
      if (selectedTargetId) {
        const fresh = await getRewatchOrder(selectedTargetId);
        setPlan(fresh);
      }
      alert(`Failed to update watched status: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setUpdatingWatchedId(null);
    }
  };

  // Remaining time formatting
  const remainingHours = plan ? Math.floor(plan.remainingRuntime / 60) : 0;
  const remainingMinutes = plan ? plan.remainingRuntime % 60 : 0;
  const remainingFormatted =
    remainingHours > 0 ? `${remainingHours}h ${remainingMinutes}m` : `${remainingMinutes}m`;

  const percentWatched =
    plan && plan.total > 0 ? Math.round((plan.watchedCount / plan.total) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Top Banner & Target Movie Selector */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center space-x-2.5 text-indigo-600 mb-1">
              <Compass className="w-5 h-5" />
              <h1 className="text-2xl font-bold text-slate-900">MCU Rewatch Planner</h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-500">
              Calculate the exact topological watch order for any target movie before Avengers: Doomsday.
            </p>
          </div>

          {/* Target Selector Dropdown */}
          <div className="flex items-center space-x-3">
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider shrink-0">
              Target Movie:
            </label>
            <select
              value={selectedTargetId || ''}
              onChange={(e) => setSelectedTargetId(Number(e.target.value))}
              disabled={loadingMovies || movies.length === 0}
              className="px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs"
            >
              {movies.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.title} ({m.releaseYear})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Plan Summary Stats (Progress Bar & Remaining Time) */}
        {plan && (
          <div className="pt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Progress Bar Card */}
            <div className="md:col-span-2 p-5 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Rewatch Progress</span>
                </span>
                <span className="text-sm font-bold text-slate-900">
                  {plan.watchedCount} of {plan.total} watched ({percentWatched}%)
                </span>
              </div>

              {/* Progress Bar Track */}
              <div className="w-full bg-slate-200 rounded-full h-3.5 overflow-hidden p-0.5">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${percentWatched}%` }}
                />
              </div>

              <div className="flex justify-between items-center text-2xs text-slate-400 mt-2">
                <span>Start</span>
                <span>Ready for {plan.target.title}</span>
              </div>
            </div>

            {/* Remaining Runtime Card */}
            <div className="p-5 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center space-x-1.5 mb-2">
                <Clock className="w-4 h-4 text-indigo-600" />
                <span>Remaining Watch Time</span>
              </span>
              <div className="my-auto">
                <p className="text-3xl font-extrabold text-slate-900">{remainingFormatted}</p>
                <p className="text-2xs text-slate-500 mt-1">
                  ({plan.remainingRuntime} total unwatched minutes)
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Global Error Notice */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Ordered Prerequisite Movie List */}
      {loadingPlan ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs animate-pulse h-20"
            />
          ))}
        </div>
      ) : !plan ? null : plan.order.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-1">No Prerequisites Needed!</h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
            <strong>{plan.target.title}</strong> has zero prerequisite requirements. You can watch it directly without watching any prior movies!
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
            <span>Viewing Sequence (Topological Order)</span>
            <span>Target: {plan.target.title}</span>
          </div>

          {plan.order.map((movie, index) => {
            const hours = Math.floor(movie.runtime / 60);
            const minutes = movie.runtime % 60;
            const runtimeStr = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

            return (
              <div
                key={movie.id}
                className={`bg-white rounded-xl border p-4 sm:p-5 shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  movie.watched ? 'border-emerald-200 bg-emerald-50/20' : 'border-slate-200'
                }`}
              >
                {/* Left: Step Index & Title Details */}
                <div className="flex items-center space-x-4">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 ${
                      movie.watched
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-indigo-50 text-indigo-700'
                    }`}
                  >
                    {index + 1}
                  </div>

                  <div>
                    <h4 className="font-bold text-base text-slate-900">{movie.title}</h4>
                    <div className="flex items-center space-x-3 text-xs text-slate-500 mt-1">
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{movie.releaseYear}</span>
                      </span>
                      <span>&bull;</span>
                      <span className="flex items-center space-x-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{runtimeStr}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Watched Toggle Action */}
                <button
                  type="button"
                  onClick={() => handleToggleWatched(movie)}
                  disabled={updatingWatchedId === movie.id}
                  className={`inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full text-xs font-medium border transition-colors self-start sm:self-auto ${
                    movie.watched
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200'
                      : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                  }`}
                >
                  {movie.watched ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Watched</span>
                    </>
                  ) : (
                    <>
                      <Circle className="w-4 h-4 text-slate-400" />
                      <span>Mark as Watched</span>
                    </>
                  )}
                </button>
              </div>
            );
          })}

          {/* Final Target Banner */}
          <div className="p-4 rounded-xl border border-dashed border-indigo-300 bg-indigo-50/50 flex items-center justify-between text-indigo-900 text-xs sm:text-sm font-semibold">
            <div className="flex items-center space-x-2">
              <Film className="w-4 h-4 text-indigo-600" />
              <span>Final Destination: Watch <strong>{plan.target.title}</strong></span>
            </div>
            <ArrowRight className="w-4 h-4 text-indigo-600" />
          </div>
        </div>
      )}
    </div>
  );
};
