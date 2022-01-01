import { handleCallbacks } from "../../util/util.mjs"

export default {
    name: "moved",
    execute: async (client, data, metadata) => {
        await handleCallbacks(client, "moved", data, metadata);
    }
}