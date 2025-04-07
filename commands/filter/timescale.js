const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { logger } = require("../../utils/logger");
const config = require("../../config");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("timescale")
        .setDescription("Set the timescale effect for the player")
        .setDMPermission(false)
        .addBooleanOption(option =>
            option.setName("enabled")
                .setDescription("Enable or disable timescale effect")
                .setRequired(true)
        )
        .addNumberOption(option =>
            option.setName("speed")
                .setDescription("Speed of the song (default is 1.0)")
                .setRequired(false)
        )
        .addNumberOption(option =>
            option.setName("pitch")
                .setDescription("Pitch adjustment (default is 1.0)")
                .setRequired(false)
        ),

    run: async ({ interaction, client }) => {
        const embed = new EmbedBuilder().setColor(config.clientOptions.embedColor);

        try {
            const player = client.riffy.players.get(interaction.guildId);
            const enabled = interaction.options.getBoolean('enabled');
            const speed = interaction.options.getNumber('speed');
            const pitch = interaction.options.getNumber('pitch');

            if (!player) {
                return interaction.reply({
                    embeds: [embed.setDescription("\`❌\` | No player found in this server.")],
                    ephemeral: true
                });
            }

            if (enabled) {
                player.filters.setTimescale(true, {
                    speed: speed || 1.0,
                    pitch: pitch || 1.0,
                    rate: 1.0
                });
                return interaction.reply({ embeds: [embed.setDescription(`\`✅\` | Timescale effect enabled with speed ${speed || 1.0} and pitch ${pitch || 1.0}.`)] });
            } else {
                player.filters.setTimescale(false);
                return interaction.reply({ embeds: [embed.setDescription(`\`✅\` | Timescale effect disabled.`)] });
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