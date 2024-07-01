import express, { Express } from 'express';
import bodyParser from 'body-parser';
import api from './routes/api';
import dotenv from 'dotenv';
import cors from 'cors';
import getAllowedOrigins from './services/getAllowedOrigins'; // Import the service you created

const UPDATE_ORIGINS_EVERY = 300000 / 10; // This is 5 min divided by 10. On prod it could be like 5 min

// TODO-p1-4: Add authentication for each request - create a middleware for this

// TODO-p1-5: Setup cronjobs that handle exp settings with worker

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
setInterval(updateAllowedOrigins, UPDATE_ORIGINS_EVERY);

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
