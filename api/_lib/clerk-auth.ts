// Path: /api/_lib/clerk-auth.ts

import clerk from '@clerk/backend';

// Initialize Clerk backend. It will automatically use the CLERK_SECRET_KEY
// environment variable.
const clerkClient = clerk;

class AuthError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'AuthError';
    }
}

/**
 * Verifies the JWT from the request, fetches the user, and checks if they are an admin.
 * Throws an error if authentication or authorization fails.
 * @param {Request} req - The incoming request object.
 */
export async function verifyAdmin(req: any) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        throw new AuthError('Authorization header is missing.');
    }

    const token = authHeader.replace('Bearer ', '');

    try {
        const claims = await clerkClient.verifyToken(token);
        if (!claims.sub) {
            throw new AuthError('Invalid token: No user ID found.');
        }

        const user = await clerkClient.users.getUser(claims.sub);
        if (!user) {
            throw new AuthError('User not found.');
        }

        if (user.publicMetadata?.role !== 'admin') {
            throw new AuthError('User is not authorized as an admin.');
        }

        console.log(`Admin action verified for user: ${user.id}`);
        return { success: true, userId: user.id };

    } catch (error: any) {
        console.error("Admin verification failed:", error.message);
        // Re-throw a generic error to not expose internal details
        throw new AuthError('Admin verification failed.');
    }
}