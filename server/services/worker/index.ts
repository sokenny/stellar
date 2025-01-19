import { Op } from 'sequelize';
import db from '../../models';
import launchExperiment from '../launchExperiment';
import stopExperiment from '../stopExperiment';
import handleSnippetInstallationFollowUps from './handleSnippetInstallationFollowUps';
import handleGettingStartedCampaign from './handleGettingStartedCampaign';
import handleSQSPolling from './handleSQSPolling';

async function handleScheduledExperimentsLaunch() {
  console.log('Worker job handleScheduledExperimentsLaunch started');
  const experimentsToStart = await db.Experiment.findAll({
    where: {
      scheduled_start_date: {
        [Op.lte]: new Date(),
      },
      started_at: null,
      ended_at: null,
      deleted_at: null,
    },
  });

  if (experimentsToStart.length === 0) {
    console.log('Worker found no experiments to start');
    return;
  }

  for (const experiment of experimentsToStart) {
    console.log('Worker is starting experiment: ', experiment.id);
    try {
      await launchExperiment(experiment.id);
      console.log('Worker has started experiment: ', experiment.id);
    } catch (error) {
      console.error(
        'Worker encountered error in starting experiment: ',
        experiment.id,
        error,
      );
    }
  }
}

async function handleScheduledExperimentsStop() {
  console.log('Worker job handleScheduledExperimentsStop started');
  const experimentsToStop = await db.Experiment.findAll({
    where: {
      scheduled_end_date: {
        [Op.lte]: new Date(),
      },
      ended_at: null,
      deleted_at: null,
    },
  });

  if (experimentsToStop.length === 0) {
    console.log('Worker found no experiments to stop');
    return;
  }

  for (const experiment of experimentsToStop) {
    console.log('Worker is stopping experiment: ', experiment.id);
    try {
      await stopExperiment(experiment.id);
      console.log('Worker has stopped experiment: ', experiment.id);
    } catch (error) {
      console.error(
        'Worker encountered error in stopping experiment: ',
        experiment.id,
        error,
      );
    }
  }
}

function runWorker() {
  console.log('Worker is running');

  setInterval(handleScheduledExperimentsLaunch, 1000 * 60 * 20);

  // Run the second service 2 minute after the first one, then every 20 minutes
  setTimeout(() => {
    handleScheduledExperimentsStop();
    setInterval(handleScheduledExperimentsStop, 1000 * 60 * 20);
  }, 1000 * 60 * 2);

  // Run the third service 4 minutes after the second one, then every 20 minutes
  setTimeout(() => {
    handleSnippetInstallationFollowUps();
    setInterval(handleSnippetInstallationFollowUps, 1000 * 60 * 20);
  }, 1000 * 60 * 4);

  // Run the third service 6 minutes after the third one, then every 20 minutes
  // setTimeout(() => {
  //   handleGettingStartedCampaign();
  //   setInterval(handleGettingStartedCampaign, 1000 * 60 * 20);
  // }, 1000 * 60 * 6);

  handleSQSPolling();
}

export default runWorker;
