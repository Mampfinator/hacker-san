import { CalenddarEvent } from "calenddar-client/dist/structures/Notification";
import { CalenddarPlatform } from "calenddar-client/dist/structures/Notification";
import { GuildChannel } from "discord.js";
import { Model, DataTypes } from "sequelize";
import { sequelize } from "./sequelize";

export class Callback extends Model {
    /**
     * Unique callback ID.
     */
    readonly id!: string;
    /**
     * Callback type identifier.
     */
    readonly type!: string;
    /**
     * ID of the guild this callback should be executed in.
     */
    readonly guildId!: string;
    /**
     * ID of the channel this callback should be executed in.
     */
    channelId!: string;
    /**
     * ID of the VTuber this callback should trigger on.
     */
    vtuber!: string;
    /**
     * Event this callback should trigger on.
     */
    trigger!: CalenddarEvent;
    /**
     * 
     */
    delay?: number;
    platform?: CalenddarPlatform;


    /**
     * @returns a Discord API embed field
     */
    toField() {
        return {
            name: `${this.id} - ${this.type} - ${this.trigger}`,
            value: `<#${this.channelId}> (${this.channelId}) - ${this.vtuber}`
        }
    }

    editChannel(channel: GuildChannel) {
        this.channelId = channel.id;
        return this;
    }

    editVtuber(vtuberId: string) {
        this.vtuber = vtuberId;
        return this;
    }

    editTrigger(trigger: CalenddarEvent) {
        this.trigger = trigger;
        return this;
    }
}
Callback.init(
    {
        id: {
            primaryKey: true,
            unique: true,
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            allowNull: false
        },
        type: DataTypes.STRING,
        guildId: DataTypes.STRING,
        channelId: DataTypes.STRING,
        vtuber: DataTypes.STRING,
        trigger: DataTypes.STRING,
        delay: {
            type: DataTypes.NUMBER({unsigned: true, }),
            defaultValue: 0
        }
    },
    {
        sequelize,
        timestamps: false
    }
)