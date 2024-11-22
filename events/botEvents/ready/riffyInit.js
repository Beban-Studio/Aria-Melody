const { client_id } = require("../../../config");
const { logger } = require("../../../utils/logger");
const client = require("../../../Aria");

module.exports = async () => {
    client.riffy.init(client_id)
    logger(`Successfully Initiate Riffy Events`, "debug");
};