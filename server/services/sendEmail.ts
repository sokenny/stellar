import { MailtrapClient } from 'mailtrap';

const client = new MailtrapClient({
  token: process.env.MAILTRAP_API_TOKEN,
});

async function sendEmail({
  recipients,
  subject,
  html,
  category = 'Transactional',
}) {
  const sender = {
    email: 'hello@gostellar.app',
    name: 'Stellar AB Testing',
  };

  const updatedHtml = `${html}<br><br><a href="https://gostellar.app/account">Unsubscribe</a> by updating your email preferences.`;

  client.send({
    from: sender,
    to: recipients,
    subject,
    html: updatedHtml,
    category,
  });
}

export default sendEmail;
