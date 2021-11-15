export default {
    name: "lock",
    async execute(client, callback) {
        let channel = await client.channels.fetch(callback.channel);
        // Guild ID = @everyone role ID for that guild
        await channel.permissionOverwrites.edit(channel.guild.id, {SEND_MESSAGES: false});
    },
    makeOptions(interaction) {
        return {}
    }
}