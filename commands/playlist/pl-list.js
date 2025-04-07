const { 
    SlashCommandBuilder, 
    ActionRowBuilder, 
    ButtonBuilder, 
    EmbedBuilder, 
    ButtonStyle 
} = require("discord.js");
const { parseTimeString } = require("../../utils/parseTimeString");
const { logger } = require("../../utils/logger");
const playlist = require("../../schemas/playlist");
const config = require("../../config");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("pl-list")
        .setDescription("Show all playlists you have created")
        .setDMPermission(false),

    run: async ({ interaction }) => {
        const embed = new EmbedBuilder().setColor(config.clientOptions.embedColor);
        
        try {
            await interaction.deferReply();
            const userId = interaction.user.id;

            const playlists = await playlist.find({ userId: userId });

            if (!playlists.length) return interaction.editReply({embeds: [embed.setDescription("\`❌\` You don't have any playlists.")]});

            const pageSize = 10;
            const totalPages = Math.ceil(playlists.length / pageSize);
            let currentPage = 0;

            const generatePlaylistDescription = (page) => {
                return playlists.slice(page * pageSize, (page + 1) * pageSize)
                    .map((playlist) =>
                        `**\`\`\`autohotkey\nName        : ${playlist.name}\n` +
                        `Total Songs : ${playlist.songs.length}\n` +
                        `Created At  : ${playlist.created}\n\`\`\`**`
                    )
                    .join('\n\n');
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
                    .setAuthor({name: "Playlist List"})
                    .setDescription(generatePlaylistDescription(currentPage))
                    .setFooter({text: `Total Playlists: ${playlists.length}`, iconURL: interaction.user.displayAvatarURL()})
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

                    embed.setDescription(generatePlaylistDescription(currentPage))
                         .setFooter({ text: `Page ${currentPage + 1} of ${totalPages}` });
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
    }
};