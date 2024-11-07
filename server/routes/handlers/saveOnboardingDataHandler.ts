import { Response } from 'express';
import saveOnboardingData from '../../services/saveOnboardingData';

async function saveOnboardingDataHandler(req: any, res: Response) {
  try {
    const onboardingData = req.body;
    const savedData = await saveOnboardingData(onboardingData, req.user.id);
    res.status(201).json(savedData);
  } catch (error) {
    res.status(500).json({ error: 'Failed to save onboarding data' });
  }
}

export default saveOnboardingDataHandler;
