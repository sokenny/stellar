import { Model, DataTypes, Sequelize } from 'sequelize';


class Journey extends Model {
    public id!: number;
    public name!: string;
    public page!: string;
    public project_id!: number; 
    public context!: object;
}

export const initializeJourney = (sequelize: Sequelize): typeof Journey => {
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
        project_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'projects', 
                key: 'id',
            },
        },
        context: {
            type: DataTypes.JSONB,
            allowNull: true,
        },
    }, {
        sequelize,
        modelName: 'Journey',
        tableName: 'journeys',
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    });

    return Journey;
}
