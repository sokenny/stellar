import express, { Express, Request, Response } from 'express';
import scrapper from './routes/scrapper';

const app: Express = express();
const port = 3001;

app.use('/scrapper', scrapper);

app.get('/', (req: Request, res: Response) => {
  res.send('Express + TypeScript Server');
});

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${port}`);
})
