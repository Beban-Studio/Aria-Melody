const { logger } = require("../../../utils/logger");

module.exports = async (client) => {
	client.riffy.on("nodeError", async (node, error) => {
		logger(`${node.name} encountered an error: ${error.message}`, "error");
	});
};