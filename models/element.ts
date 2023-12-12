import { Model, DataTypes, Sequelize } from 'sequelize';

class Element extends Model {
    public id!: number;
    public type!: string;
    public page!: string;
    public selector!: string;
    public project_id!: number; // Assuming 'project' is a separate model
}


export const initializeElement = (sequelize: Sequelize): typeof Element => {
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
        project_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'projects', 
                key: 'id',
            },
        },
    }, {
        sequelize,
        modelName: 'Element',
        tableName: 'elements',
        createdAt: 'created_at', 
        updatedAt: 'updated_at', 
    });

    return Element;
}
