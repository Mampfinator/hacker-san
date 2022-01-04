import { SlashCommandSubcommandBuilder } from "@discordjs/builders";
import { ChannelType } from "discord-api-types";
import { getCallbackRegistry, getCustomChannelTypes, getCustomTriggers, getDescription, getName } from "../../../callbacks/Callback";
import { CallbackTriggers } from "../../../util/constants";
import { SlashCommand } from "../../SlashCommand";
import { CallbackCommandBuilder } from "./CallbackCommand.builder";

type DMChannelTypes = ChannelType.DM | ChannelType.GroupDM;
export type SlashCommandChannelOptionChannelTypes = Exclude<ChannelType, DMChannelTypes>;

@SlashCommand({
    name: "callback",
    builder: CallbackCommandBuilder
})
export class CallbackCommand {
    
}