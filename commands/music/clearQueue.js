const {
    SlashCommandBuilder,
    EmbedBuilder
} = require("discord.js");
const { logger } = require("../../utils/logger");
const config = require("../../config");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("queue-clear")
        .setDescription("Clear the current music queue")
        .setDMPermission(false),

    run: async ({ interaction, client }) => {
        const embed = new EmbedBuilder().setColor(config.clientOptions.embedColor);

        try {
            await interaction.deferReply();

            const player = client.riffy.players.get(interaction.guildId);

            if (!player || !player.queue.length) {
                return interaction.editReply({
                    embeds: [embed.setDescription("`❌` | There are no songs in the queue to clear.")],
                    ephemeral: true
                });
            }


            player.queue.clear();

            return interaction.editReply({
                embeds: [embed.setDescription("`✅` | The queue has been successfully cleared.")],
            });

        } catch (err) {
            logger(err, "error");
            return interaction.editReply({
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
