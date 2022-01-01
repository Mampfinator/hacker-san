/**
 * @param {string} str - input string.
 * @param {object} substitutes - all {keys} in the input string get replaced with the corresponding substitute value.
 * @returns {string} - interpolated output string.
 */
function interpolateString(str, substitutes) {
    for (let [search, replace] of Object.entries(substitutes)) {
        str = str.replaceAll(`{${search}}`, replace);
    }
    return str;
}

async function handleCallbacks(client, event, data, {platform, vtubers}) {
    // fetch all guilds. There's *probably* a better way of doing this, but it's gotta work for now.
    await client.guilds.fetch(); 
    for (const guild of client.guilds.cache.values()) {
        client.callbacks.execute(guild, event, data, vtubers, platform);
    }
}

function callbackToString(callback) {
    let str = `**ID**: \`${callback._id ?? callback.id}\`\n**Type**: ${callback.type} \t\t|\t\t **Trigger**: ${callback.trigger}\n**Channel**: <#${callback.channel}>\n`
    switch (callback.type) {
        case "echo": 
            str+=`**Message**: ${callback.message}\n`
            break; 
        case "notify":
            if (callback.pingrole) str+=`**Role**: <@&${callback.pingrole}> (${callback.pingrole})\n`
            if (callback.custom_message) str+= `**Message**: ${callback.custom_message}\n`
            break;
        case "rename": 
            str+=`**Name**: ${callback.name}\n`
    }

    return str;
}

export {
    interpolateString,
    handleCallbacks,
    callbackToString
}