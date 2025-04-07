const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { logger } = require("../../utils/logger");
const config = require("../../config");

module.exports = {
	data: new SlashCommandBuilder()
        .setName("filter")
        .setDescription("Apply an audio filter to the current player")
        .setDMPermission(false)
        .addStringOption(option =>
            option.setName("option")
            .setDescription("The filter you want to apply")
            .setRequired(true)
            .addChoices(
                { name: 'Clear/Disable', value: 'clear' },
                { name: 'Karaoke', value: 'karaoke' },
                { name: 'Timescale', value: 'timescale' },
                { name: 'Tremolo', value: 'tremolo' },
                { name: 'Vibrato', value: 'vibrato' },
                { name: 'Rotation', value: 'rotation' },
                { name: 'Distortion', value: 'distortion' },
                { name: 'ChannelMix', value: 'channelMix' },
                { name: 'LowPass', value: 'lowPass' },
                { name: 'Bassboost', value: 'bassboost' },
                { name: 'Slowmode', value: 'slowmode' },
                { name: 'Nightcore', value: 'nightcore' },
                { name: 'Vaporwave', value: 'vaporwave' },
                { name: '8D', value: '8d' },
            )
        ),

    run: async ({ interaction, client }) => {
        const embed = new EmbedBuilder().setColor(config.clientOptions.embedColor);
        const filterOption = interaction.options.getString("option");

        try {
            const player = client.riffy.players.get(interaction.guildId);

            if (!player) {
                return interaction.reply({ 
                    embeds: [embed.setDescription("\`❌\` | No player found in this server.")],  
                    ephemeral: true 
                });
            }

            switch (filterOption) {
                case 'clear':
                    player.filters.clearFilters();
                    return interaction.reply({ 
                        embeds: [embed.setDescription("\`🎵\` | All filters have been cleared.")],  
                        ephemeral: true 
                    });
                case 'karaoke':
                    player.filters.setKaraoke(true);
                    break;
                case 'timescale':
                    player.filters.setTimescale(true);
                    break;
                case 'tremolo':
                    player.filters.setTremolo(true);
                    break;
                case 'vibrato':
                    player.filters.setVibrato(true);
                    break;
                case 'rotation':
                    player.filters.setRotation(true);
                    break;
                case 'distortion':
                    player.filters.setDistortion(true);
                    break;
                case 'channelMix':
                    player.filters.setChannelMix(true);
                    break;
                case 'lowPass':
                    player.filters.setLowPass(true);
                    break;
                case 'bassboost':
                    player.filters.setBassboost(true);
                    break;
                case 'slowmode':
                    player.filters.setSlowmode(true);
                    break;
                case 'nightcore':
                    player.filters.setNightcore(true);
                    break;
                case 'vaporwave':
                    player.filters.setVaporwave(true);
                    break;
                case '8d':
                    player.filters.set8D(true);
                    break;
                default:
                    return interaction.reply({ 
                        embeds: [embed.setDescription("\`❌\` | Invalid filter option.")],  
                        ephemeral: true 
                    });
            }

            return interaction.reply({ 
                embeds: [embed.setDescription(`\`🎵\` | ${filterOption.charAt(0).toUpperCase() + filterOption.slice(1)} filter has been applied.`)],  
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
    options: {
        inVoice: true,
        sameVoice: true,
    }
};