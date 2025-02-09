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
import runWorker from './services/worker';

dotenv.config();
// TODO-p2: Si alguien pone url de un project que ya existe en el autogenerate, que cree uno nuevo o que no traiga los exps creados anteriormente
//   - A menos que este logeado y esa url pertenezca a un proyecto suyo.

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
      callback(null, false);
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

runWorker();

app.listen(PORT, () => console.log(`Server running on port: ${PORT}`));
