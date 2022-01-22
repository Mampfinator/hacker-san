import { HackerSan } from "../../hacker-san";
import { Callback, CustomOptions } from "../Callback";
import { Callback as DbCallback } from "../../orm";
import { Builder, Execute } from "../../slash-commands/SlashCommand";
import { SlashCommandBuilder } from "@discordjs/builders";
import { GuildTextBasedChannel } from "discord.js";
import { interpolate } from "../../util";
import { Notification } from "calenddar-client";

@Callback({
    name: "echo",
    description: "Send a message!",
    makeData(interaction) {
        const message = interaction.options.getString("message");
        return {
            message
        };
    }
})
export class Echo {
    @Execute()
    async execute(client: HackerSan, notification: Notification, callback: DbCallback, preExecute: any) {
        const {channel} = preExecute;
        const typeData = callback.getTypeData() as Record<string, string>;
        const {message} = typeData;

        await channel.send({
            content: interpolate(message, {})
        });

        console.log("In EchoCallback: :reinyheh:");
        return "reinyheh";
    }

    @CustomOptions()
    extendOptions(builder: SlashCommandBuilder) {
        return builder.addStringOption(message => message
            .setName("message")
            .setDescription("Message to be sent to the channel. Supports {{templates}}.")
            .setRequired(true));
    }
}