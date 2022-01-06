# Hacker-san
Bot made for keeping people up-to-date with everything that's happening in regards to PRISM (and other VTubers) in [PRISMCord](https://discord.gg/prismworld).


# How it works
There's a few things here, but the core functionality is something that's called `callbacks`. It's essentially a repository of action descriptors that range from posting a stream notification when a streamer goes live to locking it when the streamer goes offline again.


All streaming-platform-specific notification logic is provided via [Calenddar](https://github.com/Mampfinator/calenddar).
## Slash Commands
Slash commands are loaded using TypeScript decorators and a `SlashCommandManager` that lives on the `HackerSan` client.
```ts
import {SlashCommand, Execute, CanExecute} from "src/commands/SlashCommand";
import {includesAny} from "ts-prime";

@SlashCommand({name: "example", description: "Name & description are both the API values for this command."})
export class ExampleCommand {
    @Execute()
    async execute() {
        return "I'm an example response!";
    }
    
    @CanExecute()
    async canExecute(interaction: CommandInteraction) {
        const settings = await client.settings.fetch(interaction.guildId);
        const {roles: needsRoleFrom} = settings;
        const hasRoles = [...interaction.member.roles.cache.keys()];

        return includesAny(hasRoles, needsRoleFrom);
    }

    @Builder()
    addOptions(builder: SlashCommandBuilder): SlashCommandBuilder {
        return builder.addStringOption(option => option.setName("option").setDescription("Example option."));
    }
}
````

## Callbacks
```ts
import {ChannelType} from "discord.js";
@Callback({
    name: "lock", 
    description: "Locks a channel (sets Send Messages for @everyone to deny).",
    channels: [ChannelType.GuildText, ChannelType.GuildNews], // only allows certain channel types to be used as targets
})
export class Lock {
    @Execute()
    async execute(client: HackerSan, callback: Callback, {channel}: PreExecuteData) {
        // @everyone role ID = guild ID
        await channel.permissionOverwrites.create(channel.guild.id, {SEND_MESSAGES: false});
    }
}
```