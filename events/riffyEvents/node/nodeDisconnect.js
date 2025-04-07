const { logger } = require("../../../utils/logger");

module.exports = async (client) => {
	client.riffy.on("nodeDisconnect", async (node, reason) => {
		logger(`${node.name} has disconnected, reason: ${JSON.stringify(reason)}`, "error");
	});
};