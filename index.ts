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

console.log("RUNN")

app.listen(PORT, () => console.log(`Server running on port: ${PORT}`));


process.once('SIGUSR2', function () {
  process.kill(process.pid, 'SIGUSR2');
});

process.on('SIGINT', function () {
  // this is only called on ctrl+c, not restart
  process.kill(process.pid, 'SIGINT');
});