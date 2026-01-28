
import { createClerkClient } from '@clerk/backend';

/**
 * Returns a fresh Clerk client instance.
 * Using a function ensures the secret key is read from the environment
 * at the time of the request.
 */
function getClerkClient() {
    const secretKey = process.env.CLERK_SECRET_KEY;
    if (!secretKey) {
        throw new Error('CLERK_SECRET_KEY is not defined in environment variables.');
    }
    return createClerkClient({ secretKey });
}

class AuthError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'AuthError';
    }
}

/**
 * Verifies the JWT from the request, fetches the user, and checks if they are an admin.
 * @param {Request} req - The incoming request object.
 */
export async function verifyAdmin(req: any) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        throw new AuthError('No authorization header found.');
    }

    const token = authHeader.replace('Bearer ', '').trim();
    if (!token) {
        throw new AuthError('Bearer token is empty.');
    }

    try {
        const clerkClient = getClerkClient();
        
        // 1. Verify the JWT token sent from the frontend
        const claims = await clerkClient.verifyToken(token);
        
        if (!claims || !claims.sub) {
            throw new AuthError('Token verification failed: No subject found.');
        }

        // 2. Fetch the full user object to check metadata
        const user = await clerkClient.users.getUser(claims.sub);
        
        if (!user) {
            throw new AuthError('User not found in Clerk database.');
        }

        // 3. Check for the admin role in Public Metadata
        // Expected format in Clerk: { "role": "admin" }
        const userRole = (user.publicMetadata as any)?.role;
        
        if (userRole !== 'admin') {
            console.error(`User ${user.id} attempted admin action without "admin" role. Role found: ${userRole}`);
            throw new AuthError('Forbidden: You do not have the "admin" role assigned in Clerk.');
        }

        return { success: true, userId: user.id };

    } catch (error: any) {
        console.error("Clerk Verification Error:", error.message);
        
        // If it's already an AuthError, rethrow it with its specific message
        if (error instanceof AuthError) {
            throw error;
        }
        
        // Otherwise throw a general failure message with the specific reason wrapped
        throw new AuthError(`Admin verification failed: ${error.message}`);
    }
}
