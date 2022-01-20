import { HackerSan } from "../../hacker-san";
import { Callback, CustomOptions, Execute } from "../Callback";
import { Callback as DbCallback } from "../../orm";
import { Notification } from "calenddar-client";
import { GuildChannel } from "discord.js";
import { SlashCommandSubcommandBuilder } from "@discordjs/builders";

@Callback({
    name: "rename",
    description: "Rename a channel.",
    makeData(interaction) {
        const name = interaction.options.getString("name");
        return {
            name
        };
    }
})
export class Rename {
    @Execute()
    async execute(client: HackerSan, notification: Notification, callback: DbCallback, {channel}: {channel: GuildChannel}) {
        const {name} = callback.getTypeData();
        await channel.setName(name);
    }

    @CustomOptions()
    addName(builder: SlashCommandSubcommandBuilder) {
        return builder.addStringOption(name => name
            .setName("name")
            .setDescription("The new channel name. Supports {{templates}}.")
            .setRequired(true))
    }
}