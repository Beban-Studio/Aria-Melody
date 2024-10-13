// This makes the command cannot be executed when member is not in a vc
module.exports = async ({ interaction, commandObj }) => {
    const memberChannel = await interaction.member.voice.channel;
    if (commandObj.inVoice && (!memberChannel || memberChannel === undefined)) {
        interaction.reply({
            content: `\`❌\` | You must be in a voice channel to use this command.`,
            ephemeral: true,
        });
        // This stops the command from being executed.
        return true;
    }
};

