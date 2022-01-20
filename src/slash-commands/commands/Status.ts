import { Execute, SlashCommand } from "../SlashCommand";
import { CommandInteraction, MessageEmbed } from "discord.js";
import axios from "axios";

@SlashCommand({
    name: "status",
    description: "Get the bot's status!", 
    autoDefer: true
})
export class Status {
    @Execute()
    async execute(interaction: CommandInteraction) {
        const discordWsPing = Math.abs(Date.now() - interaction.createdTimestamp);
        const calenddarPing = await new Promise<number>((res, rej) => {
            const start = Date.now();
            axios({method: "GET", url: `https://api.calenddar.de`})
            .then(() => res(Math.abs(Date.now() - start)))
            .catch(rej)
        }).catch(() => {});

        return new MessageEmbed()
            .setTitle("Status")
            .setColor((discordWsPing && calenddarPing) ? "GREEN" : "RED")
            .addField("Ping", `
                Discord: ${discordWsPing ? `${discordWsPing}ms` : ":x:"}
                CalenDDar: ${calenddarPing ? `${calenddarPing}ms` : ":x:"}
            `);
    }
}