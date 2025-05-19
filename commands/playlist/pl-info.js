const { 
    SlashCommandBuilder, 
    ActionRowBuilder, 
    ButtonBuilder, 
    EmbedBuilder, 
    ButtonStyle 
} = require("discord.js");
const { parseTimeString } = require("../../utils/parseTimeString");
const { logger } = require("../../utils/logger");
const formatDuration = require("../../utils/formatDuration");
const playlist = require("../../schemas/playlist");
const config = require("../../config");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("pl-info")
        .setDescription("Show info of a playlist")
        .setDMPermission(false)
        .addStringOption(option =>
            option.setName('name')
                .setDescription('Name of your playlist')
                .setRequired(true)
                .setAutocomplete(true)
        ),

    run: async ({ interaction }) => {
        const embed = new EmbedBuilder().setColor(config.clientOptions.embedColor);
        
        try {
            await interaction.deferReply();
            await interaction.editReply({embeds: [embed.setDescription("\`🔎\` | Loading Playlist...")]});

            const userId = interaction.user.id;
            const playlistName = interaction.options.getString("name");

            const selectedPlaylist = await playlist.findOne({ userId: userId, name: playlistName });

            if (!selectedPlaylist) return interaction.editReply({embeds: [embed.setDescription("\`❌\` | Failed to load playlist.")]});
            if (!selectedPlaylist.songs.length) return interaction.editReply({embeds: [embed.setDescription("\`❌\` | No song(s) found in selected playlist.")]});

            const songs = selectedPlaylist.songs;

            const songsPerPage = 10;
            const totalPages = Math.ceil(songs.length / songsPerPage);
            let currentPage = 0;

            const generateSongList = (page) => {
                const start = page * songsPerPage;
                const end = Math.min(start + songsPerPage, songs.length);
                return songs.slice(start, end).map((song, index) => 
                    `**\`\`\`autohotkey\n${start + index + 1}. Title       : ${song.title}\n` +
                    `   Duration    : ${formatDuration(song.time)}\n` +
                    `\`\`\`**`
                ).join("\n");
            };

            let row;
            if (totalPages > 1) {
                row = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('prev_page')
                            .setLabel('Previous')
                            .setStyle(ButtonStyle.Primary)
                            .setDisabled(currentPage === 0),
                        new ButtonBuilder()
                            .setCustomId('next_page')
                            .setLabel('Next')
                            .setStyle(ButtonStyle.Primary)
                            .setDisabled(currentPage === totalPages - 1)
                    );
            }

            const reply = await interaction.editReply({ 
                embeds: [embed
                    .setAuthor({name: "Playlist Info"})
                    .setDescription(generateSongList(currentPage))
                    .setFooter({text: `Name: ${selectedPlaylist.name} | Page ${currentPage + 1} of ${totalPages}`, iconURL: interaction.user.displayAvatarURL()})
                    .setImage("https://i.imgur.com/Pj6ZrFW.png")
                ], 
                components: row ? [row] : [],
                fetchReply: true 
            });

            const filter = (buttonInteraction) => {
                return buttonInteraction.user.id === interaction.user.id;
            };

            if (row) {
                const collector = reply.createMessageComponentCollector({ filter, time: parseTimeString("60s") });

                collector.on('collect', async (buttonInteraction) => {
                    if (buttonInteraction.customId === 'next_page') {
                        currentPage++;
                    } else if (buttonInteraction.customId === 'prev_page') {
                        currentPage--;
                    }

                    embed.setDescription(generateSongList(currentPage))
                         .setFooter({ text: `Name: ${selectedPlaylist.name} | Page ${currentPage + 1} of ${totalPages}` });
                    row.components[0].setDisabled(currentPage === 0);
                    row.components[1].setDisabled(currentPage === totalPages - 1);

                    await buttonInteraction.update({ embeds: [embed], components: [row] });
                });

                collector.on('end', () => {
                    row.components.forEach(button => button.setDisabled(true));
                    interaction.editReply({ components: [row] });
                });
            }

        } catch (err) {
            logger(err, "error");
            return interaction.editReply({ 
                embeds: [embed.setDescription(`\`❌\` | An error occurred: ${err.message}`)], 
                ephemeral: true 
            });
        }
    },

    autocomplete: async ({ interaction }) => {
        const focusedValue = interaction.options.getFocused();
        if (focusedValue.length <= 1) return;

        const userPlaylists = await playlist.find({ userId: interaction.user.id });

        const filteredPlaylists = userPlaylists
            .filter(pl => pl.name.toLowerCase().includes(focusedValue.toLowerCase()))
            .map(pl => ({
                name: pl.name,
                value: pl.name
            }));
        
        return interaction.respond(filteredPlaylists.slice(0, 10)).catch(() => {});
    }
};