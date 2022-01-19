import { CommandInteraction } from "discord.js";
import { handleAutocompletes } from "../../autocomplete/HandleAutocomplete";
import {IEvent} from "../EventLoader";

export const InteractionCreateEvent = {
    name: "interactionCreate",
    once: false,
    async execute(interaction: CommandInteraction) {
        handleAutocompletes(interaction);
    }
} as IEvent;