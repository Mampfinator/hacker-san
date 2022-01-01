import { Client, CommandInteraction } from "discord.js"
import {InteractionHandlers} from "./interaction-handlers/index.mjs";

export default {
    name: "interactionCreate",
    once: true,
    /**
     * @param {CommandInteraction} interaction
     * @param {Client} client 
     */
    async execute(interaction, client) {
        let handlers = [...InteractionHandlers, client.commands]; 

        for (const handler of handlers) {
            try {
                var result = await handler.handle(interaction)
            } catch (error) {
                console.error("Handler encountered an error: ", handler, error);
            }
            // break once we've found the right interaction handler 
            if (typeof result !== "boolean" || result === true) break;
        }
    }
}