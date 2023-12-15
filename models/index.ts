import fs from 'fs';
import path from 'path';
import { Sequelize, DataTypes } from 'sequelize';
import { config as dotenvConfig } from 'dotenv';

dotenvConfig();

export const basename = path.basename(__filename);
export const env = process.env.NODE_ENV || 'development';

import config from '../config/config.json';
import { initializeJourney } from './Journey';
import { initializeProject } from './Project';
import { initializeVariant } from './Variant';
import { initializeExperiment } from './Experiment';
import { initializeElementProperties } from './ElementProperties';
import { initializeElement } from './Element';

export const db: { [key: string]: any } = {};

export let sequelize: Sequelize;
const DB_PASSWORD = process.env[config[env].password];
const DB_NAME = process.env[config[env].database];
const DB_USER = process.env[config[env].username];
sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, config[env]);

const modelFiles = fs.readdirSync(__dirname).filter((file: string) => {
  return (
    file.indexOf('.') !== 0 && file !== basename
    // Add more filters as needed
  );
});

db.Journey = initializeJourney(sequelize);
db.Project = initializeProject(sequelize);
db.Variant = initializeVariant(sequelize);
db.Experiment = initializeExperiment(sequelize);
db.ElementProperties = initializeElementProperties(sequelize);
db.Element = initializeElement(sequelize);

const associateModels = () => {
  db.Journey.hasMany(db.Experiment, {
    foreignKey: 'journey_id',
    as: 'experiments',
  });
  db.Experiment.belongsTo(db.Journey, {
    foreignKey: 'journey_id',
    as: 'journey',
  });

  db.Experiment.hasMany(db.Variant, {
    foreignKey: 'experiment_id', // Adjust the foreign key as per your database schema
    as: 'variants', // This is the alias for the association
  });
  db.Variant.belongsTo(db.Experiment, {
    foreignKey: 'experiment_id', // Adjust the foreign key as per your database schema
    as: 'experiment', // This is the alias for the association
  });

  // Add more associations as needed
};

associateModels();

export default db;
