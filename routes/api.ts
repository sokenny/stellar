import express from 'express';
import onboardNewPage from '../services/scrapper/onboardNewPage';
import getJourneyTree from '../services/getJourneyTree';

const router = express.Router();

router.post('/onboard', onboardNewPage);
router.get('/get-journey', getJourneyTree);

export default router;
