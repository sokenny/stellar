import { Model, DataTypes, Sequelize } from 'sequelize';

class Variant extends Model {
    public id!: number;
    public element_id!: number; 
    public text?: string;
    public font_size?: string;
    public color?: string;
    public background_color?: string;
    public experiment_id!: number;
}


export const initializeVariant = (sequelize: Sequelize): typeof Variant => {
    Variant.init({
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        element_id: {
            type: DataTypes.INTEGER,
            references: {
                model: 'elements', // This should match the table name of the Element model
                key: 'id',
            },
        },
        text: DataTypes.STRING,
        font_size: DataTypes.STRING,
        color: DataTypes.STRING,
        background_color: DataTypes.STRING,
        experiment_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'experiments', 
                key: 'id',
            },
        },
    }, {
        sequelize,
        modelName: 'Variant',
        tableName: 'variants',
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    });

    return Variant;
}