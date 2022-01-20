import { SlashCommandSubcommandBuilder } from "@discordjs/builders";
import { Callback, Execute, PreExecute, CustomOptions} from "../Callback";
import {Callback as DbCallback} from "../../orm";
import { HackerSan } from "../../hacker-san";
import { Notification } from "calenddar-client";
import { GuildTextBasedChannel, MessageEmbed } from "discord.js";

@Callback({
    name: "post",
    description: "Send community post notifications here!",
    customTriggers: ["post"], 
    makeData(interaction) {
        const type = interaction.options.getString("type") ?? "embed";
        return {
            type
        };
    }
})
export class Post {
    @Execute()
    async post(client: HackerSan, notification: Notification, callback: DbCallback, {channel, embed}: {channel: GuildTextBasedChannel, embed: MessageEmbed}) {
        if (!notification.post) return;
        const {type} = callback.getTypeData();


        if (type === "preview") {
            await channel.send(`https://preview.calenddar.de/post/${notification.post.id}`);
        } else {
            await channel.send({embeds: [embed]});
        }

    }

    @PreExecute()
    buildEmbed(client: HackerSan, notification: Notification): Record<string, any> {
        const {post, vtubers} = notification;
        if (!post) return {};

        const embed = new MessageEmbed()
            .setTitle(`${vtubers.map(v => v.name).join(", ")} just posted a community post!`)
            .setColor("RED") // better color?
            .setFooter({
                text: `[Link](https://youtube.com/post?id=${post.id})`
            })

        let text = "";
        if (post.text) text += post.text;

        switch(post.type) {
            case "image": 
                embed.setImage(post.images![0]); break;
            case "poll":
                text += post.choices!.map((choice, index) => `\`${index + 1}\`: ${choice}`).join("\n"); break;
            case "video":
                embed.addField(post.video!.title, `\`\`\`\n${post.video!.descriptionSnippet}\n\`\`\`\n[Video Link](https://www.youtube.com/watch?v=${post.video!.id})`); break;
        }

        return {embed};
    }

    @CustomOptions()
    extendOptions(builder: SlashCommandSubcommandBuilder) {
        return builder.addStringOption(type => type
            .setName("type")
            .setDescription("What post type you'd like to get. Defaults to embed.")
            .addChoices([
                ["embed", "embed"],
                ["preview", "preview"]
            ]))
    }
}