import express, { Express } from 'express';
import bodyParser from 'body-parser';
import scrapper from './routes/scrapper';
import dotenv from 'dotenv';
dotenv.config();

const app: Express = express();
const PORT = 3001;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/scrapper', scrapper);

app.listen(PORT, () => console.log(`Server running on port: ${PORT}`));

process.on('uncaughtException', (err) => {
    console.error('There was an uncaught error', err);
    process.exit(1); 
  });
  