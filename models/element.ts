// Element.ts
import { Model, DataTypes } from 'sequelize';
import sequelize from '../db'; // Adjust the import path as necessary
import ElementProperties from './ElementProperties';
import Project from './Project';

class Element extends Model {
    public id!: number;
    public type!: string;
    public page!: string;
    public selector!: string;
    public properties!: ElementProperties;
    public projectId!: number; // Assuming 'project' is a separate model
}

Element.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    type: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    page: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    selector: {
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
    modelName: 'Element',
});

// Association (if Project model is defined)
Element.belongsTo(Project, { foreignKey: 'projectId' });

export default Element;
