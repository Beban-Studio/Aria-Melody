const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { logger } = require("../../utils/logger");
const config = require("../../config");

module.exports = {
	data: new SlashCommandBuilder()
        .setName("autoplay")
        .setDescription("Sets autoplay to the current player queue")
        .setDMPermission(false),

    run: async ({ interaction, client }) => {
        const embed = new EmbedBuilder().setColor(config.clientOptions.embedColor);

        try {
            const player = client.riffy.players.get(interaction.guildId);

            if (!player) {
                return interaction.reply({ 
                    embeds: [embed.setDescription("\`❌\` | No player found in this server.")],  
                    ephemeral: true 
                });
            }

            if (player.isAutoplay === false) {        
                await interaction.reply({ 
                    embeds: [embed.setDescription("♾ | Autoplay has been enabled")], 
                    ephemeral: true 
                });

                player.isAutoplay = true;
            } else if (player.isAutoplay === true) {        
                await interaction.reply({ 
                    embeds: [embed.setDescription("♾ | Autoplay has been disabled")], 
                    ephemeral: true 
                });
                player.isAutoplay = false;
            }

        } catch (err) {
            logger(err, "error");
            return interaction.reply({ 
                content: `\`❌\` | An error occurred: ${err.message}`,  
                ephemeral: true 
            });
        }
    },
	options: {
		inVoice: true,
		sameVoice: true,
	}
};