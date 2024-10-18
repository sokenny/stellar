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

  client.send({
    from: sender,
    to: recipients,
    subject,
    html,
    category,
  });
}

export default sendEmail;
