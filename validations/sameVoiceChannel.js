// This makes the command cannot be executed when member is not on the same vc as the bot
module.exports = ({ interaction, commandObj }) => {
	const memberChannel = interaction.member.voice.channel.id;
	const clientChannel = interaction.guild.members.me.voice.channelId;
	if (commandObj.sameVoice && memberChannel !== clientChannel) {
		interaction.reply({
			content: `\`❌\` | You must be on the same voice channel as me to use this command.`,
			ephemeral: true,
		});
	// This must be added to stop the command from being executed.
	return true;
	}
};