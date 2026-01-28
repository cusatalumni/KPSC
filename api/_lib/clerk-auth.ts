import { createClerkClient, verifyToken } from '@clerk/backend';

/**
 * Returns a fresh Clerk client instance.
 * Using a function ensures the secret key is read from the environment
 * at the time of the request.
 */
function getClerkClient() {
    const secretKey = process.env.CLERK_SECRET_KEY;
    if (!secretKey) {
        throw new Error('Backend Error: CLERK_SECRET_KEY is missing in environment variables.');
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
    const authHeader = req.headers.authorization || req.headers.Authorization;

    if (!authHeader) {
        throw new AuthError('No authorization header found. Please log in again.');
    }

    const token = authHeader.replace('Bearer ', '').trim();
    if (!token) {
        throw new AuthError('Authentication token is empty.');
    }

    // Fix: verifyToken requires the secretKey, and getClerkClient also uses it.
    const secretKey = process.env.CLERK_SECRET_KEY;
    if (!secretKey) {
        throw new AuthError('Backend Error: CLERK_SECRET_KEY is missing.');
    }

    try {
        const clerkClient = getClerkClient();
        
        let claims: any;
        
        try {
            // Fix: verifyToken is an exported function from @clerk/backend, not a method on the ClerkClient instance.
            // This resolved the 'Property verifyToken does not exist on type ClerkClient' error.
            claims = await verifyToken(token, { secretKey });
        } catch (e: any) {
            console.error("Token verification failed:", e.message);
            throw new AuthError('Token verification failed. Please check your CLERK_SECRET_KEY.');
        }
        
        if (!claims || !claims.sub) {
            throw new AuthError('Invalid Token: No subject found in claims.');
        }

        // 2. Fetch the full user object to check metadata
        const user = await clerkClient.users.getUser(claims.sub);
        
        if (!user) {
            throw new AuthError('Access Denied: User account not found.');
        }

        // 3. Check for the admin role in Public Metadata
        const userRole = (user.publicMetadata as any)?.role;
        
        if (userRole !== 'admin') {
            console.error(`Security Alert: User ${user.id} (${user.emailAddresses[0]?.emailAddress}) attempted admin access with role: ${userRole}`);
            throw new AuthError('Forbidden: Your account does not have Admin privileges.');
        }

        return { success: true, userId: user.id };

    } catch (error: any) {
        console.error("Auth System Error:", error.message);
        
        if (error instanceof AuthError) {
            throw error;
        }
        
        // Handle Clerk specific errors
        if (error.status === 401 || error.status === 403) {
            throw new AuthError(`Authentication failed: ${error.message}`);
        }
        
        throw new AuthError(`Admin verification failed: ${error.message}`);
    }
}