import express from 'express';
// import deleteProject from './handlers/deleteProject';
import getExperiment from './handlers/getExperiment';
import setGoal from './handlers/setGoal';
import editExperiment from './handlers/editExperiment';
import editVariant from './handlers/editVariant';
import getVariant from './handlers/getVariant';
import setVariantModifications from './handlers/setVariantModifications';
import handleStopExperiment from './handlers/handleStopExperiment';
import getExperimentStatsHandler from './handlers/getExperimentStats';
import getStatisticalSignificance from '../services/getStatisticalSignificance';
import deleteExperiment from './handlers/deleteExperiment';
import deleteVariant from './handlers/deleteVariant';
import pauseExperiment from './handlers/pauseExperiment';
import turnOnExperiment from './handlers/turnOnExperiment';
import handleLaunchExperiment from './handlers/handleLaunchExperiment';
import createExperiment from './handlers/createExperiment';
import getProjects from './handlers/getProjects';
import createVariant from './handlers/createVariant';
import finishOnboarding from './handlers/finishOnboarding';
import checkSnippet from './handlers/checkSnippet';
import updateVariantName from './handlers/updateVariantName';
import updateExperimentName from './handlers/updateExperimentName';
import updateExperimentSettings from './handlers/updateExperimentSettings';
import generalRequestLimiter from '../helpers/generalRequestLimiter';
import autoGenerate from './handlers/autoGenerate';
import createProject from './handlers/createProject';

const router = express.Router();

// TODO: add Rate Limiting to prevent abuse. mainly for the endpoints exposed to the client that
// are authenticated with the public api key

router.use(generalRequestLimiter);

router.post('/onboard/:projectId', finishOnboarding);
router.post('/project', createProject);

router.post('/kickstart-project', autoGenerate);

// This one is used on the client side to mount experiments for users
router.post('/experiments', createExperiment);
router.get('/experiment/:id', getExperiment);
router.put('/experiment/:id', editExperiment);
router.put('/experiment/:id/name', updateExperimentName);
router.get('/experiment/:id/stats/:type', getExperimentStatsHandler);
router.post('/experiment/:id/stop', handleStopExperiment);
router.post('/experiment/:id/pause', pauseExperiment);
router.post('/experiment/:id/on', turnOnExperiment);
router.post('/experiment/:id/launch', handleLaunchExperiment);
router.put('/experiment/:id/settings', updateExperimentSettings);
router.delete('/experiment/:id', deleteExperiment);

router.get('/variant/:id', getVariant);
router.put('/variant/:id', editVariant);
router.put('/variant/:id/modifications', setVariantModifications);
router.delete('/variant/:id', deleteVariant);
router.post('/variant/:experimentId', createVariant);
router.put('/variant/:id/name', updateVariantName);

router.post('/goals', setGoal);

router.get('/test-statistical-significance/:id', getStatisticalSignificance);

// Should be called getUserData or sth like that
router.get('/projects/:userEmail', getProjects);
// router.delete('/project/:projectId', deleteProject);
router.post('/check-snippet', checkSnippet);

export default router;
