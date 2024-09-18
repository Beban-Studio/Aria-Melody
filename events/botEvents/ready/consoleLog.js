const { logger } = require("../../../utils/logger");
const colors = require("colors");

module.exports = (client) => {
   logger(`Succesfully logged in as ${colors.rainbow(`[${client.user.tag}]`)}`, "debug");
};