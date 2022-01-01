import { CommandInteraction, Client } from "discord.js"


// TODO: finish properly; 
// 1. basically make the generic "vtuber" option for callbacks & the likes query the search endpoint on Calenddar and return their names & values
const autocompleteFields = new Map()
    .set("vtuber", async (client, text) => {
        return (await client.calenddar.search(text, 25, ["id", "name"])).map(({id, name}) => ({name, value: id}));
    })

/**
 * @param {CommandInteraction} interaction
 */
export const AutocompleteHandler = {
    handle: async (interaction) => {
        if (!interaction.isAutocomplete()) return false;
        const {name, value} = interaction.options.getFocused(true);
        const responder = autocompleteFields.get(name);
        if (!responder) return;

        const response = await responder(interaction.client, value)

        await interaction.respond(response);
    }
}