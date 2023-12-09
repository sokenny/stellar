import { Model, DataTypes } from 'sequelize';
import sequelize from '../db'; 

class ElementProperties extends Model {
    public id!: number;
    public innerText!: string;
    public fontSize!: string;
    public color!: string;
    public backgroundColor!: string;
}

ElementProperties.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    innerText: DataTypes.STRING,
    fontSize: DataTypes.STRING,
    color: DataTypes.STRING,
    backgroundColor: DataTypes.STRING,
}, {
    sequelize,
    modelName: 'ElementProperties',
});

export default ElementProperties;
