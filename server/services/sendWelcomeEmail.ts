import sendEmail from './sendEmail';

async function sendWelcomeEmail(newUser) {
  const html = `
      <p>Welcome to Stellar AB Testing${
        newUser.first_name ? `, ${newUser.first_name}` : ''
      }!</p>
      <p>You can now start increasing your conversion rates by creating new experiments with our platform.</p>
      <p>Don't have a clear idea on what to test? Start by making text variations of your main elements! Such as your h1 or CTA. Plenty of CR potential is usually locked inside simple tweaks of this nature.</p>
      <p>Feel free to reach to us at <b>hello@gostellar.app</b> if you need any help getting set up :)</p>
    `;

  await sendEmail({
    recipients: [{ email: newUser.email }],
    subject: 'Welcome to Stellar AB Testing!',
    html,
  });
}

export default sendWelcomeEmail;
