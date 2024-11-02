import { Request, Response } from 'express';
import db from '../../models';

async function processUserSession(req: Request, res: Response) {
  const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  console.log('ipAddress: ', ipAddress);
  try {
    const payloadString = req.body.toString();
    const payload = JSON.parse(payloadString);

    console.log('payload that arrived: ', payload);

    const session = await db.Session.create({
      visitor_id: payload.visitorId,
      length: payload.timeOnPage,
      click_count: payload.clickCount,
      scroll_depth: payload.scrollDepth,
      visited_pages: payload.visitedPages,
      ip: ipAddress,
      session_issues: payload.sessionIssues || null,
    });

    const sessionExperimentPromises = payload.activeExperiments.map(
      (experiment) => {
        return db.SessionExperiment.create({
          session_id: session.id,
          experiment_id: experiment.experiment,
          variant_id: experiment.variant,
          converted: experiment.converted,
          experiment_mounted: experiment.experimentMounted,
          had_issues: payload?.sessionIssues?.length > 0 || false,
        });
      },
    );

    await Promise.all(sessionExperimentPromises);

    res.status(204).send('OK');
  } catch (error) {
    console.error('Error processing session data:', error);
    res.status(400).send('Bad request');
  }
}

export default processUserSession;
