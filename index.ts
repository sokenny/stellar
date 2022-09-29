import express, { Express } from 'express';
import bodyParser from 'body-parser';
import scrapper from './routes/scrapper';
import mongoose, {ConnectOptions} from 'mongoose'
import dotenv from 'dotenv';
dotenv.config();

const app: Express = express();
const PORT = 3001;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/scrapper', scrapper);

const CONNECTION_URL = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.viitndt.mongodb.net/?retryWrites=true&w=majority`

mongoose.connect(CONNECTION_URL, {useNewUrlParser: true, useUnifiedTopology: true} as ConnectOptions)
    .then(()=> app.listen(PORT, ()=>console.log('Server running on port: ' + PORT)))
    .catch((error)=> console.log(error.message)) 