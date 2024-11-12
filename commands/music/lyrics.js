const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { logger } = require("../../utils/logger");
const config = require("../../config");
const fetch = require("node-fetch");


module.exports = {
	data: new SlashCommandBuilder()
   	.setName("lyrics")
   	.setDescription("Display lyrics for current played song")
    .setDMPermission(false)
    .addStringOption(option =>
        option.setName("song")
        .setDescription("Song name")
    ),

    run: async ({ interaction, client }) => {    
        const embed = new EmbedBuilder().setColor(config.default_color);

        try {
            await interaction.deferReply();
            const player = client.riffy.players.get(interaction.guildId);
            const value = interaction.options.getString("song");

            if (!player && !value) {
                return interaction.editReply({ 
                    embeds: [embed.setDescription("\`❌\` | No active player found.")], 
                    ephemeral: true 
                });
            }

            let song = value;
            if (!value) song = player.current.info.title.replace(["(Official Video)", "(Official Audio)"], "");

            await fetch(`https://some-random-api.com/others/lyrics?title=${song}`)
                .then((res) => res.json())
                .then((data) => {
                    const lyricSong = data.lyrics;
                    let lyricUrl;
                    if (data.links.genius) {
                        lyricUrl = `**[Click Here For More](${data.links.genius})**`
                    } 
                    if (!lyricSong) {
                        return interaction.editReply({ embeds: [embed.setDescription("\`❌\` | Lyrics was not found.")] });
                    }

                    const lyrics = lyricSong.length > 3905 ? lyricSong.substr(0, 3900) + "....." : lyricSong;
                    const titleSong = data.title;
                    const authorSong = data.author;
                    const lyricEmbed = new EmbedBuilder()
                        .setAuthor({
                            name: `${titleSong} by ${authorSong} lyrics`,
                            iconURL: client.user.displayAvatarURL({ dynamic: true }),
                        })
                        .setColor(config.default_color)
                        .setDescription(`${lyrics}\n${lyricUrl}`);

                    return interaction.editReply({ embeds: [lyricEmbed] });
                });
                
        } catch (err) {
            logger(err, "error");
            return interaction.editReply({ 
                embeds: [embed.setDescription(`\`❌\` | An error occurred: ${err.message}`)], 
                ephemeral: true 
            });
        }
    }
};
