import { Request, Response } from 'express';
import { SQS } from 'aws-sdk';

const sqs = new SQS({
  region: process.env.AWS_REGION || 'us-east-2',
});

async function publishUserSession(req: Request, res: Response) {
  const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  console.log('publishUserSession - ipAddress!', ipAddress);

  try {
    const payloadString = req.body.toString();
    const payload = JSON.parse(payloadString);

    const message = {
      ...payload,
      ipAddress,
      timestamp: new Date().toISOString(),
    };

    await sqs
      .sendMessage({
        QueueUrl: process.env.STELLAR_QUEUE_URL!,
        MessageBody: JSON.stringify(message),
      })
      .promise();

    res.status(202).send('Accepted');
  } catch (error) {
    console.error('Error publishing session data:', error);
    res.status(500).send('Internal Server Error');
  }
}

export default publishUserSession;
