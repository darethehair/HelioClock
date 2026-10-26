import React, { useState } from 'react';
import { X, Navigation, Check } from 'lucide-react';

interface CoordinateModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLat: number;
  currentLon: number;
  isLiveGps: boolean;
  onApplyCoords: (lat: number, lon: number) => void;
  onResetToLiveGps: () => void;
}

export const CoordinateModal: React.FC<CoordinateModalProps> = ({
  isOpen,
  onClose,
  currentLat,
  currentLon,
  isLiveGps,
  onApplyCoords,
  onResetToLiveGps,
}) => {
  const [latInput, setLatInput] = useState(currentLat.toString());
  const [lonInput, setLonInput] = useState(currentLon.toString());

  if (!isOpen) return null;

  const presets = [
    { label: 'Tropic of Cancer', lat: 23.4368, lon: -100.0, desc: 'Solstice Zenith' },
    { label: 'Arctic Circle (Tromsø)', lat: 69.6492, lon: 18.9553, desc: 'Midnight Sun & Polar Night' },
    { label: 'Equator (Quito)', lat: -0.1807, lon: -78.4678, desc: 'Constant 12h Daylight' },
    { label: 'Antarctic Circle', lat: -66.564, lon: 0.0, desc: 'Southern Polar Inversion' },
    { label: 'Greenwich Meridian', lat: 51.4826, lon: 0.0, desc: 'Prime Meridian Reference' },
  ];

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    const lat = parseFloat(latInput);
    const lon = parseFloat(lonInput);
    if (!isNaN(lat) && !isNaN(lon) && lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180) {
      onApplyCoords(lat, lon);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl bg-[#090d16] border border-slate-800 p-5 shadow-2xl text-slate-100">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-base font-semibold text-white">Geographic Calibration</h3>
            <p className="text-xs text-slate-400">Live GPS phone sensors or custom ephemeris testing</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Live GPS status */}
        <div className="mt-4 p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Navigation className={`w-4 h-4 ${isLiveGps ? 'text-emerald-400' : 'text-slate-400'}`} />
            <div>
              <div className="text-xs font-semibold text-white">
                {isLiveGps ? 'Live Phone GPS Connected' : 'Manual Coordinates Active'}
              </div>
              <div className="text-[11px] font-mono text-slate-400">
                {currentLat.toFixed(4)}°, {currentLon.toFixed(4)}°
              </div>
            </div>
          </div>
          {!isLiveGps && (
            <button
              onClick={() => {
                onResetToLiveGps();
                onClose();
              }}
              className="px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 text-xs font-mono font-medium transition"
            >
              Reset to GPS
            </button>
          )}
        </div>

        {/* Custom coordinate inputs */}
        <form onSubmit={handleApply} className="mt-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-mono text-slate-400 block mb-1">
                Latitude (-90° to +90°)
              </label>
              <input
                type="number"
                step="any"
                min="-90"
                max="90"
                value={latInput}
                onChange={(e) => setLatInput(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono text-xs focus:border-amber-400 outline-none"
                placeholder="e.g. 37.7749"
              />
            </div>
            <div>
              <label className="text-[11px] font-mono text-slate-400 block mb-1">
                Longitude (-180° to +180°)
              </label>
              <input
                type="number"
                step="any"
                min="-180"
                max="180"
                value={lonInput}
                onChange={(e) => setLonInput(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono text-xs focus:border-amber-400 outline-none"
                placeholder="e.g. -122.4194"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 text-xs hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-semibold text-xs hover:bg-amber-400 transition flex items-center gap-1"
            >
              <Check className="w-3.5 h-3.5" />
              Apply Coordinates
            </button>
          </div>
        </form>

        {/* Astronomical Presets */}
        <div className="mt-4 pt-4 border-t border-slate-800">
          <span className="text-[11px] font-mono text-slate-400 block mb-2">
            Explore Solar Curvatures Across Earth:
          </span>
          <div className="space-y-1.5">
            {presets.map((p) => (
              <button
                key={p.label}
                onClick={() => {
                  onApplyCoords(p.lat, p.lon);
                  onClose();
                }}
                className="w-full text-left px-2.5 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-900 border border-slate-900 flex items-center justify-between text-xs transition"
              >
                <div>
                  <span className="font-medium text-slate-200">{p.label}</span>
                  <span className="text-[10px] text-slate-500 block">{p.desc}</span>
                </div>
                <span className="font-mono text-[10px] text-amber-400/80">
                  {p.lat > 0 ? `${p.lat}° N` : `${Math.abs(p.lat)}° S`}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
