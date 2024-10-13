// This makes the command cannot be executed when member is not on the same vc as the bot
module.exports = (interaction, commandObj) => {
    const memberChannel = interaction.member.voice.channel
	const player = client.riffy.players.get(interaction.guildId);
    if (commandObj.sameVoice) {
		if (!player) {
			return interaction.reply({ content: "\`❌\` | No active player found.", ephemeral: true });
		}

		if (player.voiceChannel !== memberChannel) {
			return interaction.reply({ content: "\`❌\` | You must be in the same voice channel as the bot.", ephemeral: true });
		}
    } 
};