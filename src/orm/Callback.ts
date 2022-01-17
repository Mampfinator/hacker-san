import { GuildChannel } from "discord.js";
import { Model, DataTypes } from "sequelize";
import { sequelize } from "./sequelize";

export class Callback extends Model {
    readonly id!: string;
    readonly type!: string;
    readonly guildId!: string;
    channelId!: string;
    vtuber!: string;
    trigger!: string;

    editChannel(channel: GuildChannel) {
        this.channelId = channel.id;
        return this;
    }

    editVtuber(vtuberId: string) {
        this.vtuber = vtuberId;
        return this;
    }

    editTrigger(trigger: string) {
        this.trigger = trigger;
        return this;
    }
}
Callback.init(
    {
        id: {
            primaryKey: true,
            unique: true,
            type: DataTypes.UUIDV4
        },
        type: DataTypes.STRING,
        guildId: DataTypes.STRING,
        channelId: DataTypes.STRING,
        vtuber: DataTypes.STRING,
        trigger: DataTypes.STRING
    },
    {
        sequelize,
        timestamps: false
    }
)