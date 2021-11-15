import { handleCallbacks } from "../../util/util.mjs"

export default {
    name: "live",
    execute: async (data, client) => {
        await handleCallbacks(client, "live", data);
    }
}