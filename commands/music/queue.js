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
        .setName("queue")
        .setDescription("View the queue and currently playing song")
        .setDMPermission(false),

    run: async ({ interaction, client }) => {
        const embed = new EmbedBuilder().setColor(config.default_color);

        try {
            const player = client.riffy.players.get(interaction.guildId);

            if (!player || !player.queue || !player.queue.length) {
                return interaction.reply({ 
                    embeds: [embed.setDescription("`❌` | No songs are currently playing.")],  
                    ephemeral: true 
                });
            }

            const pageSize = 10;
            const totalPages = Math.ceil(player.queue.length / pageSize);
            let currentPage = 0;

            const generateQueueDescription = (page) => {
                return player.queue.slice(page * pageSize, (page + 1) * pageSize)
                    .map((track, index) => {
                        const requester = track.info.requester || 'Unknown';
                        return `\`${(page * pageSize) + index + 1}.\` [${track.info.title || 'Unknown'}](${track.info.uri}) • ${requester}`;
                    }).join('\n');
            };

            if (totalPages === 1) {
                embed.setDescription(generateQueueDescription(currentPage))
                     .setFooter({ text: `Page ${currentPage + 1} of ${totalPages}` });
                return interaction.reply({ embeds: [embed] });
            }

            const row = new ActionRowBuilder()
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

            const reply = await interaction.reply({ 
                embeds: [embed.setDescription(generateQueueDescription(currentPage)).setFooter({ text: `Page ${currentPage + 1} of ${totalPages}` })], 
                components: [row], 
                fetchReply: true 
            });

            const filter = (buttonInteraction) => {
                return buttonInteraction.user.id === interaction.user.id;
            };

            const collector = reply.createMessageComponentCollector({ filter, time: 60000 });

            collector.on('collect', async (buttonInteraction) => {
                if (buttonInteraction.customId === 'next_page') {
                    currentPage++;
                } else if (buttonInteraction.customId === 'prev_page') {
                    currentPage--;
                }

                embed.setDescription(generateQueueDescription(currentPage)).setFooter({ text: `Page ${currentPage + 1} of ${totalPages}` });
                row.components[0].setDisabled(currentPage === 0);
                row.components[1].setDisabled(currentPage === totalPages - 1);

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