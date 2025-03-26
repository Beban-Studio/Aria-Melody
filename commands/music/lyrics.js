const { 
    SlashCommandBuilder, 
    ActionRowBuilder, 
    ButtonBuilder,
    EmbedBuilder, 
    ButtonStyle 
} = require("discord.js");
const { logger } = require("../../utils/logger");
const config = require("../../config");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("lyrics")
        .setDescription("Display lyrics for the currently played song")
        .setDMPermission(false),

    run: async ({ interaction, client }) => {
        const embed = new EmbedBuilder().setColor(config.default_color);

        try {
            const node = Array.from(client.riffy.nodeMap.values())[0];
            const lyricsData = await node.lyrics.getCurrentTrack(interaction.guildId, false, "lyrics");

            if (!lyricsData || !lyricsData.text) {
                return interaction.reply({ 
                    embeds: [embed.setDescription("`❌` | No lyrics found for the current song.")], 
                    ephemeral: true 
                });
            }

            let lyricsProvider = `Source: ${lyricsData.provider}`;
            if (!lyricsData.provider) lyricsProvider = lyricsData.source;

            const lyricsChunks = lyricsData.text.split('\n').reduce((acc, line) => {
                const lastChunk = acc[acc.length - 1];
                if (!lastChunk || (lastChunk + '\n' + line).length > 2048) {
                    acc.push(line);
                } else {
                    acc[acc.length - 1] += '\n' + line;
                }
                return acc;
            }, []);

            if (lyricsChunks.length === 1) {
                return interaction.reply({ 
                    embeds: [embed.setDescription(lyricsChunks[0]).setFooter({text: lyricsProvider})] 
                });
            }

            let currentPage = 0;

            const updateEmbed = () => {
                embed.setDescription(lyricsChunks[currentPage]).setFooter({text: lyricsProvider});
                return embed;
            };

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('prev')
                        .setLabel('Previous')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(currentPage === 0),
                    new ButtonBuilder()
                        .setCustomId('next')
                        .setLabel('Next')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(currentPage === lyricsChunks.length - 1)
                );

            const reply = await interaction.reply({ 
                embeds: [updateEmbed()], 
                components: [row], 
                fetchReply: true 
            });

            const filter = (buttonInteraction) => {
                return buttonInteraction.user.id === interaction.user.id;
            };

            const collector = reply.createMessageComponentCollector({ filter, time: 60000 });

            collector.on('collect', async (buttonInteraction) => {
                if (buttonInteraction.customId === 'next') {
                    currentPage++;
                } else if (buttonInteraction.customId === 'prev') {
                    currentPage--;
                }

                embed.setDescription(lyricsChunks[currentPage]).setFooter({text: lyricsProvider});
                row.components[0].setDisabled(currentPage === 0);
                row.components[1].setDisabled(currentPage === lyricsChunks.length - 1);

                await buttonInteraction.update({ embeds: [embed], components: [row] });
            });

            collector.on('end', () => {
                row.components.forEach(button => button.setDisabled(true));
                interaction.editReply({ components: [row] });
            });

        } catch (err) {
            logger(err, "error");
            return interaction.reply({ 
                embeds: [embed.setDescription(`\`❌\` | An error occurred: ${err.message}`)], 
                ephemeral: true 
            });
        }
    },
    options: {
        inVoice: true,
        sameVoice: true,
    }
};