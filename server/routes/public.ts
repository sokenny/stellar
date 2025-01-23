import express from 'express';
import rateLimit from 'express-rate-limit';
import getExperimentsForClient from './handlers/getExperimentsForClient';
import processUserSession from './handlers/processUserSession';
import sendStellarJSBundle from './handlers/sendStellarJSBundle';
import autoGenerate from './handlers/autoGenerate';
import createAccountSocial from './handlers/createAccountSocial';
import getExperiments from './handlers/getExperiments';
import getVariantScreenshot from './handlers/getVariantScreenshot';
import deleteExperiment from './handlers/deleteExperiment';
import publicDeleteExperiment from './handlers/publicDeleteExperiment';
import deleteProject from './handlers/deleteProject';
import generalRequestLimiter from '../helpers/generalRequestLimiter';
import sendEmail from '../services/sendEmail';
import handleGetExperimentChartData from './handlers/handleGetExperimentChartData';
import handleCreateAccount from './handlers/handleCreateAccount';
import handleConfirmEmail from './handlers/handleConfirmEmail';
import handleLogin from './handlers/handleLogin';
import handleValidateAffiliateCode from './handlers/handleValidateAffiliateCode';
import publishUserSession from './handlers/publishUserSession';

const strictLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: process.env.NODE_ENV === 'development' ? 1000 : 100,
  message: 'Too many requests from this IP, please try again after some time',
  standardHeaders: true,
  legacyHeaders: false,
});

const router = express.Router();

router.use(generalRequestLimiter);

router.post('/onboard', strictLimiter, autoGenerate);

router.post('/create-account', handleCreateAccount);

router.post('/login', handleLogin);

router.get('/confirm-email', handleConfirmEmail);

router.post('/create-account-social', createAccountSocial);

router.get('/experiments/client', getExperimentsForClient);
router.post(
  '/experiments/end-session',
  // strictLimiter, // I might need this soon, perhaps not too strict
  express.text({ type: '*/*' }),
  publishUserSession,
);

router.get('/clientjs', sendStellarJSBundle);

router.get('/onboard/:projectId/experiments', getExperiments);

router.get('/experiment/:id/snapshot', getVariantScreenshot);
router.get('/experiment/:id/:variantId/snapshot', getVariantScreenshot);
router.delete('/experiment/:id', publicDeleteExperiment);

router.get('/chart/experiment/:id', handleGetExperimentChartData);

router.get('/send-test-email', sendEmail);

router.post('/validate-affiliate-code', handleValidateAffiliateCode);

// router.delete('/hipersecretapa/:projectId', deleteProject);

export default router;
