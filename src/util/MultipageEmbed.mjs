import { TextChannel, Message, MessageButton, MessageActionRow, Channel, CommandInteraction } from "discord.js";

const BACK_BUTTON = new MessageButton({
    style: "SECONDARY",
    emoji: "⬅️",
    label: "Back",
    customId: "MULTIPAGE_EMBED_BACK_BUTTON"
});

const FORWARD_BUTTON = new MessageButton({
    style: 'SECONDARY',
    label: 'Forward',
    emoji: '➡️',
    customId: "MULTIPAGE_EMBED_FORWARD_BUTTON"
});

export class MultipageEmbed {
    pages = [];
    /**
     * @type {Message}
     */
    message;
    collector;
    index = 0;

    add(...pages) {
        this.pages.push(...pages);
    }

    _generateComponents() {

        const components = [
            ...((this.pages.length > 1 && this.index > 0) ? [BACK_BUTTON] : []),
            ...((this.pages.length > 1 && this.index < (this.pages.length - 1)) ? [FORWARD_BUTTON] : [])
        ]
        return [new MessageActionRow({
            components
        })];
    }

    /**
     * @param {TextChannel} channel
     */
    async send(channelOrInteraction, author) {
        if (channelOrInteraction instanceof Channel) var channel = channelOrInteraction;
        if (channelOrInteraction instanceof CommandInteraction) var interaction = channelOrInteraction;
        
        if (!author) author = channelOrInteraction?.user ?? this.interaction?.user;

        if (this.pages.length === 0) throw new Error(`Can't send empty embed!`);
        if (!channelOrInteraction && !this.message && !this.interaction) throw new Error(`Neither channel nor message found on multipage embed!`);
        
        const payload = {
            embeds: [this.pages[this.index]], 
            components: this._generateComponents()
        }

        if (!this.message) {
            if (channel) this.message = await channel.send(payload);
            if (interaction) {
                await interaction.reply(payload);
                this.message = await interaction.fetchReply();
                this.interaction = interaction;
            }

            this.collector = this.message.createMessageComponentCollector({
                filter: ({user}) => {
                    return user.id === author?.id;
                }
            });

            this.collector.on("collect", async interaction => {
                const {customId} = interaction;
                await interaction.deferUpdate();
                switch (customId) {
                    case "MULTIPAGE_EMBED_BACK_BUTTON": this.index = Math.max(0, this.index - 1); break;
                    case "MULTIPAGE_EMBED_FORWARD_BUTTON": this.index = Math.min(this.index + 1, this.pages.length - 1); break;
                    default: 
                        return console.error("Could not find matching button ID!");
                }

                this.send();
            });

            return;
        }

        await this.message?.edit(payload) ?? this.interaction?.editReply(payload);
    }
}