import { handleCallbacks } from "../../util/util.mjs"

export default {
    name: "reservation-moved",
    execute: async (data, client) => {
        await handleCallbacks(client, "moved", data);
    }
}