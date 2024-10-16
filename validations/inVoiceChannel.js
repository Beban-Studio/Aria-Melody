// This makes the command cannot be executed when member is not in a vc
module.exports = ({ interaction, commandObj }) => {
    const memberChannel = interaction.member.voice.channelId;
    if (commandObj.options?.inVoice) {
        if (!memberChannel) {
            return interaction.reply({
                content: `\`❌\` | You must be in a voice channel to use this command.`,
                ephemeral: true,
            });
        }
    }
};