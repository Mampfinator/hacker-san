import { CalenddarEvent } from "calenddar-client/dist/structures/Notification";
import { CalenddarPlatform } from "calenddar-client/dist/structures/Notification";
import { GuildChannel } from "discord.js";
import { Model, DataTypes } from "sequelize";
import { sequelize } from "./sequelize";

export class Callback extends Model {
    static toTypeData(data: Record<string, any>) {
        try {
            return JSON.stringify(data);
        } catch {
            return "{}"
        }
    };

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
     * ID of the thread this callback should be executed in, if any.
     */
    threadId!: string;
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
    priority?: number;
    platform?: CalenddarPlatform;
    typeData?: string;

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

    getTypeData(): Record<string, any> {
        if (!this.typeData) return {};

        try { return JSON.parse(this.typeData!); } 
        catch {return {}}
    }

    setTypeData(data: Record<string, any> | string) {
        if (typeof data === "string") this.typeData = data;
        else this.typeData = Callback.toTypeData(data);
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

        /* execution-relevant details */
        type: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        guildId: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        channelId: {
            type: DataTypes.STRING,
            allowNull: false,
        },

        /* trigger discriminators */
        vtuber: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        trigger: {
            type: DataTypes.STRING,
            allowNull: false,
        },

        /* optionals */
        threadId: DataTypes.STRING, // Thread ID, if any
        delay: {
            type: DataTypes.NUMBER({unsigned: true, }),
            defaultValue: 0
        },
        priority: DataTypes.INTEGER,
        typeData: DataTypes.STRING // stores type-specific data as JSON
    },
    {
        sequelize,
        timestamps: false
    }
)