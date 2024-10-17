const { logger } = require("../../../utils/logger");

module.exports = async (interaction) => { 
    logger(`/${interaction.commandName} used by ${interaction.user.tag} on ${interaction.guild} (${interaction.guildId})`, "info");
};