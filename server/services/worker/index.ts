import { Op } from 'sequelize';
import db from '../../models';
import launchExperiment from '../launchExperiment';
import stopExperiment from '../stopExperiment';

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

  // Run the first service immediately, and then every 10 minutes
  handleScheduledExperimentsLaunch();
  setInterval(handleScheduledExperimentsLaunch, 1000 * 60 * 10);

  // Run the second service 5 minutes after the first one, then every 10 minutes
  setTimeout(() => {
    handleScheduledExperimentsStop();
    setInterval(handleScheduledExperimentsStop, 1000 * 60 * 10);
  }, 1000 * 60 * 5);
}

export default runWorker;
