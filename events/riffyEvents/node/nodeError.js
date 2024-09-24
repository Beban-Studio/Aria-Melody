const { logger } = require("../../../utils/logger");
const client = require("../../../Aria");

client.riffy.on("nodeError", async (node, error) => {
	logger(`${node.name} encountered an error: ${error.message}`, "error");
});