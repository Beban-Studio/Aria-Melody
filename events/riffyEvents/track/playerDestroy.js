const { logger } = require("../../../utils/logger");
const client = require("../../../Aria");

client.riffy.on("playerDisconnect", async (player) => {
    logger(`A player got destroyed at (${player.guildId})`, "warn");
});