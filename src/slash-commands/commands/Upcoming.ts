import { SlashCommandBuilder } from "@discordjs/builders";
import { Stream, VTuber } from "calenddar-client";
import { CommandInteraction, MessageEmbed } from "discord.js";
import { groupBy, reverse, sortBy } from "ts-prime";
import { HackerSan } from "../../hacker-san";
import { Settings } from "../../orm";
import {Builder, Execute, SlashCommand} from "../SlashCommand";

const sortOrders = new Map<string, string>()
    .set("Time until start (ascending)", "time_to_start.ascending")
    .set("Time until start (descending)", "time_to_start.descending")
    .set("VTuber", "vtuber")

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
                .setChoices(
                    [...sortOrders.entries()]
                ))
    }

    @Execute()
    async fetchUpcoming(interaction: CommandInteraction) {
        const settings = await Settings.findOne({where: {guildId: interaction.guildId}});
        const   vtuber = interaction.options.getString("vtuber"),
                sortBy = interaction.options.getString("sort_by") ?? "time_to_start.ascending";

        const client = interaction.client as HackerSan;

        let vtubers: VTuber[];


        if (vtuber) {
            vtubers = [await client.calenddar.vtubers.fetch(vtuber)];
        } else if (!vtuber && settings && settings.mainVtubers) {
            vtubers = await Promise.all(settings?.vtubers.get().map(id => client.calenddar.vtubers.fetch(id)));
        } else {
            return new MessageEmbed()
                .setTitle("This guild does not have main VTubers.")
                .setColor("RED")
                .setDescription("If you're the owner of this guild, add VTubers via `/settings set add_vtuber`");
        }

        const youtubeIds = new Set(vtubers.map(v => v.youtube?.id).filter(id => id !== undefined)) as Set<string>;

        
        const streams = (
           await client.calenddar.streams.fetchByStatus("upcoming")
        ).filter(stream => youtubeIds.has(stream.channelId))

        const [sortProperty, order] = sortBy.split(".");

        const sortedStreams = this.sort(streams, vtubers, sortProperty, order);

        
        const embed = new MessageEmbed()
            .setTitle("Upcoming streams: ")
            .setFooter({text: `Sorted by: ${ sortOrders.get(sortBy!) ?? "Time until start (ascending)"}`})
            .setColor("BLUE");

        if (sortedStreams.length === 0) embed.setDescription("No upcoming streams!");
        else embed.setDescription(
            `Showing ${sortedStreams.length} total upcoming streams for: \n${vtubers.map(vtuber => ` - **${vtuber.name}** ${vtuber.originalName ? `(${vtuber.originalName})`: ""}`).join("\n")}`
        );

        for (const stream of sortedStreams) {
            const startHammerTime = Math.floor(stream.scheduledFor!.valueOf()/1000);
            embed.addField(
                stream.title,
                `[Stream Link](https://youtube.com/watch?v=${stream.id}) | Starts: <t:${startHammerTime}:T> (<t:${startHammerTime}:R>)`
            );
        }

        return embed;
    }

    sort(streams: Stream[], vtubers: VTuber[], sortProperty: string, order: string): Stream[] {
        switch(sortProperty) {
            case "time_to_start":         
                const now = Date.now();
                const sorted = sortBy(streams.filter(s => s.scheduledFor), stream => stream.scheduledFor!.valueOf() - now);
                return order === "ascending" ? sorted : reverse(sorted);
            case "vtuber": 
                const grouped = groupBy(streams, stream => vtubers.find(vtuber => vtuber.youtube!.id == stream.channelId || vtuber.twitch?.id == stream.channelId)!.id);
                return Object.values(grouped).flat();
            default: 
                throw new Error(":PekoDerp:");
        }
    }
}