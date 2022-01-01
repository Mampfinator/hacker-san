import { handleCallbacks } from "../../util/util.mjs"

export default {
    name: "offline",
    execute: async (client, data, metadata) => {
        await handleCallbacks(client, "offline", data, metadata);
    }
}