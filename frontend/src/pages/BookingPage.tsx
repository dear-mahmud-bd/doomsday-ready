import React, { useState, useEffect } from 'react';
import { Cinema, BookingQuoteResponse } from '../api/types.js';
import { getCinemas, getBookingQuote, createCinema } from '../api/cinemas.js';
import { AddCinemaModal } from '../components/AddCinemaModal.js';
import {
  Ticket,
  Users,
  CheckCircle2,
  AlertOctagon,
  Sparkles,
  Plus,
  Loader2,
  Building2,
  Package,
} from 'lucide-react';

// Sample cinemas from SPEC.md
const SAMPLE_CINEMAS = [
  { name: 'Stark Odeon', bundleSizes: [2, 5] },
  { name: 'Wakanda IMAX', bundleSizes: [6, 9, 20] },
  { name: 'Avengers Campus Picturehouse', bundleSizes: [1, 3, 4] },
  { name: 'Sanctum Screening Room', bundleSizes: [4, 6] },
];

export const BookingPage: React.FC = () => {
  const [cinemas, setCinemas] = useState<Cinema[]>([]);
  const [selectedCinemaId, setSelectedCinemaId] = useState<number | null>(null);
  const [groupSize, setGroupSize] = useState<number | ''>(11);
  const [quote, setQuote] = useState<BookingQuoteResponse | null>(null);
  const [loadingCinemas, setLoadingCinemas] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);

  // Fetch all cinemas on mount
  const fetchCinemas = async () => {
    try {
      setLoadingCinemas(true);
      setError(null);
      const data = await getCinemas();
      setCinemas(data);
      if (data.length > 0 && !selectedCinemaId) {
        setSelectedCinemaId(data[0].id);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch cinemas');
    } finally {
      setLoadingCinemas(false);
    }
  };

  useEffect(() => {
    fetchCinemas();
  }, []);

  // Request booking quote from backend
  const handleCalculateQuote = async () => {
    if (!selectedCinemaId) {
      setError('Please select a cinema first');
      return;
    }

    const sizeNum = Number(groupSize);
    if (!Number.isInteger(sizeNum) || sizeNum < 1 || sizeNum > 10000) {
      setError('Group size must be an integer between 1 and 10,000');
      return;
    }

    try {
      setCalculating(true);
      setError(null);
      const res = await getBookingQuote(selectedCinemaId, sizeNum);
      setQuote(res);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to compute booking quote');
      setQuote(null);
    } finally {
      setCalculating(false);
    }
  };

  // Seed sample cinemas from SPEC.md
  const handleSeedCinemas = async () => {
    try {
      setIsSeeding(true);
      setError(null);
      for (const c of SAMPLE_CINEMAS) {
        await createCinema(c);
      }
      await fetchCinemas();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to seed sample cinemas');
    } finally {
      setIsSeeding(false);
    }
  };

  // Quick preset button click
  const handlePresetClick = (size: number) => {
    setGroupSize(size);
  };

  const selectedCinema = cinemas.find((c) => c.id === selectedCinemaId);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center space-x-2.5 text-indigo-600 mb-1">
              <Ticket className="w-5 h-5" />
              <h1 className="text-2xl font-bold text-slate-900">Opening Night Seat Booking</h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-500">
              Calculate the fewest exact seat bundles for your group size using dynamic programming.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {cinemas.length === 0 && (
              <button
                type="button"
                onClick={handleSeedCinemas}
                disabled={isSeeding}
                className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 transition-colors disabled:opacity-50"
              >
                {isSeeding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                <span>Seed Sample Cinemas</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Register Cinema</span>
            </button>
          </div>
        </div>

        {/* Form Controls: Cinema Picker & Group Size */}
        <div className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Cinema Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center space-x-1">
              <Building2 className="w-4 h-4 text-slate-400" />
              <span>Select Cinema</span>
            </label>
            <select
              value={selectedCinemaId || ''}
              onChange={(e) => setSelectedCinemaId(Number(e.target.value))}
              disabled={loadingCinemas || cinemas.length === 0}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs"
            >
              {cinemas.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} &mdash; bundles: [{c.bundleSizes.join(', ')}]
                </option>
              ))}
            </select>

            {selectedCinema && (
              <p className="text-2xs text-slate-500 mt-2">
                Available bundles for <strong>{selectedCinema.name}</strong>:{' '}
                <span className="font-semibold text-indigo-600">
                  {selectedCinema.bundleSizes.join(', ')} seats
                </span>
              </p>
            )}
          </div>

          {/* Group Size Input & Presets */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center space-x-1">
              <Users className="w-4 h-4 text-slate-400" />
              <span>Group Size (1 to 10,000 Seats)</span>
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                min={1}
                max={10000}
                required
                value={groupSize}
                onChange={(e) => setGroupSize(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="Enter group size..."
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs"
              />
              <button
                type="button"
                onClick={handleCalculateQuote}
                disabled={calculating || !selectedCinemaId || groupSize === ''}
                className="shrink-0 inline-flex items-center space-x-2 px-5 py-2 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-colors disabled:opacity-50"
              >
                {calculating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <span>Get Quote</span>
                )}
              </button>
            </div>

            {/* Assessment Quick Test Presets */}
            <div className="flex items-center space-x-2 mt-2.5">
              <span className="text-2xs text-slate-400">Assessment presets:</span>
              {[6, 7, 11, 44].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handlePresetClick(preset)}
                  className={`text-2xs font-semibold px-2 py-0.5 rounded-md border transition-colors ${
                    groupSize === preset
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                  }`}
                >
                  {preset} seats
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Global Error Banner */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start space-x-3">
          <AlertOctagon className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Booking Calculation Results Display */}
      {quote && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {quote.possible ? (
            <div className="bg-white rounded-2xl border border-emerald-200 p-6 sm:p-8 shadow-xs">
              {/* Header: Possible Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">
                      Exact Seating Found for Group of {quote.groupSize}
                    </h3>
                    <p className="text-xs text-slate-500">
                      At {quote.cinema.name} &bull; Fewest possible bundles: {quote.totalBundles}
                    </p>
                  </div>
                </div>

                <div className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 self-start sm:self-auto">
                  <Package className="w-4 h-4 text-emerald-600" />
                  <span>{quote.totalBundles} Total Bundles</span>
                </div>
              </div>

              {/* Bundle Distribution Cards */}
              <div className="pt-6">
                <p className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-4">
                  Recommended Bundle Breakdown
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {quote.bundles.map((bundle) => (
                    <div
                      key={bundle.size}
                      className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between"
                    >
                      <div>
                        <span className="text-xs font-semibold text-slate-500">Bundle Size</span>
                        <p className="text-xl font-extrabold text-slate-900">
                          {bundle.size} seats
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-semibold text-slate-500">Quantity</span>
                        <p className="text-xl font-extrabold text-indigo-600">
                          &times; {bundle.count}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Math Verification Banner */}
                <div className="mt-6 p-4 rounded-xl bg-slate-50/80 border border-slate-200 text-xs text-slate-600 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span>
                    Verification:{' '}
                    {quote.bundles.map((b) => `${b.size} \u00d7 ${b.count}`).join(' + ')} ={' '}
                    <strong className="text-slate-900">{quote.groupSize} seats exactly</strong>
                  </span>
                  <span className="text-emerald-700 font-semibold flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Exact zero-waste seating</span>
                  </span>
                </div>
              </div>
            </div>
          ) : (
            /* Impossible Combination Alert */
            <div className="bg-white rounded-2xl border border-rose-200 p-8 shadow-xs text-center">
              <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
                <AlertOctagon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-rose-900 mb-2">Not Possible</h3>
              <p className="text-sm text-slate-600 max-w-lg mx-auto mb-4">
                It is impossible to seat exactly <strong>{quote.groupSize}</strong> people using the available bundle sizes at {quote.cinema.name} (
                {selectedCinema?.bundleSizes.join(', ')} seats).
              </p>
              <p className="text-xs text-slate-400">
                Please try a different group size or select another cinema with different bundle offerings.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Add Cinema Modal */}
      <AddCinemaModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onCinemaCreated={(created) => {
          setCinemas((prev) => [...prev, created]);
          setSelectedCinemaId(created.id);
        }}
      />
    </div>
  );
};
