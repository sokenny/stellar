import path from 'path';
import { Sequelize } from 'sequelize';
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
import { initializeSession } from './Session';
import { initializeUser } from './User';
import { initializeApiKey } from './ApiKey';
import { initializeGoal } from './Goal';
import { initializeSessionExperiment } from './SessionExperiment';

export const db: { [key: string]: any } = {};

export let sequelize: Sequelize;
const DB_PASSWORD = process.env[config[env].password];
const DB_NAME = process.env[config[env].database];
const DB_USER = process.env[config[env].username];
sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, config[env]);

db.Journey = initializeJourney(sequelize);
db.Project = initializeProject(sequelize);
db.Variant = initializeVariant(sequelize);
db.Experiment = initializeExperiment(sequelize);
db.ElementProperties = initializeElementProperties(sequelize);
db.Element = initializeElement(sequelize);
db.Session = initializeSession(sequelize);
db.User = initializeUser(sequelize);
db.ApiKey = initializeApiKey(sequelize);
db.Goal = initializeGoal(sequelize);
db.SessionExperiment = initializeSessionExperiment(sequelize);

db.sequelize = sequelize;
db.Sequelize = sequelize;

const associateModels = () => {
  db.Journey.belongsTo(db.Project, {
    foreignKey: 'project_id',
    as: 'project',
  });
  db.Project.hasMany(db.Journey, {
    foreignKey: 'project_id',
    as: 'journeys',
  });
  db.Journey.hasMany(db.Experiment, {
    foreignKey: 'journey_id',
    as: 'experiments',
  });
  db.Experiment.belongsTo(db.Journey, {
    foreignKey: 'journey_id',
    as: 'journey',
  });
  db.Experiment.hasMany(db.Variant, {
    foreignKey: 'experiment_id',
    as: 'variants',
  });
  db.Variant.belongsTo(db.Experiment, {
    foreignKey: 'experiment_id',
    as: 'experiment',
  });
  db.Journey.hasMany(db.Element, {
    foreignKey: 'journey_id',
    as: 'elements',
  });
  db.Element.belongsTo(db.Journey, {
    foreignKey: 'journey_id',
    as: 'journey',
  });
  db.ApiKey.belongsTo(db.User, {
    foreignKey: 'user_id',
    as: 'user',
  });
  db.Experiment.hasOne(db.Goal, {
    foreignKey: 'experiment_id',
    as: 'goal',
  });
  db.Goal.belongsTo(db.Experiment, {
    foreignKey: 'experiment_id',
    as: 'experiment',
  });
  db.SessionExperiment.belongsTo(db.Session, {
    foreignKey: 'session_id',
    as: 'session',
  });
  db.Session.hasMany(db.SessionExperiment, {
    foreignKey: 'session_id',
    as: 'sessionExperiments',
  });

  db.SessionExperiment.belongsTo(db.Experiment, {
    foreignKey: 'experiment_id',
    as: 'experiment',
  });
  db.Experiment.hasMany(db.SessionExperiment, {
    foreignKey: 'experiment_id',
    as: 'sessionExperiments',
  });

  db.SessionExperiment.belongsTo(db.Variant, {
    foreignKey: 'variant_id',
    as: 'variant',
  });
  db.Variant.hasMany(db.SessionExperiment, {
    foreignKey: 'variant_id',
    as: 'sessionExperiments',
  });
};

associateModels();

export default db;
