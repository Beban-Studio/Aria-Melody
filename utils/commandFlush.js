const { REST } = require("@discordjs/rest");
const { client_token, client_id } = require("../config");
const { Routes } = require("discord-api-types/v10");

(async () => {
    const rest = new REST({ version: "10" }).setToken(client_token);

        console.log("Bot has started to delete commands...");
        await rest.put( Routes.applicationCommands(client_id), { body: [] });
        console.log("Done");
})();