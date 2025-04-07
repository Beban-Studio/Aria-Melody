const { logger } = require("../../../utils/logger");

module.exports = async (client) => {
    client.riffy.on("playerCreate", async (player) => {
        logger(`A wild player created at (${player.guildId})`, "warn");
    });
};