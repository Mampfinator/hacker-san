import { Guild } from "discord.js"
import { Settings } from "../../orm"
import {IEvent} from "../EventLoader";

export const GuildCreateEvent = {
    name: "guildCreate",
    once: false,
    async execute(guild: Guild) {
        if (!await Settings.findOne({where: {guildId: guild.id}})) await Settings.create({guildId: guild.id});        
    }
} as IEvent;