// Journey.ts
import { Model, DataTypes } from 'sequelize';
import sequelize from '../db'; // Adjust the import path as necessary
import Experiment from './Experiment';
import Project from './Project';

class Journey extends Model {
    public id!: number;
    public name!: string;
    public page!: string;
    public projectId!: number; // Assuming 'Project' is a separate model
    // Experiments association will be handled separately
}

Journey.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    page: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    projectId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Projects', // This should match the table name of the Project model
            key: 'id',
        },
    },
}, {
    sequelize,
    modelName: 'Journey',
});

// create associations between Journey and Experiments, Journey can have many experiments
// Journey.hasMany(Experiment, {
//     foreignKey: 'journeyId',
//     as: 'experiments',
// });

// Associations
// Journey.belongsTo(Project, { foreignKey: 'projectId' });
// Journey.hasMany(Experiment, { foreignKey: 'journeyId' }); // If Experiment is a separate model

export default Journey;
