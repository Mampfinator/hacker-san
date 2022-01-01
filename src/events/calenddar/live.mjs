import { handleCallbacks } from "../../util/util.mjs"

export default {
    name: "live",
    execute: async (client, data, metadata) => {
        await handleCallbacks(client, "live", data, metadata);
    }
}