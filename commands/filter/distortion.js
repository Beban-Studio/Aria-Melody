const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { logger } = require("../../utils/logger");
const config = require("../../config");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("distortion")
        .setDescription("Add a distortion effect to the player")
        .setDMPermission(false)
        .addBooleanOption(option =>
            option.setName("enabled")
                .setDescription("Enable or disable distortion effect")
                .setRequired(true)
        )
        .addNumberOption(option =>
            option.setName("sinoffset")
                .setDescription("Sine offset (default is 1.0)")
                .setRequired(false)
        )
        .addNumberOption(option =>
            option.setName("sinscale")
                .setDescription("Sine scale (default is 1.0)")
                .setRequired(false)
        )
        .addNumberOption(option =>
            option.setName("cosoffset")
                .setDescription("Cosine offset (default is 1.0)")
                .setRequired(false)
        )
        .addNumberOption(option =>
            option.setName("cosscale")
                .setDescription("Cosine scale (default is 1.0)")
                .setRequired(false)
        )
        .addNumberOption(option =>
            option.setName("tanoffset")
                .setDescription("Tangent offset (default is 1.0)")
                .setRequired(false)
        )
        .addNumberOption(option =>
            option.setName("tanscale")
                .setDescription("Tangent scale (default is 1.0)")
                .setRequired(false)
        )
        .addNumberOption(option =>
            option.setName("offset")
                .setDescription("General offset (default is 1.0)")
                .setRequired(false)
        )
        .addNumberOption(option =>
            option.setName("scale")
                .setDescription("General scale (default is 1.0)")
                .setRequired(false)
        ),

    run: async ({ interaction, client }) => {
        const embed = new EmbedBuilder().setColor(config.clientOptions.embedColor);

        try {
            const player = client.riffy.players.get(interaction.guildId);
            const enabled = interaction.options.getBoolean('enabled');
            const sinOffset = interaction.options.getNumber('sinoffset');
            const sinScale = interaction.options.getNumber('sinscale');
            const cosOffset = interaction.options.getNumber('cosoffset');
            const cosScale = interaction.options.getNumber('cosscale');
            const tanOffset = interaction.options.getNumber('tanoffset');
            const tanScale = interaction.options.getNumber('tanscale');
            const offset = interaction.options.getNumber('offset');
            const scale = interaction.options.getNumber('scale');

            if (!player) {
                return interaction.reply({
                    embeds: [embed.setDescription("\`❌\` | No player found in this server.")],
                    ephemeral: true
                });
            }

            if (enabled) {
                player.filters.setDistortion(true, {
                    sinOffset: sinOffset || 1.0,
                    sinScale: sinScale || 1.0,
                    cosOffset: cosOffset || 1.0,
                    cosScale: cosScale || 1.0,
                    tanOffset: tanOffset || 1.0,
                    tanScale: tanScale || 1.0,
                    offset: offset || 1.0,
                    scale: scale || 1.0
                });
                return interaction.reply({ embeds: [embed.setDescription(`\`✅\` | Distortion effect enabled with specified parameters.`)] });
            } else {
                player.filters.setDistortion(false);
                return interaction.reply({ embeds: [embed.setDescription(`\`✅\` | Distortion effect disabled.`)] });
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