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
    conversions: number[];
    experimentMounted: boolean;
  }>;
  sessionEndedAt: string;
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

    // Process each experiment and its conversions
    for (const experiment of message.activeExperiments) {
      // Create the session experiment
      const sessionExperiment = await db.SessionExperiment.create({
        session_id: session.id,
        experiment_id: experiment.experiment,
        variant_id: experiment.variant,
        converted: experiment.converted,
        experiment_mounted: experiment.experimentMounted,
        had_issues: message?.sessionIssues?.length > 0 || false,
        visitor_id: message.visitorId,
        session_ended_at: message?.sessionEndedAt,
      });

      // If there are conversions for this experiment, create conversion records
      if (experiment.conversions && experiment.conversions.length > 0) {
        const conversionPromises = experiment.conversions.map((goalId) => {
          return db.Conversion.create({
            session_experiment_id: sessionExperiment.id,
            goal_id: goalId,
            converted_at: message.sessionEndedAt, // Using the session end time as conversion time
          });
        });

        await Promise.all(conversionPromises);
      }
    }

    console.log('processQueuedSession - session created:', session.id);
    return true;
  } catch (error) {
    console.error('Error processing queue message:', error);
    throw error;
  }
}

export default processQueuedSession;
