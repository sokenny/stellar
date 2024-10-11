import { MailtrapClient } from 'mailtrap';

const client = new MailtrapClient({
  token: process.env.MAILTRAP_API_TOKEN,
});

// async function sendEmail(req, res) {
//   const sender = {
//     email: 'hello@gostellar.app',
//     name: 'Mailtrap Test',
//   };
//   const recipients = [
//     {
//       email: 'hello@gostellar.app',
//     },
//   ];

//   client
//     .send({
//       from: sender,
//       to: recipients,
//       subject: 'You are awesome O! test 2',
//       html: 'Congrats for <h1>sending</h1> test email with Mailtrap!',
//       category: 'Integration Test',
//     })
//     .then(
//       (result) => {
//         console.log(result);
//         res.send('Email sent');
//       },
//       (error) => {
//         console.error(error);
//         res.send('Error sending email');
//       },
//     );
// }

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
