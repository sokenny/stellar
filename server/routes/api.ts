import express from 'express';
// import deleteProject from './handlers/deleteProject';
// import getExperiment from './handlers/getExperiment';
import createGoal from './handlers/createGoal';
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
import handleGetExperimentChartData from './handlers/handleGetExperimentChartData';
import saveOnboardingDataHandler from './handlers/saveOnboardingDataHandler';
import updateEmailSettings from './handlers/updateEmailSettings';
import setTargetRules from './handlers/setTargetRules';
import editExperimentUrlRules from './handlers/editExperimentUrlRules';
import updateEditorUrl from './handlers/updateEditorUrl';
import createSplitUrlExperiment from './handlers/createSplitUrlExperiment';
import setExperimentGoals from './handlers/setExperimentGoals';
import updateGoal from './handlers/updateGoal';
import deleteGoal from './handlers/deleteGoal';

const router = express.Router();

router.use(generalRequestLimiter);

router.post('/onboard/:projectId', finishOnboarding);
router.post('/project', createProject);

router.post('/kickstart-project', autoGenerate);

// This one is used on the client side to mount experiments for users
router.post('/experiments', createExperiment);
router.post('/experiments/split-url', createSplitUrlExperiment);
// router.get('/experiment/:id', getExperiment);
router.put('/experiment/:id', editExperiment);
router.put('/experiment/:id/url-rules', editExperimentUrlRules);
router.put('/experiment/:id/editor-url', updateEditorUrl);
router.put('/experiment/:id/name', updateExperimentName);
router.get('/experiment/:id/stats/:type', getExperimentStatsHandler);
router.get('/chart/experiment/:id', handleGetExperimentChartData);
router.post('/experiment/:id/stop', handleStopExperiment);
router.post('/experiment/:id/pause', pauseExperiment);
router.post('/experiment/:id/on', turnOnExperiment);
router.post('/experiment/:id/launch', handleLaunchExperiment);
router.put('/experiment/:id/settings', updateExperimentSettings);
router.delete('/experiment/:id', deleteExperiment);
router.put('/experiment/:id/target-rules', setTargetRules);

router.get('/variant/:id', getVariant);
router.put('/variant/:id', editVariant);
router.put('/variant/:id/modifications', setVariantModifications);
router.delete('/variant/:id', deleteVariant);
router.post('/variant/:experimentId', createVariant);
router.put('/variant/:id/name', updateVariantName);

router.post('/goals', createGoal);
router.put('/goals/:id', updateGoal);
router.delete('/goals/:id', deleteGoal);

router.get('/test-statistical-significance/:id', getStatisticalSignificance);

// Should be called getUserData or sth like that
router.get('/projects/:userEmail', getProjects);
// router.delete('/project/:projectId', deleteProject);
router.post('/check-snippet', checkSnippet);

router.post('/onboarding', saveOnboardingDataHandler);

router.put('/user/email-settings', updateEmailSettings);

router.post('/experiment/:id/goals', setExperimentGoals);

export default router;
