import { Client, CommandInteraction } from "discord.js"

export default {
    name: "interactionCreate",
    once: true,
    /**
     * @param {CommandInteraction} interaction
     * @param {Client} client 
     */
    async execute(interaction, client) {
        let handlers = [client.commands]; 

        for (const handler of handlers) {
            try {
                var result = await handler.handle(interaction)
            } catch {
                console.log("Handler encountered an error: ", handler);
            }
            // break once we've found the right interaction handler 
            if (typeof result !== "boolean" || result === true) break;
        }
    }
}