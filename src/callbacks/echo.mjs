export default {
    name: "echo",
    async execute(client, callback) {
        let channel = await client.channels.fetch(callback.channel);
        await channel.send(callback.message);
    },
    makeOptions(interaction) {
        return {
            message: interaction.options.get("message").value
        }
    }
}