import { DataTypes, Model } from "sequelize";
import { sequelize } from "./sequelize";

export class ReactionRole extends Model {
    readonly guildId!: string;
    readonly emojiId!: string;
    readonly type!: string;
}

ReactionRole.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            unique: true, 
            primaryKey: true,
            allowNull: false
        },
        guildId: DataTypes.STRING,
        emojiId: DataTypes.STRING,
        type: DataTypes.STRING
    }, 
    {
        sequelize, 
        timestamps: false
    }
);