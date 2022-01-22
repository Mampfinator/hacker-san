import { HackerSan } from "../../hacker-san";
import { Execute } from "../../slash-commands/SlashCommand";
import { Callback, CustomOptions, PreExecute } from "../Callback";
import { Callback as DbCallback } from "../../orm";
import { Notification } from "calenddar-client";
import { SlashCommandSubcommandBuilder } from "@discordjs/builders";
import { GuildTextBasedChannel, MessageEmbed } from "discord.js";
import { CalenddarEvent } from "calenddar-client/dist/structures/Notification";

@Callback({
    name: "notify",
    description: "Notification for live streams & posts",
    makeData: interaction => {
        const message = interaction.options.getString("message");
        const customEmbed = interaction.options.getBoolean("custom_embed") ?? true;
        const pingRole = interaction.options.getRole("ping_role");
        return {
            message,
            customEmbed,
            pingRole: pingRole?.id
        }
    }
})
export class Notify{
    private youtubeEventLookup = new Map<CalenddarEvent, string>()
        .set("live", " just went live!")
        .set("offline", " just went offline!")
        .set("post", " just posted a community post!")
        .set("upcoming", " just posted a new waiting room!");


    @Execute()
    async execute(client: HackerSan, callback: DbCallback, notification: Notification, preExecuteData?: any): Promise<void> {
        const {pingRole, message, customEmbed} = (callback.getTypeData() as {message?: string, customEmbed?: boolean, pingRole?: string});
        const {embed, channel} = preExecuteData as {embed: MessageEmbed, channel: GuildTextBasedChannel};

        const payload = {
            content: `${pingRole ? `<@&${pingRole}>` : ""}\n${message ?? ""}`
        } as {content: string, embeds?: MessageEmbed[]}

        if (customEmbed) payload.embeds = [embed];

        await channel.send(payload);

    }

    @PreExecute()
    async preExecute(client: HackerSan, notification: Notification) {
        console.log(`Generating embed for ${notification.vtubers}.${notification.event}`);
        const embed = new MessageEmbed();
        

        switch(notification.platform) {
            case "youtube":
                this.youtubeEmbed(embed, notification);
                break;

            case "twitch":
                embed.setColor("DARK_PURPLE");
                embed.setTitle(notification.stream!.title);
                break;
            /*case "twitter":
                embed.setColor("BLUE");
            */

            default:
                throw new Error(`Could not determine platform for notification ${notification.vtubers}.${notification.event}.`);
        }
        
        
        return {
            embed
        }
    }


    youtubeEmbed(embed: MessageEmbed, notification: Notification): MessageEmbed {
        embed
            .setColor("RED")
            .setTitle(
                notification.vtubers.map(v => v.name).join(" & ") + this.youtubeEventLookup.get(notification.event)
            )
        const {stream, post} = notification;
        if (stream) {
            const link = `[Stream Link](https://youtube.com/watch?v=${stream.id})`
            let timestamp: Date | undefined;
            switch (notification.event) {
                case "live": timestamp = stream.startedAt!; break;
                case "offline": timestamp = stream.endedAt!; break;
                case "upcoming": timestamp = stream.scheduledFor!; break;
            }

            console.log(stream);

            const hammertime = timestamp ? Math.floor(timestamp?.valueOf()/1000) : 0;
            embed.setDescription(`${link} | <t:${hammertime}:T> (<t:${hammertime}:R>)\n\n ${stream.description!.slice(0, 300)}`)
        }

        if (post) {
            const link = `[Post Link](https://youtube.com/post/${post.id})`;
            
            embed.setDescription(`${link}\n\n${post.text}`);

            switch (post.type) {
                case "image":
                    embed.setImage(post.images![0]); 
                    break;
                case "poll":
                    embed.addField("Poll", post.choices!.map((choice, index) => `${index+1}: ${choice}`).join("\n"));
                    break;
                case "video":
                    embed.addField("Video", `${post.video!.title}\n${post.video!.descriptionSnippet}\n\n[Link](https://youtube.com/watch?v=${post.video!.id})`);
            }
        }
        return embed;
    }


    @CustomOptions()
    extendOptions(builder: SlashCommandSubcommandBuilder) {
        return builder
            .addRoleOption(role => role
                .setName("pingrole")
                .setDescription("Role to ping for this notification!"))
            .addStringOption(message => message
                .setName("message")
                .setDescription("Message to include. Supports {{templates}}."))
            .addBooleanOption(embed => embed
                .setName("custom_embed")
                .setDescription("Whether or not to include a custom embed in a message or just post a link. Defaults to true."))
    }
}