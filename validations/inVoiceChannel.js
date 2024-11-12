// This makes the command cannot be executed when member is not in a voice channel
module.exports = ({ interaction, commandObj }) => {
    if (commandObj.options?.inVoice) {
        const memberChannel = interaction.member.voice.channelId;
        
        if (!memberChannel) {
            return interaction.reply({
                content: `\`❌\` | You must be in a voice channel to use this command.`,
                ephemeral: true
            });
        }
    }
};