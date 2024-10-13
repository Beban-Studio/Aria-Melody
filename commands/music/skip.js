const { SlashCommandBuilder } = require("discord.js");
const { logger } = require("../../utils/logger");

module.exports = {
	data: new SlashCommandBuilder()
   	.setName("skip")
   	.setDescription("Resume a paused track"),

    run: async ({ interaction, client }) => {
    logger(`</> /skip used by ${interaction.user.tag} on ${interaction.guild} (${interaction.guildId})`, "info");

        try {
            const player = client.riffy.players.get(interaction.guildId);

            if (!player) {
                return interaction.reply({ content: "\`❌\` | No active player found.", ephemeral: true });
            }

            if (player.queue.size === 0) {
                await interaction.reply({ content: "\`❌\` | The queue is empty.", ephemeral: true });
                return;
            }

            await interaction.reply({ content: `\`⏭️\` | Skipped : ${player.current.info.title}` });
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