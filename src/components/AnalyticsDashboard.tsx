import React, { useState, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const funnelSteps = [
  { key: 'page_view', label: 'Visits', color: 'bg-blue-500' },
  { key: 'view_product', label: 'View Product', color: 'bg-indigo-500' },
  { key: 'add_to_cart', label: 'Add to Cart', color: 'bg-amber-500' },
  { key: 'checkout_start', label: 'Checkout', color: 'bg-orange-500' },
  { key: 'purchase', label: 'Purchase', color: 'bg-emerald-500' },
];

export default function AnalyticsDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [recentEvents, setRecentEvents] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [eventFilter, setEventFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [eventPage, setEventPage] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const [statsRes, eventsRes, sessionsRes] = await Promise.all([
        fetch(`${API_URL}/analytics/stats`),
        fetch(`${API_URL}/analytics/events?page=${eventPage}&limit=30${eventFilter ? `&eventType=${eventFilter}` : ''}`),
        fetch(`${API_URL}/analytics/sessions`),
      ]);
      if (statsRes.ok) setStats(await statsRes.json());
      if (eventsRes.ok) setRecentEvents((await eventsRes.json()).events || []);
      if (sessionsRes.ok) setSessions((await sessionsRes.json()).sessions || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetchStats(); }, [eventPage, eventFilter, refreshKey]);

  const clearAnalytics = async () => {
    if (!confirm('Delete ALL analytics data? This cannot be undone.')) return;
    await fetch(`${API_URL}/analytics/events`, { method: 'DELETE' });
    setRefreshKey(k => k + 1);
  };

  const getFunnelCount = (key: string) => {
    if (!stats?.funnel) return 0;
    const entry = stats.funnel.find((f: any) => f._id === key);
    return entry ? entry.count : 0;
  };

  const topFunnel = getFunnelCount('page_view');

  return (
    <div className="p-4 md:p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-stone-400">Behavior Analytics</h3>
          <p className="text-[10px] text-stone-400 mt-1">Every click, scroll, and page view is tracked</p>
        </div>
        <button onClick={clearAnalytics} className="text-[10px] font-bold uppercase tracking-widest text-red-500 hover:text-red-700 border border-red-200 px-4 py-2 rounded-sm hover:bg-red-50 transition-all">Clear Data</button>
      </div>

      {loading && !stats ? (
        <div className="text-center py-20 text-[10px] uppercase tracking-widest text-stone-400 animate-pulse">Loading analytics...</div>
      ) : (
        <>
          {/* Overview Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4">
            <div className="bg-stone-50 p-4 md:p-6 border border-stone-200 rounded-sm">
              <p className="text-[9px] font-bold uppercase tracking-widest text-stone-400 mb-1">Total Events</p>
              <h4 className="font-display text-2xl md:text-3xl font-bold tracking-tighter">{(stats?.totals?.events || 0).toLocaleString()}</h4>
            </div>
            <div className="bg-stone-50 p-4 md:p-6 border border-stone-200 rounded-sm">
              <p className="text-[9px] font-bold uppercase tracking-widest text-stone-400 mb-1">Page Views</p>
              <h4 className="font-display text-2xl md:text-3xl font-bold tracking-tighter">{(stats?.totals?.pageViews || 0).toLocaleString()}</h4>
            </div>
            <div className="bg-stone-50 p-4 md:p-6 border border-stone-200 rounded-sm">
              <p className="text-[9px] font-bold uppercase tracking-widest text-stone-400 mb-1">Clicks</p>
              <h4 className="font-display text-2xl md:text-3xl font-bold tracking-tighter">{(stats?.totals?.clicks || 0).toLocaleString()}</h4>
            </div>
            <div className="bg-stone-50 p-4 md:p-6 border border-stone-200 rounded-sm">
              <p className="text-[9px] font-bold uppercase tracking-widest text-stone-400 mb-1">Sessions</p>
              <h4 className="font-display text-2xl md:text-3xl font-bold tracking-tighter">{(stats?.totals?.sessions || 0).toLocaleString()}</h4>
            </div>
            <div className="bg-stone-50 p-4 md:p-6 border border-stone-200 rounded-sm">
              <p className="text-[9px] font-bold uppercase tracking-widest text-stone-400 mb-1">Last 24h Events</p>
              <h4 className="font-display text-2xl md:text-3xl font-bold tracking-tighter">{(stats?.last24h?.events || 0).toLocaleString()}</h4>
            </div>
          </div>

          {/* Conversion Funnel */}
          <div className="bg-stone-50 p-6 border border-stone-200 rounded-sm">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-500 mb-6">Conversion Funnel</h4>
            <div className="space-y-3">
              {funnelSteps.map((step, i) => {
                const count = getFunnelCount(step.key);
                const pct = topFunnel > 0 ? (count / topFunnel) * 100 : 0;
                const prevCount = i > 0 ? getFunnelCount(funnelSteps[i - 1].key) : topFunnel;
                const convPct = prevCount > 0 ? Math.round((count / prevCount) * 100) : 0;
                return (
                  <div key={step.key} className="space-y-1">
                    <div className="flex items-center justify-between text-[10px] md:text-xs">
                      <span className="font-bold uppercase tracking-wider text-stone-600 flex items-center gap-2">
                        {i > 0 && <ChevronRight className="h-3 w-3 text-stone-300" />}
                        {step.label}
                      </span>
                      <span className="text-stone-900 font-bold">{count.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-stone-200 h-2 rounded-sm overflow-hidden">
                      <div className={`h-full ${step.color} transition-all duration-500 rounded-sm`} style={{ width: `${Math.max(pct, 1)}%` }} />
                    </div>
                    <div className="flex justify-between text-[8px] text-stone-400">
                      <span>of total visits: {pct.toFixed(1)}%</span>
                      {i > 0 && <span>from previous: {convPct}%</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Two columns: Clicks + Scroll */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Most Clicked Elements */}
            <div className="bg-stone-50 p-6 border border-stone-200 rounded-sm">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-500 mb-4">Most Clicked Elements</h4>
              {stats?.clickHeatmap?.length > 0 ? (
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {stats.clickHeatmap.slice(0, 30).map((item: any, i: number) => (
                    <div key={i} className="flex items-center justify-between border-b border-stone-200 pb-2 gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-[9px] font-mono text-stone-700 truncate" title={item._id.selector}>{item._id.selector}</p>
                        <p className="text-[8px] text-stone-400 truncate">Page: {item._id.page}</p>
                        {item.texts?.filter(Boolean).length > 0 && (
                          <p className="text-[8px] text-stone-400 truncate">"{item.texts.filter(Boolean)[0]}"</p>
                        )}
                      </div>
                      <span className="text-xs font-bold text-stone-900 shrink-0">{item.count}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[10px] text-stone-400 italic">No click data yet. Browse the site to collect data.</p>
              )}
            </div>

            {/* Scroll Depth Distribution */}
            <div className="bg-stone-50 p-6 border border-stone-200 rounded-sm">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-500 mb-4">Scroll Depth</h4>
              {stats?.scrollDepths?.length > 0 ? (
                <div className="space-y-3">
                  {[25, 50, 75, 90, 100].map(depth => {
                    const entry = stats.scrollDepths.find((s: any) => s._id === depth);
                    const count = entry ? entry.count : 0;
                    const maxCount = Math.max(...stats.scrollDepths.map((s: any) => s.count), 1);
                    const pct = (count / maxCount) * 100;
                    return (
                      <div key={depth} className="space-y-1">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="font-bold text-stone-600">{depth}%</span>
                          <span className="text-stone-500">{count.toLocaleString()} users</span>
                        </div>
                        <div className="w-full bg-stone-200 h-3 rounded-sm overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-indigo-400 to-purple-500 rounded-sm transition-all" style={{ width: `${Math.max(pct, 1)}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-[10px] text-stone-400 italic">No scroll data yet. Scroll the site to collect data.</p>
              )}
            </div>
          </div>

          {/* Page Views Breakdown */}
          <div className="bg-stone-50 p-6 border border-stone-200 rounded-sm">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-500 mb-4">Page Views by URL</h4>
            {stats?.pageViewsPerPage?.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[10px]">
                  <thead>
                    <tr className="border-b border-stone-300">
                      <th className="pb-2 font-bold uppercase tracking-wider text-stone-500">Page</th>
                      <th className="pb-2 font-bold uppercase tracking-wider text-stone-500 text-right">Views</th>
                      <th className="pb-2 font-bold uppercase tracking-wider text-stone-500 text-right">%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.pageViewsPerPage.map((p: any, i: number) => {
                      const total = stats.totals.pageViews || 1;
                      return (
                        <tr key={i} className="border-b border-stone-200">
                          <td className="py-2 text-stone-700 truncate max-w-[300px]">{p._id || '/'}</td>
                          <td className="py-2 text-right font-bold text-stone-900">{p.count}</td>
                          <td className="py-2 text-right text-stone-500">{((p.count / total) * 100).toFixed(1)}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-[10px] text-stone-400 italic">No page view data yet.</p>
            )}
          </div>

          {/* Sessions */}
          <div className="bg-stone-50 p-6 border border-stone-200 rounded-sm">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-500 mb-4">Recent Sessions</h4>
            {sessions.length > 0 ? (
              <div className="overflow-x-auto max-h-96 overflow-y-auto">
                <table className="w-full text-left text-[10px]">
                  <thead className="sticky top-0 bg-stone-50">
                    <tr className="border-b border-stone-300">
                      <th className="pb-2 font-bold uppercase tracking-wider text-stone-500">Session</th>
                      <th className="pb-2 font-bold uppercase tracking-wider text-stone-500 text-right">Events</th>
                      <th className="pb-2 font-bold uppercase tracking-wider text-stone-500 text-right">Views</th>
                      <th className="pb-2 font-bold uppercase tracking-wider text-stone-500 text-right">Clicks</th>
                      <th className="pb-2 font-bold uppercase tracking-wider text-stone-500">Pages</th>
                      <th className="pb-2 font-bold uppercase tracking-wider text-stone-500">Last Activity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sessions.map((s: any, i: number) => (
                      <tr key={i} className="border-b border-stone-200 hover:bg-stone-100">
                        <td className="py-2 font-mono text-stone-700 text-[8px]">{s._id.slice(0, 12)}...</td>
                        <td className="py-2 text-right font-bold text-stone-900">{s.events}</td>
                        <td className="py-2 text-right text-stone-600">{s.pageViews}</td>
                        <td className="py-2 text-right text-stone-600">{s.clicks}</td>
                        <td className="py-2 text-stone-600 truncate max-w-[200px]">{s.pages?.join(', ') || '-'}</td>
                        <td className="py-2 text-stone-500">{new Date(s.lastEvent).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-[10px] text-stone-400 italic">No sessions yet.</p>
            )}
          </div>

          {/* Raw Events */}
          <div className="bg-stone-50 p-6 border border-stone-200 rounded-sm">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-500">Event Log</h4>
              <div className="flex items-center gap-3">
                <select value={eventFilter} onChange={e => { setEventFilter(e.target.value); setEventPage(1); }} className="text-[10px] border border-stone-300 bg-white px-3 py-1.5 rounded-sm uppercase tracking-wider">
                  <option value="">All Events</option>
                  <option value="page_view">Page View</option>
                  <option value="click">Click</option>
                  <option value="scroll">Scroll</option>
                  <option value="add_to_cart">Add to Cart</option>
                  <option value="view_product">View Product</option>
                  <option value="checkout_start">Checkout</option>
                  <option value="purchase">Purchase</option>
                  <option value="exit_intent">Exit Intent</option>
                </select>
              </div>
            </div>
            {recentEvents.length > 0 ? (
              <div className="overflow-x-auto max-h-96 overflow-y-auto">
                <table className="w-full text-left text-[10px]">
                  <thead className="sticky top-0 bg-stone-50">
                    <tr className="border-b border-stone-300">
                      <th className="pb-2 font-bold uppercase tracking-wider text-stone-500">Time</th>
                      <th className="pb-2 font-bold uppercase tracking-wider text-stone-500">Type</th>
                      <th className="pb-2 font-bold uppercase tracking-wider text-stone-500">Page</th>
                      <th className="pb-2 font-bold uppercase tracking-wider text-stone-500">Data</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentEvents.map((ev: any, i: number) => (
                      <tr key={i} className="border-b border-stone-200 hover:bg-stone-100">
                        <td className="py-2 text-stone-500 whitespace-nowrap">{new Date(ev.timestamp).toLocaleString()}</td>
                        <td className="py-2">
                          <span className={`inline-block px-2 py-0.5 rounded-sm text-[8px] font-bold uppercase tracking-wider ${
                            ev.eventType === 'click' ? 'bg-blue-50 text-blue-700' :
                            ev.eventType === 'page_view' ? 'bg-green-50 text-green-700' :
                            ev.eventType === 'scroll' ? 'bg-purple-50 text-purple-700' :
                            ev.eventType === 'purchase' ? 'bg-emerald-50 text-emerald-700' :
                            ev.eventType === 'add_to_cart' ? 'bg-amber-50 text-amber-700' :
                            'bg-stone-50 text-stone-600'
                          }`}>{ev.eventType}</span>
                        </td>
                        <td className="py-2 text-stone-600 truncate max-w-[200px]">{ev.page}</td>
                        <td className="py-2 text-stone-500 truncate max-w-[300px] font-mono text-[8px]">{JSON.stringify(ev.data || {}).slice(0, 120)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-[10px] text-stone-400 italic">No events yet. Browse the site to collect data.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
