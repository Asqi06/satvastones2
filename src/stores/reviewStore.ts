export interface CustomerReview {
  id: string;
  productId?: string; // specific product ID or undefined for general store review
  productName?: string;
  authorName: string;
  city: string;
  rating: number; // 1 to 5
  title: string;
  content: string;
  date: string;
  verifiedBuyer: boolean;
  createdAt: number;
}

const STORAGE_KEY = 'satvastones_customer_reviews';

export function getStoredReviews(): CustomerReview[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) {
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function getReviewsForProduct(productId: string): CustomerReview[] {
  const all = getStoredReviews();
  const matched = all.filter((r) => r.productId === productId);
  return matched;
}

export function submitCustomerReview(newReview: Omit<CustomerReview, 'id' | 'createdAt' | 'date'>): CustomerReview {
  const current = getStoredReviews();
  const today = new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(new Date());

  const fullReview: CustomerReview = {
    ...newReview,
    id: `rev-${Date.now()}`,
    date: today,
    createdAt: Date.now()
  };

  const updated = [fullReview, ...current];
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('satvastones:review_added', { detail: fullReview }));

      // Sync to Cloudflare D1
      fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fullReview)
      }).catch((err) => {
        console.warn('Review D1 sync error:', err);
      });
    } catch (e) {
      console.warn('Failed to persist customer review:', e);
    }
  }

  return fullReview;
}

export async function syncReviewsFromCloudflare(productId?: string): Promise<CustomerReview[]> {
  try {
    const url = productId ? `/api/reviews?productId=${encodeURIComponent(productId)}` : '/api/reviews';
    const res = await fetch(url);
    const data = await res.json();
    if (data?.success && Array.isArray(data.reviews)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data.reviews));
      window.dispatchEvent(new CustomEvent('satvastones:reviews_synced', { detail: data.reviews }));
      return data.reviews;
    }
  } catch (_) {}
  return getStoredReviews();
}

export async function deleteCustomerReview(id: string): Promise<boolean> {
  const current = getStoredReviews();
  const updated = current.filter((r) => r.id !== id);
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('satvastones:reviews_synced', { detail: updated }));
    const token =
      (typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('satvastones_admin_token') : null) ||
      localStorage.getItem('satvastones_admin_token') ||
      '';
    try {
      const res = await fetch(`/api/reviews?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
        credentials: 'include'
      });
      return res.ok;
    } catch (_) {
      return false;
    }
  }
  return true;
}
