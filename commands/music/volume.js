const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { logger } = require("../../utils/logger");
const config = require("../../config");

module.exports = {
	data: new SlashCommandBuilder()
        .setName("volume")
        .setDescription("Set the player's volume")
        .setDMPermission(false)
        .addIntegerOption(option =>
            option.setName("value")
            .setDescription("The player's volume ( 1 - 150 )")
            .setRequired(true)
        ),

    run: async ({ interaction, client }) => {
        const embed = new EmbedBuilder().setColor(config.default_color);

        try {
            const player = client.riffy.players.get(interaction.guildId);
            const volume = interaction.options.getInteger('value');

            if (!player) {
                return interaction.reply({ 
                    embeds: [embed.setDescription("\`❌\` | No player found in this server.")],  
                    ephemeral: true 
                });
            }

            if (volume < 0 || volume > 150) {
                return interaction.reply({ 
                    embeds: [embed.setDescription("\`❌\` | Volume level must be between 0 and 150.")], 
                    ephemeral: true 
                });
            }

            player.setVolume(volume);
            return interaction.reply({ embed: [embed.setDescription(`\`🔊\` | Volume set to ${volume}%`)] });

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