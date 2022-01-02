export default {
    name: "rename",
    async execute(client, callback) {
        let channel = await client.channels.fetch(callback.channel);
        await channel.setName(callback.name);
    },
    makeOptions(interaction) {
        return {
            name: interaction.options.get("name").value
        }
    }
}