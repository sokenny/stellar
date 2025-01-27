import { Request, Response } from 'express';
import { setExperimentGoalsService } from '../../services/setExperimentGoalsService';

interface GoalPayload {
  id: number;
  isMain: boolean;
}

async function setExperimentGoals(req: Request, res: Response) {
  try {
    const experimentId = parseInt(req.params.id);
    const goals: GoalPayload[] = req.body.goals;

    if (!experimentId || !Array.isArray(goals)) {
      return res.status(400).json({ error: 'Invalid input parameters' });
    }

    await setExperimentGoalsService(experimentId, goals);

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error in setExperimentGoals:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export default setExperimentGoals;
