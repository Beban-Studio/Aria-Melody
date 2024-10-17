const { SlashCommandBuilder } = require("discord.js");

module.exports = {
	data: new SlashCommandBuilder()
   	.setName("resume")
   	.setDescription("Resume a paused track"),

    run: async ({ interaction, client }) => {    
        try {
            const player = client.riffy.players.get(interaction.guildId);

            if (!player) {
                return interaction.reply({ content: "\`❌\` | No active player found.", ephemeral: true });
            }

            if (!player.paused) {
                return interaction.reply({ content: "\`❗\` | The current player is not paused.",  ephemeral: true });
            }

            player.pause(false);
            await interaction.reply({ content: "\`▶️\` | Playback has been resumed!" });

        } catch (err) {
            logger(err, "error");
            await interaction.reply({ content: `\`❌\` | An error occurred: ${err.message}`, ephemeral: true });
        }
    },
    options: {
        inVoice: true,
        sameVoice: true,
    }
};