export default {
    name: "rename",
    async execute(client, callback) {
        let channel = await client.guilds.fetch(callback.channel);
        // Guild ID = @everyone role ID for that guild
        await channel.setName(callback.name);
    },
    makeOptions(interaction) {
        return {
            name: interaction.options.get("name").value
        }
    }
}