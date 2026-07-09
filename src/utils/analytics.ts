const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class AnalyticsTracker {
  private sessionId: string;
  private events: any[] = [];
  private flushTimer: ReturnType<typeof setInterval> | null = null;
  private scrollDepths: Set<number> = new Set();
  private initialized = false;

  constructor() {
    this.sessionId = this.getOrCreateSessionId();
  }

  init() {
    if (this.initialized) return;
    this.initialized = true;

    document.addEventListener('click', this.handleClick, true);

    window.addEventListener('scroll', this.handleScroll, { passive: true });

    document.addEventListener('mouseleave', this.handleExitIntent);

    window.addEventListener('beforeunload', () => this.flush(true));

    this.trackPageView();

    this.flushTimer = setInterval(() => this.flush(), 5000);
  }

  destroy() {
    document.removeEventListener('click', this.handleClick, true);
    window.removeEventListener('scroll', this.handleScroll);
    document.removeEventListener('mouseleave', this.handleExitIntent);
    if (this.flushTimer) clearInterval(this.flushTimer);
    this.flush(true);
  }

  private getOrCreateSessionId(): string {
    let id = localStorage.getItem('_sid');
    if (!id) {
      id = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
      localStorage.setItem('_sid', id);
    }
    return id;
  }

  private handleClick = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    const selector = this.getElementSelector(target);
    this.events.push({
      eventType: 'click',
      page: window.location.pathname,
      timestamp: new Date().toISOString(),
      data: {
        selector,
        tagName: target.tagName,
        id: target.id || undefined,
        text: (target.textContent || '').trim().slice(0, 120) || undefined,
        className: target.className && typeof target.className === 'string' ? target.className.split(' ').filter(Boolean).slice(0, 3).join('.') : undefined,
        x: Math.round(e.clientX),
        y: Math.round(e.clientY),
      }
    });
  };

  private handleScroll = () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (docHeight <= 0) return;
    const percent = Math.round((scrollTop / docHeight) * 100);
    const milestones = [25, 50, 75, 90, 100];
    for (const m of milestones) {
      if (percent >= m && !this.scrollDepths.has(m)) {
        this.scrollDepths.add(m);
        this.events.push({
          eventType: 'scroll',
          page: window.location.pathname,
          timestamp: new Date().toISOString(),
          data: { depth: m }
        });
      }
    }
  };

  private handleExitIntent = () => {
    this.events.push({
      eventType: 'exit_intent',
      page: window.location.pathname,
      timestamp: new Date().toISOString(),
      data: {}
    });
    this.flush();
  };

  trackPageView() {
    this.events.push({
      eventType: 'page_view',
      page: window.location.pathname,
      timestamp: new Date().toISOString(),
      data: {
        referrer: document.referrer || undefined,
        title: document.title,
        url: window.location.href,
      }
    });
  }

  trackCustom(eventType: string, data?: any) {
    this.events.push({
      eventType,
      page: window.location.pathname,
      timestamp: new Date().toISOString(),
      data: data || {}
    });
  }

  private getElementSelector(el: HTMLElement | null): string {
    if (!el || el === document.body) return 'body';
    if (el.id) return `#${el.id}`;
    if (el.hasAttribute?.('data-analytics')) return `[data-analytics="${el.getAttribute('data-analytics')}"]`;
    const parent = el.parentElement;
    if (parent) {
      const parentSelector = this.getElementSelector(parent);
      const siblings = Array.from(parent.children).filter(c => c.tagName === el.tagName);
      const idx = siblings.indexOf(el) + 1;
      return `${parentSelector} > ${el.tagName.toLowerCase()}${idx > 1 ? `:nth-child(${idx})` : ''}`;
    }
    return el.tagName.toLowerCase();
  }

  private async flush(useBeacon = false) {
    if (this.events.length === 0) return;
    const batch = this.events.splice(0);
    batch.forEach(e => e.sessionId = this.sessionId);

    if (useBeacon) {
      navigator.sendBeacon(`${API_URL}/analytics/events`, JSON.stringify({ events: batch }));
    } else {
      try {
        await fetch(`${API_URL}/analytics/events`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ events: batch }),
          keepalive: true,
        });
      } catch {}
    }
  }
}

export const analytics = new AnalyticsTracker();
