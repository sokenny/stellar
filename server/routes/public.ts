import express from 'express';
import getExperimentsForClient from './handlers/getExperimentsForClient';
import processUserSession from './handlers/processUserSession';
import sendStellarJSBundle from './handlers/sendStellarJSBundle';

const router = express.Router();

router.get('/experiments/client', getExperimentsForClient);

router.post(
  '/experiments/end-session',
  express.text({ type: '*/*' }),
  processUserSession,
);

router.get('/clientjs', sendStellarJSBundle);

export default router;
