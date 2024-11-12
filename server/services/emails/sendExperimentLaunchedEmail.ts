import sendEmail from '../sendEmail';
import db from '../../models';

async function sendExperimentLaunchedEmail(experimentId) {
  const experiment = await db.Experiment.findOne({
    where: { id: experimentId },
    include: [
      {
        model: db.Project,
        as: 'project',
        include: [
          {
            model: db.User,
            as: 'user',
          },
        ],
      },
    ],
  });

  if (!experiment) {
    throw new Error('Experiment not found');
  }

  const { name, id } = experiment;
  const { email } = experiment.project.user;

  const subject = `Your experiment "${name}" has been launched!`;
  const html = `
      <p>We are excited to inform you that your experiment "<strong>${name}</strong>" (ID: ${id}) has been successfully launched.</p>
      <p>Feel free to monitor its progress <a href="${process.env.STELLAR_CLIENT_URL}/experiment/${id}">here</a>.</p>
      <p>Thank you for choosing our platform!</p>
      <p>Best regards,</p>
      <p>The Stellar Team</p>
    `;

  await sendEmail({
    recipients: [{ email }],
    subject,
    html,
  });
}

export default sendExperimentLaunchedEmail;
