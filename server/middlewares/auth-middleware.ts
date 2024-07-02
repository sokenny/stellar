import { Request, Response, NextFunction } from 'express';

function authMiddleware(req: Request, res: Response, next: NextFunction) {
  if (req.headers['project-id']) {
    req.body.projectId = req.headers['project-id'];
    next();
  } else {
    console.log('Project-ID header is missing');
    next();
  }
}

export default authMiddleware;
