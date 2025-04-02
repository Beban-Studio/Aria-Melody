const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const { logger } = require("../../utils/logger");
const config = require("../../config");
const playlist = require("../../schemas/playlist");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("pl-play")
        .setDescription("Play a saved playlist")
        .setDMPermission(false)
        .addStringOption(option => 
            option.setName("name")
            .setDescription("The name of the playlist")
            .setAutocomplete(true)
            .setRequired(true)
        ),

    run: async ({ interaction, client }) => {
        if (!interaction.guild.members.me.permissionsIn(interaction.channel).has([PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages])) {
            return interaction.reply({ content: "\`❌\` | Bot can't access the channel you're currently in\n\`⚠️\` | Please check Bot's permission on this server", ephemeral: true });
        }
        if (!interaction.guild.members.me.permissionsIn(interaction.member.voice.channel.id).has([PermissionFlagsBits.ViewChannel, PermissionFlagsBits.Connect])) {
            return interaction.reply({ content: "\`❌\` | Bot can't connect to the voice channel you're currently in\n\`⚠️\` | Please check Bot's permission on this server", ephemeral: true });
        }

        await interaction.deferReply();

        const embed = new EmbedBuilder().setColor(config.default_color);
        const playlistName = interaction.options.getString("name");
        
        let player = client.riffy.players.get(interaction.guildId);
        
        if (!player) {
            player = client.riffy.createConnection({
                defaultVolume: 50,
                guildId: interaction.guildId,
                voiceChannel: interaction.member.voice.channelId,
                textChannel: interaction.channelId,
                deaf: true
            });
        }

        const userPlaylists = await playlist.find({ userId: interaction.user.id });

        const matchedPlaylists = userPlaylists.filter(pl => pl.name.toLowerCase() === playlistName.toLowerCase());

        if (matchedPlaylists.length > 0) {
            const selectedPlaylist = matchedPlaylists[0];
            for (const song of selectedPlaylist.songs) {
                const query = song.url ? song.url : song.name;
                const resolve = await client.riffy.resolve({ query: query, requester: interaction.member });
                if (!resolve || typeof resolve !== 'object') {
                    throw new TypeError('Resolve response is not an object');
                }

                const { loadType, tracks } = resolve;
                if (loadType === 'track' || loadType === 'search') {
                    const track = tracks.shift();
                    track.info.requester = interaction.user.username;
                    player.queue.add(track);
                } else {
                    return interaction.editReply({ embeds: [embed.setDescription("\`❌\` | Error resolving song.")] });
                }
            }

            await interaction.editReply({ embeds: [embed.setDescription(`\`➕\` | Added **${selectedPlaylist.name}** to the queue.`)] });
            if (!player.playing && !player.paused) player.play();
        } else {
            return interaction.editReply({ embeds: [embed.setDescription("\`❌\` | No playlists found matching your query.")] });
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