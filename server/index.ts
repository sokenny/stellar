import express, { Express, Request, Response, NextFunction } from 'express';
import bodyParser from 'body-parser';
import api from './routes/api';
import dotenv from 'dotenv';
import cors from 'cors';
import getAllowedOrigins from './services/getAllowedOrigins';
import authMiddleware from './middlewares/auth-middleware';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3000;

let allowedOrigins: string[] = [];

async function updateAllowedOrigins() {
  console.log('---- UPDATING ORIGINS ----');
  try {
    const updatedAllowedOrigins = await getAllowedOrigins();
    allowedOrigins = updatedAllowedOrigins;
  } catch (error) {
    console.error('Failed to fetch origins from database:', error);
  }
}

updateAllowedOrigins();
setInterval(updateAllowedOrigins, 300000 / 10); // 5 min divided by 10

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
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

// I might then exclude this middleware from some routes
app.use(authMiddleware);

app.get('/', (req, res) => {
  res.status(200).send('All good!');
});

app.use('/api', api);

app.listen(PORT, () => console.log(`Server running on port: ${PORT}`));

process.once('SIGUSR2', function () {
  process.kill(process.pid, 'SIGUSR2');
});

process.on('SIGINT', function () {
  process.kill(process.pid, 'SIGINT');
});
