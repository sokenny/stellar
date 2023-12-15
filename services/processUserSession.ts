import { Request, Response } from 'express';

async function processUserSession(req: Request, res: Response) {
  try {
    // req.body is a buffer, convert it to a string and then parse it as JSON
    console.log('req: ', req);
    console.log('body actual:', req.body);
    const payloadString = req.body.toString();
    // const payload = JSON.parse(payloadString);

    console.log('PAYLOAD: ', payloadString);

    // Continue with your logic
    res.json({ message: 'Session processed', payloadString });
  } catch (error) {
    console.error('Error processing session data:', error);
    res.status(400).send('Bad request');
  }
}

export default processUserSession;
