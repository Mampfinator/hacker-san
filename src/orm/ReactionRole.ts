import { DataTypes, Model } from "sequelize/dist";
import { sequelize } from "./sequelize";

export class ReactionRole extends Model {
    readonly guildId!: string;
    readonly emojiId!: string;
    readonly type!: string;
}

ReactionRole.init(
    {
        guildId: DataTypes.STRING,
        emojiId: DataTypes.STRING,
        type: DataTypes.STRING
    }, 
    {
        sequelize, 
        timestamps: false
    }
);