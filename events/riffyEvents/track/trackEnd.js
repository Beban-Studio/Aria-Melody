const { logger } = require("../../../utils/logger");

module.exports = async (client) => {
    client.riffy.on("trackEnd", async (player) => {
        if (!player) return;

        if (player.message) await player.message.delete().catch((e) => {});
    });
};