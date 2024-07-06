import { Request, Response, NextFunction } from 'express';
import { decode } from 'next-auth/jwt';

async function authenticateSession(req) {
  const token = req.token;

  if (!token) {
    throw new Error('Token not found');
  }

  try {
    await decode({
      token,
      secret: process.env.NEXTAUTH_SECRET,
    });
  } catch (error) {
    throw new Error('Failed to decode token: ' + error.message);
  }
}

async function authMiddleware(req: any, res: Response, next: NextFunction) {
  req.projectId = req.headers['project-id'];

  const token = req.headers['authorization']?.split(' ')[1];
  if (token) {
    req.token = token; // Attach token to the request object
    // console.log('Token attached to request:', token);
  }

  try {
    await authenticateSession(req);
  } catch (error) {
    console.error('Authentication failed:', error);
    return res.status(401).send('Authentication failed');
  }

  next();
}

export default authMiddleware;
