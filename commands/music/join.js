const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { logger } = require("../../utils/logger.js");
const config = require("../../config");

module.exports = {
	data: new SlashCommandBuilder()
   		.setName("join")
   		.setDescription("Invite the bot to the current voice channel you're in")
   		.setDMPermission(false),

	run: async ({ client, interaction }) => {
		const embed = new EmbedBuilder().setColor(config.default_color);
		const player = client.riffy.players.get(interaction.guildId);

		if (player) return interaction.reply({ 
			content: "\`❌\` | You must be in the same voice channel as the bot.", 
			ephemeral: true 
		});
		
		try {
            await interaction.deferReply({ ephemeral: true });

            await client.riffy.createConnection({
                defaultVolume: 50,
                guildId: interaction.guildId,
                voiceChannel: interaction.member.voice.channelId,
                textChannel: interaction.channelId,
                deaf: true
            });

            return interaction.editReply({ 
                embeds: [embed.setDescription(`Successfully joined <#${interaction.member.voice.channelId}>`)], 
                ephemeral: true 
            });

		} catch (err) {
			logger(err, "error");
			return interaction.editReply({ 
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