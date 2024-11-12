const { logger } = require("../../../utils/logger");
const client = require("../../../Aria");

client.riffy.on("nodeConnect", async (node) => {
    logger(`Successfully connect to ${node.name}`, "debug");
});