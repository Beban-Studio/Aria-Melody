const { SlashCommandBuilder } = require("discord.js");
const { logger } = require("../../models/logger");

module.exports = {
	data: new SlashCommandBuilder()
   	.setName("volume")
   	.setDescription("Set the player\'s volume")
    .addIntegerOption(option =>
        option.setName("value")
        .setDescription("The player\'s volume ( 1 - 150 )")
        .setRequired(true)
    ),

    run: async ({ interaction, client }) => {
        try {
            const player = client.riffy.players.get(interaction.guildId);
            const volume = interaction.options.getInteger('value');

            if (!player) {
                return interaction.reply({ content: "\`❌\` | No active player found.", ephemeral: true });
            }

            if (volume < 0 || volume > 150) {
                return interaction.reply({ content: "\`❌\` | Volume level must be between 0 and 150.", ephemeral: true });
            }

            player.setVolume(volume);
            return interaction.reply({ content: `\`🔊\` | Volume set to ${volume}%` });

        } catch (err) {
            logger(err, "error");
            await interaction.reply({ content: `\`❌\` | An error occurred: ${err.message}`, ephemeral: true });
        }
    },
    options: {
        inVoice: true,
        sameVoice: true,
    }
};