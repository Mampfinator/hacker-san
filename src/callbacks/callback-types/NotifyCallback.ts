import { HackerSan } from "../../hacker-san";
import { Execute } from "../../slash-commands/SlashCommand";
import { Callback, CustomOptions, PreExecute } from "../Callback";
import { Callback as DbCallback } from "../../orm";
import { Notification } from "calenddar-client";
import { SlashCommandSubcommandBuilder } from "@discordjs/builders";

@Callback({
    name: "notify",
    description: "Notification for live streams & posts"
})
export class Notify{
    @Execute()
    execute(client: HackerSan, callback: DbCallback, notification: Notification, preExecuteData?: any): void | Promise<void> {
        
    }

    @CustomOptions()
    extendOptions(builder: SlashCommandSubcommandBuilder) {
        return builder
            .addStringOption(message => message
                .setName("message")
                .setDescription("Message to include. Supports {{templates}}.")
                .setRequired(true));
    }
}