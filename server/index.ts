import express, { Express } from 'express';
import bodyParser from 'body-parser';
import api from './routes/api';
import dotenv from 'dotenv';
import cors from 'cors';
dotenv.config();

const app: Express = express();
const PORT = process.env.PORT;

const allowedOrigins = [
  'https://lengaswear.vercel.app',
  'https://www.lengaswear.vercel.app',
  'https://anotherdomain.com' /* other domains you want to allow */,
  'http://localhost:3000',
  'https://incubadora.bluehackers.com',
  'https://www.grantcardonerealestate.com',
  'https://clickup.com',
  'http://localhost:3002',
  'http://localhost:3004',
];

const corsOptions = {
  origin: function (origin, callback) {
    console.log('origin que llega: ', origin);
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
};

app.use(cors(corsOptions));
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.status(200).send('All good!');
});
app.use('/api', api);

console.log('RUNN');

app.listen(PORT, () => console.log(`Server running on port: ${PORT}`));

process.once('SIGUSR2', function () {
  process.kill(process.pid, 'SIGUSR2');
});

process.on('SIGINT', function () {
  // this is only called on ctrl+c, not restart
  process.kill(process.pid, 'SIGINT');
});
