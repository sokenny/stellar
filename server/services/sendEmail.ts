import { MailtrapClient } from 'mailtrap';

const client = new MailtrapClient({
  token: process.env.MAILTRAP_API_TOKEN,
});

async function sendEmail(req, res) {
  const sender = {
    email: 'hello@gostellar.app',
    name: 'Mailtrap Test',
  };
  const recipients = [
    {
      email: 'hello@gostellar.app',
    },
  ];

  client
    .send({
      from: sender,
      to: recipients,
      subject: 'You are awesome!',
      text: 'Congrats for sending test email with Mailtrap!',
      category: 'Integration Test',
    })
    .then(
      (result) => {
        console.log(result);
        res.send('Email sent');
      },
      (error) => {
        console.error(error);
        res.send('Error sending email');
      },
    );
}

export default sendEmail;
