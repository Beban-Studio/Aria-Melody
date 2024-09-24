const { logger } = require("../../../utils/logger");
const client = require("../../../Aria");

client.riffy.on("playerCreate", async (player) => {
    logger(`A wild player created at (${player.guildId})`, "warn");
});