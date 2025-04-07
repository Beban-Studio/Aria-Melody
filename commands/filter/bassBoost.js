const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { logger } = require("../../utils/logger");
const config = require("../../config");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("bassboost")
        .setDescription("Add a bass boost effect to the player")
        .setDMPermission(false)
        .addBooleanOption(option =>
            option.setName("enabled")
                .setDescription("Enable or disable bass boost effect")
                .setRequired(true)
        )
        .addNumberOption(option =>
            option.setName("level")
                .setDescription("Bass boost level (default is 1, range 1 to 5)")
                .setRequired(false)
        ),

    run: async ({ interaction, client }) => {
        const embed = new EmbedBuilder().setColor(config.clientOptions.embedColor);

        try {
            const player = client.riffy.players.get(interaction.guildId);
            const enabled = interaction.options.getBoolean('enabled');
            const level = interaction.options.getNumber('level');

            if (!player) {
                return interaction.reply({
                    embeds: [embed.setDescription("\`❌\` | No player found in this server.")],
                    ephemeral: true
                });
            }

            if (enabled) {
                player.filters.setBassBoost(true, {
                    level: level !== null ? level : 1.0
                });
                return interaction.reply({ embeds: [embed.setDescription(`\`✅\` | Bass boost effect enabled with level ${level !== null ? level : 1.0}.`)] });
            } else {
                player.filters.setBassBoost(false);
                return interaction.reply({ embeds: [embed.setDescription(`\`✅\` | Bass boost effect disabled.`)] });
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