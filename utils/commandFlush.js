const { REST } = require("@discordjs/rest");
const { clientOptions } = require("../config");
const { Routes } = require("discord-api-types/v10");

(async () => {
    const rest = new REST({ version: "10" }).setToken(clientOptions.clientToken);

        console.log("Bot has started to delete commands...");
        await rest.put( Routes.applicationCommands(clientOptions.clientId), { body: [] });
        console.log("Done");
})();