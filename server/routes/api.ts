import express from 'express';
import getJourneyTree from './handlers/getJourneyTree';
import getExperimentsForClient from './handlers/getExperimentsForClient';
import processUserSession from './handlers/processUserSession';
import deleteProject from './handlers/deleteProject';
import getExperiment from './handlers/getExperiment';
import setGoal from './handlers/setGoal';
import launchJourney from './handlers/launchJourney';
import editExperiment from './handlers/editExperiment';
import editVariant from './handlers/editVariant';
import getExperiments from './handlers/getExperiments';
import sendStellarJSBundle from './handlers/sendStellarJSBundle';
import stopExperiment from './handlers/stopExperiment';
import onboardNewPage from './handlers/onboardNewPage';
import getExperimentStatsHandler from './handlers/getExperimentStats';
import getStatisticalSignificance from '../services/getStatisticalSignificance';
import deleteExperiment from './handlers/deleteExperiment';
import pauseExperiment from './handlers/pauseExperiment';
import resumeExperiment from './handlers/resumeExperiment';

const router = express.Router();

// TODO: add Rate Limiting to prevent abuse. mainly for the endpoints exposed to the client that
// are authenticated with the public api key

router.post('/onboard', onboardNewPage);

router.get('/journey/:id', getJourneyTree);
router.post('/journey/:id/launch', launchJourney);

// This one is used on the client side to mount experiments for users
router.get('/experiments/client', getExperimentsForClient);
router.get('/experiments', getExperiments);
router.get('/experiment/:id', getExperiment);
router.put('/experiment/:id', editExperiment);
router.get('/experiment/:id/stats', getExperimentStatsHandler);
router.post('/experiment/:id/stop', stopExperiment);
router.post('/experiment/:id/pause', pauseExperiment);
router.post('/experiment/:id/resume', resumeExperiment);
router.delete('/experiment/:id', deleteExperiment);

router.put('/variant/:id', editVariant);

router.post('/goals', setGoal);

router.post(
  '/experiments/end-session',
  express.text({ type: '*/*' }),
  processUserSession,
);

router.get('/clientjs', sendStellarJSBundle);

router.get('/test-statistical-significance/:id', getStatisticalSignificance);

router.delete('/project/:projectId', deleteProject);

export default router;
