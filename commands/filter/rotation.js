const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { logger } = require("../../utils/logger");
const config = require("../../config");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("rotation")
        .setDescription("Add a rotation effect to the player")
        .setDMPermission(false)
        .addBooleanOption(option =>
            option.setName("enabled")
                .setDescription("Enable or disable rotation effect")
                .setRequired(true)
        )
        .addNumberOption(option =>
            option.setName("rotationhz")
                .setDescription("Rotation frequency in Hz (default is 1.0)")
                .setRequired(false)
        ),

    run: async ({ interaction, client }) => {
        const embed = new EmbedBuilder().setColor(config.clientOptions.embedColor);

        try {
            const player = client.riffy.players.get(interaction.guildId);
            const enabled = interaction.options.getBoolean('enabled');
            const rotationHz = interaction.options.getNumber('rotationhz');

            if (!player) {
                return interaction.reply({
                    embeds: [embed.setDescription("\`❌\` | No player found in this server.")],
                    ephemeral: true
                });
            }

            if (enabled) {
                player.filters.setRotation(true, {
                    rotationHz: rotationHz || 1.0
                });
                return interaction.reply({ embeds: [embed.setDescription(`\`✅\` | Rotation effect enabled with frequency ${rotationHz || 1.0} Hz.`)] });
            } else {
                player.filters.setRotation(false);
                return interaction.reply({ embeds: [embed.setDescription(`\`✅\` | Rotation effect disabled.`)] });
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