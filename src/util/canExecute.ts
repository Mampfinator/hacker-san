import { CommandInteraction, GuildMemberRoleManager, Permissions } from "discord.js"
import { includesAny } from "ts-prime";
import { Settings } from "../orm";

/**
 * 
 * @returns true if a command should be executed, false if otherwise. 
 */
export const canExecuteHelper = async (interaction: CommandInteraction, ...functions: ((interaction: CommandInteraction) => boolean | Promise<boolean>)[]) => {
    for (const func of functions) {
        const funcResult = await func(interaction);
        if (funcResult === true) return true;
    }

    return false;
}

export const admin = (interaction: CommandInteraction): boolean => (interaction.member?.permissions as Permissions).has("ADMINISTRATOR");
export const mod = async (interaction: CommandInteraction): Promise<boolean> => {
    const {permissions} = interaction.member!;
    if (typeof permissions === "string") return false;

    const settings = await Settings.findOne({where: {guildId: interaction.guildId}});
    if (!settings) return false;

    return permissions.any([
        "ADMINISTRATOR",
        "MANAGE_GUILD",
        "BAN_MEMBERS",
        "MANAGE_CHANNELS",
    ]) || includesAny(settings.getModRoles(), [...(interaction.member!.roles as GuildMemberRoleManager).cache.keys()])
} 
export const botOwner = (interaction: CommandInteraction): boolean => (interaction.user.id === process.env.BOT_OWNER);