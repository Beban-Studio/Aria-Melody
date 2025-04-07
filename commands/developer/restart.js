const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { logger } = require("../../utils/logger");
const config = require("../../config");


module.exports = {
	data: new SlashCommandBuilder()
   	    .setName("restart")
   	    .setDescription("Restart the bot process."),

    run: async ({ interaction }) => {
        const embed = new EmbedBuilder().setColor(config.clientOptions.embedColor);
        
        try {
        await interaction.reply({ 
            embeds: [embed.setDescription("Restarting the bot...")],
            ephemeral: true
        });

        process.exit();

        } catch (err) {
            logger(err, "error");
            return interaction.reply({ 
                embeds: [embed.setDescription(`\`❌\` | An error occurred: ${err.message}`)], 
                ephemeral: true 
            });
        }
    },
    options: {
		devOnly: true
	}
};
