const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { logger } = require("../../utils/logger");
const config = require("../../config");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("vibrato")
        .setDescription("Add a vibrato effect to the player")
        .setDMPermission(false)
        .addBooleanOption(option =>
            option.setName("enabled")
                .setDescription("Enable or disable vibrato effect")
                .setRequired(true)
        )
        .addNumberOption(option =>
            option.setName("frequency")
                .setDescription("Frequency of the vibrato effect (default is 1.0)")
                .setRequired(false)
        )
        .addNumberOption(option =>
            option.setName("depth")
                .setDescription("Depth of the vibrato effect (default is 1.0)")
                .setRequired(false)
        ),

    run: async ({ interaction, client }) => {
        const embed = new EmbedBuilder().setColor(config.clientOptions.embedColor);

        try {
            const player = client.riffy.players.get(interaction.guildId);
            const enabled = interaction.options.getBoolean('enabled');
            const frequency = interaction.options.getNumber('frequency');
            const depth = interaction.options.getNumber('depth');

            if (!player) {
                return interaction.reply({
                    embeds: [embed.setDescription("\`❌\` | No player found in this server.")],
                    ephemeral: true
                });
            }

            if (enabled) {
                player.filters.setVibrato(true, {
                    frequency: frequency || 1.0,
                    depth: depth || 1.0
                });
                return interaction.reply({ embeds: [embed.setDescription(`\`✅\` | Vibrato effect enabled with frequency ${frequency || 1.0} and depth ${depth || 1.0}.`)] });
            } else {
                player.filters.setVibrato(false);
                return interaction.reply({ embeds: [embed.setDescription(`\`✅\` | Vibrato effect disabled.`)] });
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