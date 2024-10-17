const { SlashCommandBuilder } = require("discord.js");

module.exports = {
	data: new SlashCommandBuilder()
   	.setName("stop")
   	.setDescription("Stop the current track and destroy the player"),

    run: async ({ interaction, client }) => {
        try {
            const player = client.riffy.players.get(interaction.guildId);

            if (!player) {
                return interaction.reply({ content: "\`❌\` | No active player found.", ephemeral: true });
            }

            player.stop();
            player.destroy();
            return interaction.reply({ content: "\`⏹️\` Player has been stopped and destroyed." });

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