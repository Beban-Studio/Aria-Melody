const { client_id } = require("../../../config")
const { logger } = require("../../../utils/logger");
const client = require("../../../Aria");

module.exports = () => {
	client.riffy.init(client_id)
   logger(`Succesfully Initiate Riffy Events`, "debug");
};