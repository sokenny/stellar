// Project.ts
import { Model, DataTypes } from 'sequelize';
import sequelize from '../db'; // Adjust the import path as necessary

class Project extends Model {
    public id!: number;
    public name!: string;
    public domain!: string;
    public userId!: number; // Assuming 'User' is a separate model with an 'id' field
}

Project.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    domain: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users', // This should match the table name of the User model
            key: 'id',
        },
    },
}, {
    sequelize,
    modelName: 'Project',
});

// Association (if User model is defined)
// Project.belongsTo(User, { foreignKey: 'userId' });

export default Project;
