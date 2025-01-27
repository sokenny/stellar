import { Request, Response, NextFunction } from 'express';
import { client as redisClient } from '../helpers/cache';
import db from '../models';
import { decode } from 'next-auth/jwt';

async function getUserAttributes(email) {
  const key = `user:${email}`;
  const cachedUser = await redisClient.get(key);
  if (cachedUser) {
    return JSON.parse(cachedUser);
  }

  const user = await db.User.findOne({
    where: { email },
  });

  if (!user) {
    throw new Error('User not found');
  }

  await redisClient.set(key, JSON.stringify(user), { EX: 3600 });
  return user.toJSON();
}

async function updateLasteActiveAt(email) {
  const user = await db.User.findOne({
    where: { email },
  });

  if (!user) {
    throw new Error('User not found');
  }

  user.last_active_at = new Date();
  await user.save();
}

async function authenticateSession(req) {
  const token = req.token;

  if (!token) {
    throw new Error('Token not found');
  }

  try {
    const decoded = await decode({
      token,
      secret: process.env.NEXTAUTH_SECRET,
    });
    const user = await getUserAttributes(decoded.email);
    req.user = user;

    if (decoded.isAdmin !== undefined) {
      req.user.isAdmin = decoded.isAdmin;
    }
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
    if (!req.user.isAdmin) {
      updateLasteActiveAt(req.user.email);
    } else {
      console.log('ADMIN! we dont update last active', req.user);
    }
  } catch (error) {
    console.error('Authentication failed:', error);
    return res.status(401).send('Authentication failed');
  }

  next();
}

export default authMiddleware;
