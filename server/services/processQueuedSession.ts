import db from '../models';

interface QueueMessage {
  visitorId: string;
  timeOnPage: number;
  clickCount: number;
  scrollDepth: number;
  visitedPages: string[];
  ipAddress: string;
  sessionIssues?: string[];
  activeExperiments: Array<{
    experiment: string;
    variant: string;
    converted: boolean;
    experimentMounted: boolean;
  }>;
}

async function processQueuedSession(messageBody: string) {
  try {
    const message: QueueMessage = JSON.parse(messageBody);

    const session = await db.Session.create({
      visitor_id: message.visitorId,
      length: message.timeOnPage,
      click_count: message.clickCount,
      scroll_depth: message.scrollDepth,
      visited_pages: message.visitedPages,
      ip: message.ipAddress,
      session_issues: message.sessionIssues || null,
    });

    const sessionExperimentPromises = message.activeExperiments.map(
      (experiment) => {
        return db.SessionExperiment.create({
          session_id: session.id,
          experiment_id: experiment.experiment,
          variant_id: experiment.variant,
          converted: experiment.converted,
          experiment_mounted: experiment.experimentMounted,
          had_issues: message?.sessionIssues?.length > 0 || false,
        });
      },
    );

    await Promise.all(sessionExperimentPromises);

    console.log('processQueuedSession - session created:', session.id);

    return true;
  } catch (error) {
    console.error('Error processing queue message:', error);
    throw error;
  }
}

export default processQueuedSession;
