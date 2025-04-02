// This makes the command cannot be executed when member is not in a vc
module.exports = ({ interaction, commandObj }) => {
    if (commandObj.options?.inVoice) {
        if (interaction.isAutocomplete() || interaction.isButton()) return;
        
        const memberChannel = interaction.member.voice.channelId;
        if (!memberChannel) {
            if (interaction.deferred) {
                return interaction.editReply({ 
                    content: `\`❌\` | You must be in a voice channel to use this command.`, 
                    ephemeral: true 
                });
            } else {
                return interaction.reply({ 
                    content: `\`❌\` | You must be in a voice channel to use this command.`, 
                    ephemeral: true 
                });
            }
        }
    }
};