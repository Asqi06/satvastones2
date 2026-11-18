import React, { useState, useEffect } from 'react';

const RING_SIZES = [
  { indian: '10', us: '5.0', diameterMm: 15.7, circMm: 49.3 },
  { indian: '11', us: '5.5', diameterMm: 16.1, circMm: 50.6 },
  { indian: '12', us: '6.0', diameterMm: 16.5, circMm: 51.9 },
  { indian: '13', us: '6.5', diameterMm: 16.9, circMm: 53.1 },
  { indian: '14', us: '7.0', diameterMm: 17.3, circMm: 54.4 },
  { indian: '15', us: '7.5', diameterMm: 17.7, circMm: 55.7 },
  { indian: '16', us: '8.0', diameterMm: 18.1, circMm: 57.0 },
  { indian: '17', us: '8.5', diameterMm: 18.5, circMm: 58.3 },
  { indian: '18', us: '9.0', diameterMm: 19.0, circMm: 59.5 },
  { indian: '19', us: '9.5', diameterMm: 19.4, circMm: 60.8 },
  { indian: '20', us: '10.0', diameterMm: 19.8, circMm: 62.1 },
  { indian: '21', us: '10.5', diameterMm: 20.2, circMm: 63.4 },
  { indian: '22', us: '11.0', diameterMm: 20.6, circMm: 64.6 }
];

const TABS = [
  { id: 'screen' as const, label: 'Screen sizer' },
  { id: 'chart' as const, label: 'Ring table' },
  { id: 'bangle' as const, label: 'Bangle' }
];

export default function RingSizeModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'screen' | 'chart' | 'bangle'>('screen');
  const [diameterSlider, setDiameterSlider] = useState<number>(17.3); // default size 14 (17.3mm)

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('satvastones:open_ring_sizer', handleOpen);
    return () => window.removeEventListener('satvastones:open_ring_sizer', handleOpen);
  }, []);

  // Lock the page and allow Escape while the modal is open.
  useEffect(() => {
    if (!isOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener('keydown', onKey);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Find closest size matching current diameter slider
  const closestSize = RING_SIZES.reduce((prev, curr) => {
    return Math.abs(curr.diameterMm - diameterSlider) < Math.abs(prev.diameterMm - diameterSlider) ? curr : prev;
  }, RING_SIZES[0]);

  // Scale pixels for visual screen representation (~3.78 px per mm on standard 96dpi/screen CSS px)
  const pixelDiameter = Math.round(diameterSlider * 5.6);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#14110f]/75 p-3 backdrop-blur-sm sm:p-6"
      onClick={() => setIsOpen(false)}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="ring-sizer-title"
        className="w-full max-w-xl overflow-hidden border border-[#e5ded3] bg-[#fbf9f5] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-[#e5ded3] px-5 py-4 sm:px-6">
          <div>
            <p className="text-[9px] uppercase tracking-[0.2em] text-[#c5a059]">Fit, measured</p>
            <h2
              id="ring-sizer-title"
              className="font-display mt-1 text-[1.5rem] leading-none text-[#14110f]"
            >
              Ring &amp; bangle size finder
            </h2>
            <p className="mt-1.5 text-[11px] leading-relaxed text-[#8a8279]">
              Exact Indian sizing, verified against US diameter and circumference.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center border border-[#d8d0c4] text-[#6f675f] transition-colors hover:border-[#14110f] hover:text-[#14110f]"
            aria-label="Close size finder"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-[#e5ded3]">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 cursor-pointer border-b-2 px-2 py-3 text-[9px] uppercase tracking-[0.14em] transition-colors sm:text-[10px] ${
                activeTab === tab.id
                  ? 'border-[#14110f] text-[#14110f]'
                  : 'border-transparent text-[#8a8279] hover:text-[#14110f]'
              }`}
              aria-pressed={activeTab === tab.id}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab 1: Screen Ring Placement Tool */}
        {activeTab === 'screen' && (
          <div className="space-y-6 p-5 text-center sm:p-6">
            <div>
              <p className="text-[9px] uppercase tracking-[0.18em] text-[#8d3f3d]">
                Method 01 — direct screen matching
              </p>
              <p className="mx-auto mt-2 max-w-sm text-[11.5px] leading-relaxed text-[#5f5851]">
                Place an existing ring flat on the screen, over the circle below. Drag until the gold
                outline matches the <strong className="font-medium text-[#14110f]">inner rim</strong> of
                your ring.
              </p>
            </div>

            {/* Interactive Sizing Target Circle */}
            <div className="relative flex h-44 items-center justify-center overflow-hidden border border-[#e5ded3] bg-[#f4efe7]">
              <div
                className="relative flex items-center justify-center rounded-full border-2 border-[#c5a059] bg-[#c5a059]/10 transition-all duration-75"
                style={{ width: `${pixelDiameter}px`, height: `${pixelDiameter}px` }}
              >
                <span className="text-[10px] font-medium text-[#8a5314]">
                  {diameterSlider.toFixed(1)} mm
                </span>
              </div>
            </div>

            {/* Slider */}
            <div className="mx-auto max-w-xs space-y-2">
              <input
                type="range"
                min="15.0"
                max="21.5"
                step="0.1"
                value={diameterSlider}
                onChange={(e) => setDiameterSlider(parseFloat(e.target.value))}
                className="w-full cursor-pointer accent-[#14110f]"
                aria-label="Ring inside diameter in millimetres"
              />
              <div className="flex justify-between text-[9px] uppercase tracking-[0.12em] text-[#8a8279]">
                <span>Smaller · 15mm</span>
                <span>Larger · 21.5mm</span>
              </div>
            </div>

            {/* Live Size Match Output Box */}
            <div className="grid grid-cols-3 gap-px border border-[#e5ded3] bg-[#e5ded3]">
              <div className="bg-white px-3 py-3.5">
                <p className="text-[8.5px] uppercase tracking-[0.14em] text-[#8a8279]">Indian size</p>
                <p className="font-display mt-1 text-[1.4rem] leading-none text-[#8d3f3d]">
                  {closestSize.indian}
                </p>
              </div>
              <div className="bg-white px-3 py-3.5">
                <p className="text-[8.5px] uppercase tracking-[0.14em] text-[#8a8279]">US size</p>
                <p className="font-display mt-1 text-[1.4rem] leading-none text-[#14110f]">
                  {closestSize.us}
                </p>
              </div>
              <div className="bg-white px-3 py-3.5">
                <p className="text-[8.5px] uppercase tracking-[0.14em] text-[#8a8279]">Circumference</p>
                <p className="font-display mt-1 text-[1.4rem] leading-none text-[#14110f]">
                  {closestSize.circMm}
                  <span className="ml-0.5 text-[10px] tracking-normal text-[#8a8279]">mm</span>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Full Ring Chart */}
        {activeTab === 'chart' && (
          <div className="max-h-96 overflow-y-auto p-4 sm:p-5">
            <table className="w-full border-collapse text-left text-[11.5px]">
              <thead>
                <tr>
                  <th className="border border-[#e5ded3] bg-[#f4efe7] px-3 py-2 text-[8.5px] font-medium uppercase tracking-[0.12em] text-[#6f675f]">
                    Indian
                  </th>
                  <th className="border border-[#e5ded3] bg-[#f4efe7] px-3 py-2 text-[8.5px] font-medium uppercase tracking-[0.12em] text-[#6f675f]">
                    US
                  </th>
                  <th className="border border-[#e5ded3] bg-[#f4efe7] px-3 py-2 text-[8.5px] font-medium uppercase tracking-[0.12em] text-[#6f675f]">
                    Inside ⌀
                  </th>
                  <th className="border border-[#e5ded3] bg-[#f4efe7] px-3 py-2 text-[8.5px] font-medium uppercase tracking-[0.12em] text-[#6f675f]">
                    Circumference
                  </th>
                </tr>
              </thead>
              <tbody>
                {RING_SIZES.map((sz) => (
                  <tr key={sz.indian} className="transition-colors hover:bg-[#f4efe7]">
                    <td className="border border-[#e5ded3] px-3 py-2 font-medium text-[#14110f]">
                      {sz.indian}
                    </td>
                    <td className="border border-[#e5ded3] px-3 py-2 text-[#5f5851]">{sz.us}</td>
                    <td className="border border-[#e5ded3] px-3 py-2 text-[#5f5851]">
                      {sz.diameterMm} mm
                    </td>
                    <td className="border border-[#e5ded3] px-3 py-2 text-[#5f5851]">
                      {sz.circMm} mm
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 3: Bangle Sizing */}
        {activeTab === 'bangle' && (
          <div className="space-y-4 p-5 text-[11.5px] leading-relaxed text-[#5f5851] sm:p-6">
            <div>
              <p className="text-[9px] uppercase tracking-[0.18em] text-[#c5a059]">Kada & bangle sizing</p>
              <h3 className="font-display mt-1 text-[1.25rem] leading-tight text-[#14110f]">
                Standard Indian sizes.
              </h3>
            </div>
            <p>
              Tuck your thumb into your palm, as if slipping a bangle on, then measure around the
              widest part with a tape measure.
            </p>

            <div className="divide-y divide-[#e5ded3] border-y border-[#e5ded3]">
              {[
                { name: 'Size 2-4 · Small', dia: '2.25 in (57.2 mm)', fit: 'Petite wrists' },
                { name: 'Size 2-6 · Medium', dia: '2.375 in (60.3 mm)', fit: 'Most popular' },
                { name: 'Size 2-8 · Large', dia: '2.5 in (63.5 mm)', fit: 'Relaxed fit' }
              ].map((item) => (
                <div key={item.name} className="flex items-center justify-between gap-3 py-3">
                  <div>
                    <p className="text-[12px] font-medium text-[#14110f]">{item.name}</p>
                    <p className="mt-0.5 text-[10.5px] text-[#8a8279]">Inner diameter: {item.dia}</p>
                  </div>
                  <span className="shrink-0 border border-[#e6d6bb] bg-[#faf3e6] px-2 py-0.5 text-[8px] uppercase tracking-[0.1em] text-[#8a5314]">
                    {item.fit}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex flex-col items-start justify-between gap-3 border-t border-[#e5ded3] bg-[#f4efe7] px-5 py-4 sm:flex-row sm:items-center sm:px-6">
          <p className="text-[10px] leading-relaxed text-[#8a8279]">
            Every Satvastones ring has a comfort-fit smooth inner band.
          </p>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="cursor-pointer bg-[#14110f] px-6 py-2.5 text-[9px] uppercase tracking-[0.14em] text-[#f6f1e8] transition-colors hover:bg-[#8d3f3d]"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
