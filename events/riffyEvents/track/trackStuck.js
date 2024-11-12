const { logger } = require("../../../utils/logger");
const client = require("../../../Aria");

client.riffy.on("trackStuck", async (payload, player) => {
    logger(payload, "error");
    player.stop();
});