const { SlashCommandBuilder } = require("discord.js");
const { logger } = require("../../utils/logger");

module.exports = {
	data: new SlashCommandBuilder()
   	.setName("previous")
   	.setDescription("Play the previous track"),

    run: async ({ interaction, client }) => {
        try {
            const player = client.riffy.players.get(interaction.guildId);

            if (!player) {
                return interaction.reply({ content: "\`❌\` | No active player found.", ephemeral: true });
            }

            if (!player.previous) {
                await interaction.reply({ content: "\`❌\` | Previous song was: \`Not found\`.", ephemeral: true });
                return;
            }

            await player.queue.unshift(player.previous);
            player.stop();

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