import { Interaction } from "discord.js";
import { getAutocompletes } from "./autocomplete";

export const handleAutocompletes = async (interaction: Interaction) => {
    if (!interaction.isAutocomplete()) return;

    // find out if there's a proper handler for the autocomplete.
    const autocompletes = getAutocompletes();
    const {name: option, value: input} = interaction.options.getFocused(true);

    const autocomplete = [...autocompletes].find(ac => 
        ac.optionAliases.includes(option) && (
            (!ac.enabledCommands && !ac.disabledCommands) ||
            ac.enabledCommands?.has(interaction.commandName) ||
            !(ac.disabledCommands?.has(interaction.commandName))
        )
    )

    if (!autocomplete) return;
    await interaction.respond(await autocomplete.execute(interaction, input));
}