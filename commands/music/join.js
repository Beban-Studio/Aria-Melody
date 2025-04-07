const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const { logger } = require("../../utils/logger.js");
const config = require("../../config");

module.exports = {
	data: new SlashCommandBuilder()
   		.setName("join")
   		.setDescription("Invite the bot to the current voice channel you're in")
   		.setDMPermission(false),

	run: async ({ client, interaction }) => {
		const embed = new EmbedBuilder().setColor(config.clientOptions.embedColor);
		const player = client.riffy.players.get(interaction.guildId);

		if (!interaction.guild.members.me.permissionsIn(interaction.channel).has([PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages])) {
			return interaction.reply({ embeds: ["\`❌\` | Bot can't access the channel you're currently in. Please check the bot's permission on this server"], ephemeral: true });
		}
		if (!interaction.guild.members.me.permissionsIn(interaction.member.voice.channel.id).has([PermissionFlagsBits.ViewChannel, PermissionFlagsBits.Connect])) {
			return interaction.reply({ embeds: ["\`❌\` | Bot can't connect to the voice channel you're currently in. Please check the bot's permission on this server"], ephemeral: true });
		}
		if (player && player.voiceChannel !== interaction.member.voice.channelId) {
			return interaction.reply({ embeds: [embed.setDescription("\`❌\` | Bot already joined a voice channel.")], ephemeral: true });
		}

		try {
            await interaction.deferReply({ ephemeral: true });

			client.riffy.createConnection({
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
    }
};