import express from 'express';
import rateLimit from 'express-rate-limit';
import getExperimentsForClient from './handlers/getExperimentsForClient';
import processUserSession from './handlers/processUserSession';
import sendStellarJSBundle from './handlers/sendStellarJSBundle';
import autoGenerate from './handlers/autoGenerate';
import createAccount from './handlers/createAccount';
import getExperiments from './handlers/getExperiments';
import getVariantScreenshot from './handlers/getVariantScreenshot';
import deleteExperiment from './handlers/deleteExperiment';
import publicDeleteExperiment from './handlers/publicDeleteExperiment';
import deleteProject from './handlers/deleteProject';
import generalRequestLimiter from '../helpers/generalRequestLimiter';
import sendEmail from '../services/sendEmail';

const strictLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 5,
  message: 'Too many requests from this IP, please try again after some time',
  standardHeaders: true,
  legacyHeaders: false,
});

const router = express.Router();

router.use(generalRequestLimiter);

router.post('/onboard', strictLimiter, autoGenerate);

router.post('/create-account', createAccount);

router.get('/experiments/client', getExperimentsForClient);

router.post(
  '/experiments/end-session',
  express.text({ type: '*/*' }),
  processUserSession,
);

router.get('/clientjs', sendStellarJSBundle);

router.get('/onboard/:projectId/experiments', getExperiments);

router.get('/experiment/:id/snapshot', getVariantScreenshot);
router.get('/experiment/:id/:variantId/snapshot', getVariantScreenshot);
router.delete('/experiment/:id', publicDeleteExperiment);

router.get('/send-test-email', sendEmail);

// router.delete('/hipersecretapa/:projectId', deleteProject);

export default router;
