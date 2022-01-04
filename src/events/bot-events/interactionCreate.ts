import { Interaction } from "discord.js";
import { HackerSan } from "../../hacker-san";

export const InteractionCreateEvent = {
    name: "interactionCreate",
    async execute(interaction: Interaction) {
        const {client} = interaction as unknown as {client: HackerSan}; 

        client.commands.handle(interaction);
    }
}