import db from '../../models';
import sendEmail from '../sendEmail';

const firstEmailHtml = (data) => `
  <p>${data.first_name ? `${data.first_name}` : ''}, install your snippet on ${
  data.domain
} to start running experiments.</p>
  <p>All you need to do is paste the snippet we provide inside of the &lt;head&gt; tag of your website.</p>
  <p>You'll find everything you need to complete this step by heading to https://gostellar.app/dashboard</p>
  <p>Feel free to reply to this email if you need any help getting set up!</p>
  <p>Best, Juan 👨‍🔬.</p>
`;

const secondEmailHtml = (data) => `
  <p>${
    data.first_name ? `${data.first_name}` : ''
  }, just a reminder to install your snippet on ${
  data.domain
} to start running experiments.</p>
  <p>It's important to complete this step to get the most out of our service.</p>
  <p>You can visit your dashboard at https://gostellar.app/dashboard for more details.</p>
  <p>For a step by step tutorial, visit <a href="https://www.gostellar.app/blog/install-stellar-snippet">our installation guide</a>.</p>
  <p>Best, Juan 👨‍🔬.</p>
`;

// const thirdEmailHtml = (data) => `
//   <p>${
//     data.first_name ? `${data.first_name}` : ''
//   }, this is your final reminder to install your snippet on ${data.domain}.</p>
//   <p>Don't miss out on the benefits of running experiments on your site.</p>
//   <p>Check https://gostellar.app/dashboard for instructions.</p>
//   <p>Best, Juan.</p>
// `;

async function handleSnippetInstallationFollowUps() {
  console.log('Running handleSnippetInstallationFollowUps!!!');
  const fourHoursAgo = new Date(new Date().getTime() - 1000 * 60 * 60 * 4);

  const campaigns = [
    {
      id: 'snippet-installation-follow-up-1',
      daysAgo: 0,
      subject: 'Install your snippet to start running experiments :)',
      html: firstEmailHtml,
    },
    {
      id: 'snippet-installation-follow-up-2',
      daysAgo: 3,
      subject:
        'Friendly Reminder: Install your snippet to start running experiments!',
      html: secondEmailHtml,
    },
    // {
    //   id: 'snippet-installation-follow-up-3',
    //   daysAgo: 10,
    //   subject:
    //     'Final Reminder: Install your snippet to start running experiments!',
    //   html: thirdEmailHtml,
    // },
  ];

  for (const campaign of campaigns) {
    await processCampaign(campaign, fourHoursAgo);
  }
}

async function processCampaign(campaign, fourHoursAgo) {
  const dateThreshold = new Date(
    fourHoursAgo.getTime() - 1000 * 60 * 60 * 24 * campaign.daysAgo,
  );

  const res = await db.sequelize.query(
    `SELECT p.*, u.id as user_id, u.email, u.first_name, u.last_name
       FROM projects p
       JOIN users u ON p.user_id = u.id
       LEFT JOIN transactional_emails te
         ON u.id = te.user_id
         AND te.campaign_id = '${campaign.id}'
       WHERE p.snippet_status IS NULL
         AND p.created_at BETWEEN '2024-10-16' AND '${dateThreshold.toISOString()}'
         AND te.id IS NULL;`,
  );

  const projects = res[0];

  console.log(`Projects length for ${campaign.id}: `, projects.length);

  for (const project of projects) {
    console.log(
      'will send email ',
      campaign.id,
      ' to project ',
      project.id,
      ' to user: ',
      project.email,
    );
    await sendFollowUpEmail(project, campaign);
  }
}

async function sendFollowUpEmail(project, campaign) {
  console.log('Sending snippet follow up email to: ', project.email);
  await sendEmail({
    recipients: [{ email: project.email }],
    subject: campaign.subject,
    html: campaign.html(project),
  });
  console.log('Snippet follow up email sent to: ', project.email);

  await db.TransactionalEmail.create({
    user_id: project.user_id,
    campaign_id: campaign.id,
  });
}

export default handleSnippetInstallationFollowUps;
