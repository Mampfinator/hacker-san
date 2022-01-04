import { CommandInteraction, CacheType, MessageEmbed } from "discord.js";
import { ISlashCommand, SlashCommand } from "../SlashCommand";
import { makeCallbackTypeList } from "../../util";
import { CallbackTriggers } from "../../util/constants";

@SlashCommand({
    name: "list",
    builder: (builder) => builder.setDescription("List everything!")
        .addSubcommand(callbacks => 
            callbacks
                .addStringOption(vtuber => vtuber.setName("vtuber").setDescription("Filters callbacks by VTuber.").setAutocomplete(true))
                .addChannelOption(channel => channel.setName("channel").setDescription("Filters callbacks by channels."))
                .addStringOption(callbacks => {
                    const callbackList = makeCallbackTypeList().map(name => [name, name]) as [string, string][];
                    return callbacks
                        .setName("callbacks").setDescription("Filters callbacks by type.")
                        .setChoices(callbackList);
                })
                .addStringOption(trigger => 
                    trigger.setChoices(
                        CallbackTriggers.map(t => [t, t] as [string, string])
                    )
                )
        ),
})
export class ListCommand implements ISlashCommand {
    async execute(interaction: CommandInteraction<CacheType>): Promise<MessageEmbed> {
        const target = interaction.options.getSubcommand();

        let embed = new MessageEmbed().setDescription("404");

        switch(target) {
            case "callbacks":
                embed = await this.generateCallbacksEmbed(interaction);
                break;
            default: 
                console.error(":LutoSweat:");
        }

        return embed;
    }


    async generateCallbacksEmbed(interaction: CommandInteraction): Promise<MessageEmbed> {
        return new MessageEmbed().setDescription("Hi!");
    }
}