import React from 'react';
import { Movie } from '../api/types.js';
import { CheckCircle2, Circle, Clock, Calendar, GitFork, Edit3 } from 'lucide-react';

interface MovieCardProps {
  movie: Movie;
  allMovies: Movie[];
  onToggleWatched: (movie: Movie) => void;
  onEditPrerequisites: (movie: Movie) => void;
  isUpdatingWatched?: boolean;
}

export const MovieCard: React.FC<MovieCardProps> = ({
  movie,
  allMovies,
  onToggleWatched,
  onEditPrerequisites,
  isUpdatingWatched = false,
}) => {
  // Format runtime to "Xh Ym"
  const hours = Math.floor(movie.runtime / 60);
  const minutes = movie.runtime % 60;
  const runtimeDisplay = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

  // Map prerequisite IDs to titles
  const movieMap = new Map<number, Movie>(allMovies.map((m) => [m.id, m]));
  const prerequisiteTitles = movie.prerequisites
    .map((id) => movieMap.get(id)?.title || `Movie #${id}`)
    .filter(Boolean);

  return (
    <div
      className={`bg-white rounded-xl border transition-all duration-200 shadow-xs hover:shadow-md flex flex-col justify-between ${
        movie.watched ? 'border-emerald-200 bg-emerald-50/20' : 'border-slate-200'
      }`}
    >
      <div className="p-5">
        {/* Top Header: Title & Watched Toggle Button */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <h3 className="font-semibold text-lg text-slate-900 leading-snug">
            {movie.title}
          </h3>
          <button
            type="button"
            onClick={() => onToggleWatched(movie)}
            disabled={isUpdatingWatched}
            className={`shrink-0 flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
              movie.watched
                ? 'bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200'
                : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
            }`}
            title={movie.watched ? 'Mark as unwatched' : 'Mark as watched'}
          >
            {movie.watched ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Watched</span>
              </>
            ) : (
              <>
                <Circle className="w-3.5 h-3.5 text-slate-400" />
                <span>Unwatched</span>
              </>
            )}
          </button>
        </div>

        {/* Badges: Year & Runtime */}
        <div className="flex flex-wrap items-center gap-2 mb-4 text-xs text-slate-600">
          <span className="inline-flex items-center space-x-1 bg-slate-100 px-2.5 py-1 rounded-md font-medium text-slate-700">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>{movie.releaseYear}</span>
          </span>
          <span className="inline-flex items-center space-x-1 bg-slate-100 px-2.5 py-1 rounded-md font-medium text-slate-700">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{runtimeDisplay}</span>
          </span>
        </div>

        {/* Prerequisites Section */}
        <div className="pt-3 border-t border-slate-100">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-medium flex items-center space-x-1">
              <GitFork className="w-3.5 h-3.5 text-slate-400" />
              <span>Watch Before This ({prerequisiteTitles.length}):</span>
            </span>
          </div>

          {prerequisiteTitles.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No prerequisites required</p>
          ) : (
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
              {prerequisiteTitles.map((title, idx) => (
                <span
                  key={idx}
                  className="inline-block px-2 py-0.5 rounded text-xs bg-indigo-50 text-indigo-700 border border-indigo-100 font-medium truncate max-w-full"
                  title={title}
                >
                  {title}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Card Footer: Edit Prerequisites Action */}
      <div className="px-5 py-3 bg-slate-50/70 border-t border-slate-100 rounded-b-xl flex justify-end">
        <button
          type="button"
          onClick={() => onEditPrerequisites(movie)}
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors py-1 px-2 rounded hover:bg-indigo-50"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>Edit Prerequisites</span>
        </button>
      </div>
    </div>
  );
};
