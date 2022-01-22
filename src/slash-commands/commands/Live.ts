import { SlashCommandBuilder } from "@discordjs/builders";
import { VTuber } from "calenddar-client";
import { CommandInteraction, MessageEmbed } from "discord.js";
import { HackerSan } from "../../hacker-san";
import { Settings } from "../../orm";
import { SlashCommand, Execute, Builder } from "../SlashCommand";

@SlashCommand({
    name: "live",
    description: "List currently ongoing live streams!"
})
export class Live {
    @Builder()
    options(builder: SlashCommandBuilder) {
        return builder.addStringOption(vtuber => vtuber
            .setName("vtuber")
            .setDescription("VTuber to fetch live streams for. If not set, will default to server VTubers.")
            .setAutocomplete(true))
    }

    @Execute()
    async fetchLive(interaction: CommandInteraction) {
        const settings = await Settings.findOne({where: {guildId: interaction.guildId}});
        const   vtuber = interaction.options.getString("vtuber");
        const   client = interaction.client as HackerSan;

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

        const channelIds = new Set(...[
            vtubers.map(v => [v.youtube?.id, v.twitch?.id].filter(id => id) as string[]).flat()
        ]);

        const streams = (
            await client.calenddar.streams.fetchByStatus("live")
        ).filter(v => channelIds.has(v.channelId));

        const embed = new MessageEmbed()
            .setTitle("Live streams: ")
            .setColor("BLUE");

        if (streams.length === 0) embed.setDescription("No live streams found!");

        for (const stream of streams) {
            const startHammerTime = Math.floor(stream.scheduledFor ? stream.scheduledFor.valueOf()/1000 : 0);

            embed.addField(
                stream.title,
                `[Stream Link](https://youtube.com/watch?v=${stream.id}) | Started at: <t:${startHammerTime}:T> (<t:${startHammerTime}:R>)`
            );
        }

        return embed;
    }
}