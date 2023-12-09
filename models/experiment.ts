// Experiment.ts
import { Model, DataTypes } from 'sequelize';
import sequelize from '../db'; // Adjust the import path as necessary
import Element from './Element';
import Journey from './Journey';
import Variant from './Variant';

class Experiment extends Model {
    public id!: number;
    public name!: string;
    public startDate!: Date;
    public endDate!: Date;
    public elementId!: number; // Assuming 'Element' is a separate model
    public journeyId!: number; // Assuming 'Journey' is a separate model
    public url!: string;
    // Variants association will be handled separately
}

Experiment.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    startDate: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    endDate: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    elementId: {
        type: DataTypes.INTEGER,
        references: {
            model: 'Elements', // This should match the table name of the Element model
            key: 'id',
        },
    },
    journeyId: {
        type: DataTypes.INTEGER,
        references: {
            model: 'Journeys', // This should match the table name of the Journey model
            key: 'id',
        },
    },
    url: {
        type: DataTypes.STRING,
        allowNull: false,
    },
}, {
    sequelize,
    modelName: 'Experiment',
});

// Associations
// Experiment.belongsTo(Element, { foreignKey: 'elementId' });
// Experiment.belongsTo(Journey, { foreignKey: 'journeyId' });
// Experiment.hasMany(Variant, { foreignKey: 'experimentId' }); // If Variant is a separate model

export default Experiment;
