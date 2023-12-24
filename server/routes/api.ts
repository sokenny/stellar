import express from 'express';
import onboardNewPage from '../services/scrapper/onboardNewPage';
import getJourneyTree from '../services/getJourneyTree';
import getExperiments from '../services/getExperiments';
import processUserSession from '../services/processUserSession';
import deleteProject from '../services/deleteProject';
import getExperiment from '../services/getExperiment';
import setGoal from '../services/setGoal';
import launchJourney from '../services/launchJourney';
import editExperiment from '../services/editExperiment';

const router = express.Router();

// TODO: add Rate Limiting to prevent abuse. mainly for the endpoints exposed to the client that
// are authenticated with the public api key

router.post('/onboard', onboardNewPage);

router.get('/journey/:id', getJourneyTree);

router.get('/experiments', getExperiments);

router.get('/experiment/:id', getExperiment);

router.put('/experiment/:id', editExperiment);

router.post('/goals', setGoal);

router.post('/journey/:id/launch', launchJourney);

router.post(
  '/experiments/end-session',
  express.text({ type: '*/*' }),
  processUserSession,
);

router.get('/clientjs', (req, res) => {
  res.sendFile('client_js/stellar.js', { root: 'public' });
});

router.delete('/project/:projectId', deleteProject);

export default router;
