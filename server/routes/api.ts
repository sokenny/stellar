import express from 'express';
import onboardNewPage from '../services/scrapper/onboardNewPage';
import getJourneyTree from '../services/getJourneyTree';
import getExperiments from '../services/getExperiments';
import processUserSession from '../services/processUserSession';
import deleteProject from '../services/deleteProject';
import getExperiment from '../services/getExperiment';

const router = express.Router();

// TODO: add Rate Limiting to prevent abuse. mainly for the endpoints exposed to the client that
// are authenticated with the public api key

router.post('/onboard', onboardNewPage);

router.get('/journey/:id', getJourneyTree);

router.get('/experiments', getExperiments);

router.get('/experiment/:id', getExperiment);

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
