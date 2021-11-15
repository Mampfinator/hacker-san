import { handleCallbacks } from "../../util/util.mjs"

export default {
    name: "reservation",
    execute: async (data, client) => {
        await handleCallbacks(client, "upcoming", data);
    }
}