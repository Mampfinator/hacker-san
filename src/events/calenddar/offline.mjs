import { handleCallbacks } from "../../util/util.mjs"

export default {
    name: "offline",
    execute: async (data, client) => {
        await handleCallbacks(client, "offline", data);
    }
}