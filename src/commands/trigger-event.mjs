import {SlashCommand} from "../modules/index.mjs";

export default new SlashCommand(
    "trigger_event",
    builder => builder.setDescription("Trigger an event. For testing only.")
    .addStringOption(option => option.setName("event").setDescription("Event to trigger."))
    .addStringOption(option => option.setName("vtuber").setDescription("VTuber to trigger for."))
    .addStringOption(option => option.setName("data").setDescription("JSON-data to dispatch to the event handler.")),
    (interaction) => interaction.member.id === "159382108681404416",
    async interaction => {
        let {options} = interaction;

        let event = options.get("event").value;
        let vtuber = options.get("vtuber").value;
        let data = options.get("data").value;
        try {data = JSON.parse(data)} catch {}

        interaction.client.calenddar.emit(event, {vtuber, ...data});

        await interaction.reply("Triggering event...");
    }
)