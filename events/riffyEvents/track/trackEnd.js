const { logger } = require("../../../utils/logger");
const client = require("../../../Aria");

client.riffy.on("trackEnd", async (player) => {
    if (!player) return;

    if (player.message) await player.message.delete().catch((e) => {});
});