
import type { SubscriptionStatus } from '../types';

/**
 * SubscriptionService
 * ------------------------------
 * Manages user subscription status using localStorage for persistence across sessions
 * and immediate state retrieval for the UI.
 */

const getSubscriptionKey = (userId: string) => `kpsc_pro_status_${userId}`;

class SubscriptionService {
  
  getSubscriptionStatus(userId: string): SubscriptionStatus {
    if (!userId) return 'free';
    const status = localStorage.getItem(getSubscriptionKey(userId));
    return status === 'pro' ? 'pro' : 'free';
  }

  upgradeToPro(userId: string): void {
    if (userId) {
      localStorage.setItem(getSubscriptionKey(userId), 'pro');
      // Trigger a custom event to notify App component if needed
      window.dispatchEvent(new Event('subscription_updated'));
    }
  }

  clearSubscription(userId: string): void {
    if (userId) {
      localStorage.removeItem(getSubscriptionKey(userId));
    }
  }
}

export const subscriptionService = new SubscriptionService();
