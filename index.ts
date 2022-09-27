import express, { Express, Request, Response } from 'express';
import bodyParser from 'body-parser';
import scrapper from './routes/scrapper';

const app: Express = express();
const port = 3001;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/scrapper', scrapper);


app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${port}`);
})
