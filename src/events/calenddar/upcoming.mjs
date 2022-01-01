import { handleCallbacks } from "../../util/util.mjs"

export default {
    name: "upcoming",
    execute: async (client, data, metadata) => {
        await handleCallbacks(client, "upcoming", data, metadata);
    }
}