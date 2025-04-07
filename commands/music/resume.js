const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { logger } = require("../../utils/logger");
const config = require("../../config");

module.exports = {
	data: new SlashCommandBuilder()
        .setName("resume")
        .setDescription("Resume a paused track")
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

            if (!player.paused) {
                return interaction.reply({ 
                    embeds: [embed.setDescription("\`❗\` | The current player is not paused.")],  
                    ephemeral: true 
                });
            }

            player.pause(false);
            return interaction.reply({ embeds: [embed.setDescription("\`▶️\` | Playback has been resumed!")] });

        } catch (err) {
            logger(err, "error");
            return interaction.reply({ 
                embeds: [embed.setDescription(`\`❌\` | An error occurred: ${err.message}`)], 
                ephemeral: true 
            });
        }
    },
    options: {
        inVoice: true,
        sameVoice: true,
    }
};