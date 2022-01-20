import { SlashCommandBuilder, SlashCommandSubcommandBuilder } from "@discordjs/builders";
import { ChannelType } from "discord-api-types";
import { Builder, CanExecute, Execute, SlashCommand } from "../SlashCommand";
import { getName, getDescription, getCallbackRegistry, getCustomTriggers, getCustomChannelTypes, getCustomOptions, ChannelOptionChannelTypes} from "../../callbacks/Callback";
import { CallbackTriggers } from "../../util/constants";
import { CommandInteraction, MessageEmbed, ThreadChannel } from "discord.js";
import { Callback } from "../../orm";
import { HackerSan } from "../../hacker-san";
import { admin, canExecuteHelper, mod } from "../../util/canExecute";

type DMChannelTypes = ChannelType.DM | ChannelType.GroupDM;
export type SlashCommandChannelOptionChannelTypes = Exclude<ChannelType, DMChannelTypes>;

@SlashCommand({
    name: "callback",
    description: "Manage callbacks in this server!"
})
export class CallbackCommand {
    @Execute()
    async execute(interaction: CommandInteraction) {
        const mode = interaction.options.getSubcommandGroup()

        var response;

        switch (mode) {
            case "add": response = await this.addCallback(interaction); break;
            case "edit": response = await this.editCallback(interaction); break;
            case "remove": response = await this.removeCallback(interaction); break;
        }

        return response;
    }

    @CanExecute()
    async canExecute(interaction: CommandInteraction): Promise<boolean> {
        const executable = await canExecuteHelper(interaction,
            admin,
            mod     
        )

        return executable;
    }

    private async addCallback(interaction: CommandInteraction) {
        const { guildId, options } = interaction;

        // get values here
        const   type    = options.getSubcommand(),
                channel = options.getChannel("channel")!,
                trigger = options.getString("trigger")!,
                vtuber  = options.getString("vtuber")!,
                delay   = options.getNumber("delay") ?? 0,
                priority = options.getInteger("priority") ?? 0;

        
        const {makeData} = (interaction.client as HackerSan).callbacks.callbacks.get(type)!;

        const typeData = typeof makeData === "function" ? (makeData(interaction) ?? {}) : {};

        let threadId: string | undefined, channelId: string;
        if ((channel.type as string).includes("_THREAD")) {
            channelId = (channel as ThreadChannel).parentId!;
            threadId = channel.id;
        } else {
            channelId = channel.id;
        }

        const callback = await Callback.create({
            type,
            guildId,
            channelId,
            threadId: threadId ?? null,
            trigger,
            vtuber,
            delay, 
            priority,
            typeData: Callback.toTypeData(typeData)
        }).catch(console.error);

        // callback creation failed.
        if (!callback) return await interaction.reply({
            embeds: [
                new MessageEmbed()
                    .setTitle("Callback creation failed!")
                    .setColor("RED")
                    .setDescription("Please contact the bot author. Or don't.")
            ]
        });

        const {name, value} = callback.toField();
        await interaction.reply({
            embeds: [
                new MessageEmbed()
                    .setTitle("Created new callback!")
                    .setColor("GREEN")
                    .addField(name, value)
            ]
        })


    }


    private async editCallback(interaction: CommandInteraction) {

    }

    private async removeCallback(interaction: CommandInteraction) {
        const {guildId} = interaction;
        const callbackIds = (interaction.options.get("id")?.value! as string).split(",");

        const removeCallbacks = await Callback.findAll({where: {id: callbackIds}});
        await Callback.destroy({where: {id: callbackIds}})
    }

    private fillDefaultOptions(sub: SlashCommandSubcommandBuilder, customTriggers?: string[], customTypes?: ChannelOptionChannelTypes[]) {
        return sub
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
                    ChannelType.GuildPublicThread]))
    }

    @Builder()
    buildCommand(builder: SlashCommandBuilder) {
        return builder
            .addSubcommandGroup(add => {
                add = add.setName("add").setDescription("Add a new callback");
                for (const type of getCallbackRegistry()) {
                    const name = getName(type);
                    const description = getDescription(type);
                    const customTriggers = getCustomTriggers(type);
                    const customChannelTypes = getCustomChannelTypes(type);
                    const customOptions = getCustomOptions(type);
    
                    add.addSubcommand(subcommand => {
                        subcommand = this.fillDefaultOptions(subcommand, customTriggers, customChannelTypes).setName(name).setDescription(description)
                        if (customOptions) subcommand = customOptions(subcommand);

                        subcommand = subcommand
                            .addNumberOption(delay => delay
                                .setName("delay")
                                .setDescription("Delay (in seconds) before the next callback in this channel (including threads) is executed.")
                                .setMinValue(0)
                                .setMaxValue(300))
                            .addIntegerOption(priority => priority
                                .setName("priority")
                                .setDescription("The higher the priority, the earlier a callback is executed in the chain within a channel.")
                                .setMinValue(0))

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
            // TODO: actually implement
            .addSubcommand(edit => edit
                .setName("edit").setDescription("Edit a callback.").addStringOption(id => id
                    .setName("id")
                    .setDescription("ID of the callback to edit.")
                    .setRequired(true)))
    }
}