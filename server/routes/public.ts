import express from 'express';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import getExperimentsForClient, {
  getExperimentsForClientCF,
} from './handlers/getExperimentsForClient';
import sendStellarJSBundle from './handlers/sendStellarJSBundle';
import autoGenerate from './handlers/autoGenerate';
import createAccountSocial from './handlers/createAccountSocial';
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
import sendEditorJSBundle from './handlers/sendEditorJSBundle';

const strictLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: process.env.NODE_ENV === 'development' ? 1000 : 200,
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

router.get('/experiments/client', compression(), getExperimentsForClient);
router.get(
  '/experiments/client/:apiKey',
  compression(),
  getExperimentsForClientCF,
);
router.post(
  '/experiments/end-session',
  // strictLimiter, // I might need this soon, perhaps not too strict
  express.text({ type: '*/*' }),
  publishUserSession,
);

router.get('/clientjs', sendStellarJSBundle);
router.get('/editorjs', sendEditorJSBundle);

router.get('/experiment/:id/snapshot', getVariantScreenshot);
router.get('/experiment/:id/:variantId/snapshot', getVariantScreenshot);
router.delete('/experiment/:id', publicDeleteExperiment);

router.get('/chart/experiment/:id', handleGetExperimentChartData);

router.get('/send-test-email', sendEmail);

router.post('/validate-affiliate-code', handleValidateAffiliateCode);

// router.delete('/hipersecretapa/:projectId', deleteProject);

export default router;
