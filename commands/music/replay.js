const { SlashCommandBuilder } = require("discord.js");
const { logger } = require("../../utils/logger");

module.exports = {
	data: new SlashCommandBuilder()
   	.setName("replay")
   	.setDescription("Replay the current track"),

    run: async ({ interaction, client }) => {
        try {
            const player = client.riffy.players.get(interaction.guildId);

            if (!player) {
                return interaction.reply({ content: "\`❌\` | No active player found.", ephemeral: true });
            }

            await interaction.reply({ content: "\`🔄\` | Track replayed." });
            player.seek(0);

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