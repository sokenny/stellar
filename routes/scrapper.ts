import express from 'express';
import onboardNewPage from '../services/scrapper/onboardNewPage';

const router = express.Router();

// router.get('/test', Scrapper.test);
router.post('/onboard', onboardNewPage);

export default router;
