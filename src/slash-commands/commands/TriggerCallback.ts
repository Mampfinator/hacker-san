import { SlashCommandBuilder } from "@discordjs/builders";
import { Notification } from "calenddar-client";
import { CalenddarEvent } from "calenddar-client/dist/structures/Notification";
import { CommandInteraction } from "discord.js";
import { HackerSan } from "../../hacker-san";
import { Builder, Execute, SlashCommand } from "../SlashCommand";

@SlashCommand({
    name: "trigger",
    description: "Triggers a callback.",
})
export class TriggerCallback {
    @Execute()
    async execute(interaction: CommandInteraction) {
        const   trigger = interaction.options.getString("trigger")! as CalenddarEvent,
                vtuberId = interaction.options.getString("vtuber")!,
                payload = interaction.options.getString("payload")!

        const data = JSON.stringify(payload);

        const notification = new Notification((interaction.client as HackerSan).calenddar, {
            event: trigger,
            vtubers: [vtuberId],
            platform: "youtube",
            data
        });

        await notification.fetchVtubers()
        console.log(notification);

        await (interaction.client as HackerSan).callbacks.handle(notification);

        return ":YuraPolite:";
    }

    @Builder()
    build(builder: SlashCommandBuilder) {
        return builder.
            addStringOption(trigger => trigger
                .setName("trigger")
                .setDescription("Which callbacks to trigger")
                .setRequired(true))
            .addStringOption(vtuber => vtuber
                .setName("vtuber")
                .setDescription("which vtuber's callbacks to trigger")
                .setRequired(true)
                .setAutocomplete(true))
            .addStringOption(notification => notification
                .setName("payload")
                .setDescription("Notification JSON payload.")
                .setRequired(true))
    }
}