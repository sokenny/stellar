import db from '../../models';
import sendEmail from '../sendEmail';

const firstTipEmailHtml = (data) => `
  <p>Hi ${data.first_name ? `${data.first_name}` : ''},</p>
  <p>We are hyped to have you here 🎉</p>
  <p>When it comes to AB testing, you don’t need a complete overhaul to see results.</p> 
  <p>In fact, small changes can lead to significant improvements.</p> 
  <p>Here are three quick tests you can run right away:</p>
  <p><strong>Headline Experiment:</strong> Test different copy on your titles. Try different angles of your offer. We found font size and color can also make a big difference.</p>
  <p><strong>CTA Button Variations:</strong> Swap out your CTA text (e.g., "Learn More" vs. "Get Started Now") and see which drives more clicks.</p>
  <p>You’d be surprised at the impact a small change can make. If you don't believe us, try and prove us wrong 🙏.</p>
  <p><a href="https://gostellar.app/dashboard">Start Testing</a></p>
  <p>Best, <br>Juan 👨‍🔬</p>
`;

const secondTipEmailHtml = (data) => `
  <p>${
    data.first_name ? `${data.first_name}` : ''
  }, here’s a little secret: Many people think they need a complete redesign of their landing page to see a lift in conversions.</p>
  <p>But here’s the truth – it’s often the copy, not the design, that holds the key to success.</p>
  <p>Small tweaks like changing your headline or refining your call-to-action wording can make a big difference. For example:</p>
  <p>Instead of "Learn More," try "Get Started Now" for a clearer call to action.</p>
  <p>Instead of focusing solely on features, highlight the benefits. A headline like “Boost Your Sales in Just 7 Days” speaks directly to your users’ goals.</p>
  <p>The best part? These changes are quick and easy to implement, so you can start seeing results faster.</p>
  <p><a href="https://gostellar.app/dashboard">Try a Copy Change Test Today</a></p>
  <p>You don’t need a full redesign to make an impact. Start small and test smart!</p>
  <p>Best, <br>Juan 👨‍🔬</p>
`;

const thirdTipEmailHtml = (data) => `
  <p>Hi ${data.first_name ? `${data.first_name}` : ''},</p>
  <p>Now that you're familiar with the basics, let's talk about best practices to help you get the most out of your tests:</p>
  <p><strong>Test One Change at a Time:</strong> It's tempting to test multiple elements at once, but it's better to focus on one variable (like your CTA text) to get clear, actionable insights.</p>
  <p><strong>Run Tests Long Enough for Reliable Results:</strong> Don't cut your tests short. Allow them to run until you see a statistically significant result.</p>
  <p><strong>Prioritize High-Impact Areas:</strong> Start with the elements that matter most, like headlines, CTAs, and form fields. These tend to have the biggest influence on conversions.</p>
  <p>Following these simple rules can help you make data-driven decisions and see more consistent improvements.</p>
  <p><a href="https://gostellar.app/dashboard">Launch Your Next Test with Confidence</a></p>
  <p>Keep testing and iterating – you've got this! 🚀</p>
  <p>Best, <br>Juan 👨‍🔬</p>
`;

async function handleGettingStartedCampaign() {
  console.log('Running handleGettingStartedCampaign!!!');
  const fourHoursAgo = new Date(new Date().getTime() - 1000 * 60 * 60 * 4);

  const campaigns = [
    {
      id: 'getting-started-1',
      daysAgo: 1,
      subject: 'Getting Started: 🚀 Experiment with These Easy A/B Test Ideas',
      html: firstTipEmailHtml,
    },
    {
      id: 'getting-started-2',
      daysAgo: 6, // 1 day + 5 days
      subject:
        'The #1 Mistake Holding Back Your Conversions (And How to Fix It)',
      html: secondTipEmailHtml,
    },
    {
      id: 'getting-started-3',
      daysAgo: 16, // 1 day + 5 days + 10 days
      subject: '3 Simple Rules to Maximize Your A/B Testing Results',
      html: thirdTipEmailHtml,
    },
  ];

  for (const campaign of campaigns) {
    await processCampaign(campaign, fourHoursAgo);
  }
}

async function processCampaign(campaign, fourHoursAgo) {
  const dateThreshold = new Date(
    fourHoursAgo.getTime() - 1000 * 60 * 60 * 24 * campaign.daysAgo,
  );

  // Determine the previous campaign ID
  const previousCampaignId = getPreviousCampaignId(campaign.id);

  const res = await db.sequelize.query(
    `SELECT u.id as user_id, u.email, u.first_name, u.last_name, u.email_settings
       FROM users u
       LEFT JOIN transactional_emails te
         ON u.id = te.user_id
         AND te.campaign_id = '${campaign.id}'
       WHERE u.created_at BETWEEN '2024-10-16' AND '${dateThreshold.toISOString()}'
         AND te.id IS NULL
         AND u.email NOT LIKE '%ignorar%'
       ${
         previousCampaignId
           ? `AND EXISTS (
         SELECT 1 FROM transactional_emails te_prev
         WHERE te_prev.user_id = u.id
         AND te_prev.campaign_id = '${previousCampaignId}'
       )`
           : ''
       }
       LIMIT 5;`, // Limit to 10 emails per run
  );

  const users = res[0];

  console.log(`Users length for ${campaign.id}: `, users.length);

  for (const user of users) {
    if (user.email_settings.recommendations) {
      // Check if recommendations is true
      console.log('will send email ', campaign.id, ' to user: ', user.email);
      await sendGettingStartedEmail(user, campaign);
    } else {
      console.log('Skipping user due to email settings: ', user.email);
    }
  }
}

function getPreviousCampaignId(currentCampaignId) {
  const campaignOrder = [
    'getting-started-1',
    'getting-started-2',
    'getting-started-3',
  ];
  const currentIndex = campaignOrder.indexOf(currentCampaignId);
  return currentIndex > 0 ? campaignOrder[currentIndex - 1] : null;
}

async function sendGettingStartedEmail(user, campaign) {
  console.log('Sending getting started email to: ', user.email);
  await sendEmail({
    recipients: [{ email: user.email }],
    subject: campaign.subject,
    html: campaign.html(user),
  });
  console.log('Getting started email sent to: ', user.email);

  await db.TransactionalEmail.create({
    user_id: user.user_id,
    campaign_id: campaign.id,
  });
}

export default handleGettingStartedCampaign;
