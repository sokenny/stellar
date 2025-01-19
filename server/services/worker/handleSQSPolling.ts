import { SQS } from 'aws-sdk';
import processQueuedSession from '../processQueuedSession';

const sqs = new SQS({
  region: process.env.AWS_REGION || 'us-east-1',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

let isPolling = false;

async function pollQueue() {
  if (isPolling) return;

  isPolling = true;
  try {
    const response = await sqs
      .receiveMessage({
        QueueUrl: process.env.STELLAR_QUEUE_URL!,
        MaxNumberOfMessages: 10,
        WaitTimeSeconds: 20,
      })
      .promise();

    if (response.Messages) {
      console.log('juanete - response.Messages!', response.Messages);
      await Promise.all(
        response.Messages.map(async (message) => {
          try {
            await processQueuedSession(message.Body!);
            await sqs
              .deleteMessage({
                QueueUrl: process.env.STELLAR_QUEUE_URL!,
                ReceiptHandle: message.ReceiptHandle!,
              })
              .promise();
          } catch (error) {
            console.error('Error processing message:', error);
          }
        }),
      );
    }
  } catch (error) {
    console.error('Error polling queue:', error);
  } finally {
    isPolling = false;
  }
}

export default function handleSQSPolling() {
  setInterval(pollQueue, 5000);
}
