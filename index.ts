import express, { Express } from 'express';
import bodyParser from 'body-parser';
import scrapper from './routes/scrapper';
import sequelize from './db'; // Import Sequelize connection
import dotenv from 'dotenv';
dotenv.config();

const app: Express = express();
const PORT = 3001;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/scrapper', scrapper);

// Establish connection to the database using Sequelize
sequelize.authenticate()
    .then(() => {
        console.log('Connection has been established successfully.');
        // Start the server only after the database connection is established
        app.listen(PORT, () => console.log(`Server running on port: ${PORT}`));
    })
    .catch(err => {
        console.error('Unable to connect to the database:', err);
    });
