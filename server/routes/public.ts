import express from 'express';
import getExperimentsForClient from './handlers/getExperimentsForClient';
import processUserSession from './handlers/processUserSession';
import sendStellarJSBundle from './handlers/sendStellarJSBundle';
import autoGenerate from './handlers/autoGenerate';
import createAccount from './handlers/createAccount';
import getExperiments from './handlers/getExperiments';
import getVariantScreenshot from './handlers/getVariantScreenshot';
import deleteExperiment from './handlers/deleteExperiment';
import publicDeleteExperiment from './handlers/publicDeleteExperiment';

const router = express.Router();

router.post('/onboard', autoGenerate);

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

export default router;
