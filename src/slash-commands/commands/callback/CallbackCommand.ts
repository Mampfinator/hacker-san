import { SlashCommandBuilder, SlashCommandSubcommandBuilder } from "@discordjs/builders";
import { ChannelType } from "discord-api-types";
import { Builder, Execute, SlashCommand } from "../../SlashCommand";

type DMChannelTypes = ChannelType.DM | ChannelType.GroupDM;
export type SlashCommandChannelOptionChannelTypes = Exclude<ChannelType, DMChannelTypes>;

@SlashCommand({
    name: "callback",
    description: "Manage callbacks in this server!"
})
export class CallbackCommand {
    @Execute()
    async execute() {

    }

    @Builder()
    build(builder: SlashCommandBuilder): SlashCommandBuilder {
        return builder;
    }
}