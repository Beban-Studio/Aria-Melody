const { logger } = require("../../../utils/logger");

module.exports = async (client) => {
    client.riffy.on("trackStuck", async (payload, player) => {
        logger(payload, "error");
        player.stop();
    });
};