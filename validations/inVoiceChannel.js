// This makes the command cannot be executed when member is not in a vc
module.exports = ({ interaction, commandObj }) => {
	const memberChannel = interaction.member.voice.channel.id;
	if (commandObj.inVoice && !memberChannel) {
		if (!memberChannel) {
			  	interaction.reply({
					content: `\`❌\` | You must be in a voice channel to use this command.`,
					ephemeral: true,
				});
		// This must be added to stop the command from being executed.
		return true;
		}
	}
};