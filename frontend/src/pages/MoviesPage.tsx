import React, { useState, useEffect, useMemo } from 'react';
import { Movie, CreateMovieInput } from '../api/types.js';
import { getMovies, createMovie, patchMovie } from '../api/movies.js';
import { MovieCard } from '../components/MovieCard.js';
import { AddMovieModal } from '../components/AddMovieModal.js';
import { EditPrerequisitesModal } from '../components/EditPrerequisitesModal.js';
import {
  Film,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Layers,
  Sparkles,
  AlertCircle,
  Loader2,
} from 'lucide-react';

// Sample MCU movies from docs/SPEC.md for one-click initial seeding if database is empty
const INITIAL_MCU_MOVIES: { title: string; releaseYear: number; runtime: number; prereqTitles: string[] }[] = [
  { title: 'Iron Man', releaseYear: 2008, runtime: 126, prereqTitles: [] },
  { title: 'Captain America: The First Avenger', releaseYear: 2011, runtime: 124, prereqTitles: [] },
  { title: 'The Avengers', releaseYear: 2012, runtime: 143, prereqTitles: ['Iron Man', 'Captain America: The First Avenger'] },
  { title: 'Captain America: Civil War', releaseYear: 2016, runtime: 147, prereqTitles: ['The Avengers'] },
  { title: 'Thor: Ragnarok', releaseYear: 2017, runtime: 130, prereqTitles: [] },
  { title: 'Avengers: Infinity War', releaseYear: 2018, runtime: 149, prereqTitles: ['Captain America: Civil War', 'Thor: Ragnarok'] },
  { title: 'Avengers: Endgame', releaseYear: 2019, runtime: 181, prereqTitles: ['Avengers: Infinity War'] },
  { title: 'Avengers: Doomsday', releaseYear: 2026, runtime: 180, prereqTitles: ['Avengers: Endgame'] },
];

export const MoviesPage: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingWatchedId, setUpdatingWatchedId] = useState<number | null>(null);

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedMovieForPrereqs, setSelectedMovieForPrereqs] = useState<Movie | null>(null);
  const [isSeeding, setIsSeeding] = useState(false);

  const fetchMovies = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getMovies();
      setMovies(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to fetch movies from server');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  // Quick Watched Toggle with Optimistic UI Update
  const handleToggleWatched = async (movie: Movie) => {
    const previousWatched = movie.watched;
    const newWatched = !previousWatched;

    // Optimistic update
    setMovies((prev) =>
      prev.map((m) => (m.id === movie.id ? { ...m, watched: newWatched } : m))
    );
    setUpdatingWatchedId(movie.id);

    try {
      await patchMovie(movie.id, { watched: newWatched });
    } catch (err: unknown) {
      // Rollback on error
      setMovies((prev) =>
        prev.map((m) => (m.id === movie.id ? { ...m, watched: previousWatched } : m))
      );
      const msg = err instanceof Error ? err.message : 'Failed to update watched status';
      alert(`Error updating watched status: ${msg}`);
    } finally {
      setUpdatingWatchedId(null);
    }
  };

  // Add Movie
  const handleAddMovie = async (input: CreateMovieInput) => {
    const created = await createMovie(input);
    setMovies((prev) => [...prev, created]);
  };

  // Edit Prerequisites
  const handleSavePrerequisites = async (movieId: number, prereqIds: number[]) => {
    const updated = await patchMovie(movieId, { prerequisites: prereqIds });
    setMovies((prev) => prev.map((m) => (m.id === movieId ? updated : m)));
  };

  // Seed Canonical MCU Movies from SPEC.md
  const handleSeedSampleData = async () => {
    try {
      setIsSeeding(true);
      setError(null);
      const titleToIdMap = new Map<string, number>();

      for (const item of INITIAL_MCU_MOVIES) {
        const prereqIds = item.prereqTitles
          .map((t) => titleToIdMap.get(t))
          .filter((id): id is number => typeof id === 'number');

        const created = await createMovie({
          title: item.title,
          releaseYear: item.releaseYear,
          runtime: item.runtime,
          watched: false,
          prerequisites: prereqIds,
        });

        titleToIdMap.set(created.title, created.id);
      }

      await fetchMovies();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to seed sample MCU data');
      }
    } finally {
      setIsSeeding(false);
    }
  };

  // Filtered movies & stats calculation
  const filteredMovies = useMemo(() => {
    if (!searchQuery.trim()) return movies;
    const q = searchQuery.toLowerCase();
    return movies.filter((m) => m.title.toLowerCase().includes(q));
  }, [movies, searchQuery]);

  const stats = useMemo(() => {
    const total = movies.length;
    const watched = movies.filter((m) => m.watched).length;
    const remainingRuntime = movies
      .filter((m) => !m.watched)
      .reduce((sum, m) => sum + m.runtime, 0);

    const hours = Math.floor(remainingRuntime / 60);
    const mins = remainingRuntime % 60;

    return {
      total,
      watched,
      remainingDisplay: hours > 0 ? `${hours}h ${mins}m` : `${mins}m`,
    };
  }, [movies]);

  return (
    <div className="space-y-6">
      {/* Top Banner & Stats Overview */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center space-x-2.5 text-indigo-600 mb-1">
              <Film className="w-5 h-5" />
              <h1 className="text-2xl font-bold text-slate-900">MCU Movies & Prerequisites</h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-500">
              Build your custom timeline, record what you have seen, and configure prerequisites.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {movies.length === 0 && (
              <button
                type="button"
                onClick={handleSeedSampleData}
                disabled={isSeeding}
                className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 transition-colors disabled:opacity-50"
              >
                {isSeeding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                <span>Seed Sample MCU Movies</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Movie</span>
            </button>
          </div>
        </div>

        {/* Stats Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-5">
          <div className="flex items-center space-x-3.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
            <div className="p-2.5 rounded-lg bg-indigo-100 text-indigo-600">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">Total Movies</p>
              <p className="text-lg font-bold text-slate-900">{stats.total}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
            <div className="p-2.5 rounded-lg bg-emerald-100 text-emerald-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">Watched</p>
              <p className="text-lg font-bold text-slate-900">
                {stats.watched} of {stats.total}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
            <div className="p-2.5 rounded-lg bg-amber-100 text-amber-600">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">Remaining Watch Time</p>
              <p className="text-lg font-bold text-slate-900">{stats.remainingDisplay}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search movies by title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-2xs"
          />
        </div>
      </div>

      {/* Global Error Banner */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">Error</p>
            <p className="text-xs text-rose-700 mt-0.5">{error}</p>
          </div>
          <button
            type="button"
            onClick={fetchMovies}
            className="text-xs font-semibold text-rose-800 underline hover:no-underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Movie Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs animate-pulse space-y-4"
            >
              <div className="h-6 bg-slate-200 rounded w-3/4"></div>
              <div className="h-4 bg-slate-200 rounded w-1/2"></div>
              <div className="h-12 bg-slate-100 rounded"></div>
            </div>
          ))}
        </div>
      ) : filteredMovies.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
          <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
            <Film className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-1">No movies found</h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mb-6">
            {searchQuery
              ? `No movies matched your search query "${searchQuery}".`
              : 'Your movie database is currently empty. Add your first movie or populate with standard sample MCU movies.'}
          </p>
          {movies.length === 0 && (
            <button
              type="button"
              onClick={handleSeedSampleData}
              disabled={isSeeding}
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              <span>Load 8 Sample MCU Movies</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredMovies.map((movie) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              allMovies={movies}
              onToggleWatched={handleToggleWatched}
              onEditPrerequisites={(m) => setSelectedMovieForPrereqs(m)}
              isUpdatingWatched={updatingWatchedId === movie.id}
            />
          ))}
        </div>
      )}

      {/* Add Movie Modal */}
      <AddMovieModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddMovie={handleAddMovie}
        existingMovies={movies}
      />

      {/* Edit Prerequisites Modal */}
      <EditPrerequisitesModal
        isOpen={selectedMovieForPrereqs !== null}
        movie={selectedMovieForPrereqs}
        onClose={() => setSelectedMovieForPrereqs(null)}
        onSavePrerequisites={handleSavePrerequisites}
        allMovies={movies}
      />
    </div>
  );
};
