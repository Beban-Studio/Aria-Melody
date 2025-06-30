const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { parseTimeString } = require("../../utils/parseTimeString");
const { logger } = require("../../utils/logger");
const config = require("../../config");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("seek")
		.setDescription("Seek to a specific time in the current track.")
		.addStringOption(option =>
			option
				.setName("time")
				.setDescription("Timestamp to seek to (e.g. 1:30 or 90s)")
				.setRequired(true)
		)
		.setDMPermission(false),

	run: async ({ interaction, client }) => {
		const embed = new EmbedBuilder().setColor(config.clientOptions.embedColor);

		try {
			const player = client.riffy.players.get(interaction.guildId);

			if (!player || !player.current) {
				return interaction.reply({
					embeds: [embed.setDescription("`❌` | No track is currently playing.")],
					ephemeral: true
				});
			}

			const timeInput = interaction.options.getString("time");
			const seekTime = parseTimeString(timeInput);

			if (seekTime === null || isNaN(seekTime)) {
				return interaction.reply({
					embeds: [embed.setDescription("`❌` | Invalid time format. Try `1:30` or `90s`.")],
					ephemeral: true
				});
			}

			const duration = player.current.info.length;
			if (seekTime >= duration) {
				return interaction.reply({
					embeds: [embed.setDescription("`❌` | Cannot seek beyond track duration.")],
					ephemeral: true
				});
			}

			await player.seek(seekTime);

			return interaction.reply({
				embeds: [embed.setDescription(`\`✅\` | Seeked to \`${timeInput}\`.`)],
				ephemeral: false
			});
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
		sameVoice: true
	}
};
