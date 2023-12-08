import express from 'express';
import Scrapper from '../controllers/scrapper';

const router = express.Router();

router.get('/test', Scrapper.test);
router.post('/onboard', Scrapper.onboardNewPage);

export default router;
