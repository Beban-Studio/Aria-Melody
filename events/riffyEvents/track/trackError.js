const { logger } = require("../../../utils/logger");
const client = require("../../../Aria");

client.riffy.on("trackError", async (payload) => {
    logger(payload, "error");
})