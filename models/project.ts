import { Model, DataTypes, Sequelize } from 'sequelize';


class Project extends Model {
    public id!: number;
    public name!: string;
    public domain!: string;
}

export const initializeProject = (sequelize: Sequelize): typeof Project => {
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
    }, {
        sequelize,
        modelName: 'Project',
        tableName: 'projects',
        createdAt: 'created_at', 
        updatedAt: 'updated_at', 
    });

    return Project;
}