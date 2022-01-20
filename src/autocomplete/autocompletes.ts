import { HackerSan } from "../hacker-san";
import { addAutocomplete } from "./autocomplete";

addAutocomplete({
    optionAliases: ["vtuber", "add_vtuber", "remove_vtuber"],
    async execute(interaction, input: string) {
        if (input.length < 3) return [];
        
        const vtubers = await (interaction.client as HackerSan).calenddar.vtubers.search(input);
        return vtubers.map(vtuber => ({
            name: `${vtuber.name} ${vtuber.originalName ? `(${vtuber.originalName})` : ""}`,
            value: vtuber.id
        }));
    }
});