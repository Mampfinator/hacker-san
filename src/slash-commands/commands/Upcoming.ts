import { SlashCommandBuilder } from "@discordjs/builders";
import {Builder, SlashCommand} from "../SlashCommand";

@SlashCommand({
    name: "upcoming",
    description: "Get upcoming streams for a VTuber, or this server's main VTuber(s)!"
})
export class Upcoming {
    @Builder()
    options(builder: SlashCommandBuilder) {
        return builder.
            addStringOption(vtuber => vtuber
                .setName("vtuber")
                .setDescription("VTuber to fetch upcoming streams for. If not set, will default to server's main VTubers.")
                .setAutocomplete(true))
            .addStringOption(sortBy => sortBy
                .setName("sort_by")
                .setDescription("Choose what to sort the returned streams by. Defaults to ascending time until scheduled start..")
                .setChoices([
                    ["Time until start (ascending)", "time_to_start.ascending"],
                    ["Time until start (descending)", "time_to_start.descending"],
                    ["VTuber", "vtuber"]
                ]))
    }
}