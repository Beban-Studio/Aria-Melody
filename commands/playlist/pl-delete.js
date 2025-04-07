const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { logger } = require("../../utils/logger");
const playlist = require("../../schemas/playlist");
const config = require('../../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pl-delete')
        .setDescription('Delete a playlist')
        .setDMPermission(false)
        .addStringOption(option => 
            option.setName("name")
            .setDescription("The name of the playlist")
            .setAutocomplete(true)
            .setRequired(true)
        ),

    run: async ({ interaction }) => {
        const embed = new EmbedBuilder().setColor(config.clientOptions.embedColor);

        try {
            const playlistName = interaction.options.getString('name');
            const userId = interaction.user.id;

            const existingPlaylist = await playlist.findOne({ 
                name: playlistName, 
                userId: userId 
            });

            if (!existingPlaylist) {
                return interaction.reply({ 
                    embeds: [embed.setDescription("\`❌\` | You don't have a playlist with that name.")], 
                    ephemeral: true 
                });
            }

            const result = await playlist.deleteOne({ 
                name: playlistName, 
                userId: userId 
            });

            if (result.deletedCount === 0) {
                return interaction.reply({ 
                    embeds: [embed.setDescription("\`❌\` | Failed to delete the playlist.")], 
                    ephemeral: true 
                });
            }

            await interaction.reply({ 
                embeds: [embed.setDescription(`\`✔\` | The playlist \`${playlistName}\` has been deleted.`)], 
                ephemeral: true 
            });

        } catch (err) {
            logger(err, "error");
            return interaction.reply({ 
                embeds: [embed.setDescription(`\`❌\` | An error occurred: ${err.message}`)], 
                ephemeral: true 
            });
        }
    },

    autocomplete: async ({ interaction }) => {
        const focusedValue = interaction.options.getFocused();
        if (focusedValue.length <= 1) return;

        const userPlaylists = await playlist.find({ userId: interaction.user.id });

        const filteredPlaylists = userPlaylists.filter(pl => pl.name.toLowerCase().includes(focusedValue.toLowerCase()));

        const choices = filteredPlaylists.map(pl => ({
            name: pl.name,
            value: pl.name
        }));

        return interaction.respond(choices.slice(0, 10)).catch(() => {});
    },
};