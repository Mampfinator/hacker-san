import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, MessageEmbed } from "discord.js";
import { Settings } from "../../orm";
import { admin, canExecuteHelper } from "../../util/canExecute";
import {Builder, CanExecute, Execute, SlashCommand} from "../SlashCommand";

@SlashCommand({
    name: "settings",
    description: "Server ettings!"
})
export class SettingsCommand {
    @CanExecute()
    canExecute(interaction: CommandInteraction) {
        return canExecuteHelper(interaction, admin);
    }


    @Execute()
    async main(interaction: CommandInteraction) {
        const subcommand = interaction.options.getSubcommand();
        const settings = await Settings.findOne({where: {guildId: interaction.guildId}});
        if (!settings) return await interaction.reply({embeds: [
            new MessageEmbed()
                .setColor("RED")
                .setTitle("ERROR")
                .setDescription(":x: Please contact the bot author.")
        ]});

        let reply;
        switch(subcommand) {
            case "set": reply = await this.set(interaction, settings); break;
            case "get": reply = await this.get(interaction, settings); break;
        }

        return reply;
    }


    async set(interaction: CommandInteraction, settings: Settings) {
        const {options} = interaction;
        const   addModRole = options.getRole("add_mods"),
                removeModRole = options.getRole("remove_mods");
        
        if (addModRole) settings.addModRole(addModRole.id);
        if (removeModRole) settings.removeModRole(removeModRole.id);

        await settings.save();

        return this.get(interaction, settings);
    }

    async get(interaction: CommandInteraction, settings: Settings) {
        const rolesDescription = settings.getModRoles().map(role => `<@&${role}>`).join("\n")

        return new MessageEmbed()
            .setTitle("Settings")
            .addField("Mod roles: ",  (rolesDescription && rolesDescription !== "" && rolesDescription.length > 0) ? rolesDescription : "None" )
    }


    @Builder()
    build(builder: SlashCommandBuilder) {
        return builder.
            addSubcommand(set => set
                .setName("set")
                .setDescription("Modify a setting!")
                .addRoleOption(modRole => modRole 
                    .setName("add_mods")
                    .setDescription("Add a mod role. Has access to /callback command."))
                .addRoleOption(modRole => modRole
                    .setName("remove_mods")
                    .setDescription("Remove a previously added mod role."))
            ).addSubcommand(get => get
                .setName("get")
                .setDescription("Get the settings!"))
    }

}