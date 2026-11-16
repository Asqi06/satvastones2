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

export default function RingSizeModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'screen' | 'chart' | 'bangle'>('screen');
  const [diameterSlider, setDiameterSlider] = useState<number>(17.3); // default size 14 (17.3mm)

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('satvastones:open_ring_sizer', handleOpen);
    return () => window.removeEventListener('satvastones:open_ring_sizer', handleOpen);
  }, []);

  if (!isOpen) return null;

  // Find closest size matching current diameter slider
  const closestSize = RING_SIZES.reduce((prev, curr) => {
    return Math.abs(curr.diameterMm - diameterSlider) < Math.abs(prev.diameterMm - diameterSlider) ? curr : prev;
  }, RING_SIZES[0]);

  // Scale pixels for visual screen representation (~3.78 px per mm on standard 96dpi/screen CSS px)
  const pixelDiameter = Math.round(diameterSlider * 5.6);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white w-full max-w-xl rounded-[24px] shadow-2xl border border-gray-100 overflow-hidden">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center text-[#f2707f]">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 100-18 9 9 0 000 18z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m-3-3h6" />
              </svg>
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-gray-900">Interactive Jewellery Size Finder</h2>
              <p className="text-[11px] text-gray-500">Find your exact Indian ring and bangle measurements</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-400 hover:text-black p-2 rounded-lg cursor-pointer"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-gray-100 bg-gray-50 text-xs font-bold">
          <button
            onClick={() => setActiveTab('screen')}
            className={`flex-1 py-3 text-center transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'screen'
                ? 'bg-white text-[#f2707f] border-b-2 border-[#f2707f]'
                : 'text-gray-500 hover:text-black'
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
            </svg>
            <span>Screen Sizer</span>
          </button>
          <button
            onClick={() => setActiveTab('chart')}
            className={`flex-1 py-3 text-center transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'chart'
                ? 'bg-white text-[#f2707f] border-b-2 border-[#f2707f]'
                : 'text-gray-500 hover:text-black'
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
            <span>Ring Table</span>
          </button>
          <button
            onClick={() => setActiveTab('bangle')}
            className={`flex-1 py-3 text-center transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'bangle'
                ? 'bg-white text-[#f2707f] border-b-2 border-[#f2707f]'
                : 'text-gray-500 hover:text-black'
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 100-18 9 9 0 000 18z" />
            </svg>
            <span>Bangle Sizer</span>
          </button>
        </div>

        {/* Tab 1: Screen Ring Placement Tool */}
        {activeTab === 'screen' && (
          <div className="p-6 space-y-6 text-center">
            <div className="space-y-1">
              <span class="text-xs bg-[#ffe7e9] text-[#a1505a] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Method 1: Direct Screen Matching
              </span>
              <p className="text-xs text-gray-600 max-w-sm mx-auto pt-1 leading-relaxed">
                Place an existing ring flat against your screen on top of the circle below. Drag the slider until the pink circle matches the <strong>inner rim</strong> of your ring.
              </p>
            </div>

            {/* Interactive Sizing Target Circle */}
            <div className="h-44 flex items-center justify-center bg-[#fffafb] border border-[#f9d8dc] rounded-[20px] relative overflow-hidden">
              <div
                className="rounded-full border-3 border-[#f2707f] bg-[#ffe7e9]/40 flex items-center justify-center transition-all duration-75 relative shadow-inner"
                style={{ width: `${pixelDiameter}px`, height: `${pixelDiameter}px` }}
              >
                <span className="text-[10px] font-bold text-[#a1505a]">
                  {diameterSlider.toFixed(1)} mm
                </span>
              </div>
            </div>

            {/* Slider */}
            <div className="space-y-2 max-w-xs mx-auto">
              <input
                type="range"
                min="15.0"
                max="21.5"
                step="0.1"
                value={diameterSlider}
                onChange={(e) => setDiameterSlider(parseFloat(e.target.value))}
                className="w-full accent-[#f2707f] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-gray-400">
                <span>Smaller (15mm)</span>
                <span>Larger (21.5mm)</span>
              </div>
            </div>

            {/* Live Size Match Output Box */}
            <div className="grid grid-cols-3 gap-3 p-4 bg-gray-50 rounded-[18px] border border-gray-200">
              <div>
                <p className="text-[10px] uppercase font-bold text-gray-400">Indian Size</p>
                <p className="text-xl font-extrabold text-[#f2707f]">Size {closestSize.indian}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-gray-400">US Standard</p>
                <p className="text-xl font-extrabold text-gray-900">{closestSize.us}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-gray-400">Circumference</p>
                <p className="text-xl font-extrabold text-gray-900">{closestSize.circMm} mm</p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Full Ring Chart */}
        {activeTab === 'chart' && (
          <div className="p-5 max-h-96 overflow-y-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-gray-100 text-gray-900 font-bold border-b border-gray-200">
                  <th className="py-2.5 px-3">Indian Size</th>
                  <th className="py-2.5 px-3">US Size</th>
                  <th className="py-2.5 px-3">Inside Diameter (mm)</th>
                  <th className="py-2.5 px-3">Circumference (mm)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-600">
                {RING_SIZES.map((sz) => (
                  <tr key={sz.indian} className="hover:bg-[#fffafb]">
                    <td className="py-2.5 px-3 font-bold text-gray-900">Size {sz.indian}</td>
                    <td className="py-2.5 px-3">{sz.us}</td>
                    <td className="py-2.5 px-3">{sz.diameterMm} mm</td>
                    <td className="py-2.5 px-3">{sz.circMm} mm</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 3: Bangle Sizing */}
        {activeTab === 'bangle' && (
          <div className="p-6 space-y-4 text-xs text-gray-600">
            <h3 className="font-bold text-sm text-gray-900">Standard Indian Bangle & Kada Sizes</h3>
            <p className="leading-relaxed">
              To measure your bangle size, tuck your thumb into the palm of your hand (as if slipping a bangle on) and measure around the widest part with a tape measure.
            </p>
            <div className="space-y-2 pt-2">
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl flex justify-between items-center">
                <div>
                  <p className="font-bold text-gray-900">Size 2-4 (Small)</p>
                  <p className="text-[11px] text-gray-500">Inner Diameter: 2.25 inches (57.2 mm)</p>
                </div>
                <span className="text-xs font-bold text-[#f2707f]">Petite Wrists</span>
              </div>
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl flex justify-between items-center">
                <div>
                  <p className="font-bold text-gray-900">Size 2-6 (Medium / Most Popular)</p>
                  <p className="text-[11px] text-gray-500">Inner Diameter: 2.375 inches (60.3 mm)</p>
                </div>
                <span className="text-xs font-bold text-[#007c52]">Universal Fit</span>
              </div>
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl flex justify-between items-center">
                <div>
                  <p className="font-bold text-gray-900">Size 2-8 (Large)</p>
                  <p className="text-[11px] text-gray-500">Inner Diameter: 2.5 inches (63.5 mm)</p>
                </div>
                <span className="text-xs font-bold text-gray-700">Relaxed Fit</span>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
          <p className="text-[11px] text-gray-500">All SatvaStones rings feature comfort-fit smooth inner bands.</p>
          <button
            onClick={() => setIsOpen(false)}
            className="bg-[#f2707f] hover:bg-[#e05e6d] text-white px-5 py-2 text-xs font-bold uppercase tracking-wider rounded-xl cursor-pointer"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
}
