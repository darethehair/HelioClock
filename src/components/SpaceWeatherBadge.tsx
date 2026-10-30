import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Activity, RotateCw, ExternalLink, X, Info, Zap } from 'lucide-react';
import { useSpaceWeather } from '../hooks/useSpaceWeather';

export interface KpTier {
  category: 'green' | 'yellow' | 'orange' | 'red';
  shortLabel: string;
  stormScale: string;
  badgeBg: string;
  borderColor: string;
  textColor: string;
  dotColor: string;
  glowColor: string;
  barColor: string;
}

/**
 * Returns color coding per instructions:
 * - Green for Kp < 4
 * - Yellow for Kp 4 (4 <= Kp < 5)
 * - Orange for Kp 5-6 (5 <= Kp < 7)
 * - Red for Kp 7+ (Kp >= 7)
 */
export function getKpTier(kp: number | null): KpTier {
  if (kp === null) {
    return {
      category: 'green',
      shortLabel: 'Quiet',
      stormScale: 'G0 · Quiet Geomagnetic Field',
      badgeBg: 'bg-slate-900/80 hover:bg-slate-800/80',
      borderColor: 'border-slate-700/60',
      textColor: 'text-slate-400',
      dotColor: 'bg-slate-500',
      glowColor: 'rgba(148,163,184,0.3)',
      barColor: '#10b981',
    };
  }

  if (kp < 4) {
    return {
      category: 'green',
      shortLabel: 'Quiet',
      stormScale: 'G0 - Quiet',
      badgeBg: 'bg-emerald-950/40 hover:bg-emerald-900/50',
      borderColor: 'border-emerald-500/50',
      textColor: 'text-emerald-300',
      dotColor: 'bg-emerald-400',
      glowColor: 'rgba(52,211,153,0.5)',
      barColor: '#10b981', // emerald-500
    };
  }

  if (kp < 5) {
    return {
      category: 'yellow',
      shortLabel: 'Unsettled',
      stormScale: 'Active / Unsettled (Kp 4)',
      badgeBg: 'bg-yellow-950/40 hover:bg-yellow-900/50',
      borderColor: 'border-yellow-500/60',
      textColor: 'text-yellow-300',
      dotColor: 'bg-yellow-400',
      glowColor: 'rgba(250,204,21,0.6)',
      barColor: '#facc15', // yellow-400
    };
  }

  if (kp < 7) {
    const isG2 = kp >= 6;
    return {
      category: 'orange',
      shortLabel: isG2 ? 'G2 Storm' : 'G1 Storm',
      stormScale: isG2 ? 'G2 - Moderate Storm' : 'G1 - Minor Storm',
      badgeBg: 'bg-orange-950/50 hover:bg-orange-900/60',
      borderColor: 'border-orange-500/60',
      textColor: 'text-orange-300',
      dotColor: 'bg-orange-400',
      glowColor: 'rgba(251,146,60,0.7)',
      barColor: '#f97316', // orange-500
    };
  }

  const isG5 = kp >= 9;
  const isG4 = kp >= 8;
  return {
    category: 'red',
    shortLabel: isG5 ? 'G5 Storm' : isG4 ? 'G4 Storm' : 'G3 Storm',
    stormScale: isG5
      ? 'G5 - Extreme Storm'
      : isG4
      ? 'G4 - Severe Storm'
      : 'G3 - Strong Storm',
    badgeBg: 'bg-rose-950/60 hover:bg-rose-900/70',
    borderColor: 'border-rose-500/70',
    textColor: 'text-rose-300',
    dotColor: 'bg-rose-400',
    glowColor: 'rgba(244,63,94,0.8)',
    barColor: '#ef4444', // red-500
  };
}

export const SpaceWeatherBadge: React.FC = () => {
  const { kp, timeTag, stationCount, recentSeries, loading, error, refresh } = useSpaceWeather();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const tier = getKpTier(kp);

  // Close modal on Escape key
  useEffect(() => {
    if (!isModalOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen]);

  // Format observation time nicely
  const formattedObsTime = React.useMemo(() => {
    if (!timeTag) return null;
    try {
      const d = new Date(timeTag.endsWith('Z') ? timeTag : `${timeTag}Z`);
      if (!isNaN(d.getTime())) {
        return d.toUTCString().replace('GMT', 'UTC');
      }
    } catch {
      // fallback
    }
    return timeTag;
  }, [timeTag]);

  // Format timestamp label for bar chart (e.g., "09:00" or "09z")
  const formatBarTime = (tStr: string) => {
    try {
      const d = new Date(tStr.endsWith('Z') ? tStr : `${tStr}Z`);
      if (!isNaN(d.getTime())) {
        const hh = d.getUTCHours().toString().padStart(2, '0');
        return `${hh}Z`;
      }
    } catch {
      // fallback
    }
    const match = tStr.match(/(\d{2}):\d{2}/);
    return match ? `${match[1]}Z` : tStr.slice(-5);
  };

  // SVG Trend Bar Chart dimensions
  const chartWidth = 320;
  const chartHeight = 85;
  const paddingX = 16;
  const paddingTop = 18;
  const paddingBottom = 20;
  const innerWidth = chartWidth - paddingX * 2;
  const innerHeight = chartHeight - paddingTop - paddingBottom;
  const maxKpScale = 9;

  return (
    <>
      {/* Space Weather Trigger Badge in Header */}
      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        aria-label="Toggle Space Weather & Planetary Kp Index Details"
        title="Live Space Weather: Planetary K-Index (NOAA SWPC). Click to inspect geomagnetic storm levels & trend."
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md font-mono text-[11px] font-medium border transition-all duration-200 cursor-pointer active:scale-95 shadow-xs ${tier.badgeBg} ${tier.borderColor} ${tier.textColor}`}
      >
        {/* Pulsing activity indicator */}
        <span className="relative flex h-2 w-2 items-center justify-center">
          {tier.category === 'red' && (
            <span
              className="absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75 animate-ping"
              aria-hidden="true"
            />
          )}
          <span
            className={`relative inline-flex rounded-full h-1.5 w-1.5 ${tier.dotColor}`}
            style={{ boxShadow: `0 0 6px ${tier.glowColor}` }}
          />
        </span>

        <Activity className="w-3 h-3 shrink-0" />

        <span className="font-bold tracking-tight">
          {kp !== null ? `Kp ${kp.toFixed(1)}` : 'Kp --'}
        </span>

        <span className="hidden xs:inline text-[10px] opacity-80 uppercase tracking-wider font-semibold">
          {tier.shortLabel}
        </span>
      </button>

      {/* Centered Modal Overlay mounted directly to document.body via Portal to prevent any parent clipping */}
      {isModalOpen &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-150"
            onClick={() => setIsModalOpen(false)}
          >
            {/* Modal Card with Clear Dimensions: min-w-[320px] p-4 bg-slate-900 rounded-lg shadow-xl border border-slate-700 */}
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="kp-modal-title"
              className="min-w-[320px] max-w-md w-full p-4 bg-slate-900 rounded-lg shadow-xl border border-slate-700 text-slate-100 font-sans text-xs select-none relative animate-in zoom-in-95 duration-150"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${tier.dotColor}`} style={{ boxShadow: `0 0 8px ${tier.glowColor}` }} />
                  <h3 id="kp-modal-title" className="font-semibold text-white tracking-wide text-sm flex items-center gap-1.5">
                    <span>Planetary K-Index (Kp)</span>
                    <span className="text-[11px] font-mono text-slate-400 font-normal">· Space Weather</span>
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition cursor-pointer"
                  aria-label="Close space weather dialog"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Primary Status Card: Current Kp Value & NOAA Geomagnetic Storm Scale */}
              <div className={`p-3.5 rounded-lg border mb-3 ${tier.badgeBg} ${tier.borderColor}`}>
                <div className="flex items-baseline justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-0.5">
                      Current Planetary Kp Index
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className={`text-2xl font-bold font-mono tracking-tight ${tier.textColor}`}>
                        {kp !== null ? `Kp ${kp.toFixed(1)}` : 'Loading...'}
                      </span>
                      {kp !== null && (
                        <span className="text-xs font-mono text-slate-400">
                          ({kp.toFixed(2)})
                        </span>
                      )}
                    </div>
                  </div>

                  {/* NOAA Scale Badge */}
                  <div className="text-right">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-0.5">
                      NOAA Scale
                    </span>
                    <span className={`inline-block px-2.5 py-1 rounded-md text-[11px] font-mono font-bold uppercase border ${tier.borderColor} ${tier.textColor} bg-slate-950/60 shadow-xs`}>
                      {tier.stormScale}
                    </span>
                  </div>
                </div>
              </div>

              {/* Short Description: What the Kp value means */}
              <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 text-[11.5px] leading-relaxed text-slate-300 mb-3 space-y-1.5">
                <div className="flex items-center gap-1.5 text-amber-400 font-semibold text-[11px]">
                  <Info className="w-3.5 h-3.5 shrink-0" />
                  <span>What Does the Kp Index Mean?</span>
                </div>
                <p>
                  The <strong>Planetary K-index (Kp)</strong> quantifies geomagnetic disturbances in Earth's magnetosphere on an open 0 to 9 scale. Calculated every 3 hours from ground magnetometer stations worldwide, it monitors solar wind pressure and coronal mass ejections (CMEs).
                </p>
                <div className="grid grid-cols-2 gap-1.5 pt-1 text-[10.5px] font-mono border-t border-slate-800/80 text-slate-400">
                  <div>• <span className="text-emerald-400">Kp &lt; 4</span>: Quiet (G0)</div>
                  <div>• <span className="text-yellow-400">Kp 4</span>: Active / Unsettled</div>
                  <div>• <span className="text-orange-400">Kp 5–6</span>: Minor–Mod Storm (G1–G2)</div>
                  <div>• <span className="text-rose-400">Kp 7+</span>: Major–Extreme Storm (G3–G5)</div>
                </div>
              </div>

              {/* SVG / Bar Chart: Recent Trend Levels (Last 24 Hours) */}
              <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 mb-3">
                <div className="flex items-center justify-between text-[11px] font-mono mb-2">
                  <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-sky-400" />
                    <span>Recent 24h Kp Trend (3-Hour Blocks)</span>
                  </span>
                  <span className="text-[10px] text-slate-400">0 to 9 Scale</span>
                </div>

                {recentSeries && recentSeries.length > 0 ? (
                  <div className="w-full flex justify-center overflow-x-auto">
                    <svg
                      viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                      className="w-full max-w-[340px] h-auto overflow-visible"
                    >
                      {/* Storm Threshold Line at Kp 5 (G1) */}
                      <line
                        x1={paddingX}
                        y1={paddingTop + innerHeight * (1 - 5 / maxKpScale)}
                        x2={chartWidth - paddingX}
                        y2={paddingTop + innerHeight * (1 - 5 / maxKpScale)}
                        stroke="#f97316"
                        strokeDasharray="3 3"
                        strokeWidth="1"
                        strokeOpacity="0.5"
                      />
                      <text
                        x={chartWidth - paddingX}
                        y={paddingTop + innerHeight * (1 - 5 / maxKpScale) - 3}
                        fill="#f97316"
                        fontSize="8"
                        textAnchor="end"
                        fontFamily="monospace"
                        opacity="0.8"
                      >
                        G1 Storm (Kp 5)
                      </text>

                      {/* Active Threshold Line at Kp 4 */}
                      <line
                        x1={paddingX}
                        y1={paddingTop + innerHeight * (1 - 4 / maxKpScale)}
                        x2={chartWidth - paddingX}
                        y2={paddingTop + innerHeight * (1 - 4 / maxKpScale)}
                        stroke="#facc15"
                        strokeDasharray="2 2"
                        strokeWidth="0.8"
                        strokeOpacity="0.4"
                      />

                      {/* Baseline Axis */}
                      <line
                        x1={paddingX}
                        y1={paddingTop + innerHeight}
                        x2={chartWidth - paddingX}
                        y2={paddingTop + innerHeight}
                        stroke="#334155"
                        strokeWidth="1"
                      />

                      {/* Individual 3-Hour Bars */}
                      {recentSeries.map((item, idx) => {
                        const totalBars = recentSeries.length;
                        const slotWidth = innerWidth / totalBars;
                        const barWidth = Math.max(12, slotWidth * 0.65);
                        const x = paddingX + idx * slotWidth + (slotWidth - barWidth) / 2;
                        const clampedKp = Math.max(0, Math.min(maxKpScale, item.kp));
                        const barHeight = Math.max(4, (clampedKp / maxKpScale) * innerHeight);
                        const y = paddingTop + innerHeight - barHeight;
                        const itemTier = getKpTier(item.kp);
                        const isLatest = idx === totalBars - 1;

                        return (
                          <g key={`${item.timeTag}-${idx}`} className="group cursor-pointer">
                            {/* Bar Background Slot */}
                            <rect
                              x={x}
                              y={paddingTop}
                              width={barWidth}
                              height={innerHeight}
                              fill="#1e293b"
                              fillOpacity="0.3"
                              rx="2"
                            />

                            {/* Active Data Bar */}
                            <rect
                              x={x}
                              y={y}
                              width={barWidth}
                              height={barHeight}
                              fill={itemTier.barColor}
                              rx="2"
                              className="transition-all duration-300"
                              stroke={isLatest ? '#ffffff' : 'none'}
                              strokeWidth={isLatest ? '1.5' : '0'}
                            />

                            {/* Top Kp Value */}
                            <text
                              x={x + barWidth / 2}
                              y={y - 3}
                              fill={itemTier.barColor}
                              fontSize="8"
                              fontWeight={isLatest ? 'bold' : 'normal'}
                              textAnchor="middle"
                              fontFamily="monospace"
                            >
                              {item.kp.toFixed(1)}
                            </text>

                            {/* Bottom Time Tag Label */}
                            <text
                              x={x + barWidth / 2}
                              y={paddingTop + innerHeight + 12}
                              fill={isLatest ? '#f8fafc' : '#94a3b8'}
                              fontSize="8"
                              fontWeight={isLatest ? 'bold' : 'normal'}
                              textAnchor="middle"
                              fontFamily="monospace"
                            >
                              {formatBarTime(item.timeTag)}
                            </text>
                          </g>
                        );
                      })}
                    </svg>
                  </div>
                ) : (
                  <div className="h-16 flex items-center justify-center text-slate-500 font-mono text-xs">
                    Loading trend history from NOAA SWPC...
                  </div>
                )}
              </div>

              {/* Observation Metadata & Links */}
              <div className="space-y-1.5 text-[11px] text-slate-300 font-mono bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80 mb-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Observation Time:</span>
                  <span className="text-slate-200 text-right truncate ml-2">
                    {formattedObsTime || 'Live feed synced'}
                  </span>
                </div>
                {stationCount !== null && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Reporting Observatories:</span>
                    <span className="text-slate-200">{stationCount} global ground stations</span>
                  </div>
                )}
              </div>

              {/* Action Buttons Row */}
              <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => refresh()}
                  disabled={loading}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white transition text-xs font-mono cursor-pointer active:scale-95 disabled:opacity-50"
                >
                  <RotateCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-amber-400' : ''}`} />
                  <span>{loading ? 'Refreshing...' : 'Refresh NOAA Data'}</span>
                </button>

                <a
                  href="https://www.swpc.noaa.gov/products/planetary-k-index"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 text-xs font-mono text-sky-400 hover:text-sky-300 transition"
                >
                  <span>NOAA SWPC</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {error && (
                <div className="mt-2 text-[10px] text-rose-400 font-mono leading-tight flex items-center gap-1">
                  <Info className="w-3 h-3 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </div>
          </div>,
          document.body
        )}
    </>
  );
};
