const { logger } = require("../../../utils/logger");

module.exports = async (client) => {
    client.riffy.on("trackError", async (payload) => {
        logger(payload, "error");
    });
};