import {sequelize} from "./sequelize";
import { Model, DataType, DataTypes } from "sequelize";

export class Settings extends Model {
    readonly guildId!: string;
}

Settings.init(
    {
        guildId: {
            primaryKey: true,
            unique: true,
            type: DataTypes.STRING
        }
    }, 
    {
        sequelize, 
        timestamps: false
    }
)