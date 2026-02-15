
import type { SubscriptionStatus, SubscriptionData } from '../types';

class SubscriptionService {
  
  async getSubscriptionData(userId: string): Promise<SubscriptionData> {
    if (!userId) return { status: 'free' };
    
    try {
        const res = await fetch('/api/subscription', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId })
        });
        
        if (res.ok) {
            const data = await res.json();
            // Cache in local storage for faster UI but trust API
            localStorage.setItem(`sub_status_${userId}`, data.status);
            return data;
        }
    } catch (e) {
        console.error("Failed to fetch subscription:", e);
    }
    
    // Fallback to local storage if API fails
    const local = localStorage.getItem(`sub_status_${userId}`);
    return { status: (local === 'pro' ? 'pro' : 'free') };
  }

  // Purely for UI reactive components that need a quick check
  getSubscriptionStatus(userId: string): SubscriptionStatus {
    if (!userId) return 'free';
    return localStorage.getItem(`sub_status_${userId}`) === 'pro' ? 'pro' : 'free';
  }

  async upgradeToPro(userId: string, planType = 'Annual'): Promise<boolean> {
    if (!userId) return false;
    
    try {
        const res = await fetch('/api/subscription', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, action: 'upgrade', planType })
        });
        
        if (res.ok) {
            localStorage.setItem(`sub_status_${userId}`, 'pro');
            window.dispatchEvent(new Event('subscription_updated'));
            return true;
        }
    } catch (e) {
        console.error("Upgrade sync failed:", e);
    }
    return false;
  }
}

export const subscriptionService = new SubscriptionService();
