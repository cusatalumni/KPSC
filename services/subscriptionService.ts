import type { SubscriptionStatus } from '../types';

/**
 * SubscriptionService Simulation
 * ------------------------------
 * This service simulates managing user subscription status. It uses sessionStorage
 * to persist the "pro" status for a given user ID. In a real-world application,
 * this service would interact with your backend API, which would in turn verify
 * subscription status with a payment provider like Stripe or Razorpay.
 *
 * - `getSubscriptionStatus(userId)`: Checks if a user has a "pro" subscription.
 * - `upgradeToPro(userId)`: Simulates a subscription upgrade for the user.
 */

const getSubscriptionKey = (userId: string) => `kerala_psc_guru_subscription_${userId}`;

class SubscriptionService {
  
  getSubscriptionStatus(userId: string): SubscriptionStatus {
    const status = sessionStorage.getItem(getSubscriptionKey(userId));
    if (status === 'pro') {
      return 'pro';
    }
    return 'free';
  }

  upgradeToPro(userId: string): void {
    if (userId) {
      sessionStorage.setItem(getSubscriptionKey(userId), 'pro');
    }
  }
}

// Export a singleton instance of the service
export const subscriptionService = new SubscriptionService();
