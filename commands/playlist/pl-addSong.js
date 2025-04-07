const {
    StringSelectMenuBuilder,
    SlashCommandBuilder, 
    ActionRowBuilder, 
    EmbedBuilder
} = require('discord.js');
const { parseTimeString } = require("../../utils/parseTimeString");
const { logger } = require("../../utils/logger");
const playlist = require("../../schemas/playlist");
const config = require('../../config');

function checkUrl(link) {
    const urlPatterns = {
        youtube: /^(?:https?:\/\/)?(?:m\.|www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/gi,
        spotify: /^(?:https:\/\/open\.spotify\.com\/(?:user\/[A-Za-z0-9]+\/)?|spotify:)(album|playlist|track|artist)(?:[/:])([A-Za-z0-9]+).*$/gi,
        appleMusic: /(?:https:\/\/music\.apple\.com\/)(?:.+)?(artist|album|music-video|playlist)\/([\w\-\.]+(\/)+[\w\-\.]+|[^&]+)\/([\w\-\.]+(\/)+[\w\-\.]+|[^&]+)/gi,
        deezer: /^(?:https?:\/\/|)?(?:www\.)?deezer\.com\/(?:\w{2}\/)?(track|album|playlist|artist)\/(\d+)/gi,
        soundCloud: /^https?:\/\/(soundcloud\.com|snd\.sc)\/(.*)$/
    };

    for (const [key, pattern] of Object.entries(urlPatterns)) {
        if (pattern.test(link)) {
            return { type: key, url: link };
        }
    }
    return null;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pl-addsong')
        .setDescription('Add a song to a playlist')
        .setDMPermission(false)
        .addStringOption(option =>
            option.setName('query')
                .setDescription('Search for a track on Spotify')
                .setRequired(true)
                .setAutocomplete(true)
        ),

    run: async ({ interaction, client }) => {
        const embed = new EmbedBuilder().setColor(config.clientOptions.embedColor);
        const query = interaction.options.getString('query');
        const userId = interaction.user.id;

        try {
            await interaction.deferReply();
            await interaction.editReply({embeds: [embed.setDescription("\`🔎\` | Loading Song...")]});
            const resolve = await client.riffy.resolve({ query: query });
            const { loadType, tracks } = resolve;

            if (loadType === "playlist") {
                const songsToAdd = resolve.tracks.map(track => ({
                    url: track.info.uri,
                    title: track.info.title,
                    artist: track.info.author,
                    time: track.info.length
                }));

                const userPlaylists = await playlist.find({ userId: userId });
                if (!userPlaylists.length) {
                    return interaction.editReply({embeds: [embed.setDescription("\`❌\` | You don't have any playlists.")]});
                }

                const selectMenu = new StringSelectMenuBuilder()
                    .setCustomId('select_playlist')
                    .setPlaceholder('Select your playlist')
                    .addOptions(
                        userPlaylists.map(pl => ({
                            label: pl.name,
                            value: pl.name
                        }))
                    );

                const row = new ActionRowBuilder().addComponents(selectMenu);

                await interaction.editReply({
                    embeds: [embed.setDescription("\`✔\` | Please select your playlist from the menu below to add the songs.")],
                    components: [row],
                });

                const filter = (i) => i.customId === 'select_playlist' && i.user.id === userId;
                const collector = interaction.channel.createMessageComponentCollector({ filter, time: parseTimeString("60s") });

                collector.on('collect', async (i) => {
                    const selectedPlaylistName = i.values[0];
                    const selectedPlaylist = await playlist.findOne({ name: selectedPlaylistName, userId: userId });
                
                    if (!selectedPlaylist) {
                        return i.reply({ embeds: [embed.setDescription("\`❌\` | Playlist not found.")], ephemeral: true });
                    }
                
                    await i.deferUpdate();
                
                    for (const song of songsToAdd) {
                        await playlist.updateOne(
                            { name: selectedPlaylistName, userId: userId },
                            { $push: { songs: song } }
                        );
                    }
                
                    await interaction.editReply({ 
                        embeds: [embed.setDescription(`\`✔\` | Successfully added \`${songsToAdd.length}\` songs to playlist \`${selectedPlaylistName}\`.`)], 
                        components: [] 
                    });
                    collector.stop();
                });

            } else if (loadType === "search" || loadType === "track") {
                const track = tracks.shift();
                const song = { 
                    url: track.info.uri, 
                    title: track.info.title, 
                    artist: track.info.author,
                    time: track.info.length
                };

                const userPlaylists = await playlist.find({ userId: userId });
                if (!userPlaylists.length) {
                    return interaction.editReply({embeds: [embed.setDescription("\`❌\` | You don't have any playlists.")]});
                }

                const selectMenu = new StringSelectMenuBuilder()
                    .setCustomId('select_playlist')
                    .setPlaceholder('Select your playlist')
                    .addOptions(
                        userPlaylists.map(pl => ({
                            label: pl.name,
                            value: pl.name
                        }))
                    );

                const row = new ActionRowBuilder().addComponents(selectMenu);

                await interaction.editReply({
                    embeds: [embed.setDescription("\`✔\` | Please select your playlist from the menu below to add the song.")],
                    components: [row],
                });

                const filter = (i) => i.customId === 'select_playlist' && i.user.id === userId;
                const collector = interaction.channel.createMessageComponentCollector({ filter, time: parseTimeString("60s") });

                collector.on('collect', async (i) => {
                    const selectedPlaylistName = i.values[0];
                    const selectedPlaylist = await playlist.findOne({ name: selectedPlaylistName, userId: userId });

                    if (!selectedPlaylist) {
                        return i.reply({ embeds: [embed.setDescription("\`❌\` | Playlist not found.")], ephemeral: true });
                    }

                    await playlist.updateOne(
                        { name: selectedPlaylistName, userId: userId },
                        { $push: { songs: song } }
                    );

                    await interaction.editReply({ 
                        embeds: [embed.setDescription(`\`✔\` |  Added **[${track.info.title}](${track.info.uri})** to playlist \`${selectedPlaylistName}\`.`).setFooter({ iconURL: "https://i.imgur.com/V8bD4zm.png", text: "BebanCode"})],
                        components: [] 
                    });
                    collector.stop();
                });

            } else {
                return interaction.editReply({embeds: [embed.setDescription("\`❌\` | The song was not found or failed to load.")]});
            }

        } catch (err) {
            logger(err, "error");
            return interaction.editReply({
                embeds: [embed.setDescription(`\`❌\` | An error occurred: ${err.message}`)],
                ephemeral: true
            });
        }
    },

    autocomplete: async ({ interaction, client }) => {
        const focusedValue = interaction.options.getFocused();
        if (focusedValue.length <= 1) return;

        const urlCheck = checkUrl(focusedValue);
        if (urlCheck) {
            return interaction.respond([{ name: `${urlCheck.type.charAt(0).toUpperCase() + urlCheck.type.slice(1)} URL`, value: urlCheck.url }]);
        }

        let spotifyChoices = [];
        try {
            const spotifyResults = await client.spotify.searchTracks(focusedValue, { limit: 10 });
            spotifyChoices = spotifyResults.body.tracks.items.map(track => ({
                name: `${track.name} - ${track.artists.map(artist => artist.name).join(', ')}`,
                value: track.external_urls.spotify
            }));
        } catch (err) {
            logger(`Error fetching Spotify results: ${err}`);
        }

        // If you're looking to use ytsearch for the autocomplete check the example on play.js

        return interaction.respond(spotifyChoices.slice(0, 10)).catch(() => {});
    }
};