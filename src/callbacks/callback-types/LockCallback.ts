import { SlashCommandSubcommandBuilder } from "@discordjs/builders";
import { ChannelType } from "discord-api-types";
import { GuildChannel } from "discord.js";
import { HackerSan } from "../../hacker-san";
import { Callback as DbCallback} from "../../orm";
import { Callback, CustomOptions, Execute } from "../Callback";

@Callback({
    name: "lock",
    description: "(Un-)locks a channel.",
    customChannelTypes: [
        ChannelType.GuildText,
        ChannelType.GuildNews
    ],
    makeData(interaction) {
        const mode = interaction.options.getString("mode");
        return {
            mode
        }
    }
})
export class Lock {
    @Execute()
    async execute(client: HackerSan, _: never, callback: DbCallback, {channel}: {channel: GuildChannel}) {
        const {mode} = callback.getTypeData();
        const permission = mode === "unlock" ? null : false;

        await channel.permissionOverwrites.create(channel.guildId, {
            SEND_MESSAGES: permission
        });
    }

    @CustomOptions()
    extendOptions(builder: SlashCommandSubcommandBuilder) {
        return builder.addStringOption(mode => mode
            .setName("mode")
            .setDescription("Whether to lock or unlock the channel.")
            .setChoices([
                ["lock", "lock"],
                ["unlock", "unlock"]
            ])
            .setRequired(true))
    }
}