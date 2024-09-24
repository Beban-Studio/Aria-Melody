const { logger } = require("../../../utils/logger");
const client = require("../../../Aria");

client.riffy.on("trackError", async (player, track, payload) => {
    logger(payload, "error");
})