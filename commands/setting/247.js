const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { logger } = require("../../utils/logger.js");
const Reconnect = require("../../Schemas/247Connection");
const config = require("../../config");

module.exports = {
	data: new SlashCommandBuilder()
   		.setName("247")
   		.setDescription("Set the current player session to 24/7")
   		.setDMPermission(false),

	run: async ({ client, interaction }) => {
		const embed = new EmbedBuilder().setColor(config.default_color);

		try {
			await interaction.deferReply({ ephemeral: false });
			const player = client.riffy.players.get(interaction.guildId);
			const data = await Reconnect.findOne({ GuildId: interaction.guildId });

			if (data) {
				await data.deleteOne();
				return interaction.editReply({ embeds: [embed.setDescription("\`📻\` | 247 Mode has been: \`Disabled\`")] });
			} else if (!data) {
                console.log(player.textChannel, player.voiceChannel)
				const newData = await Reconnect.create({
					GuildId: interaction.guildId,
					TextChannelId: player.textChannel,
					VoiceChannelId: player.voiceChannel,
				});

				await newData.save();
				return interaction.editReply({ embeds: [embed.setDescription("\`📻\` | 247 Mode has been: \`Enabled\`")] });
			}
		} catch (err) {
			logger(err, "error");
			return interaction.editReply({ content: `\`❌\` | An error occurred while processing your request. Please try again later.`, ephemeral: true });
		}
	},
	options: {
		inVoice: true,
		sameVoice: true,
	}
};