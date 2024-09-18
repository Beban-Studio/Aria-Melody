const { logger } = require("../../../utils/logger");
const client = require("../../../Aria");

client.riffy.on("nodeConnect", async (node) => {
    logger(`Succesfully connect to ${node.name}`, "debug")
});