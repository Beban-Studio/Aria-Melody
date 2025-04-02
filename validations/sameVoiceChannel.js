// This makes the command cannot be executed when member is not on the same vc as the bot
module.exports = ({ interaction, commandObj, client }) => {
    if (commandObj.options?.sameVoice) {
        if (interaction.isAutocomplete() || interaction.isButton()) return;
        
        const memberChannel = interaction.member.voice.channel;
        const player = client.riffy.players.get(interaction.guildId);
        if (player) {
            if (player.voiceChannel !== memberChannel.id) {
                if (interaction.deferred) {
                    return interaction.editReply({ 
                        content: "\`❌\` | You must be in the same voice channel as the bot.", 
                        ephemeral: true 
                    });
                } else {
                    return interaction.reply({ 
                        content: "\`❌\` | You must be in the same voice channel as the bot.", 
                        ephemeral: true 
                    });
                }
            }
        } else {
            if (interaction.deferred) {
                return interaction.editReply({ 
                    content: "\`❌\` | No music is currently playing.", 
                    ephemeral: true 
                });
            } else {
                return interaction.reply({ 
                    content: "\`❌\` | No music is currently playing.", 
                    ephemeral: true 
                });
            }
        }
    } 
};