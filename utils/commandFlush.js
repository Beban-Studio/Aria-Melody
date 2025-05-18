const { clientOptions } = require("../config");
const { Routes } = require("discord-api-types/v10");
const { logger } = require("./logger");
const { REST } = require("@discordjs/rest");

(async () => {
    const rest = new REST({ version: "10" }).setToken(clientOptions.clientToken);

    logger("Bot has started to delete commands...", "warn");
    try {
        await rest.put(Routes.applicationCommands(clientOptions.clientId), { body: [] });
        logger("The bot is done deleting all past commands", "success");
    } catch (err) {
        logger(`Error deleting commands: ${err}`, "error");
        process.exit(1); 
    }

    process.exit(0); 
})();
