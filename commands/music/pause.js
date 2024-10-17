const { SlashCommandBuilder } = require("discord.js");
const { logger } = require("../../utils/logger");

module.exports = {
	data: new SlashCommandBuilder()
   	.setName("pause")
   	.setDescription("Pause the current track"),

    run: async ({ interaction, client }) => {
        try {
            const player = client.riffy.players.get(interaction.guild.id);

            if (!player) {
                return interaction.reply({ content: "\`❌\` | No player found in this server.",  ephemeral: true });
            }

            if (player.paused) {
                return interaction.reply({ content: "\`❗\` | The player is already paused.",  ephemeral: true });
            }

            player.pause(true);
            return interaction.reply("\`⏸\` | Paused the current track.");

        } catch (err) {
            logger(err, "error");   
            return interaction.reply({ content: `\`❌\` | An error occurred: ${err.message}`,  ephemeral: true });
        }
    },
	options: {
		inVoice: true,
		sameVoice: true,
	}
};