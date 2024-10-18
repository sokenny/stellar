import path from 'path';
import { Sequelize } from 'sequelize';
import { config as dotenvConfig } from 'dotenv';

dotenvConfig();

export const basename = path.basename(__filename);
export const env = process.env.NODE_ENV || 'development';

import config from '../config/config.json';
import { initializePage } from './Page';
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
import { initializeTransactionalEmail } from './TransactionalEmail';

export const db: { [key: string]: any } = {};

export let sequelize: Sequelize;
const DB_PASSWORD = process.env[config[env].password];
const DB_NAME = process.env[config[env].database];
const DB_USER = process.env[config[env].username];
sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, config[env]);

db.Page = initializePage(sequelize);
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
db.TransactionalEmail = initializeTransactionalEmail(sequelize);

db.sequelize = sequelize;
db.Sequelize = sequelize;

const associateModels = () => {
  db.User.hasMany(db.Project, {
    foreignKey: 'user_id',
    as: 'projects',
  });
  db.Page.belongsTo(db.Project, {
    foreignKey: 'project_id',
    as: 'project',
  });
  db.User.hasMany(db.TransactionalEmail, {
    foreignKey: 'user_id',
    as: 'transactional_emails',
  });
  db.TransactionalEmail.belongsTo(db.User, {
    foreignKey: 'user_id',
    as: 'user',
  });
  db.Project.belongsTo(db.User, {
    foreignKey: 'user_id',
    as: 'user',
  });
  db.Project.hasMany(db.Page, {
    foreignKey: 'project_id',
    as: 'pages',
  });
  db.Project.hasMany(db.Experiment, {
    foreignKey: 'project_id',
    as: 'experiments',
  });
  db.Page.hasMany(db.Experiment, {
    foreignKey: 'page_id',
    as: 'experiments',
  });
  db.Experiment.belongsTo(db.Project, {
    foreignKey: 'project_id',
    as: 'project',
  });
  db.Experiment.belongsTo(db.Page, {
    foreignKey: 'page_id',
    as: 'page',
  });
  db.Experiment.belongsTo(db.Element, {
    foreignKey: 'element_id',
    as: 'element',
  });
  db.Experiment.hasMany(db.Variant, {
    foreignKey: 'experiment_id',
    as: 'variants',
  });
  db.Variant.belongsTo(db.Experiment, {
    foreignKey: 'experiment_id',
    as: 'experiment',
  });
  db.Page.hasMany(db.Element, {
    foreignKey: 'page_id',
    as: 'elements',
  });
  db.Element.belongsTo(db.Page, {
    foreignKey: 'page_id',
    as: 'page',
  });
  db.ApiKey.belongsTo(db.User, {
    foreignKey: 'user_id',
    as: 'user',
  });
  db.User.hasMany(db.ApiKey, {
    foreignKey: 'user_id',
    as: 'api_keys',
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
