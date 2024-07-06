import express, { Express } from 'express';
import bodyParser from 'body-parser';
import api from './routes/api';
import publicRoutes from './routes/public';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import cors from 'cors';
import getAllowedOrigins from './services/getAllowedOrigins';
import authMiddleware from './middlewares/auth-middleware';
import normalizeUrl from './helpers/normalizeUrl';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3000;

const corsOptions = {
  origin: async function (origin, callback) {
    const allowedOrigins = await getAllowedOrigins();

    const normalizedOrigin = normalizeUrl(origin);

    console.log('normalized origin: ', origin);

    if (!origin || allowedOrigins.includes(normalizedOrigin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'DELETE', 'UPDATE', 'PUT', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Project-Id'],
};

app.use(cors(corsOptions));
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser()); // Add cookie-parser middleware

app.get('/', (req, res) => {
  res.status(200).send('All good!');
});

// middleware that console logs the request method and path
app.use((req, res, next) => {
  console.log(`${req.method} request for ${req.url}`);
  next();
});

app.use('/public', publicRoutes);
app.use('/api', authMiddleware, api);
// app.use('/api', api);

// If this is a .ts file, ignore the line below
app.listen(PORT, () => console.log(`Server running on port: ${PORT}`));

// process.once('SIGUSR2', function () {
//   server.close(() => {
//     process.kill(process.pid, 'SIGUSR2');
//   });
// });

// process.on('SIGINT', function () {
//   server.close(() => {
//     process.kill(process.pid, 'SIGINT');
//   });
// });

// process.on('uncaughtException', function (err) {
//   console.error(err);
//   server.close(() => {
//     process.exit(1);
//   });
// });
