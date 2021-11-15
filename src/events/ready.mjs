import { Client } from "discord.js"

export default {
    name: "ready",
    once: true,
    /**
     * 
     * @param {Client} client 
     */
    async execute(client) {
        if (!client.application.owner) await client.application.fetch();
        await client.commands.register(process.env.NODE_ENV !== "deployment" ? "826407842558115880" : undefined);

        await client.guilds.fetch();
        for (const [id] of client.guilds.cache) {
            await client.settings.fetch(id, true);
        }
    }
}