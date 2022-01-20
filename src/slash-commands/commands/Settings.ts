import { SlashCommandBuilder } from "@discordjs/builders";
import { AxiosError } from "axios";
import { CommandInteraction, MessageEmbed } from "discord.js";
import { HackerSan } from "../../hacker-san";
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
        const errors = [];
        const client = (interaction.client as HackerSan);

        const {options} = interaction;
        const   addModRole = options.getRole("add_mods"),
                removeModRole = options.getRole("remove_mods"),
                addVtuber = options.getString("add_vtuber"),
                removeVtuber = options.getString("remove_vtuber");
        
        if (addVtuber) await client.calenddar.vtubers.fetch(addVtuber).catch((error: AxiosError) => {
            if (error.code === "404") errors.push(`Could not find VTuber with ID ${addVtuber}, so no new VTuber has been added. If you believe this is an error, please contact the bot author.`)
            else throw error;
        });
        
        if (addModRole) settings.roles.add(addModRole.id);
        if (removeModRole) settings.roles.remove(removeModRole.id);
        if (addVtuber) settings.vtubers.add(addVtuber);
        if (removeVtuber) settings.vtubers.remove(removeVtuber);

        await settings.save();

        return this.get(interaction, settings);
    }

    async get(interaction: CommandInteraction, settings: Settings) {
        const rolesDescription = settings.roles.get().map(role => `<@&${role}>`).join("\n")
        const vtubers = (await Promise.all(settings.vtubers.get().map(v => (interaction.client as HackerSan).calenddar.vtubers.fetch(v).catch()))).filter(v => v);

        const vtubersDescription = vtubers.map(vtuber => `${vtuber.name} (${vtuber.originalName ?? ""}) - \`${vtuber.id}\``).join("\n");

        return new MessageEmbed()
            .setTitle("Settings")
            .addField("Mod roles: ",  (rolesDescription && rolesDescription !== "" && rolesDescription.length > 0) ? rolesDescription : "None" )
            .addField("Main VTubers: ", (vtubersDescription && vtubersDescription !== "" && vtubersDescription.length > 0) ? vtubersDescription : "None. Add some with \`/settings set\`!")
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
                .addStringOption(vtuber => vtuber
                    .setName("add_vtuber")
                    .setDescription("Add a main VTuber to this server.")
                    .setAutocomplete(true))
                .addStringOption(vtuber => vtuber
                    .setName("remove_vtuber")
                    .setDescription("Remove a main VTuber from this server.")
                    .setAutocomplete(true))
            ).addSubcommand(get => get
                .setName("get")
                .setDescription("Get the settings!"))
    }

}