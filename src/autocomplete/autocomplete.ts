import { APIApplicationCommandAutocompleteResponse } from "discord-api-types";
import { ApplicationCommandOptionChoice, AutocompleteInteraction } from "discord.js";

export interface Autocomplete {
    enabledCommands?: Set<string>;
    disabledCommands?: Set<string>;

    optionAliases: (string | number)[];

    execute(interaction: AutocompleteInteraction, input: string | number): ApplicationCommandOptionChoice[] | Promise<ApplicationCommandOptionChoice[]>;
}

const autocompletes = new Set<Autocomplete>();

export const addAutocomplete = (autocomplete: Autocomplete) => autocompletes.add(autocomplete);
export const getAutocompletes = () => new Set(autocompletes);
export const removeAutocomplete = (autocomplete: Autocomplete) => autocompletes.delete(autocomplete);