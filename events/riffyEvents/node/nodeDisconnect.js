const { logger } = require("../../../utils/logger");
const client = require("../../../Aria");

client.riffy.on("nodeDisconnect", async (node, reason) => {
	logger(`${node.name} has disconnected, reason: ${JSON.stringify(reason)}`, "error");
});