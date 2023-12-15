import express from 'express';
import onboardNewPage from '../services/scrapper/onboardNewPage';
import getJourneyTree from '../services/getJourneyTree';
import getExperiments from '../services/getExperiments';
import processUserSession from '../services/processUserSession';

const router = express.Router();

router.post('/onboard', onboardNewPage);
router.get('/get-journey', getJourneyTree);

router.get('/experiments', getExperiments);
router.post(
  '/experiments/end-session',
  express.text({ type: '*/*' }),
  processUserSession,
);

export default router;
