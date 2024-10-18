import { Op } from 'sequelize';
import db from '../../models';
import launchExperiment from '../launchExperiment';
import stopExperiment from '../stopExperiment';
import sendEmail from '../sendEmail';

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

async function handleSnippetInstallationFollowUp() {
  console.log('Running handleSnippetInstallationFollowUp!!!');
  const fourHoursAgo = new Date(new Date().getTime() - 1000 * 60 * 60 * 4);

  const campaignId = 'snippet-installation-follow-up';

  const res = await db.sequelize.query(
    `SELECT p.*, u.id as user_id, u.email, u.first_name, u.last_name
     FROM projects p
     JOIN users u ON p.user_id = u.id
     LEFT JOIN transactional_emails te
       ON u.id = te.user_id
       AND te.campaign_id = '${campaignId}'
     WHERE p.snippet_status IS NULL
       AND p.created_at BETWEEN '2024-10-16' AND '${fourHoursAgo.toISOString()}'
       AND te.id IS NULL;`,
  );

  const projects = res[0];

  console.log('Projects length: ', projects.length);

  console.log('projects: ', projects);

  const html = (data) => `
    <p>${
      data.first_name ? `${data.first_name}` : ''
    }, install your snippet on ${data.domain} to start running experiments.</p>
    <p>All you need to do is paste the snippet we provide inside of the &lt;head&gt; tag of your website.</p>
    <p>You'll find everything you need to complete this step by heading to https://gostellar.app/dashboard</p>
    <p>Feel free to reply to this email if you need any help getting set up!</p>
    <p>Best, Juan.</p>
  `;

  for (const project of projects) {
    console.log('Project---: ', project);
    console.log('User email: ', project.email);

    console.log('Sending snippet follow up email to: ', project.email);
    await sendEmail({
      recipients: [{ email: project.email }],
      subject: 'Install your snippet to start running experiments :)',
      html: html(project),
    });
    console.log('Snippet follow up email sent to: ', project.email);

    await db.TransactionalEmail.create({
      user_id: project.user_id,
      campaign_id: campaignId,
    });
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
    handleSnippetInstallationFollowUp();
    setInterval(handleSnippetInstallationFollowUp, 1000 * 60 * 20);
  }, 1000 * 60 * 4);
}

export default runWorker;
