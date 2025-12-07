import { NextRequest } from 'next/server';
import { verifyToken, JWTPayload } from './jwt';

export interface AuthRequest extends NextRequest {
  user?: JWTPayload;
}

export async function authenticate(request: NextRequest): Promise<JWTPayload | null> {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // Try to get token from cookie
      const token = request.cookies.get('token')?.value;
      
      if (!token) {
        return null;
      }
      
      const decoded = verifyToken(token);
      return decoded;
    }
    
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    const decoded = verifyToken(token);
    
    return decoded;
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
}

export function unauthorizedResponse(message: string = 'Unauthorized') {
  return Response.json(
    { success: false, error: message },
    { status: 401 }
  );
}