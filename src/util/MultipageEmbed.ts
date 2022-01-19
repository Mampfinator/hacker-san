import { TextChannel, Interaction, MessageEmbed, CommandInteraction, Message, MessageButton } from "discord.js";

export class MultipageEmbed {
    public readonly pages: MessageEmbed[] = [];
    private index = 0;
    static readonly nextButton = new MessageButton().setCustomId("MULTIPAGE_EMBED_BACK").setEmoji("").setLabel("Next").setStyle("SECONDARY");
    static readonly previousButton = new MessageButton().setCustomId("MULTIPAGE_EMBED_NEXT").setEmoji("").setLabel("Previous").setStyle("SECONDARY");
    
    private mode?: string;
    addPage(embed: MessageEmbed) {
        return this.pages.push(embed)
    }


    async next() {
        if (this.index >= this.pages.length) return;
        ++this.index;
    }

    async previous() {
        if (this.index === 0) return;
        --this.index;
    }

    async destroy() {

    }

    async send(target: TextChannel | CommandInteraction) {
        var message;
        const page = this.pages[0];
        if (!page) throw new TypeError("Can't send empty embed!");
        const payload = {embeds: [page]};
        if (target instanceof TextChannel) {
            message = await target.send(payload);
            this.mode = "channel";
        } else if (target instanceof CommandInteraction) {
            await target.reply(payload);
            message = await target.fetchReply();
            this.mode = "interaction";
        }
        if (!message || typeof message === "boolean") return;
        const collector = (message as Message).createMessageComponentCollector()
    }   
}