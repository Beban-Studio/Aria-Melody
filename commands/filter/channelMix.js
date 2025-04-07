const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { logger } = require("../../utils/logger");
const config = require("../../config");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("channelmix")
        .setDescription("Add a channel mix effect to the player")
        .setDMPermission(false)
        .addBooleanOption(option =>
            option.setName("enabled")
                .setDescription("Enable or disable channel mix effect")
                .setRequired(true)
        )
        .addNumberOption(option =>
            option.setName("left")
                .setDescription("Mix level for the left channel (default is 1.0)")
                .setRequired(false)
        )
        .addNumberOption(option =>
            option.setName("right")
                .setDescription("Mix level for the right channel (default is 1.0)")
                .setRequired(false)
        ),

    run: async ({ interaction, client }) => {
        const embed = new EmbedBuilder().setColor(config.clientOptions.embedColor);

        try {
            const player = client.riffy.players.get(interaction.guildId);
            const enabled = interaction.options.getBoolean('enabled');
            const leftMix = interaction.options.getNumber('left');
            const rightMix = interaction.options.getNumber('right');

            if (!player) {
                return interaction.reply({
                    embeds: [embed.setDescription("\`❌\` | No player found in this server.")],
                    ephemeral: true
                });
            }

            if (enabled) {
                player.filters.setChannelMix(true, {
                    left: leftMix || 1.0,
                    right: rightMix || 1.0
                });
                return interaction.reply({ embeds: [embed.setDescription(`\`✅\` | Channel mix effect enabled with left mix ${leftMix || 1.0} and right mix ${rightMix || 1.0}.`)] });
            } else {
                player.filters.setChannelMix(false);
                return interaction.reply({ embeds: [embed.setDescription(`\`✅\` | Channel mix effect disabled.`)] });
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