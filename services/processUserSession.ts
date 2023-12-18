import { Request, Response } from 'express';
import db from '../models';

async function processUserSession(req: Request, res: Response) {
  try {
    const payloadString = req.body.toString();
    const payload = JSON.parse(payloadString);

    await db.Session.create({
      session_id: payload.sessionId,
      length: payload.timeOnPage,
      click_count: payload.clickCount,
      scroll_depth: payload.scrollDepth,
      journey_id: 1,
      experiments_run: payload.experimentsRun,
    });

    res.status(204).send('OK');
  } catch (error) {
    console.error('Error processing session data:', error);
    res.status(400).send('Bad request');
  }
}

export default processUserSession;
