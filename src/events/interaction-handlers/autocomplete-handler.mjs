import { CommandInteraction, Client } from "discord.js"

const responders = new Map()
    .set("vtuber", async (client, text) => {
        if (text?.length < 3) return []; // as to not flood Calenddar with requests. 
        return (await client.calenddar.search(text, 25, ["id", "name", "originalName", "affiliation"])).map(({id, name, originalName, affiliation}) => ({name: `${name}${originalName ? `/${originalName}` : ""} (${affiliation})`, value: id}));
    })

/**
 * @param {CommandInteraction} interaction
 */
export const AutocompleteHandler = {
    handle: async (interaction) => {
        if (!interaction.isAutocomplete()) return false;
        const {name, value} = interaction.options.getFocused(true);
        const responder = responders.get(name);
        if (!responder) return;

        const response = await responder(interaction.client, value)

        await interaction.respond(response);
    }
}