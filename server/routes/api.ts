import express from 'express';
import getExperimentsForClient from './handlers/getExperimentsForClient';
import processUserSession from './handlers/processUserSession';
import deleteProject from './handlers/deleteProject';
import getExperiment from './handlers/getExperiment';
import setGoal from './handlers/setGoal';
// import launchJourney from './handlers/launchJourney';
import editExperiment from './handlers/editExperiment';
import editVariant from './handlers/editVariant';
import getExperiments from './handlers/getExperiments';
import sendStellarJSBundle from './handlers/sendStellarJSBundle';
import stopExperiment from './handlers/stopExperiment';
import onboardNewPage from './handlers/onboardNewPage';
import getExperimentStatsHandler from './handlers/getExperimentStats';
import getStatisticalSignificance from '../services/getStatisticalSignificance';
import deleteExperiment from './handlers/deleteExperiment';
import deleteVariant from './handlers/deleteVariant';
import pauseExperiment from './handlers/pauseExperiment';
import turnOnExperiment from './handlers/turnOnExperiment';
import createExperiment from './handlers/createExperiment';
import getProjects from './handlers/getProjects';
import createVariant from './handlers/createVariant';
import createAccount from './handlers/createAccount';
import finishOnboarding from './handlers/finishOnboarding';

const router = express.Router();

// TODO: add Rate Limiting to prevent abuse. mainly for the endpoints exposed to the client that
// are authenticated with the public api key

router.post('/onboard', onboardNewPage);
router.post('/create-account', createAccount);

router.post('/finish-onboarding/:projectId', finishOnboarding);

// This one is used on the client side to mount experiments for users
router.post('/experiments', createExperiment);
router.get('/experiments/client', getExperimentsForClient);
router.get('/projects/:projectId/experiments', getExperiments);
router.get('/experiment/:id', getExperiment);
router.put('/experiment/:id', editExperiment);
router.get('/experiment/:id/stats', getExperimentStatsHandler);
router.post('/experiment/:id/stop', stopExperiment);
router.post('/experiment/:id/pause', pauseExperiment);
router.post('/experiment/:id/on', turnOnExperiment);
router.delete('/experiment/:id', deleteExperiment);

router.put('/variant/:id', editVariant);
router.post('/variant', createVariant);
router.delete('/variant/:id', deleteVariant);

router.post('/goals', setGoal);

router.post(
  '/experiments/end-session',
  express.text({ type: '*/*' }),
  processUserSession,
);

router.get('/clientjs', sendStellarJSBundle);

router.get('/test-statistical-significance/:id', getStatisticalSignificance);

router.get('/projects/:userEmail', getProjects);
router.delete('/project/:projectId', deleteProject);

export default router;
