import { DataTypes, Model } from "sequelize";
import { sequelize } from ".";
import { HackerSan } from "../hacker-san";

export class Autoreact extends Model {
    triggers!: string;
    emoji!: string;
    readonly guildId!: string;

    getTriggers() {
        return this.triggers.split(",");
    }   

    setTriggers(triggers: string[]) {
        this.triggers = triggers.join(",");
    }

    addTrigger(trigger: string) {
        const triggers = this.getTriggers();
        this.setTriggers([...new Set([...triggers, trigger])]);
    }

    removeTrigger(trigger: string) {
        const triggers = this.getTriggers().filter(t => t !== trigger);
        this.setTriggers(triggers);
    }

    async fetchEmoji(client: HackerSan) {
        return client.emojis.resolve(this.emoji) ?? (await client.guilds.fetch(this.guildId)).emojis.fetch(this.emoji); 
    }
}

Autoreact.init(
    {
        guildId: DataTypes.STRING,
        triggers: DataTypes.STRING,
        emoji: DataTypes.STRING
    }, {
        sequelize, 
        timestamps: false
    }
);