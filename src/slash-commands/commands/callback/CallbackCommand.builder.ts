import { SlashCommandSubcommandBuilder, SlashCommandBuilder } from "@discordjs/builders";
import { ChannelType } from "discord-api-types";
import { CallbackTriggers } from "../../../util/constants";
import { getCallbackRegistry, getName, getDescription, getCustomTriggers, getCustomChannelTypes, ChannelOptionChannelTypes, getCustomOptions } from "../../../callbacks/Callback";

export const CallbackCommandBuilder = (builder: SlashCommandBuilder) => {
        
    const defaultOptions = (sub: SlashCommandSubcommandBuilder, customTriggers?: string[], customTypes?: ChannelOptionChannelTypes[]) =>
        sub
            .addStringOption(vtuber => vtuber
                .setName("vtuber")
                .setDescription("VTuber this callback is for.")
                .setRequired(true)
                .setAutocomplete(true))
            .addStringOption(trigger => trigger
                .setName("trigger")
                .setDescription("Which event this callback should trigger on.")
                .setRequired(true)
                .setChoices((customTriggers ?? CallbackTriggers).map(name => [name, name] as [string, string])))
            .addChannelOption(channel => channel
                .setName("channel")
                .setDescription("Channel this callback acts in/on.")
                .setRequired(true)
                .addChannelTypes(customTypes ?? [
                    ChannelType.GuildText,
                    ChannelType.GuildNews,
                    ChannelType.GuildPublicThread
                ]))

    return builder
        .addSubcommandGroup(add => {
            add = add.setName("add").setDescription("Add a new callback");
            // TODO: make this part dynamic

            for (const type of getCallbackRegistry()) {
                const name = getName(type);
                const description = getDescription(type);
                const customTriggers = getCustomTriggers(type);
                const customChannelTypes = getCustomChannelTypes(type);
                const customOptions = getCustomOptions(type);

                add.addSubcommand(subcommand => {
                    subcommand = defaultOptions(subcommand, customTriggers, customChannelTypes).setName(name).setDescription(description)
                    if (customOptions) subcommand = customOptions(subcommand);
                    return subcommand;
                });
            }

            return add;
        })
        .addSubcommand(remove => remove
            .setName("remove").setDescription("Remove callbacks")
            .addStringOption(ids => ids
                .setName("ids")
                .setDescription("Comma-separated IDs of callbacks to remove.")
                .setRequired(true)))
        .addSubcommand(edit => edit
            .setName("edit").setDescription("Edit a callback.").addStringOption(id => id
                .setName("id")
                .setDescription("ID of the callback to edit.")
                .setRequired(true)))
}