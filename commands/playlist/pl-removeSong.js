const { 
    SlashCommandBuilder, 
    ActionRowBuilder, 
    ButtonBuilder,
    EmbedBuilder, 
    ModalBuilder, 
    TextInputBuilder, 
    TextInputStyle,
    ButtonStyle
} = require("discord.js");
const { logger } = require("../../utils/logger");
const formatDuration = require("../../utils/formatDuration");
const playlist = require("../../schemas/playlist");
const config = require("../../config");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("pl-removesong")
        .setDescription("Remove a song from a playlist")
        .setDMPermission(false)
        .addStringOption(option =>
            option.setName("playlist")
                .setDescription("Select your playlist")
                .setRequired(true)
                .setAutocomplete(true)
        ),

    run: async ({ interaction }) => {
        const embed = new EmbedBuilder().setColor(config.default_color);
        const selectedPlaylistName = interaction.options.getString("playlist");
        const userId = interaction.user.id;

        try {
            await interaction.deferReply();
            await interaction.editReply({embeds: [embed.setDescription("\`🔎\` | Loading playlist...")]});

            const selectedPlaylist = await playlist.findOne({ name: selectedPlaylistName, userId: userId });

            if (!selectedPlaylist) {
                return interaction.editReply({ embeds: [embed.setDescription("\`❌\` | Playlist not found.")], ephemeral: true });
            }

            const songs = selectedPlaylist.songs;

            const songsPerPage = 10;
            const totalPages = Math.ceil(songs.length / songsPerPage);
            let currentPage = 0;

            const generateSongList = (page) => {
                const start = page * songsPerPage;
                const end = Math.min(start + songsPerPage, songs.length);
                return songs.slice(start, end).map((song, index) => 
                    `**\`\`\`autohotkey\n${start + index + 1}. Title       : ${song.title}\n` +
                    `Duration    : ${formatDuration(song.time)}\n` +
                    `\`\`\`**`
                ).join("\n");
            };

            const updateEmbed = () => {
                embed.setDescription(generateSongList(currentPage))
                     .setFooter({ text: `Page ${currentPage + 1} of ${totalPages}` })
                     .setAuthor({ name: "Select a Song to Remove" })
                     .setImage("https://i.imgur.com/Pj6ZrFW.png");
            };

            const createButtons = () => {
                const row = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId("prev_page")
                            .setLabel("Previous")
                            .setStyle(ButtonStyle.Primary)
                            .setDisabled(currentPage === 0),
                        new ButtonBuilder()
                            .setCustomId("next_page")
                            .setLabel("Next")
                            .setStyle(ButtonStyle.Primary)
                            .setDisabled(currentPage === totalPages - 1),
                        new ButtonBuilder()
                            .setCustomId("select_number")
                            .setLabel("Select Number")
                            .setStyle(ButtonStyle.Secondary)
                    );
                return [row];
            };

            updateEmbed();
            const reply = await interaction.editReply({
                embeds: [embed],
                components: createButtons(),
                fetchReply: true
            });

            const filter = (buttonInteraction) => buttonInteraction.user.id === userId;
            const collector = reply.createMessageComponentCollector({ filter, time: 300000 });

            collector.on("collect", async (buttonInteraction) => {
                if (buttonInteraction.customId === "next_page") {
                    currentPage++;
                } else if (buttonInteraction.customId === "prev_page") {
                    currentPage--;
                } else if (buttonInteraction.customId === "select_number") {
                    const modal = new ModalBuilder()
                        .setCustomId("remove_song_modal")
                        .setTitle("The Song's Number You Want to Delete");

                    const songNumberInput = new TextInputBuilder()
                        .setCustomId("song_number")
                        .setLabel("Song Number")
                        .setStyle(TextInputStyle.Short)
                        .setRequired(true);

                    const modalRow = new ActionRowBuilder().addComponents(songNumberInput);
                    modal.addComponents(modalRow);

                    await buttonInteraction.showModal(modal);

                    const row = createButtons();
                    if (row) {
                        row[0].components.forEach(button => button.setDisabled(true));
                        await interaction.editReply({ components: row });
                    }

                    const modalInteraction = await buttonInteraction.awaitModalSubmit({
                        time: 60000,
                        filter: (modalInteraction) => modalInteraction.user.id === userId,
                    });

                    const songNumber = parseInt(modalInteraction.fields.getTextInputValue("song_number")) - 1;

                    if (!selectedPlaylist || songNumber < 0 || songNumber >= selectedPlaylist.songs.length) {
                        return modalInteraction.reply({ embeds: [embed.setDescription("\`❌\` | Invalid song number or playlist not found.")], ephemeral: true });
                    }

                    const songToRemove = selectedPlaylist.songs[songNumber];

                    await playlist.updateOne(
                        { name: selectedPlaylistName, userId: userId },
                        { $pull: { songs: { url: songToRemove.url } } }
                    );

                    await modalInteraction.reply({ embeds: [embed.setDescription(`\`✔\` | Successfully removed the song from playlist \`${selectedPlaylistName}\`.`)], ephemeral: true });
                    return;
                }

                await buttonInteraction.deferUpdate();
                updateEmbed();
                await buttonInteraction.editReply({
                    embeds: [embed],
                    components: createButtons()
                });
            });

            collector.on("end", async () => {
                const row = createButtons();
                if (row) {
                    row[0].components.forEach(button => button.setDisabled(true));
                }
                await interaction.editReply({ components: row });
            });

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

        const userPlaylists = await Playlist.find({ userId: interaction.user.id });

        const filteredPlaylists = userPlaylists.filter(pl => pl.name.toLowerCase().includes(focusedValue.toLowerCase()));

        const choices = filteredPlaylists.map(pl => ({
            name: pl.name,
            value: pl.name
        }));

        return interaction.respond(choices.slice(0, 10)).catch(() => {});
    },
};