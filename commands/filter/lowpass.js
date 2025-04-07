const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { logger } = require("../../utils/logger");
const config = require("../../config");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("lowpass")
        .setDescription("Add a lowpass filter to the player")
        .setDMPermission(false)
        .addBooleanOption(option =>
            option.setName("enabled")
                .setDescription("Enable or disable lowpass filter")
                .setRequired(true)
        )
        .addNumberOption(option =>
            option.setName("cutoff")
                .setDescription("Cutoff frequency in Hz (default is 2000)")
                .setRequired(false)
        )
        .addNumberOption(option =>
            option.setName("resonance")
                .setDescription("Resonance (default is 1.0)")
                .setRequired(false)
        ),

    run: async ({ interaction, client }) => {
        const embed = new EmbedBuilder().setColor(config.clientOptions.embedColor);

        try {
            const player = client.riffy.players.get(interaction.guildId);
            const enabled = interaction.options.getBoolean('enabled');
            const cutoff = interaction.options.getNumber('cutoff');
            const resonance = interaction.options.getNumber('resonance');

            if (!player) {
                return interaction.reply({
                    embeds: [embed.setDescription("\`❌\` | No player found in this server.")],
                    ephemeral: true
                });
            }

            if (enabled) {
                player.filters.setLowpass(true, {
                    cutoff: cutoff || 2000,
                    resonance: resonance || 1.0
                });
                return interaction.reply({ embeds: [embed.setDescription(`\`✅\` | Lowpass filter enabled with cutoff frequency ${cutoff || 2000} Hz and resonance ${resonance || 1.0}.`)] });
            } else {
                player.filters.setLowpass(false);
                return interaction.reply({ embeds: [embed.setDescription(`\`✅\` | Lowpass filter disabled.`)] });
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