const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { logger } = require("../../utils/logger");
const config = require("../../config");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("slowmode")
        .setDescription("Add a slow mode effect to the player")
        .setDMPermission(false)
        .addBooleanOption(option =>
            option.setName("enabled")
                .setDescription("Enable or disable slow mode effect")
                .setRequired(true)
        )
        .addNumberOption(option =>
            option.setName("speed")
                .setDescription("Playback speed (default is 0.5, range 0.1 to 1.0)")
                .setRequired(false)
        ),

    run: async ({ interaction, client }) => {
        const embed = new EmbedBuilder().setColor(config.clientOptions.embedColor);

        try {
            const player = client.riffy.players.get(interaction.guildId);
            const enabled = interaction.options.getBoolean('enabled');
            const speed = interaction.options.getNumber('speed');

            if (!player) {
                return interaction.reply({
                    embeds: [embed.setDescription("\`❌\` | No player found in this server.")],
                    ephemeral: true
                });
            }

            if (enabled) {
                const playbackSpeed = speed !== null ? speed : 0.5;
                if (playbackSpeed < 0.1 || playbackSpeed > 1.0) {
                    return interaction.reply({
                        embeds: [embed.setDescription("\`❌\` | Speed must be between 0.1 and 1.0.")],
                        ephemeral: true
                    });
                }
                player.filters.setSlowMode(true, {
                    speed: playbackSpeed
                });
                return interaction.reply({ embeds: [embed.setDescription(`\`✅\` | Slow mode effect enabled with playback speed ${playbackSpeed}.`)] });
            } else {
                player.filters.setSlowMode(false);
                return interaction.reply({ embeds: [embed.setDescription(`\`✅\` | Slow mode effect disabled.`)] });
            }

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