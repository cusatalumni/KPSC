
import type { User } from '../types';
import { LOGGED_IN_USER } from '../constants';

/**
 * AuthService Simulation
 * ----------------------
 * This is a mock authentication service that uses sessionStorage to simulate
 * a logged-in user state. In a real-world application, the methods here
 * would make API calls to a backend or an auth provider like Clerk, Auth0, or Firebase.
 *
 * - `login()`: Simulates a user logging in and stores their data in sessionStorage.
 * - `logout()`: Clears the user data from sessionStorage.
 * - `getCurrentUser()`: Retrieves the user from sessionStorage.
 * - `upgradeToPro()`: Simulates a subscription upgrade and updates the user's status.
 */

const USER_SESSION_KEY = 'kerala_psc_guru_user';

class AuthService {
  
  login(): User {
    // In a real app, this would be the result of a login API call
    const user = { ...LOGGED_IN_USER };
    sessionStorage.setItem(USER_SESSION_KEY, JSON.stringify(user));
    return user;
  }

  logout(): void {
    sessionStorage.removeItem(USER_SESSION_KEY);
  }

  getCurrentUser(): User | null {
    const userJson = sessionStorage.getItem(USER_SESSION_KEY);
    if (!userJson) {
      return null;
    }
    try {
      return JSON.parse(userJson) as User;
    } catch (e) {
      console.error("Failed to parse user session", e);
      return null;
    }
  }

  upgradeToPro(): User | null {
    const user = this.getCurrentUser();
    if (user) {
      const proUser = { ...user, subscription: 'pro' as const };
      sessionStorage.setItem(USER_SESSION_KEY, JSON.stringify(proUser));
      return proUser;
    }
    return null;
  }
}

// Export a singleton instance of the service
export const authService = new AuthService();
