const { 
    SlashCommandBuilder, 
    ActionRowBuilder, 
    ButtonBuilder, 
    EmbedBuilder, 
    ButtonStyle 
} = require("discord.js");
const { parseTimeString } = require("../../utils/parseTimeString");
const { logger } = require("../../utils/logger");
const config = require("../../config");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("queue")
        .setDescription("View the queue and currently playing song")
        .setDMPermission(false),

    run: async ({ interaction, client }) => {
        const embed = new EmbedBuilder().setColor(config.clientOptions.embedColor);

        try {
            await interaction.deferReply();
            await interaction.editReply({ embeds: [embed.setDescription("`🔎` | Loading queue...")] });

            const player = client.riffy.players.get(interaction.guildId);

            if (!player || !player.queue || !player.queue.length) {
                return interaction.editReply({ 
                    embeds: [embed.setDescription("`❌` | No songs are currently playing.")],  
                    ephemeral: true 
                });
            }

            const songsPerPage = 10;
            const totalPages = Math.ceil(player.queue.length / songsPerPage);
            let currentPage = 0;

            const generateSongList = (page) => {
                const start = page * songsPerPage;
                const end = Math.min(start + songsPerPage, player.queue.length);
                return player.queue.slice(start, end).map((track, index) => 
                    `**\`\`\`autohotkey\n${start + index + 1}. ${track.info.title} • ${track.info.author}\n` +
                    `\`\`\`**`
                ).join("\n");
            };

            const updateEmbed = () => {
                embed.setDescription(generateSongList(currentPage))
                     .setFooter({ text: `Page ${currentPage + 1} of ${totalPages}` })
                     .setAuthor({ name: "Current Queue" });
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

            updateEmbed();
            const reply = await interaction.editReply({ 
                embeds: [embed], 
                components: row ? [row] : [],
                fetchReply: true 
            });

            const filter = (buttonInteraction) => buttonInteraction.user.id === interaction.user.id;

            if (row) {
                const collector = reply.createMessageComponentCollector({ filter, time: parseTimeString("60s") });

                collector.on('collect', async (buttonInteraction) => {
                    if (buttonInteraction.customId === 'next_page') {
                        currentPage++;
                    } else if (buttonInteraction.customId === 'prev_page') {
                        currentPage--;
                    }

                    updateEmbed();
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
    options: {
        inVoice: true,
        sameVoice: true,
    }
};