import { HackerSan } from "../../hacker-san";
import { Settings } from "../../orm";
import {IEvent} from "../EventLoader";

export const ReadyEvent = {
    name: "ready",
    once: true,
    async execute(client: HackerSan) {
        console.log("Syncing Settings table...");

        for (const guild of client.guilds.cache.values()) {
            if (!(await Settings.findOne({where: {guildId: guild.id}}))) {
                console.log(`Joined guild ${guild.name} (${guild.id}) while offline. Creating new row.`);
                await Settings.create({
                    guildId: guild.id
                });
            }
        }
    }
} as IEvent;